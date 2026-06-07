import type { ReactNode } from 'react';

export type Status = 'idle' | 'loading' | 'done' | 'error' | 'skipped';

export interface ThreadContextValue {
    depth: number;
    parentLines: boolean[]; // per ancestor: true = draw │, false = draw space
}

export interface ThreadItemProps {
    label: string;
    meta?: string;       // dimmed · separated secondary text
    icon?: ReactNode;    // emoji string, <Spinner />, <Badge>, anything
    right?: ReactNode;   // right-side slot: URL, count, etc.
    status?: Status;
    isLast?: boolean;
    children?: ReactNode;
}

export interface ThreadStageProps {
    label: string;
    icon?: ReactNode;
    status?: Status;
    count?: ReactNode; // optional trailing summary, e.g. "4 found"
}
