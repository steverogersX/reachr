import { EventEmitter } from 'node:events';
import type { DiscoveredDomain, LinkedInProfile, Contact } from '@/services/types';

export interface BusEventMap {
  // Stage 1 — domain discovery
  'domain:found':        [domain: DiscoveredDomain];
  'domains:done':        [];
  'domains:error':       [err: Error];

  // Stage 2 — per-domain profile lookup (parallel)
  'profiles:task:start': [taskId: string, domain: string];
  'profiles:task:done':  [taskId: string];
  'profiles:task:retry': [taskId: string, attempt: number];
  'profiles:task:error': [taskId: string, err: Error];
  'profile:found':       [taskId: string, profile: LinkedInProfile];

  // Stage 3 — per-profile email lookup (parallel)
  'emails:task:start':   [taskId: string, profile: LinkedInProfile];
  'emails:task:done':    [taskId: string];
  'emails:task:retry':   [taskId: string, attempt: number];
  'emails:task:error':   [taskId: string, err: Error];
  'contact:found':       [taskId: string, contact: Contact];

  // Pipeline lifecycle
  'pipeline:done':       [contacts: Contact[]];
  'pipeline:error':      [err: Error];
}

type Listener<K extends keyof BusEventMap> = (...args: BusEventMap[K]) => void;

export class PipelineBus extends EventEmitter {
  emit<K extends keyof BusEventMap>(event: K, ...args: BusEventMap[K]): boolean {
    return super.emit(event as string, ...args);
  }
  on<K extends keyof BusEventMap>(event: K, listener: Listener<K>): this {
    return super.on(event as string, listener as (...args: unknown[]) => void);
  }
  once<K extends keyof BusEventMap>(event: K, listener: Listener<K>): this {
    return super.once(event as string, listener as (...args: unknown[]) => void);
  }
  off<K extends keyof BusEventMap>(event: K, listener: Listener<K>): this {
    return super.off(event as string, listener as (...args: unknown[]) => void);
  }
}
