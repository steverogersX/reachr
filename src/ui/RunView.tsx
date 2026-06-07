import React, { useState, useEffect, useRef } from 'react';
import { Box, Text, Static, useApp } from 'ink';
import { ConfirmInput } from '@inkjs/ui';
import { Thread } from '@/ui/thread';
import { glyph, color } from '@/ui/theme';
import { runWorkflow, runSendStage, type WorkflowOptions } from '@/services/runWorkflow';
import { TaskStore, PipelineState, type Task, type TaskStatus } from '@/pipeline';
import type { Domain } from '@/services/domains/types';
import type { Status } from '@/ui/thread/types';
import { ResultsTable } from '@/ui/ResultsTable';

// --- status mapping ---

function toStatus(s: TaskStatus): Status {
    if (s === 'running')  return 'loading';
    if (s === 'retrying') return 'retrying';
    if (s === 'done')    return 'done';
    if (s === 'error')   return 'error';
    if (s === 'skipped') return 'skipped';
    return 'idle';
}

// done / total across a stage's direct children, for the trailing "n found" hint
function tally(task: Task): { done: number; total: number } {
    const leaves = task.subtasks.flatMap(t => (t.subtasks.length > 0 ? t.subtasks : [t]));
    return {
        done:  leaves.filter(t => t.status === 'done').length,
        total: leaves.length,
    };
}

// --- sub-components ---

function Header({ domain }: { domain: string }) {
    const width = Math.min(process.stdout.columns ?? 60, 80);
    return (
        <Box flexDirection="column" marginBottom={1}>
            <Box>
                <Text bold color={color.text}>{glyph.brand} reachr</Text>
                <Text color={color.muted} dimColor>  {glyph.sep}  </Text>
                <Text color={color.muted}>{domain}</Text>
            </Box>
            <Text color={color.muted} dimColor>{glyph.bar.repeat(width)}</Text>
        </Box>
    );
}

function FatalError({ error }: { error: Error }) {
    return (
        <Box flexDirection="column" marginTop={1}>
            <Text bold color={color.error}>Error</Text>
            <Box marginTop={1}>
                <Text color={color.muted}>{error.message}</Text>
            </Box>
        </Box>
    );
}

function LeafItem({ task, isLast }: { task: Task; isLast: boolean }) {
    return (
        <>
            <Thread.Item
                label={task.label}
                meta={task.meta}
                right={task.right}
                status={toStatus(task.status)}
                isLast={isLast && !task.error}
            />
            {task.error && <ErrorLine error={task.error} />}
        </>
    );
}

function ErrorLine({ error }: { error: Error }) {
    return (
        <Box paddingLeft={5}>
            <Text color={color.error}>{error.message}</Text>
        </Box>
    );
}

function GroupItem({ task, isLast }: { task: Task; isLast: boolean }) {
    return (
        <>
            <Thread.Item
                label={task.label}
                status={toStatus(task.status)}
                isLast={isLast && !task.error}
            >
                {task.subtasks.map((child, i) => (
                    <LeafItem
                        key={child.id}
                        task={child}
                        isLast={i === task.subtasks.length - 1}
                    />
                ))}
            </Thread.Item>
            {task.error && <ErrorLine error={task.error} />}
        </>
    );
}

function stageCountNode(task: Task): React.ReactNode {
    if (task.status !== 'done' || task.subtasks.length === 0) return undefined;
    const { done, total } = tally(task);
    if (total === 0) return undefined;
    const label = done === total ? `${total}` : `${done}/${total}`;
    return <Text color={color.muted} dimColor>{glyph.sep} {label}</Text>;
}

function Stage({ task }: { task: Task }) {
    const hasGroups = task.subtasks.some(t => t.subtasks.length > 0);
    return (
        <Box flexDirection="column" marginBottom={1}>
            <Thread.Stage
                label={task.label}
                status={toStatus(task.status)}
                count={stageCountNode(task)}
            />
            {task.subtasks.length > 0 && (
                <Thread>
                    {task.subtasks.map((item, i) => {
                        const isLast = i === task.subtasks.length - 1;
                        return hasGroups || item.subtasks.length > 0
                            ? <GroupItem key={item.id} task={item} isLast={isLast} />
                            : <LeafItem  key={item.id} task={item} isLast={isLast} />;
                    })}
                </Thread>
            )}
        </Box>
    );
}

// --- main view ---

interface RunViewProps {
    domain: Domain;
    store:  TaskStore;
    state:  PipelineState;
    opts:   Partial<WorkflowOptions>;
}

type Phase = 'discovering' | 'confirm-send' | 'sending' | 'cancelled' | 'done';

