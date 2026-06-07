import { z } from 'zod';

export const RequestOptionsSchema = z.object({
    method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).default('POST'),
    headers: z.record(z.string(), z.string()).optional(),
    maxRetries: z.number().int().min(0).default(3),
    initialDelayMs: z.number().int().min(0).default(1000),
    backoffFactor: z.number().min(1).default(2),
    // Only rate-limit responses are worth retrying with backoff — anything else
    // (bad request, auth, server errors) is a definitive failure, not a transient one.
    retryStatusCodes: z.array(z.number().int()).default([429]),
});

export type RequestOptions = z.infer<typeof RequestOptionsSchema>;

export interface RetryInfo {
    attempt:    number; // the retry attempt about to be made (1-based)
    maxRetries: number;
    delayMs:    number;
    status:     number;
}

type WithRetryOptions<T> = Partial<RequestOptions> & {
    responseSchema?: z.ZodType<T>;
    onRetry?: (info: RetryInfo) => void;
};

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export async function withRetry<T = unknown>(
    url: string,
    apiKey: string,
    body: unknown,
    params?: Record<string, string | number>,
    options?: WithRetryOptions<T>,
): Promise<T> {
    const { responseSchema, onRetry, ...rawOpts } = options ?? {};
    const opts = RequestOptionsSchema.parse(rawOpts);

    const fullUrl = buildUrl(url, params);

    const customHeaders = opts.headers ?? {};
    const hasCustomAuth = 'X-KEY' in customHeaders || 'Authorization' in customHeaders;

    for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
        const response = await fetch(fullUrl, {
            method: opts.method,
            headers: {
                'Content-Type': 'application/json',
                ...(hasCustomAuth ? {} : { 'Authorization': `Bearer ${apiKey}` }),
                ...customHeaders,
            },
            body: opts.method !== 'GET' ? JSON.stringify(body) : undefined,
        });

        // Rate limits are transient — back off and retry. Everything else
        // (bad request, auth, server errors) is a definitive failure: fail fast.
        if (opts.retryStatusCodes.includes(response.status)) {
            const error = new HttpError(response.status, response.statusText);
            if (attempt === opts.maxRetries) throw error;

            const delayMs = opts.initialDelayMs * Math.pow(opts.backoffFactor, attempt);
            onRetry?.({ attempt: attempt + 1, maxRetries: opts.maxRetries, delayMs, status: response.status });
            await sleep(delayMs);
            continue;
        }

        if (!response.ok) {
            throw new HttpError(response.status, response.statusText);
        }

        const json: unknown = await response.json();
        return responseSchema ? responseSchema.parse(json) : (json as T);
    }

    throw new Error('Request failed');
}

export class HttpError extends Error {
    constructor(
        public readonly status: number,
        message: string,
    ) {
        super(`HTTP ${status}: ${message}`);
        this.name = 'HttpError';
    }
}

function buildUrl(base: string, params?: Record<string, string | number>): string {
    if (!params || Object.keys(params).length === 0) return base;
    const query = new URLSearchParams(
        Object.entries(params).map(([k, v]) => [k, String(v)]),
    );
    return `${base}?${query}`;
}
