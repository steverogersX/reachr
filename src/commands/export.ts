import path from 'node:path';
import fs from 'node:fs/promises';
import { readAllCaches } from '@/utils/cache';
import type { ProfileRecord } from '@/pipeline';

const CSV_HEADERS = ['domain', 'name', 'title', 'linkedin_url', 'email'];

function toCSV(profiles: ProfileRecord[]): string {
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const rows = profiles.map(p =>
        [p.domain, p.name, p.title, p.linkedinUrl, p.email ?? ''].map(escape).join(','),
    );
    return [CSV_HEADERS.join(','), ...rows].join('\n') + '\n';
}

function link(text: string, url: string): string {
    return `\x1b]8;;${url}\x1b\\${text}\x1b]8;;\x1b\\`;
}

function toFileUrl(absPath: string): string {
    const normalized = absPath.replace(/\\/g, '/');
    return normalized.startsWith('/') ? `file://${normalized}` : `file:///${normalized}`;
}

export async function exportCommand(): Promise<void> {
    const profiles = await readAllCaches();

    if (profiles.length === 0) {
        process.stderr.write(
            `\n  ● No cached data found.\n` +
            `    Run reachr run <domain> first.\n\n`,
        );
        process.exit(1);
    }

    const filename = 'reachr-export.csv';
    const outPath  = path.resolve(process.cwd(), filename);

    await fs.writeFile(outPath, toCSV(profiles), 'utf8');

    const fileLink = link(filename, toFileUrl(outPath));
    process.stdout.write(
        `\n  ${profiles.length} contact${profiles.length !== 1 ? 's' : ''} — ${fileLink}\n\n`,
    );
}
