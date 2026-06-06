import { CompanyEnrichProvider } from './domains';
import { ProspeoProfileDiscoveryProvider } from './profiles/providers/ProspeoProvider';
import { TaskStore } from '@/pipeline';
import type { Domain } from './domains/types';

export async function runWorkflow(seedDomain: Domain, store: TaskStore): Promise<void> {
    const domainProvider = new CompanyEnrichProvider();
    const profileProvider = new ProspeoProfileDiscoveryProvider();

    store.add({ id: 'stage:domains', label: 'Discovering Domains', status: 'running' });

    const domains = await domainProvider.discoverLookalikeDomains(seedDomain);

    for (const domain of domains) {
        store.add({ id: `domain:${domain}`, label: domain, status: 'done' }, 'stage:domains');
    }
    store.update('stage:domains', { status: 'done' });

    store.add({ id: 'stage:profiles', label: 'Discovering Profiles', status: 'running' });

    for (const domain of domains) {
        store.add({ id: `profiles:${domain}`, label: domain, status: 'running' }, 'stage:profiles');

        try {
            const profiles = await profileProvider.discoverLinkedinProfiles(domain);

            if (profiles.length === 0) {
                store.update(`profiles:${domain}`, { status: 'skipped', meta: 'no contacts found' });
            } else {
                for (const profile of profiles) {
                    store.add(
                        {
                            id:     `profile:${domain}:${profile.name}`,
                            label:  profile.name,
                            status: 'done',
                            data:   profile,
                            meta:   profile.title,
                            right:  profile.profileUrl,
                        },
                        `profiles:${domain}`,
                    );
                }
                store.update(`profiles:${domain}`, { status: 'done' });
            }
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            store.update(`profiles:${domain}`, { status: 'error', error });
        }
    }

    store.update('stage:profiles', { status: 'done' });
}
