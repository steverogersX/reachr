import type { DomainDiscoveryProvider } from '@/services/domains/DomainDiscoveryProvider';
import type { DiscoveredDomain, DiscoverOptions } from '@/services/domains/types';

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const jitter = (base: number, spread: number) => base + Math.random() * spread;

const RELATED_DOMAINS: Record<string, string[]> = {
  'stripe.com':  ['stripe.co.uk', 'stripe.de', 'stripe.jp', 'stripe.com.au', 'stripe.ca'],
  'notion.so':   ['notion.com', 'notion.site', 'notionhq.com'],
  'vercel.com':  ['vercel.app', 'vercel.sh', 'now.sh'],
  default:       [],
};

export class MockDomainDiscoveryProvider implements DomainDiscoveryProvider {
  async *discover(domain: string, _options: DiscoverOptions = {}): AsyncGenerator<DiscoveredDomain> {
    const related = RELATED_DOMAINS[domain] ?? RELATED_DOMAINS['default']!;

    yield { name: domain };

    for (const name of related) {
      await sleep(jitter(200, 150));
      yield { name };
    }
  }
}
