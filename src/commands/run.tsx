import { render } from 'ink';
import { z } from 'zod';
import { parse as parseDomain } from 'tldts';
import { RunPipeline } from '@/ui/RunPipeline.tsx';
import { fatal } from '@/utils/fatal.ts';

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

export function runCommand(domain: string): void {
  const result = DomainSchema.safeParse(domain);

  if (!result.success) {
    fatal(result.error.issues[0]?.message ?? 'Invalid domain', {
      got:  domain,
      hint: 'Example: acme.com  or  api.acme.co.uk',
    });
  }

  const { waitUntilExit } = render(<RunPipeline domain={result.data} />);
  waitUntilExit().then(() => process.exit(0)).catch(() => process.exit(1));
}
