import type { LinkedInProfile, Contact, DiscoveredDomain } from '@/services/types';

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const jitter = (base: number, spread: number) => base + Math.random() * spread;

const PROFILES: LinkedInProfile[] = [
  { url: 'linkedin.com/in/alex-morgan-cto', name: 'Alex Morgan',  title: 'Chief Technology Officer' },
  { url: 'linkedin.com/in/priya-sharma-vp', name: 'Priya Sharma', title: 'VP of Sales'               },
  { url: 'linkedin.com/in/daniel-lee-eng',  name: 'Daniel Lee',   title: 'Head of Engineering'       },
  { url: 'linkedin.com/in/sofia-chen-ceo',  name: 'Sofia Chen',   title: 'CEO & Co-founder'          },
];

export async function* mockProfiles(_domain: string, _domains: DiscoveredDomain[]): AsyncGenerator<LinkedInProfile> {
  for (const profile of PROFILES) {
    await sleep(jitter(320, 280));
    yield profile;
  }
}

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
