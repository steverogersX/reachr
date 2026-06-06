import { z } from 'zod';
import { parse } from 'tldts';

export const DomainSchema = z
    .string()
    .min(1)
    .transform(v => v.replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase())
    .refine(v => {
        const result = parse(v);
        return result.domain !== null && !result.isIp;
    }, 'Must be a valid domain (e.g. example.com)');

export type Domain = z.infer<typeof DomainSchema>;

export interface DomainDiscoveryProvider {
    discoverLookalikeDomains(domain: Domain, maxResults?: number): Promise<Domain[]>;
}
