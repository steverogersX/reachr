import { z } from 'zod';

export const LinkedinProfileSchema = z.object({
    name: z.string(),
    title: z.string(),
    profileUrl: z.string().url(),
});
export type LinkedinProfile = z.infer<typeof LinkedinProfileSchema>;

export interface LinkedinDiscoveryProvider {
    discoverLinkedinProfiles(domain: string, maxResultsPerDomain?: number): Promise<LinkedinProfile[]>;
}
