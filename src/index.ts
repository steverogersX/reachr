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

program.addHelpText('after', `
Examples:
  $ reachr run stripe.com
  $ reachr run stripe.com --max-domains 8 --max-profiles 5
  $ reachr export
`);

program.parse();