function SendPrompt({ count, onConfirm, onCancel }: { count: number; onConfirm: () => void; onCancel: () => void }) {
    return (
        <Box flexDirection="column" marginTop={1}>
            <Box>
                <Text color={color.muted}>{glyph.arrow} </Text>
                <Text color={color.text}>Send outreach emails to </Text>
                <Text bold color={color.text}>{count}</Text>
                <Text color={color.text}> {count === 1 ? 'profile' : 'profiles'}?</Text>
                <Text color={color.muted} dimColor>  (Y/n)</Text>
            </Box>
            <Box marginTop={1}>
                <ConfirmInput onConfirm={onConfirm} onCancel={onCancel} />
            </Box>
        </Box>
    );
}

function CancelledNotice() {
    return (
        <Box marginTop={1}>
            <Text color={color.muted}>{glyph.arrow} Cancelled — no emails were sent.</Text>
        </Box>
    );
}

function DoneSummary({ sent, failed }: { sent: number; failed: number }) {
    return (
        <Box marginTop={1}>
            <Text bold color={color.success}>Done</Text>
            <Text color={color.muted} dimColor>  {glyph.sep}  </Text>
            <Text color={color.muted}>{sent} sent</Text>
            {failed > 0 && (
                <>
                    <Text color={color.muted} dimColor>  {glyph.sep}  </Text>
                    <Text color={color.error}>{failed} failed</Text>
                </>
            )}
        </Box>
    );
}

export function RunView({ domain, store, state, opts }: RunViewProps) {
    const { exit } = useApp();
    const [staticTasks, setStaticTasks] = useState<Task[]>([]);
    const [liveTasks, setLiveTasks]     = useState<Task[]>([]);
    const [fatalError, setFatalError]   = useState<Error | null>(null);
    const [phase, setPhase]             = useState<Phase>('discovering');
    const committedIds                  = useRef(new Set<string>());

    const sendable = state.profiles.filter(p => p.email && !p.sentAt).length;
    const wantsSend = sendable > 0;

    useEffect(() => {
        // Ink repaints its whole live tree on every render. Pushing finished
        // stages into <Static> writes them to the terminal exactly once —
        // they become permanent scrollback that Ink never rewrites — so the
        // repainted "live" region stays small and scrolling stays smooth.
        const isTerminal = (status: TaskStatus) =>
            status === 'done' || status === 'error' || status === 'skipped';

        const onChange = (t: Task[]) => {
            const newlyDone: Task[] = [];
            const stillLive: Task[] = [];

            for (const task of t) {
                if (committedIds.current.has(task.id)) continue;
                if (isTerminal(task.status)) {
                    committedIds.current.add(task.id);
                    newlyDone.push(task);
                } else {
                    stillLive.push(task);
                }
            }

            if (newlyDone.length > 0) setStaticTasks(prev => [...prev, ...newlyDone]);
            setLiveTasks(stillLive);
        };
        store.on('change', onChange);

        runWorkflow(domain, store, state, opts)
            .then(() => {
                if (state.profiles.some(p => p.email && !p.sentAt)) {
                    setPhase('confirm-send');
                } else {
                    setPhase('done');
                    setTimeout(() => exit(), 500);
                }
            })
            .catch(err => {
                const error = err instanceof Error ? err : new Error(String(err));
                setFatalError(error);
                setTimeout(() => exit(error), 1500);
            });

        return () => { store.off('change', onChange); };
    }, []);

    const handleConfirm = () => {
        setPhase('sending');
        runSendStage(domain, store, state)
            .then(() => {
                setPhase('done');
                setTimeout(() => exit(), 500);
            })
            .catch(err => {
                const error = err instanceof Error ? err : new Error(String(err));
                setFatalError(error);
                setTimeout(() => exit(error), 1500);
            });
    };

    const handleCancel = () => {
        setPhase('cancelled');
        setTimeout(() => exit(), 500);
    };

    const sendTask = staticTasks.find(t => t.id === 'stage:send') ?? liveTasks.find(t => t.id === 'stage:send');
    const isSend   = (task: Task) => task.id === 'stage:send';

    return (
        <Box flexDirection="column" paddingX={1} paddingTop={1}>
            <Header domain={domain} />
            <Static items={staticTasks.filter(task => !isSend(task))}>
                {task => <Stage key={task.id} task={task} />}
            </Static>
            {fatalError
                ? <FatalError error={fatalError} />
                : liveTasks.filter(task => !isSend(task)).map(task => <Stage key={task.id} task={task} />)
            }
            {phase !== 'discovering' && <ResultsTable profiles={state.profiles} />}
            {phase === 'confirm-send' && wantsSend && (
                <SendPrompt count={sendable} onConfirm={handleConfirm} onCancel={handleCancel} />
            )}
            {sendTask && <Stage task={sendTask} />}
            {phase === 'cancelled' && <CancelledNotice />}
            {phase === 'done' && sendTask && (
                <DoneSummary
                    sent={state.profiles.filter(p => p.sentAt).length}
                    failed={(sendTask.subtasks ?? []).filter(t => t.status === 'error').length}
                />
            )}
        </Box>
    );
}
