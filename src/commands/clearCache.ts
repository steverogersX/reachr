import { clearCache } from '@/utils/cache';

export async function clearCacheCommand(domain?: string): Promise<void> {
    const count = await clearCache(domain);

    if (count === 0) {
        process.stdout.write(
            domain
                ? `\n  ● No cached data found for ${domain}.\n\n`
                : `\n  ● No cached data found.\n\n`,
        );
        return;
    }

    process.stdout.write(`\n  Cleared ${count} cache ${count === 1 ? 'entry' : 'entries'}.\n\n`);
}
