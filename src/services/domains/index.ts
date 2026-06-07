import { config } from '@/config';
import { MockDomainDiscoveryProvider } from '../mocks';
import { CompanyEnrichProvider } from './providers/CompanyEnrichProvider';
import type { DomainDiscoveryProvider } from './types';

export * from './types';
export * from './providers/CompanyEnrichProvider';

export function createDomainDiscoveryProvider(): DomainDiscoveryProvider {
    return config.mock ? new MockDomainDiscoveryProvider() : new CompanyEnrichProvider();
}
