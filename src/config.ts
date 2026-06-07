import 'dotenv/config';
import { z } from 'zod';

const ConfigSchema = z.object({
    mock: z
        .string()
        .default('false')
        .transform(v => v === 'true'),

    companyRich: z.object({
        apiKey: z.string().min(1, 'COMPANYRICH_API_KEY is required'),
        baseUrl: z.string().url('COMPANYRICH_BASE_URL must be a valid URL'),
        maxAttempts: z.coerce.number().int().min(1).default(3),
        backoffMs: z.coerce.number().int().min(0).default(1000),
    }),

    prospeo: z.object({
        apiKey: z.string().min(1, 'PROSPEO_API_KEY is required'),
        baseUrl: z.string().url('PROSPEO_BASE_URL must be a valid URL'),
        limit: z.coerce.number().int().min(1).default(50),
        maxAttempts: z.coerce.number().int().min(1).default(3),
        backoffMs: z.coerce.number().int().min(0).default(800),
    }),

    cache: z.object({
        ttlHours: z.coerce.number().int().min(0).default(24),
    }),

    smtp: z.object({
        host: z.string().min(1).default('localhost'),
        port: z.coerce.number().int().min(1).default(1025),
        from: z.string().min(1).default('reachr@example.com'),
    }),
});

function load() {
    const result = ConfigSchema.safeParse({
        mock: process.env.MOCK,
        companyRich: {
            apiKey: process.env.COMPANYRICH_API_KEY,
            baseUrl: process.env.COMPANYRICH_BASE_URL,
            maxAttempts: process.env.COMPANYRICH_MAX_ATTEMPTS,
            backoffMs: process.env.COMPANYRICH_BACKOFF_MS,
        },
        prospeo: {
            apiKey: process.env.PROSPEO_API_KEY,
            baseUrl: process.env.PROSPEO_BASE_URL,
            limit: process.env.PROSPEO_LIMIT,
            maxAttempts: process.env.PROSPEO_MAX_ATTEMPTS,
            backoffMs: process.env.PROSPEO_BACKOFF_MS,
        },
        cache: {
            ttlHours: process.env.CACHE_TTL_HOURS,
        },
        smtp: {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            from: process.env.SMTP_FROM,
        },
    });

    if (!result.success) {
        const issues = result.error.issues
            .map(i => `  • ${i.path.join('.')}: ${i.message}`)
            .join('\n');
        throw new Error(`Invalid configuration:\n${issues}`);
    }

    return result.data;
}

export const config = load();
export type Config = typeof config;
