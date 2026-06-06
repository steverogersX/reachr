import { config }                             from '@/config';
import { MockDomainDiscoveryProvider }        from '@/services/domains/providers/MockDomainDiscoveryProvider';
import { CompanyRichDomainDiscoveryProvider } from '@/services/domains/providers/CompanyRichDomainDiscoveryProvider';
import { ProspeoProfileDiscoveryProvider }    from '@/services/profiles/providers/ProspeoProfileDiscoveryProvider';
import { MockProfileDiscoveryProvider }       from '@/services/profiles/providers/MockProfileDiscoveryProvider';
import { mockEmails }                         from '@/mock/index';
import type { ReachServices }                 from '@/services/types';

const domainProvider = config.MOCK
  ? new MockDomainDiscoveryProvider()
  : new CompanyRichDomainDiscoveryProvider({
      apiKey:      config.COMPANYRICH_API_KEY,
      baseUrl:     config.COMPANYRICH_BASE_URL,
      maxAttempts: config.COMPANYRICH_MAX_ATTEMPTS,
      backoffMs:   config.COMPANYRICH_BACKOFF_MS,
    });

const profileProvider = config.MOCK
  ? new MockProfileDiscoveryProvider()
  : new ProspeoProfileDiscoveryProvider({
      apiKey:      config.PROSPEO_API_KEY,
      baseUrl:     config.PROSPEO_BASE_URL,
      limit:       config.PROSPEO_LIMIT,
      maxAttempts: config.PROSPEO_MAX_ATTEMPTS,
      backoffMs:   config.PROSPEO_BACKOFF_MS,
    });

export const services: ReachServices = {
  getDomains:  (domain, options)  => domainProvider.discover(domain, options),
  getProfiles: (domain, domains)  => profileProvider.discover(domain, domains),
  getEmails:   (domain, profiles) => mockEmails(domain, profiles),
};

export type { ReachServices, DiscoveredDomain, LinkedInProfile, Contact, StageStatus } from '@/services/types';
