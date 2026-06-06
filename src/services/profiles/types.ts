import { z } from 'zod';

export const LinkedinProfileSchema = z.object({
    personId:   z.string(),
    name:       z.string(),
    title:      z.string(),
    headline:   z.string(),
    profileUrl: z.string().url(),
});
export type LinkedinProfile = z.infer<typeof LinkedinProfileSchema>;

export interface LinkedinDiscoveryProvider {
    discoverLinkedinProfiles(domain: string, maxResultsPerDomain?: number): Promise<LinkedinProfile[]>;
}
