import { Command } from 'commander';

const program = new Command()
    .name('reachr')
    .description('LinkedIn outreach pipeline — discover domains and profiles')
    .version('1.0.0', '-v, --version');

program
    .command('run <domain>')
    .description('discover lookalike domains and LinkedIn profiles')
    .option('--max-domains <n>', 'max lookalike domains to process', '4')
    .option('--max-profiles <n>', 'max profiles to fetch per domain', '3')
    .action(async (domain: string, opts: { maxDomains: string; maxProfiles: string }) => {
        try {
            const { runCommand } = await import('./commands/run.js');
            await runCommand(domain, {
                maxDomains:  parseInt(opts.maxDomains,  10),
                maxProfiles: parseInt(opts.maxProfiles, 10),
            });
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            process.stderr.write(`\n  ${msg}\n\n`);
            process.exit(1);
        }
    });

program
    .command('export')
    .description('export all cached contacts to CSV')
    .action(async () => {
        try {
            const { exportCommand } = await import('./commands/export.js');
            await exportCommand();
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            process.stderr.write(`\n  ${msg}\n\n`);
            process.exit(1);
        }
    });

program
    .command('clear-cache [domain]')
    .description('clear cached results (all domains, or a single domain)')
    .action(async (domain?: string) => {
        try {
            const { clearCacheCommand } = await import('./commands/clearCache.js');
            await clearCacheCommand(domain);
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            process.stderr.write(`\n  ${msg}\n\n`);
            process.exit(1);
        }
    });

program
    .command('preview-email <template> <to>')
    .description('render an email template and send it to a local MailDev inbox (dev only)')
    .action(async (template: string, to: string) => {
        try {
            const { previewEmailCommand } = await import('./commands/previewEmail.js');
            await previewEmailCommand(template, to);
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            process.stderr.write(`\n  ${msg}\n\n`);
            process.exit(1);
        }
    });

program.addHelpText('after', `
Examples:
  $ reachr run stripe.com
  $ reachr run stripe.com --max-domains 8 --max-profiles 5
  $ reachr export
  $ reachr clear-cache               # clear all cached results
  $ reachr clear-cache stripe.com    # clear cache for a single domain
  $ docker compose up -d            # start MailDev for local email testing
  $ reachr preview-email coldOutreach you@example.com
`);

program.parse();
