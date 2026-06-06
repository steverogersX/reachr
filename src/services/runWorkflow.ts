import { CompanyEnrichProvider } from './domains';
import { ProspeoProfileDiscoveryProvider } from './profiles/providers/ProspeoProvider';
import { ProspeoEmailProvider } from './emails';
import { TaskStore, PipelineState } from '@/pipeline';
import { readCache, writeCache } from '@/utils/cache';
import type { Domain } from './domains/types';

export interface WorkflowOptions {
    maxDomains:  number;
    maxProfiles: number;
}

const DEFAULTS: WorkflowOptions = { maxDomains: 4, maxProfiles: 3 };

export async function runWorkflow(
    seedDomain: Domain,
    store:      TaskStore,
    state:      PipelineState,
    opts:       Partial<WorkflowOptions> = {},
): Promise<void> {
    const cached = await readCache(seedDomain);
    if (cached) {
        for (const record of cached) state.addProfile(record);
        store.add({ id: 'stage:domains',  label: 'Discovering Domains',  status: 'done' });
        store.add({ id: 'stage:profiles', label: 'Discovering Profiles', status: 'done' });
        store.add({ id: 'stage:emails',   label: 'Enriching Emails',     status: 'done' });
        return;
    }

    const MAX_DOMAINS  = opts.maxDomains  ?? DEFAULTS.maxDomains;
    const MAX_PROFILES = opts.maxProfiles ?? DEFAULTS.maxProfiles;

    const domainProvider  = new CompanyEnrichProvider();
    const profileProvider = new ProspeoProfileDiscoveryProvider();

    store.add({ id: 'stage:domains', label: 'Discovering Domains', status: 'running' });

    const allDomains = await domainProvider.discoverLookalikeDomains(seedDomain);
    const domains    = allDomains.slice(0, MAX_DOMAINS);

    for (const domain of domains) {
        store.add({ id: `domain:${domain}`, label: domain, status: 'done' }, 'stage:domains');
    }
    store.update('stage:domains', { status: 'done' });

    store.add({ id: 'stage:profiles', label: 'Discovering Profiles', status: 'running' });

    // linkedinUrl → personId, built during profile discovery for use in email enrichment
    const personIdMap = new Map<string, string>();

    for (const domain of domains) {
        store.add({ id: `profiles:${domain}`, label: domain, status: 'running' }, 'stage:profiles');

        try {
            const profiles = await profileProvider.discoverLinkedinProfiles(domain, MAX_PROFILES);

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
                    state.addProfile({
                        domain,
                        name:        profile.name,
                        title:       profile.title,
                        linkedinUrl: profile.profileUrl,
                    });
                    personIdMap.set(profile.profileUrl, profile.personId);
                }
                store.update(`profiles:${domain}`, { status: 'done' });
            }
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            store.update(`profiles:${domain}`, { status: 'error', error });
        }
    }

    store.update('stage:profiles', { status: 'done' });

    const emailProvider = new ProspeoEmailProvider();
    store.add({ id: 'stage:emails', label: 'Enriching Emails', status: 'running' });

    for (const record of state.profiles) {
        const taskId  = `email:${record.linkedinUrl}`;
        const personId = personIdMap.get(record.linkedinUrl);
        store.add({ id: taskId, label: record.name, status: 'running' }, 'stage:emails');

        if (!personId) {
            store.update(taskId, { status: 'skipped', meta: 'missing person id' });
            continue;
        }

        try {
            const email = await emailProvider.findEmail(personId);
            if (email) {
                state.updateEmail(record.linkedinUrl, email);
                store.update(taskId, { status: 'done', right: email });
            } else {
                store.update(taskId, { status: 'skipped', meta: 'no email found' });
            }
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            store.update(taskId, { status: 'error', error });
        }
    }

    store.update('stage:emails', { status: 'done' });
    await writeCache(seedDomain, state.profiles);
}
