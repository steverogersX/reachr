import { services } from '@/services/index';
import { PipelineBus } from '@/pipeline/bus';
import type { DiscoveredDomain, LinkedInProfile, Contact } from '@/services/types';
import type { PipelineOptions } from '@/pipeline/types';
import { DEFAULT_PIPELINE_OPTIONS } from '@/pipeline/types';

const MAX_RETRIES      = 2;
const RETRY_BACKOFF_MS = 1_000;
const INTER_TASK_MS    = 1_500; // pause between tasks to avoid rate limits

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export async function runPipeline(
  rootDomain: string,
  bus:        PipelineBus,
  options:    PipelineOptions = DEFAULT_PIPELINE_OPTIONS,
): Promise<void> {
  const allContacts: Contact[] = [];
  const domains: DiscoveredDomain[] = [];

  // Stage 1: collect domains sequentially
  try {
    for await (const domain of services.getDomains(rootDomain)) {
      if (domains.length >= options.maxDomains) break;
      domains.push(domain);
      bus.emit('domain:found', domain);
    }
    bus.emit('domains:done');
  } catch (err) {
    const error = toError(err);
    bus.emit('domains:error', error);
    bus.emit('pipeline:error', error);
    return;
  }

  // Stage 2 + 3: one domain at a time, one profile at a time
  for (const domain of domains) {
    await runProfilesForDomain(rootDomain, domain, bus, allContacts, options);
    await sleep(INTER_TASK_MS);
  }

  bus.emit('pipeline:done', allContacts);
}

async function runProfilesForDomain(
  rootDomain:  string,
  discovered:  DiscoveredDomain,
  bus:         PipelineBus,
  allContacts: Contact[],
  options:     PipelineOptions,
): Promise<void> {
  const taskId   = discovered.name;
  const seenUrls = new Set<string>();
  const profiles: LinkedInProfile[] = [];
  bus.emit('profiles:task:start', taskId, discovered.name);

  try {
    await withRetry(MAX_RETRIES, async (attempt) => {
      if (attempt > 0) bus.emit('profiles:task:retry', taskId, attempt);

      for await (const profile of services.getProfiles(rootDomain, [discovered])) {
        if (seenUrls.has(profile.url)) continue;
        seenUrls.add(profile.url);
        if (seenUrls.size > options.maxProfilesPerDomain) break;
        bus.emit('profile:found', taskId, profile);
        profiles.push(profile);
      }
    });

    bus.emit('profiles:task:done', taskId);
  } catch (err) {
    bus.emit('profiles:task:error', taskId, toError(err));
    return;
  }

  // Stage 3: process each profile sequentially
  for (const profile of profiles) {
    await runEmailForProfile(discovered.name, profile, bus, allContacts);
    await sleep(INTER_TASK_MS);
  }
}

async function runEmailForProfile(
  domain:      string,
  profile:     LinkedInProfile,
  bus:         PipelineBus,
  allContacts: Contact[],
): Promise<void> {
  const taskId = profile.url;
  bus.emit('emails:task:start', taskId, profile);

  try {
    await withRetry(MAX_RETRIES, async (attempt) => {
      if (attempt > 0) bus.emit('emails:task:retry', taskId, attempt);

      for await (const contact of services.getEmails(domain, [profile])) {
        if (allContacts.some(c => c.email === contact.email)) continue;
        bus.emit('contact:found', taskId, contact);
        allContacts.push(contact);
      }
    });

    bus.emit('emails:task:done', taskId);
  } catch (err) {
    bus.emit('emails:task:error', taskId, toError(err));
  }
}

async function withRetry(
  maxRetries: number,
  fn: (attempt: number) => Promise<void>,
): Promise<void> {
  let lastError!: Error;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      await fn(attempt);
      return;
    } catch (err) {
      lastError = toError(err);
      if (attempt < maxRetries) {
        await sleep(RETRY_BACKOFF_MS * 2 ** attempt);
      }
    }
  }
  throw lastError;
}

function toError(err: unknown): Error {
  return err instanceof Error ? err : new Error(String(err));
}
