import { config }                             from '@/config';
import { MockDomainDiscoveryProvider }        from '@/services/domains/providers/MockDomainDiscoveryProvider';
import { CompanyRichDomainDiscoveryProvider } from '@/services/domains/providers/CompanyRichDomainDiscoveryProvider';
import { mockProfiles, mockEmails }           from '@/mock/index';
import type { ReachServices }                 from '@/services/types';

const domainProvider = config.MOCK
  ? new MockDomainDiscoveryProvider()
  : new CompanyRichDomainDiscoveryProvider({
      apiKey:      config.COMPANYRICH_API_KEY,
      baseUrl:     config.COMPANYRICH_BASE_URL,
      maxAttempts: config.COMPANYRICH_MAX_ATTEMPTS,
      backoffMs:   config.COMPANYRICH_BACKOFF_MS,
    });

export const services: ReachServices = {
  getDomains:  (domain, options)  => domainProvider.discover(domain, options),
  getProfiles: (domain, domains)  => mockProfiles(domain, domains),
  getEmails:   (domain, profiles) => mockEmails(domain, profiles),
};

export type { ReachServices, DiscoveredDomain, LinkedInProfile, Contact, StageStatus } from '@/services/types';
