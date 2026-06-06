import React from 'react';
import { Box, Text } from 'ink';
import type { StageStatus } from '../../services/types.js';
import { useSpinner } from '../hooks/useSpinner.js';

export interface StageItem {
  primary: string;
  secondary?: string;
}

interface Props {
  index: number;
  title: string;
  status: StageStatus;
  items: StageItem[];
  timing?: number;
  error?: string;
}

function formatTiming(ms: number): string {
  return ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`;
}

const STATUS_COLOR: Record<StageStatus, string> = {
  idle:    'gray',
  running: 'yellowBright',
  done:    'greenBright',
  error:   'redBright',
};

export function StageBox({ index, title, status, items, timing, error }: Props) {
  const spinner = useSpinner(status === 'running');

  if (status === 'idle') return null;

  const idx    = String(index).padStart(2, '0');
  const color  = STATUS_COLOR[status];
  const icon   = status === 'running' ? spinner
               : status === 'done'    ? '✓'
               : status === 'error'   ? '✗'
               :                        '○';

  return (
    <Box flexDirection="column" marginBottom={1}>
      {/* Stage header row */}
      <Box gap={1}>
        <Text color={color}>{icon}</Text>
        <Text color="gray" dimColor>{idx} ·</Text>
        <Text bold color="white">{title}</Text>
        {status === 'done' && timing !== undefined && (
          <Text color="gray" dimColor>
            {'  '}{items.length} found · {formatTiming(timing)}
          </Text>
        )}
        {status === 'running' && items.length > 0 && (
          <Text color="gray" dimColor>  {items.length} found so far</Text>
        )}
      </Box>

      {/* Streamed items */}
      {items.map((item, i) => (
        <Box key={i} marginLeft={3} gap={2}>
          <Text color="cyanBright">✦</Text>
          <Text color="white">{item.primary}</Text>
          {item.secondary && (
            <Text color="gray" dimColor>{item.secondary}</Text>
          )}
        </Box>
      ))}

      {/* Empty running placeholder */}
      {status === 'running' && items.length === 0 && (
        <Box marginLeft={3}>
          <Text color="gray" dimColor>searching...</Text>
        </Box>
      )}

      {/* Error message */}
      {status === 'error' && error && (
        <Box marginLeft={3}>
          <Text color="redBright">{error}</Text>
        </Box>
      )}
    </Box>
  );
}
