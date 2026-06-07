import { Command } from 'commander';
import chalk from 'chalk';

const accent = chalk.cyanBright;
const dim    = chalk.gray;
const bold   = chalk.bold;

const program = new Command()
    .name('reachr')
    .description('LinkedIn outreach pipeline — discover domains, find profiles, and send outreach emails')
    .version('1.0.0', '-v, --version')
    .configureHelp({
        styleTitle:                str => bold.white(str),
        styleUsage:                str => dim(str),
        styleCommandText:          str => accent(bold(str)),
        styleSubcommandText:       str => accent(bold(str)),
        styleCommandDescription:   str => dim(str),
        styleSubcommandDescription: str => dim(str),
        styleOptionTerm:           str => chalk.white(str),
        styleOptionDescription:    str => dim(str),
        styleArgumentTerm:         str => chalk.white(str),
        styleArgumentDescription:  str => dim(str),
    });

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
            process.stderr.write(`\n  ${chalk.red(msg)}\n\n`);
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
            process.stderr.write(`\n  ${chalk.red(msg)}\n\n`);
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
            process.stderr.write(`\n  ${chalk.red(msg)}\n\n`);
            process.exit(1);
        }
    });

program
    .command('report <domain>')
    .description('show a per-stage success/failure summary for the latest run')
    .action(async (domain: string) => {
        try {
            const { reportCommand } = await import('./commands/report.js');
            await reportCommand(domain);
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            process.stderr.write(`\n  ${chalk.red(msg)}\n\n`);
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
            process.stderr.write(`\n  ${chalk.red(msg)}\n\n`);
            process.exit(1);
        }
    });

function example(cmd: string, comment?: string): string {
    const line = `  ${chalk.gray('$')} ${accent(cmd)}`;
    return comment ? `${line}${dim(`  # ${comment}`)}` : line;
}

program.addHelpText('beforeAll', `\n${bold.white('reachr')}  ${dim('— LinkedIn outreach, end to end')}\n`);

program.addHelpText('after', `
${bold.white('Examples')}
${example('reachr run stripe.com')}
${example('reachr run stripe.com --max-domains 8 --max-profiles 5')}
${example('reachr export')}
${example('reachr clear-cache', 'clear all cached results')}
${example('reachr clear-cache stripe.com', 'clear cache for a single domain')}
${example('reachr report stripe.com', 'show per-stage results from the latest run')}
${example('docker compose up -d', 'start MailDev for local email testing')}
${example('reachr preview-email coldOutreach you@example.com')}
`);

program.parse();
