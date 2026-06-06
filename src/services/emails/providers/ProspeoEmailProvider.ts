import { z } from 'zod';
import { config } from '@/config';
import type { EmailDiscoveryProvider } from '../types';
import { withRetry } from '@/utils/http';

const ProspeoEnrichResponseSchema = z.object({
    error: z.boolean(),
    person: z.object({
        email: z.object({
            status: z.string(),
            revealed: z.boolean(),
            email: z.string().optional(),
        }).optional(),
    }).optional(),
});

export class ProspeoEmailProvider implements EmailDiscoveryProvider {
    private readonly cfg = config.prospeo;

    async findEmail(personId: string): Promise<string | null> {
        const data = await withRetry(
            `${this.cfg.baseUrl}/enrich-person`,
            this.cfg.apiKey,
            { only_verified_email: true, data: { person_id: personId } },
            undefined,
            {
                headers: { 'X-KEY': this.cfg.apiKey },
                maxRetries: this.cfg.maxAttempts - 1,
                initialDelayMs: this.cfg.backoffMs,
            },
        );

        const parsed = ProspeoEnrichResponseSchema.safeParse(data);
        if (!parsed.success || parsed.data.error) return null;

        const email = parsed.data.person?.email?.email;
        return email && email.length > 0 ? email : null;
    }
}
