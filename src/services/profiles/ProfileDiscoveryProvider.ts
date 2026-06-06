import type { DiscoveredDomain } from '@/services/domains/types';
import type { LinkedInProfile }  from '@/services/types';

export interface ProfileDiscoveryProvider {
  discover(rootDomain: string, domains: DiscoveredDomain[]): AsyncGenerator<LinkedInProfile>;
}
