import { config } from '@/config';
import { withRetry } from '@/utils/http';
import type { DomainDiscoveryProvider, Domain } from '../types';

export class CompanyEnrichProvider implements DomainDiscoveryProvider {
    private readonly cfg = config.companyRich;

    async discoverLookalikeDomains(domain: Domain, maxResults = 10): Promise<Domain[]> {
        return withRetry<Domain[]>(
            `${this.cfg.baseUrl}/companies/similar`,
            this.cfg.apiKey,
            { domain, maxResults },
            undefined,
            {
                maxRetries: this.cfg.maxAttempts - 1,
                initialDelayMs: this.cfg.backoffMs,
            },
        );
    }
}
