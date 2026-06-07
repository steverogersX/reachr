import PQueue from 'p-queue';
import { config } from '@/config';
import { createDomainDiscoveryProvider } from './domains';
import { createProfileDiscoveryProvider } from './profiles';
import { createEmailDiscoveryProvider, createEmailSendProvider, renderEmail } from './emails';
import { TaskStore, PipelineState } from '@/pipeline';
import { readCache, writeCache } from '@/utils/cache';
import type { Domain } from './domains/types';

export interface WorkflowOptions {
    maxDomains:  number;
    maxProfiles: number;
}

const DEFAULTS: WorkflowOptions = { maxDomains: 4, maxProfiles: 3 };

export async function runSendStage(seedDomain: Domain, store: TaskStore, state: PipelineState): Promise<void> {
    const sendProvider = createEmailSendProvider();
    const queue = new PQueue({
        concurrency: 4,
        interval: 1000,
        intervalCap: config.resend.rateLimit,
    });

    store.add({ id: 'stage:send', label: 'Sending Emails', status: 'running' });

    const recipients = state.profiles.filter(record => record.email && !record.sentAt);

    await Promise.all(recipients.map(record => queue.add(async () => {
        const taskId = `send:${record.linkedinUrl}`;
        store.add({ id: taskId, label: record.name, status: 'running' }, 'stage:send');

        try {
            const rendered = await renderEmail('coldOutreach', {
                domain:        record.domain,
                name:          record.name,
                title:         record.title,
                linkedinUrl:   record.linkedinUrl,
                senderName:    config.outreach.senderName,
                senderCompany: config.outreach.senderCompany,
            });
            const { messageId } = await sendProvider.send(record.email!, rendered);
            state.markSent(record.linkedinUrl, messageId);
            store.update(taskId, { status: 'done', right: record.email });
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            store.update(taskId, { status: 'error', meta: `couldn't send to ${record.email}`, error });
        }
    })));

    store.update('stage:send', { status: 'done' });
    await writeCache(seedDomain, state.profiles);
}

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

    const domainProvider  = createDomainDiscoveryProvider();
    const profileProvider = createProfileDiscoveryProvider();

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
            const profiles = await profileProvider.discoverLinkedinProfiles(domain, MAX_PROFILES, ({ attempt, maxRetries, delayMs }) => {
                store.update(`profiles:${domain}`, {
                    status: 'retrying',
                    meta:   `rate limited · retrying in ${Math.round(delayMs / 1000)}s (${attempt}/${maxRetries})`,
                });
            });

            if (profiles.length === 0) {
                store.update(`profiles:${domain}`, { status: 'skipped', meta: `no data was found for ${domain}` });
            } else {
                for (const profile of profiles) {
                    store.add(
                        {
                            id:     `profile:${profile.profileUrl}`,
                            label:  profile.name,
                            status: 'done',
                            data:   profile,
                            meta:   profile.title,
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
            store.update(`profiles:${domain}`, { status: 'error', meta: `couldn't load profiles for ${domain}`, error });
        }
    }

    store.update('stage:profiles', { status: 'done' });

    const emailProvider = createEmailDiscoveryProvider();
    store.add({ id: 'stage:emails', label: 'Enriching Emails', status: 'running' });

    for (const record of state.profiles) {
        const taskId  = `email:${record.linkedinUrl}`;
        const personId = personIdMap.get(record.linkedinUrl);
        store.add({ id: taskId, label: record.name, status: 'running' }, 'stage:emails');

        if (!personId) {
            store.update(taskId, { status: 'skipped', meta: `no profile data to enrich ${record.name} from` });
            continue;
        }

        try {
            const email = await emailProvider.findEmail(personId);
            if (email) {
                state.updateEmail(record.linkedinUrl, email);
                store.update(taskId, { status: 'done', right: email });
            } else {
                store.update(taskId, { status: 'skipped', meta: `no email was found for ${record.name}` });
            }
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            store.update(taskId, { status: 'error', meta: `couldn't enrich email for ${record.name}`, error });
        }
    }

    store.update('stage:emails', { status: 'done' });

    await writeCache(seedDomain, state.profiles);
}
