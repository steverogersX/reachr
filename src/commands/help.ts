import chalk from 'chalk';
import { DEFAULT_PIPELINE_OPTIONS } from '@/pipeline/types';

const { maxDomains, maxProfilesPerDomain } = DEFAULT_PIPELINE_OPTIONS;

const dim   = chalk.dim;
const bold  = chalk.bold;
const cyan  = chalk.cyanBright;
const green = chalk.greenBright;
const gray  = chalk.gray;

function row(flag: string, desc: string, def?: string): string {
  const defPart = def ? gray(`  (default: ${def})`) : '';
  return `  ${cyan(flag.padEnd(28))}${dim(desc)}${defPart}`;
}

export function helpCommand(): void {
  console.log();
  console.log(`  ${bold('reachr')}  ${gray('·')}  ${dim('Domain → LinkedIn → emails. Outbound, automated.')}`);
  console.log();
  console.log(bold('USAGE'));
  console.log(`  ${cyan('reachr')} ${green('<command>')} ${gray('[options]')}`);
  console.log();
  console.log(bold('COMMANDS'));
  console.log(`  ${cyan('run')} ${green('<domain>')}              ${dim('Run the full outreach pipeline for a domain')}`);
  console.log(`  ${cyan('help')}                       ${dim('Show this help message')}`);
  console.log();
  console.log(bold('RUN OPTIONS'));
  console.log(row('--max-domains <n>',  'Max similar domains to process',         String(maxDomains)));
  console.log(row('--max-profiles <n>', 'Max LinkedIn profiles per domain',        String(maxProfilesPerDomain)));
  console.log(row('-h, --help',         'Show help for a specific command',        ''));
  console.log();
  console.log(bold('EXAMPLES'));
  console.log(`  ${dim('# Run with defaults (10 domains, 25 profiles each)')}`);
  console.log(`  ${cyan('reachr run')} kfc.com`);
  console.log();
  console.log(`  ${dim('# Narrow scope: 3 domains, 10 profiles each')}`);
  console.log(`  ${cyan('reachr run')} kfc.com ${green('--max-domains')} 3 ${green('--max-profiles')} 10`);
  console.log();
  console.log(`  ${dim('# Wide sweep: 20 domains, 50 profiles each')}`);
  console.log(`  ${cyan('reachr run')} kfc.com ${green('--max-domains')} 20 ${green('--max-profiles')} 50`);
  console.log();
}
