import type { DomainDiscoveryProvider } from '@/services/domains/DomainDiscoveryProvider';
import type { DiscoveredDomain, DiscoverOptions, RetryEvent } from '@/services/domains/types';
import { log } from '@/utils/logger';

interface CompanyRichItem {
  domain: string;
  name:   string;
}

interface CompanyRichResponse {
  items: CompanyRichItem[];
}

export interface CompanyRichConfig {
  apiKey:      string;
  baseUrl:     string;
  maxAttempts: number;
  backoffMs:   number;
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export class CompanyRichDomainDiscoveryProvider implements DomainDiscoveryProvider {
  constructor(private readonly cfg: CompanyRichConfig) {}

  async *discover(domain: string, options: DiscoverOptions = {}): AsyncGenerator<DiscoveredDomain> {
    const items = await this.fetchWithRetry(domain, options.onRetry);
    for (const item of items) {
      yield { name: item.domain };
    }
  }

  private async fetchWithRetry(
    domain: string,
    onRetry?: (event: RetryEvent) => void,
  ): Promise<CompanyRichItem[]> {
    let lastError!: Error;

    for (let attempt = 1; attempt <= this.cfg.maxAttempts; attempt++) {
      try {
        return await this.fetchSimilar(domain);
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));

        log('CompanyRich', `attempt ${attempt}/${this.cfg.maxAttempts} failed`, {
          message: lastError.message,
          cause:   lastError.cause instanceof Error ? lastError.cause.message : lastError.cause,
        });

        if (attempt === this.cfg.maxAttempts) break;

        const retryInMs = this.cfg.backoffMs * 2 ** (attempt - 1);
        onRetry?.({ attempt, maxAttempts: this.cfg.maxAttempts, retryInMs, error: lastError });
        await sleep(retryInMs);
      }
    }

    throw lastError;
  }

  private async fetchSimilar(domain: string): Promise<CompanyRichItem[]> {
    const url = `${this.cfg.baseUrl}/companies/similar`;

    log('CompanyRich', `POST ${url}`, { domain });

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization:  `Bearer ${this.cfg.apiKey}`,
        'Content-Type': 'application/json',
        Accept:         'application/json',
      },
      body: JSON.stringify({ domain }),
    });

    log('CompanyRich', `response ${res.status} ${res.statusText}`);

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      log('CompanyRich', 'error body', body);
      throw new Error(`CompanyRich HTTP ${res.status}: ${body || res.statusText}`);
    }

    const data = (await res.json()) as CompanyRichResponse;
    log('CompanyRich', `ok — ${data.items.length} items`);
    return data.items;
  }
}
