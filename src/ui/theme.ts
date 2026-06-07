// Central design tokens for the reachr CLI.
//
// Deliberately restrained: native ANSI colors that adapt to the user's terminal
// theme, white/gray for everything structural, and color used only to mark
// state. Green is reserved strictly for success; red strictly for errors.

export const color = {
    text:    'white',
    muted:   'gray',  // secondary text, meta, connectors, rules
    success: 'green', // success only
    error:   'red',   // errors only
} as const;

export const glyph = {
    brand: '▲',

    // section / stage marker (kept neutral — never colored by status)
    stage: '◆',

    // status indicator — a single neutral marker; color (not shape) carries meaning
    dot: '·',

    // tree connectors
    branch: '├─',
    last:   '└─',
    pipe:   '│',
    indent: '   ',

    // inline punctuation
    sep:  '·',
    arrow: '›',
    bar:  '─',
} as const;

export type StatusKey = 'idle' | 'loading' | 'done' | 'error' | 'skipped';
