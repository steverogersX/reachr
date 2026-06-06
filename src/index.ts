import '@/config';
import { Command } from 'commander';
import { runCommand }  from '@/commands/run';
import { helpCommand } from '@/commands/help';

const program = new Command();

program
  .name('reachr')
  .description('Domain → LinkedIn → emails. Outbound, automated.')
  .version('1.0.0');

program
  .command('run <domain>')
  .description('Run the full outreach pipeline for a domain')
  .option('--max-domains <n>',  'Max similar domains to process (default: 10)')
  .option('--max-profiles <n>', 'Max LinkedIn profiles per domain (default: 25)')
  .action(runCommand);

program
  .command('help', { isDefault: false })
  .description('Show usage and all options')
  .action(helpCommand);

program.parse();
