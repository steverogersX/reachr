import { z } from 'zod';
import { config } from "@/config";
import { LinkedinDiscoveryProvider, LinkedinProfile } from "../types";
import { withRetry } from "@/utils/http";


const ProspeoPersonRecordSchema = z.object({
    person_id:         z.string().optional(),
    full_name:         z.string().optional(),
    first_name:        z.string().optional(),
    last_name:         z.string().optional(),
    linkedin_url:      z.string().optional(),
    current_job_title: z.string().optional(),
    headline:          z.string().optional(),
});

const ProspeoResponseSchema = z.object({
    error: z.boolean(),
    message: z.string().optional(),
    results: z.array(z.object({ person: ProspeoPersonRecordSchema })).optional(),
    pagination: z.object({
        current_page: z.number(),
        total_page: z.number(),
    }).optional(),
});

export class ProspeoProfileDiscoveryProvider implements LinkedinDiscoveryProvider {
    private readonly cfg = config.prospeo;

    async discoverLinkedinProfiles(domain: string, maxResults = 10): Promise<LinkedinProfile[]> {
        const data = await withRetry(
            `${this.cfg.baseUrl}/search-person`,
            this.cfg.apiKey,
            {
                page: 1,
                filters: {
                    company: {
                        websites: { include: [domain] },
                    },
                    max_person_per_company: Math.min(maxResults, 100),
                },
            },
            undefined,
            {
                headers: { 'X-KEY': this.cfg.apiKey },
                maxRetries: this.cfg.maxAttempts - 1,
                initialDelayMs: this.cfg.backoffMs,
            },
        );

        const parsed = ProspeoResponseSchema.safeParse(data);
        if (!parsed.success || parsed.data.error) {
            const errorMsg = parsed.success ? parsed.data.message ?? 'Unknown error' : parsed.error.message;
            throw new Error(`Failed to fetch profiles from Prospeo: ${errorMsg}`);
        }

        return (parsed.data.results ?? []).flatMap(({ person }) => {
            const name = person.full_name ?? [person.first_name, person.last_name].filter(Boolean).join(' ');
            if (!name || !person.linkedin_url || !person.person_id) return [];
            return [{
                personId:   person.person_id,
                name,
                title:      person.current_job_title ?? '',
                headline:   person.headline ?? '',
                profileUrl: person.linkedin_url,
            }];
        });
    }
}