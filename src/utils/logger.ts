import { appendFileSync } from 'node:fs';
import { resolve } from 'node:path';

const LOG_PATH = resolve(process.cwd(), '.reachr.log');

export function log(tag: string, msg: string, data?: unknown): void {
  const ts    = new Date().toISOString();
  const extra = data !== undefined ? ' ' + JSON.stringify(data, null, 0) : '';
  appendFileSync(LOG_PATH, `${ts} [${tag}] ${msg}${extra}\n`);
}
