import React, { useState, useEffect, useRef } from 'react';
import { Box, Text, useApp } from 'ink';
import { Header }       from '@/ui/components/Header';
import { StageBox }     from '@/ui/components/StageBox';
import { DomainStage, EmailStage } from '@/ui/components/ParallelStage';
import type { StageItem } from '@/ui/components/StageBox';
import type { StageStatus, Contact } from '@/services/types';
import type { DomainTask, EmailTask, PipelineOptions } from '@/pipeline/types';
import { DEFAULT_PIPELINE_OPTIONS } from '@/pipeline/types';
import { PipelineBus }  from '@/pipeline/bus';
import { runPipeline }  from '@/pipeline/runner';

interface Props {
  domain:  string;
  options?: PipelineOptions;
}

interface UIState {
  stage1Status:  StageStatus;
  stage1Items:   StageItem[];
  stage1Timing?: number;
  stage1Error?:  string;

  domainTasks:   DomainTask[];
  emailTasks:    EmailTask[];

  pipelineDone:  boolean;
  allContacts:   Contact[];
}

const INITIAL: UIState = {
  stage1Status: 'running',
  stage1Items:  [],
  domainTasks:  [],
  emailTasks:   [],
  pipelineDone: false,
  allContacts:  [],
};

export function RunPipeline({ domain, options = DEFAULT_PIPELINE_OPTIONS }: Props) {
  const { exit }          = useApp();
  const startedAt         = useRef(Date.now());
  const [state, setState] = useState<UIState>(INITIAL);

  useEffect(() => {
    const bus = new PipelineBus();

    // ── Stage 1 ──────────────────────────────────────────────────────────────
    bus.on('domain:found', (d) =>
      setState(s => ({ ...s, stage1Items: [...s.stage1Items, { primary: d.name, icon: '🌐' }] })),
    );
    bus.on('domains:done', () =>
      setState(s => ({
        ...s,
        stage1Status: 'done',
        stage1Timing: Date.now() - startedAt.current,
      })),
    );
    bus.on('domains:error', (err) =>
      setState(s => ({ ...s, stage1Status: 'error', stage1Error: err.message })),
    );

    // ── Stage 2: per-domain profile tasks ────────────────────────────────────
    bus.on('profiles:task:start', (taskId, d) =>
      setState(s => ({
        ...s,
        domainTasks: [
          ...s.domainTasks,
          { id: taskId, domain: d, status: 'running', count: 0, startedAt: Date.now() },
        ],
      })),
    );
    bus.on('profile:found', (taskId) =>
      setState(s => ({
        ...s,
        domainTasks: s.domainTasks.map(t =>
          t.id === taskId ? { ...t, count: t.count + 1 } : t,
        ),
      })),
    );
    bus.on('profiles:task:retry', (taskId) =>
      setState(s => ({
        ...s,
        domainTasks: s.domainTasks.map(t =>
          t.id === taskId ? { ...t, status: 'retrying' } : t,
        ),
      })),
    );
    bus.on('profiles:task:done', (taskId) =>
      setState(s => ({
        ...s,
        domainTasks: s.domainTasks.map(t =>
          t.id === taskId
            ? { ...t, status: 'done', timing: Date.now() - t.startedAt }
            : t,
        ),
      })),
    );
    bus.on('profiles:task:error', (taskId, err) =>
      setState(s => ({
        ...s,
        domainTasks: s.domainTasks.map(t =>
          t.id === taskId
            ? { ...t, status: 'error', error: err.message, timing: Date.now() - t.startedAt }
            : t,
        ),
      })),
    );

    // ── Stage 3: per-profile email tasks ─────────────────────────────────────
    bus.on('emails:task:start', (taskId, profile) =>
      setState(s => {
        if (s.emailTasks.some(t => t.id === taskId)) return s;
        return {
          ...s,
          emailTasks: [
            ...s.emailTasks,
            { id: taskId, name: profile.name, title: profile.title, status: 'running', startedAt: Date.now() },
          ],
        };
      }),
    );
    bus.on('contact:found', (taskId, contact) =>
      setState(s => ({
        ...s,
        emailTasks: s.emailTasks.map(t =>
          t.id === taskId ? { ...t, email: contact.email } : t,
        ),
      })),
    );
    bus.on('emails:task:retry', (taskId) =>
      setState(s => ({
        ...s,
        emailTasks: s.emailTasks.map(t =>
          t.id === taskId ? { ...t, status: 'retrying' } : t,
        ),
      })),
    );
    bus.on('emails:task:done', (taskId) =>
      setState(s => ({
        ...s,
        emailTasks: s.emailTasks.map(t =>
          t.id === taskId
            ? { ...t, status: 'done', timing: Date.now() - t.startedAt }
            : t,
        ),
      })),
    );
    bus.on('emails:task:error', (taskId, err) =>
      setState(s => ({
        ...s,
        emailTasks: s.emailTasks.map(t =>
          t.id === taskId
            ? { ...t, status: 'error', error: err.message }
            : t,
        ),
      })),
    );

    // ── Pipeline lifecycle ────────────────────────────────────────────────────
    bus.on('pipeline:done', (contacts) =>
      setState(s => ({ ...s, pipelineDone: true, allContacts: contacts })),
    );
    bus.on('pipeline:error', () => setTimeout(exit, 1500));

    runPipeline(domain, bus, options).catch((err: unknown) => {
      const message = err instanceof Error ? err.message : 'Unexpected error';
      setState(s => ({ ...s, stage1Status: 'error', stage1Error: message }));
      setTimeout(exit, 1500);
    });

    return () => { bus.removeAllListeners(); };
  }, []);

  const {
    stage1Status, stage1Items, stage1Timing, stage1Error,
    domainTasks, emailTasks,
    pipelineDone, allContacts,
  } = state;

  // Sealed = no new tasks will arrive from upstream
  const stage2Sealed =
    stage1Status !== 'running' &&
    domainTasks.every(t => t.status === 'done' || t.status === 'error');

  const stage3Sealed =
    stage2Sealed &&
    emailTasks.every(t => t.status === 'done' || t.status === 'error');

  const hasError =
    stage1Status === 'error' ||
    domainTasks.some(t => t.status === 'error') ||
    emailTasks.some(t => t.status === 'error');

  return (
    <Box flexDirection="column" paddingX={1} paddingTop={1}>
      <Header domain={domain} />

      <StageBox
        index={1}
        title="Discovering Domains"
        status={stage1Status}
        items={stage1Items}
        timing={stage1Timing}
        error={stage1Error}
      />

      <DomainStage
        index={2}
        title="LinkedIn Profiles"
        tasks={domainTasks}
        sealed={stage2Sealed}
      />

      <EmailStage
        index={3}
        title="Extracting Emails"
        tasks={emailTasks}
        sealed={stage3Sealed}
      />

      {pipelineDone && (
        <Box flexDirection="column" marginTop={1} gap={1}>
          <Box gap={1}>
            <Text color="greenBright">✓</Text>
            <Text color="white" bold>Pipeline complete</Text>
            <Text color="gray" dimColor>· {allContacts.length} contacts ready</Text>
          </Box>
          <Box marginLeft={2} flexDirection="column">
            <Text color="gray" dimColor>next  <Text color="white">reachr report</Text>  to review before sending</Text>
            <Text color="gray" dimColor>next  <Text color="white">reachr send</Text>    to choose a template and send</Text>
          </Box>
        </Box>
      )}

      {hasError && !pipelineDone && (
        <Box marginTop={1} gap={1}>
          <Text color="redBright">✗</Text>
          <Text color="redBright">Pipeline failed.</Text>
          <Text color="gray" dimColor>Check the errors above.</Text>
        </Box>
      )}

      <Box marginTop={1} />
    </Box>
  );
}
