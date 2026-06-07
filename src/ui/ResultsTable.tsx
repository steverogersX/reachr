import React from 'react';
import { Box, Text } from 'ink';
import type { ProfileRecord } from '@/pipeline';
import { color, glyph } from './theme';

const DISPLAY_LIMIT = 20;
const MAX_WIDTH = 96;

type ColKey = 'name' | 'title' | 'domain' | 'email';

const HEADERS: Record<ColKey, string> = {
    name:   'NAME',
    title:  'TITLE',
    domain: 'DOMAIN',
    email:  'EMAIL',
};

// proportional weights + a hard minimum for each column; email soaks up slack
const LAYOUT: Record<ColKey, { weight: number; min: number }> = {
    name:   { weight: 0.24, min: 12 },
    title:  { weight: 0.28, min: 12 },
    domain: { weight: 0.22, min: 10 },
    email:  { weight: 0.26, min: 14 },
};

const GAP = 2;
const ORDER: ColKey[] = ['name', 'title', 'domain', 'email'];

// Distribute the available terminal width across columns. Everything is
// truncated to its computed width so the table can never wrap, no matter how
// narrow the window.
function computeWidths(): Record<ColKey, number> {
    const term = Math.min(process.stdout.columns ?? 80, MAX_WIDTH);
    const body = Math.max(term - 2 /* outer padding */ - GAP * (ORDER.length - 1), 40);

    const widths = {} as Record<ColKey, number>;
    let used = 0;
    for (const key of ORDER) {
        const w = Math.max(LAYOUT[key].min, Math.floor(body * LAYOUT[key].weight));
        widths[key] = w;
        used += w;
    }
    // hand any rounding remainder to the email column
    widths.email += Math.max(0, body - used);
    return widths;
}

function clip(s: string, max: number): string {
    return s.length <= max ? s : s.slice(0, Math.max(1, max - 1)) + '…';
}

interface ResultsTableProps {
    profiles: ProfileRecord[];
}

export function ResultsTable({ profiles }: ResultsTableProps) {
    if (profiles.length === 0) return null;

    const widths   = computeWidths();
    const visible  = profiles.slice(0, DISPLAY_LIMIT);
    const overflow = profiles.length - visible.length;
    const withEmail = profiles.filter(p => p.email).length;
    const ruleWidth = ORDER.reduce((acc, k) => acc + widths[k], 0) + GAP * (ORDER.length - 1);

    return (
        <Box flexDirection="column" marginTop={1}>
            {/* summary line */}
            <Box>
                <Text bold color={color.text}>Results</Text>
                <Text color={color.muted} dimColor>  {glyph.sep}  </Text>
                <Text color={color.muted}>{profiles.length} contact{profiles.length !== 1 ? 's' : ''}</Text>
                <Text color={color.muted} dimColor>  {glyph.sep}  </Text>
                <Text color={color.muted}>{withEmail} with email</Text>
            </Box>

            {/* header */}
            <Box marginTop={1}>
                {ORDER.map((key, i) => (
                    <Box key={key} width={widths[key]} marginRight={i < ORDER.length - 1 ? GAP : 0}>
                        <Text color={color.muted} dimColor>{HEADERS[key]}</Text>
                    </Box>
                ))}
            </Box>
            <Text color={color.muted} dimColor>{glyph.bar.repeat(ruleWidth)}</Text>

            {/* rows */}
            {visible.map((r, idx) => {
                const hasEmail = Boolean(r.email);
                const cells: Record<ColKey, string> = {
                    name:   r.name,
                    title:  r.title,
                    domain: r.domain,
                    email:  r.email ?? '—',
                };
                return (
                    <Box key={`${r.domain}:${r.name}:${idx}`}>
                        <Cell text={clip(cells.name,   widths.name)}   width={widths.name}   color={color.text} />
                        <Cell text={clip(cells.title,  widths.title)}  width={widths.title}  color={color.muted} />
                        <Cell text={clip(cells.domain, widths.domain)} width={widths.domain} color={color.muted} />
                        <Cell
                            text={clip(cells.email, widths.email)}
                            width={widths.email}
                            color={hasEmail ? color.text : color.muted}
                            last
                        />
                    </Box>
                );
            })}

            {overflow > 0 && (
                <Box marginTop={1}>
                    <Text color={color.muted}>+{overflow} more  {glyph.arrow} run </Text>
                    <Text color={color.text}>reachr export</Text>
                    <Text color={color.muted}> to see all</Text>
                </Box>
            )}
        </Box>
    );
}

function Cell({ text, width, color: textColor, last }: { text: string; width: number; color: string; last?: boolean }) {
    return (
        <Box width={width} marginRight={last ? 0 : GAP}>
            <Text color={textColor} wrap="truncate-end">{text}</Text>
        </Box>
    );
}
