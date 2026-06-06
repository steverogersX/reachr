import { Command } from 'commander';

const program = new Command()
    .name('reachr')
    .description('LinkedIn outreach pipeline — discover domains and profiles')
    .version('1.0.0', '-v, --version');

program
    .command('run <domain>')
    .description('discover lookalike domains and LinkedIn profiles')
    .action(async (domain: string) => {
        try {
            const { runCommand } = await import('./commands/run.js');
            await runCommand(domain);
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            process.stderr.write(`\n  ${msg}\n\n`);
            process.exit(1);
        }
    });

program.addHelpText('after', `
Examples:
  $ reachr run stripe.com
  $ reachr run github.com
`);

program.parse();
