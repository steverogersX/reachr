import PQueue from 'p-queue';
import { services } from '@/services/index';
import { PipelineBus } from '@/pipeline/bus';
import type { DiscoveredDomain, LinkedInProfile, Contact } from '@/services/types';

const PROFILE_CONCURRENCY = 5;
const EMAIL_CONCURRENCY   = 10;
const MAX_RETRIES         = 2;

export async function runPipeline(rootDomain: string, bus: PipelineBus): Promise<void> {
  const profileQueue = new PQueue({ concurrency: PROFILE_CONCURRENCY });
  const emailQueue   = new PQueue({ concurrency: EMAIL_CONCURRENCY });
  const allContacts: Contact[] = [];

  // Stage 1: stream domains → immediately fan-out to Stage 2 workers
  try {
    for await (const domain of services.getDomains(rootDomain)) {
      bus.emit('domain:found', domain);
      profileQueue.add(() =>
        runProfilesForDomain(rootDomain, domain, bus, emailQueue, allContacts),
      );
    }
    bus.emit('domains:done');
  } catch (err) {
    const error = toError(err);
    bus.emit('domains:error', error);
    bus.emit('pipeline:error', error);
    return;
  }

  // Wait for all Stage 2 and Stage 3 workers to finish
  await profileQueue.onIdle();
  await emailQueue.onIdle();

  bus.emit('pipeline:done', allContacts);
}

async function runProfilesForDomain(
  rootDomain:   string,
  discovered:   DiscoveredDomain,
  bus:          PipelineBus,
  emailQueue:   PQueue,
  allContacts:  Contact[],
): Promise<void> {
  const taskId = discovered.name;
  bus.emit('profiles:task:start', taskId, discovered.name);

  try {
    await withRetry(MAX_RETRIES, async (attempt) => {
      if (attempt > 0) bus.emit('profiles:task:retry', taskId, attempt);

      for await (const profile of services.getProfiles(rootDomain, [discovered])) {
        bus.emit('profile:found', taskId, profile);
        emailQueue.add(() => runEmailForProfile(discovered.name, profile, bus, allContacts));
      }
    });

    bus.emit('profiles:task:done', taskId);
  } catch (err) {
    bus.emit('profiles:task:error', taskId, toError(err));
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
    }
  }
  throw lastError;
}

function toError(err: unknown): Error {
  return err instanceof Error ? err : new Error(String(err));
}
