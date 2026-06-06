import type { ReachServices, Field, LinkedInProfile, Contact } from '../services/types.js';

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const jitter = (base: number, spread: number) => base + Math.random() * spread;

// ─── Static data ─────────────────────────────────────────────────────────────

const FIELDS_BY_DOMAIN: Record<string, string[]> = {
  'stripe.com':  ['Fintech', 'Payment Processing', 'Developer Tools', 'API Platform', 'SaaS'],
  'notion.so':   ['Productivity', 'SaaS', 'Collaboration', 'Knowledge Management', 'B2B'],
  'vercel.com':  ['Cloud Infrastructure', 'Developer Tools', 'Hosting', 'Frontend Platform', 'SaaS'],
  default:       ['Technology', 'SaaS', 'B2B Software', 'Cloud Infrastructure', 'Enterprise'],
};

const PROFILES: LinkedInProfile[] = [
  { url: 'linkedin.com/in/alex-morgan-cto',   name: 'Alex Morgan',  title: 'Chief Technology Officer' },
  { url: 'linkedin.com/in/priya-sharma-vp',   name: 'Priya Sharma', title: 'VP of Sales'               },
  { url: 'linkedin.com/in/daniel-lee-eng',    name: 'Daniel Lee',   title: 'Head of Engineering'       },
  { url: 'linkedin.com/in/sofia-chen-ceo',    name: 'Sofia Chen',   title: 'CEO & Co-founder'          },
];

// ─── Generators ──────────────────────────────────────────────────────────────

async function* getFields(domain: string): AsyncGenerator<Field> {
  const names = FIELDS_BY_DOMAIN[domain] ?? FIELDS_BY_DOMAIN['default']!;
  for (const name of names) {
    await sleep(jitter(220, 180));
    yield { name };
  }
}

async function* getProfiles(domain: string, _fields: Field[]): AsyncGenerator<LinkedInProfile> {
  for (const profile of PROFILES) {
    await sleep(jitter(320, 280));
    yield profile;
  }
}

async function* getEmails(domain: string, profiles: LinkedInProfile[]): AsyncGenerator<Contact> {
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

// ─── Export ───────────────────────────────────────────────────────────────────

export const mockServices: ReachServices = { getFields, getProfiles, getEmails };
