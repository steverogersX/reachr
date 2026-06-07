import { z } from 'zod';
import { config } from '@/config';
import { withRetry } from '@/utils/http';
import type { DomainDiscoveryProvider, Domain } from '../types';


const CompanyRichItemSchema = z.object({
    domain: z.string(),
    name: z.string(),
});

const CompanyRichResponseSchema = z.object({
    items: z.array(CompanyRichItemSchema),
});

export class CompanyEnrichProvider implements DomainDiscoveryProvider {
    private readonly cfg = config.companyRich;

    async discoverLookalikeDomains(domain: Domain, maxResults = 10): Promise<Domain[]> {
        const data = await withRetry(
            `${this.cfg.baseUrl}/companies/similar`,
            this.cfg.apiKey,
            { domain, limit: maxResults },
            undefined,
            {
                maxRetries: this.cfg.maxAttempts - 1,
                initialDelayMs: this.cfg.backoffMs,
            },
        );

        const parsed = CompanyRichResponseSchema.safeParse(data);
        if (!parsed.success) {
            throw new Error(`Invalid response from CompanyEnrich: ${parsed.error}`);
        }

        if (parsed.data.items.length === 0) {
            throw new Error(`No similar domains found for ${domain}`);
        }

        return parsed.data.items.map((item) => item.domain);
    }
}
