import React from 'react';
import { Box, Text } from 'ink';
import type { DomainTask, EmailTask } from '@/pipeline/types';
import { DomainTaskRow, EmailTaskRow } from '@/ui/components/TaskRow';
import { useSpinner } from '@/ui/hooks/useSpinner';

function StageHeader({
  index,
  title,
  isRunning,
  summary,
}: {
  index:     number;
  title:     string;
  isRunning: boolean;
  summary?:  string;
}) {
  const spinner = useSpinner(isRunning);
  const icon    = isRunning ? spinner : '✓';
  const color   = isRunning ? 'yellowBright' : 'greenBright';
  const idx     = String(index).padStart(2, '0');

  return (
    <Box gap={1}>
      <Text color={color}>{icon}</Text>
      <Text color="gray" dimColor>{idx} ·</Text>
      <Text bold color="white">{title}</Text>
      {summary && <Text color="gray" dimColor>  {summary}</Text>}
    </Box>
  );
}

function stageSummary(running: number, done: number, total: number): string {
  if (running > 0) return `${running} running · ${done}/${total} done`;
  return `${done}/${total} complete`;
}

export function DomainStage({
  index,
  title,
  tasks,
  sealed,
}: {
  index:  number;
  title:  string;
  tasks:  DomainTask[];
  sealed: boolean;
}) {
  if (tasks.length === 0) return null;

  const running   = tasks.filter(t => t.status === 'running' || t.status === 'retrying').length;
  const done      = tasks.filter(t => t.status === 'done' || t.status === 'error').length;
  const isRunning = running > 0 || !sealed;

  return (
    <Box flexDirection="column" marginBottom={1}>
      <StageHeader
        index={index}
        title={title}
        isRunning={isRunning}
        summary={stageSummary(running, done, tasks.length)}
      />
      {tasks.map(task => (
        <DomainTaskRow key={task.id} task={task} />
      ))}
    </Box>
  );
}

export function EmailStage({
  index,
  title,
  tasks,
  sealed,
}: {
  index:  number;
  title:  string;
  tasks:  EmailTask[];
  sealed: boolean;
}) {
  if (tasks.length === 0) return null;

  const running   = tasks.filter(t => t.status === 'running' || t.status === 'retrying').length;
  const done      = tasks.filter(t => t.status === 'done').length;
  const isRunning = running > 0 || !sealed;

  return (
    <Box flexDirection="column" marginBottom={1}>
      <StageHeader
        index={index}
        title={title}
        isRunning={isRunning}
        summary={stageSummary(running, done, tasks.length)}
      />
      {tasks.map(task => (
        <EmailTaskRow key={task.id} task={task} />
      ))}
    </Box>
  );
}
