import chalk from 'chalk';

interface FatalOptions {
  hint?: string;
  got?: string;
}

export function fatal(message: string, opts: FatalOptions = {}): never {
  const tag    = chalk.bgRed.bold.white(' ERROR ');
  const indent = ' '.repeat(10);

  process.stderr.write('\n');
  process.stderr.write(`  ${tag}  ${chalk.bold.white(message)}\n`);

  if (opts.got) {
    process.stderr.write(`${indent}${chalk.dim('got  ')}${chalk.yellow(opts.got)}\n`);
  }

  if (opts.hint) {
    process.stderr.write(`${indent}${chalk.dim('hint ')}${chalk.gray(opts.hint)}\n`);
  }

  process.stderr.write('\n');
  process.exit(1);
}
