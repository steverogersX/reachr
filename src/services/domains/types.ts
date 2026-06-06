export interface DiscoveredDomain {
  name: string;
}

export interface RetryEvent {
  attempt: number;   // which attempt just failed (1-based)
  maxAttempts: number;
  retryInMs: number; // how long until next attempt
  error: Error;
}

export interface DiscoverOptions {
  onRetry?: (event: RetryEvent) => void;
}
