import type { LinkedInProfile, Contact } from '@/services/types';

const sleep  = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const jitter = (base: number, spread: number) => base + Math.random() * spread;

export async function* mockEmails(domain: string, profiles: LinkedInProfile[]): AsyncGenerator<Contact> {
  for (const profile of profiles) {
    await sleep(jitter(180, 320));
    const [first, ...rest] = profile.name.toLowerCase().split(' ');
    const last = rest.at(-1) ?? '';
    yield {
      email:       `${first}.${last}@${domain}`,
      name:        profile.name,
      title:       profile.title,
      linkedinUrl: profile.url,
    };
  }
}
