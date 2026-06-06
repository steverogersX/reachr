import { createContext, useContext } from 'react';
import type { ThreadContextValue } from './types';

export const ThreadContext = createContext<ThreadContextValue>({
    depth: 0,
    parentLines: [],
});

export const useThread = () => useContext(ThreadContext);
