import type { ProfileDiscoveryProvider } from '@/services/profiles/ProfileDiscoveryProvider';
import type { DiscoveredDomain } from '@/services/domains/types';
import type { LinkedInProfile } from '@/services/types';
import { log } from '@/utils/logger';

interface ProspeoPersonRecord {
  full_name?: string;
  first_name?: string;
  last_name?: string;
  linkedin_url?: string;
  current_job_title?: string;
}

interface ProspeoResponse {
  error: boolean;
  message?: string;
  results?: Array<{ person: ProspeoPersonRecord }>;
  pagination?: {
    current_page: number;
    total_page: number;
  };
}

export interface ProspeoConfig {
  apiKey: string;
  baseUrl: string;
  limit: number;
  maxAttempts: number;
  backoffMs: number;
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export class ProspeoProfileDiscoveryProvider implements ProfileDiscoveryProvider {
  constructor(private readonly cfg: ProspeoConfig) { }

  async *discover(
    _rootDomain: string,
    domains: DiscoveredDomain[],
  ): AsyncGenerator<LinkedInProfile> {
    for (const d of domains) {
      yield* this.searchDomain(d.name);
    }
  }

  private async *searchDomain(domain: string): AsyncGenerator<LinkedInProfile> {
    let page = 1;

    while (true) {
      const data = await this.fetchWithRetry(domain, page);

      for (const { person } of data.results ?? []) {
        if (!person.linkedin_url) continue;

        const name =
          person.full_name?.trim() ||
          [person.first_name, person.last_name].filter(Boolean).join(' ') ||
          'Unknown';

        yield { url: person.linkedin_url, name, title: person.current_job_title ?? '' };
      }

      const { current_page, total_page } = data.pagination ?? { current_page: page, total_page: page };
      if (current_page >= total_page) break;
      page++;
    }
  }

  private async fetchWithRetry(domain: string, page: number): Promise<ProspeoResponse> {
    let lastError!: Error;

    for (let attempt = 1; attempt <= this.cfg.maxAttempts; attempt++) {
      try {
        return await this.fetchPage(domain, page);
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        log('Prospeo', `attempt ${attempt}/${this.cfg.maxAttempts} failed`, { message: lastError.message });

        if (attempt === this.cfg.maxAttempts) break;

        const backoff = this.cfg.backoffMs * 2 ** (attempt - 1);
        log('Prospeo', `backing off ${backoff}ms before retry`);
        await sleep(backoff);
      }
    }

    throw lastError;
  }

  private async fetchPage(domain: string, page: number): Promise<ProspeoResponse> {
    const url = `${this.cfg.baseUrl}/search-person`;
    log('Prospeo', `POST ${url}`, { domain, page });

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'X-KEY': this.cfg.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page,
        filters: {
          company: {
            websites: { include: [domain] },
          },
        },
      }),
    });

    const body = (await res.json()) as ProspeoResponse;
    log('Prospeo', `response ${res.status}`, {
      error: body.error,
      count: body.results?.length,
      pagination: body.pagination,
    });

    if (!res.ok || body.error) {
      throw new Error(`Prospeo ${res.status}: ${body.message ?? res.statusText}`);
    }

    return body;
  }
}
