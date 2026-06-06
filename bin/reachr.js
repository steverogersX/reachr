#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const dir   = dirname(fileURLToPath(import.meta.url));
const tsx   = resolve(dir, '../node_modules/.bin/tsx');
const entry = resolve(dir, '../src/index.ts');

const bin = process.platform === 'win32' ? `${tsx}.cmd` : tsx;

const child = spawn(bin, [entry, ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: process.env,
  cwd: resolve(dir, '..'),
  shell: process.platform === 'win32',
});

child.on('exit', (code) => process.exit(code ?? 0));
child.on('error', (err) => { process.stderr.write(`\n  Error: ${err.message}\n\n`); process.exit(1); });
