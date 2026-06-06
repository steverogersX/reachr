import type { ProfileDiscoveryProvider } from '@/services/profiles/ProfileDiscoveryProvider';
import type { DiscoveredDomain }          from '@/services/domains/types';
import type { LinkedInProfile }           from '@/services/types';

const sleep  = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const jitter = (base: number, spread: number) => base + Math.random() * spread;

const PROFILES: LinkedInProfile[] = [
  { url: 'linkedin.com/in/alex-morgan-cto', name: 'Alex Morgan',  title: 'Chief Technology Officer' },
  { url: 'linkedin.com/in/priya-sharma-vp', name: 'Priya Sharma', title: 'VP of Sales'               },
  { url: 'linkedin.com/in/daniel-lee-eng',  name: 'Daniel Lee',   title: 'Head of Engineering'       },
  { url: 'linkedin.com/in/sofia-chen-ceo',  name: 'Sofia Chen',   title: 'CEO & Co-founder'          },
];

export class MockProfileDiscoveryProvider implements ProfileDiscoveryProvider {
  async *discover(_rootDomain: string, _domains: DiscoveredDomain[]): AsyncGenerator<LinkedInProfile> {
    for (const profile of PROFILES) {
      await sleep(jitter(320, 280));
      yield profile;
    }
  }
}
