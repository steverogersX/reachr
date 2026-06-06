export type TaskStatus = 'running' | 'retrying' | 'done' | 'error';

export interface PipelineOptions {
  maxDomains:           number;
  maxProfilesPerDomain: number;
}

export const DEFAULT_PIPELINE_OPTIONS: PipelineOptions = {
  maxDomains:           10,
  maxProfilesPerDomain: 25,
};

export interface DomainTask {
  id:        string;
  domain:    string;
  status:    TaskStatus;
  count:     number;
  startedAt: number;
  timing?:   number;
  error?:    string;
}

export interface EmailTask {
  id:        string;
  name:      string;
  title:     string;
  status:    TaskStatus;
  email?:    string;
  startedAt: number;
  timing?:   number;
  error?:    string;
}
