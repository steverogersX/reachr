import '@/config';
import { Command } from 'commander';
import { runCommand } from '@/commands/run';

const program = new Command();

program
  .name('reachr')
  .description('Domain → fields → LinkedIn → emails. Outbound, automated.')
  .version('1.0.0');

program
  .command('run <domain>')
  .description('Run the full outreach pipeline for a domain')
  .action(runCommand);

program.parse();
