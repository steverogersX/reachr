import { render } from 'ink';
import { z } from 'zod';
import { RunPipeline } from '../ui/RunPipeline.js';

const DomainSchema = z
  .string()
  .trim()
  .toLowerCase()
  .regex(
    /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?$/,
    'Must be a valid domain (e.g. acme.com or sub.acme.co.uk)',
  );

export function runCommand(domain: string): void {
  const result = DomainSchema.safeParse(domain);

  if (!result.success) {
    const message = result.error.issues[0]?.message ?? 'Invalid domain';
    process.stderr.write(`\n  ✗  ${message}\n  Got: "${domain}"\n\n`);
    process.exit(1);
  }

  const { waitUntilExit } = render(<RunPipeline domain={result.data} />);
  waitUntilExit().then(() => process.exit(0)).catch(() => process.exit(1));
}
