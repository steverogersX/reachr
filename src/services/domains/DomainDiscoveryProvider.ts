import type { DiscoveredDomain, DiscoverOptions } from '@/services/domains/types';

export interface DomainDiscoveryProvider {
  discover(domain: string, options?: DiscoverOptions): AsyncGenerator<DiscoveredDomain>;
}
