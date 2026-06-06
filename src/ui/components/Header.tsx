import React from 'react';
import { Box, Text } from 'ink';

interface Props {
  domain: string;
}

export function Header({ domain }: Props) {
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box gap={1}>
        <Text bold color="cyanBright">reachr</Text>
        <Text color="gray">·</Text>
        <Text color="white">{domain}</Text>
      </Box>
      <Text color="gray" dimColor>{'─'.repeat(52)}</Text>
    </Box>
  );
}
