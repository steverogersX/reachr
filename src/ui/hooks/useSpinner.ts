import { useState, useEffect } from 'react';

const FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'] as const;

export function useSpinner(active: boolean): string {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setFrame((f) => (f + 1) % FRAMES.length), 80);
    return () => clearInterval(id);
  }, [active]);

  return FRAMES[frame]!;
}
