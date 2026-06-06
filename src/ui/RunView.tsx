import React, { useState, useEffect } from 'react';
import { Box, Text, useApp } from 'ink';
import { Thread } from '@/ui/thread';
import { icons } from '@/ui/icons';
import { runWorkflow } from '@/services/runWorkflow';
import { TaskStore, type Task, type TaskStatus } from '@/pipeline';
import type { Domain } from '@/services/domains/types';
import type { Status } from '@/ui/thread/types';

// --- status mapping ---

function toStatus(s: TaskStatus): Status {
    if (s === 'running') return 'loading';
    if (s === 'done')    return 'done';
    if (s === 'error')   return 'error';
    return 'idle';
}

// --- sub-components ---

function Header({ domain }: { domain: string }) {
    const width = Math.min(process.stdout.columns ?? 60, 80);
    return (
        <Box flexDirection="column" marginBottom={1}>
            <Box gap={1}>
                <Text bold color="cyan">reachr</Text>
                <Text dimColor>{icons.sep}</Text>
                <Text bold>{domain}</Text>
            </Box>
            <Text dimColor>{'─'.repeat(width)}</Text>
        </Box>
    );
}

function FatalError({ error }: { error: Error }) {
    return (
        <Box flexDirection="column" gap={1}>
            <Box gap={1}>
                <Text color="red">{icons.dot}</Text>
                <Text bold color="red">Error</Text>
            </Box>
            <Text dimColor>  {error.message}</Text>
        </Box>
    );
}

function LeafItem({ task, isLast }: { task: Task; isLast: boolean }) {
    return (
        <Thread.Item
            label={task.label}
            meta={task.meta}
            right={task.right ? <Text dimColor>{task.right}</Text> : undefined}
            status={toStatus(task.status)}
            isLast={isLast}
        />
    );
}

function ErrorLine({ error }: { error: Error }) {
    return (
        <Box paddingLeft={4}>
            <Text color="red" dimColor>{error.message}</Text>
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

function Stage({ task }: { task: Task }) {
    const hasGroups = task.subtasks.some(t => t.subtasks.length > 0);
    return (
        <Box flexDirection="column" marginBottom={1}>
            <Thread.Stage label={task.label} status={toStatus(task.status)} />
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
}

export function RunView({ domain, store }: RunViewProps) {
    const { exit } = useApp();
    const [tasks, setTasks]           = useState<Task[]>([]);
    const [fatalError, setFatalError] = useState<Error | null>(null);

    useEffect(() => {
        const onChange = (t: Task[]) => setTasks([...t]);
        store.on('change', onChange);

        runWorkflow(domain, store)
            .then(() => setTimeout(() => exit(), 300))
            .catch(err => {
                const error = err instanceof Error ? err : new Error(String(err));
                setFatalError(error);
                setTimeout(() => exit(error), 1500);
            });

        return () => { store.off('change', onChange); };
    }, []);

    return (
        <Box flexDirection="column" paddingX={1} paddingTop={1}>
            <Header domain={domain} />
            {fatalError
                ? <FatalError error={fatalError} />
                : tasks.map(task => <Stage key={task.id} task={task} />)
            }
        </Box>
    );
}
