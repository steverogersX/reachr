import 'dotenv/config';
import { z } from 'zod';

const optionalBool = z.string().optional().transform(v => (v === undefined ? undefined : v === 'true'));

const ConfigSchema = z.object({
    mock: z
        .object({
            global:   z.string().default('false').transform(v => v === 'true'),
            domains:  optionalBool,
            profiles: optionalBool,
            emails:   optionalBool,
            send:     optionalBool,
        })
        .transform(m => ({
            domains:  m.domains  ?? m.global,
            profiles: m.profiles ?? m.global,
            emails:   m.emails   ?? m.global,
            send:     m.send     ?? m.global,
        })),

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

    outreach: z.object({
        senderName: z.string().min(1).default('Reachr'),
        senderCompany: z.string().min(1).default('Reachr'),
    }),

    resend: z.object({
        apiKey: z.string().default(''),
        baseUrl: z.string().url('RESEND_BASE_URL must be a valid URL').default('https://api.resend.com'),
        from: z.string().default(''),
        maxAttempts: z.coerce.number().int().min(1).default(3),
        backoffMs: z.coerce.number().int().min(0).default(1000),
        rateLimit: z.coerce.number().int().min(1).default(2),
    }),
});

function load() {
    const result = ConfigSchema.safeParse({
        mock: {
            global:   process.env.MOCK,
            domains:  process.env.MOCK_DOMAINS,
            profiles: process.env.MOCK_PROFILES,
            emails:   process.env.MOCK_EMAILS,
            send:     process.env.MOCK_SEND,
        },
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
        outreach: {
            senderName: process.env.SENDER_NAME,
            senderCompany: process.env.SENDER_COMPANY,
        },
        resend: {
            apiKey: process.env.RESEND_API_KEY,
            baseUrl: process.env.RESEND_BASE_URL,
            from: process.env.RESEND_FROM,
            maxAttempts: process.env.RESEND_MAX_ATTEMPTS,
            backoffMs: process.env.RESEND_BACKOFF_MS,
            rateLimit: process.env.RESEND_RATE_LIMIT,
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
