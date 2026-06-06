import { render } from 'ink';
import { z } from 'zod';
import { parse as parseDomain } from 'tldts';
import { RunPipeline } from '@/ui/RunPipeline';
import { fatal } from '@/utils/fatal';
import { DEFAULT_PIPELINE_OPTIONS } from '@/pipeline/types';

const DomainSchema = z
  .string()
  .trim()
  .toLowerCase()
  .refine(
    (d) => {
      const { domain, isIcann, isPrivate } = parseDomain(d, { allowPrivateDomains: true });
      return !!domain && (isIcann === true || isPrivate === true);
    },
    'Must be a valid domain (e.g. acme.com, shop.io, api.acme.co.uk)',
  );

const PositiveInt = z.coerce.number().int().min(1);

interface RunCliOptions {
  maxDomains?:  string;
  maxProfiles?: string;
}

export function runCommand(domain: string, opts: RunCliOptions): void {
  const domainResult = DomainSchema.safeParse(domain);
  if (!domainResult.success) {
    fatal(domainResult.error.issues[0]?.message ?? 'Invalid domain', {
      got:  domain,
      hint: 'Example: acme.com  or  api.acme.co.uk',
    });
  }

  const maxDomains = opts.maxDomains !== undefined
    ? PositiveInt.parse(opts.maxDomains)
    : DEFAULT_PIPELINE_OPTIONS.maxDomains;

  const maxProfilesPerDomain = opts.maxProfiles !== undefined
    ? PositiveInt.parse(opts.maxProfiles)
    : DEFAULT_PIPELINE_OPTIONS.maxProfilesPerDomain;

  const { waitUntilExit } = render(
    <RunPipeline
      domain={domainResult.data}
      options={{ maxDomains, maxProfilesPerDomain }}
    />,
  );
  waitUntilExit().then(() => process.exit(0)).catch(() => process.exit(1));
}
