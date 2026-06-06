import type { DiscoveredDomain } from '@/services/domains/types';

export type { DiscoveredDomain };

export interface LinkedInProfile {
  url: string;
  name: string;
  title: string;
}

export interface Contact {
  email: string;
  name: string;
  title: string;
  linkedinUrl: string;
}

export type StageStatus = 'idle' | 'running' | 'done' | 'error';

export interface ReachServices {
  getDomains(domain: string, options?: import('@/services/domains/types').DiscoverOptions): AsyncGenerator<DiscoveredDomain>;
  getProfiles(domain: string, domains: DiscoveredDomain[]): AsyncGenerator<LinkedInProfile>;
  getEmails(domain: string, profiles: LinkedInProfile[]): AsyncGenerator<Contact>;
}
