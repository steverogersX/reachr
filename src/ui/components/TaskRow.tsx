import React from 'react';
import { Box, Text } from 'ink';
import type { DomainTask, EmailTask } from '@/pipeline/types';
import { useSpinner } from '@/ui/hooks/useSpinner';

function formatTiming(ms: number): string {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

function taskIcon(status: DomainTask['status'], spinner: string): string {
  switch (status) {
    case 'running':  return spinner;
    case 'retrying': return '↻';
    case 'done':     return '✓';
    case 'error':    return '✗';
  }
}

function taskColor(status: DomainTask['status']): string {
  switch (status) {
    case 'running':
    case 'retrying': return 'yellowBright';
    case 'done':     return 'greenBright';
    case 'error':    return 'redBright';
  }
}

export function DomainTaskRow({ task }: { task: DomainTask }) {
  const spinner = useSpinner(task.status === 'running' || task.status === 'retrying');
  const icon    = taskIcon(task.status, spinner);
  const color   = taskColor(task.status);

  return (
    <Box gap={1} marginLeft={3}>
      <Text color={color}>{icon}</Text>
      <Text color="white">{task.domain.padEnd(24)}</Text>
      {task.status === 'running' && (
        <Text color="gray" dimColor>
          {task.count > 0 ? `${task.count} found` : 'searching...'}
        </Text>
      )}
      {task.status === 'retrying' && (
        <Text color="yellowBright" dimColor>retrying ({task.count} found so far)...</Text>
      )}
      {task.status === 'done' && (
        <Text color="gray" dimColor>
          {task.count} profile{task.count !== 1 ? 's' : ''}
          {task.timing !== undefined ? `  ·  ${formatTiming(task.timing)}` : ''}
        </Text>
      )}
      {task.status === 'error' && (
        <Text color="redBright">{task.error ?? 'failed'}</Text>
      )}
    </Box>
  );
}

export function EmailTaskRow({ task }: { task: EmailTask }) {
  const spinner = useSpinner(task.status === 'running' || task.status === 'retrying');
  const icon    = taskIcon(task.status, spinner);
  const color   = taskColor(task.status);

  return (
    <Box gap={1} marginLeft={3}>
      <Text color={color}>{icon}</Text>
      <Text color="white">{task.name.padEnd(20)}</Text>
      <Text color="gray" dimColor>{task.title.padEnd(28)}</Text>
      {task.status === 'running' && (
        <Text color="gray" dimColor>finding email...</Text>
      )}
      {task.status === 'retrying' && (
        <Text color="yellowBright" dimColor>retrying...</Text>
      )}
      {task.status === 'done' && task.email && (
        <>
          <Text color="cyanBright">{task.email}</Text>
          {task.timing !== undefined && (
            <Text color="gray" dimColor>  ·  {formatTiming(task.timing)}</Text>
          )}
        </>
      )}
      {task.status === 'error' && (
        <Text color="redBright">{task.error ?? 'failed'}</Text>
      )}
    </Box>
  );
}
