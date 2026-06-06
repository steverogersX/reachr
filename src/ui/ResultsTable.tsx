import React from 'react';
import { Box, Text } from 'ink';
import type { ProfileRecord } from '@/pipeline';

const DISPLAY_LIMIT = 20;

const COL = {
    domain:   16,
    name:     20,
    title:    22,
    linkedin: 24,
    email:    22,
} as const;

const HEADERS = ['DOMAIN', 'NAME', 'TITLE', 'LINKEDIN', 'EMAIL'] as const;
const KEYS    = ['domain', 'name', 'title', 'linkedin', 'email'] as const;

type RowKey = (typeof KEYS)[number];

const COL_WIDTHS: Record<RowKey, number> = {
    domain:   COL.domain,
    name:     COL.name,
    title:    COL.title,
    linkedin: COL.linkedin,
    email:    COL.email,
};

function clip(s: string, max: number): string {
    return s.length <= max ? s : s.slice(0, max - 1) + '…';
}

function shortLinkedin(url: string): string {
    return url
        .replace('https://www.linkedin.com', '')
        .replace('https://linkedin.com', '');
}

interface RowData {
    domain:   string;
    name:     string;
    title:    string;
    linkedin: string;
    email:    string;
}

function toRow(r: ProfileRecord): RowData {
    return {
        domain:   r.domain,
        name:     r.name,
        title:    r.title,
        linkedin: shortLinkedin(r.linkedinUrl),
        email:    r.email ?? '—',
    };
}

function Cell({ value, colKey, dim }: { value: string; colKey: RowKey; dim?: boolean }) {
    const width = COL_WIDTHS[colKey];
    return (
        <Box width={width + 2}>
            <Text dimColor={dim}>{clip(value, width)}</Text>
        </Box>
    );
}

function HeaderRow() {
    return (
        <Box flexDirection="row">
            {KEYS.map((key, i) => (
                <Box key={key} width={COL_WIDTHS[key] + 2}>
                    <Text bold dimColor>{HEADERS[i]}</Text>
                </Box>
            ))}
        </Box>
    );
}

function Divider() {
    const total = KEYS.reduce((acc, k) => acc + COL_WIDTHS[k] + 2, 0);
    return <Text dimColor>{'─'.repeat(total)}</Text>;
}

function DataRow({ row, index }: { row: RowData; index: number }) {
    const dim = index % 2 !== 0;
    return (
        <Box flexDirection="row">
            <Cell value={row.domain}   colKey="domain"   dim={dim} />
            <Cell value={row.name}     colKey="name"     dim={dim} />
            <Cell value={row.title}    colKey="title"    dim={dim} />
            <Cell value={row.linkedin} colKey="linkedin" dim={dim} />
            <Cell value={row.email}    colKey="email"    dim={dim} />
        </Box>
    );
}

interface ResultsTableProps {
    profiles: ProfileRecord[];
}

export function ResultsTable({ profiles }: ResultsTableProps) {
    if (profiles.length === 0) return null;

    const visible  = profiles.slice(0, DISPLAY_LIMIT);
    const overflow = profiles.length - visible.length;

    return (
        <Box flexDirection="column" marginTop={1}>
            <Box gap={1} marginBottom={1}>
                <Text bold color="cyan">Results</Text>
                <Text dimColor>·</Text>
                <Text dimColor>{profiles.length} contact{profiles.length !== 1 ? 's' : ''}</Text>
            </Box>

            <HeaderRow />
            <Divider />

            {visible.map((r, i) => (
                <DataRow key={`${r.domain}:${r.name}`} row={toRow(r)} index={i} />
            ))}

            {overflow > 0 && (
                <Box marginTop={1}>
                    <Text dimColor>+ {overflow} more  </Text>
                    <Text dimColor color="cyan">reachr export</Text>
                    <Text dimColor> to see all</Text>
                </Box>
            )}
        </Box>
    );
}
