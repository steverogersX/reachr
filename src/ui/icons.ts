export const icons = {
    // stage / section marker
    stage: '◆',

    // tree structure (already in use)
    branch: '├─',
    last:   '└─',
    pipe:   '│',
    indent: '   ',

    // item type markers — pass as icon prop to Thread.Item
    domain:  '◇',
    profile: '○',

    // status dots — used by StatusDot component, not as icon prop
    dot: '●',

    // inline separators
    sep:   '·',
    slash: '/',
} as const;

export type IconKey = keyof typeof icons;
