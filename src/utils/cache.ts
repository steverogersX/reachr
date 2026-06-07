import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { z } from 'zod';
import { config } from '@/config';
import type { ProfileRecord } from '@/pipeline';

const CACHE_DIR = path.join(os.homedir(), '.cache', 'reachr');
const VERSION   = 1;

const CacheEntrySchema = z.object({
    version:  z.literal(1),
    domain:   z.string(),
    cachedAt: z.string(),
    profiles: z.array(z.object({
        domain:      z.string(),
        name:        z.string(),
        title:       z.string(),
        linkedinUrl: z.string(),
        email:       z.string().optional(),
        sentAt:      z.string().optional(),
        messageId:   z.string().optional(),
    })),
});

function cacheFile(domain: string): string {
    return path.join(CACHE_DIR, `${domain}.json`);
}

export async function readCache(domain: string): Promise<ProfileRecord[] | null> {
    try {
        const raw    = await fs.readFile(cacheFile(domain), 'utf8');
        const parsed = CacheEntrySchema.safeParse(JSON.parse(raw));
        if (!parsed.success) return null;

        const ageMs = Date.now() - new Date(parsed.data.cachedAt).getTime();
        const ttlMs = config.cache.ttlHours * 60 * 60 * 1000;
        if (ageMs > ttlMs) return null;

        return parsed.data.profiles;
    } catch {
        return null;
    }
}

export async function writeCache(domain: string, profiles: ProfileRecord[]): Promise<void> {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    const entry = { version: VERSION, domain, cachedAt: new Date().toISOString(), profiles };
    await fs.writeFile(cacheFile(domain), JSON.stringify(entry, null, 2), 'utf8');
}

export async function readAllCaches(): Promise<ProfileRecord[]> {
    try {
        const files = await fs.readdir(CACHE_DIR);
        const results = await Promise.all(
            files
                .filter(f => f.endsWith('.json'))
                .map(f => readCache(f.replace(/\.json$/, ''))),
        );
        return results.flatMap(r => r ?? []);
    } catch {
        return [];
    }
}
