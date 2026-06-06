import { z } from 'zod';

export const RequestOptionsSchema = z.object({
    method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).default('POST'),
    headers: z.record(z.string(), z.string()).optional(),
    maxRetries: z.number().int().min(0).default(3),
    initialDelayMs: z.number().int().min(0).default(1000),
    backoffFactor: z.number().min(1).default(2),
    retryStatusCodes: z.array(z.number().int()).default([429, 500, 502, 503, 504]),
});

export type RequestOptions = z.infer<typeof RequestOptionsSchema>;

type WithRetryOptions<T> = Partial<RequestOptions> & {
    responseSchema?: z.ZodType<T>;
};

const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

export async function withRetry<T = unknown>(
    url: string,
    apiKey: string,
    body: unknown,
    params?: Record<string, string | number>,
    options?: WithRetryOptions<T>,
): Promise<T> {
    const { responseSchema, ...rawOpts } = options ?? {};
    const opts = RequestOptionsSchema.parse(rawOpts);

    const fullUrl = buildUrl(url, params);

    let lastError: Error = new Error('Request failed');

    for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
        if (attempt > 0) {
            const delay = opts.initialDelayMs * Math.pow(opts.backoffFactor, attempt - 1);
            await sleep(delay);
        }

        try {
            const customHeaders = opts.headers ?? {};
            const hasCustomAuth = 'X-KEY' in customHeaders || 'Authorization' in customHeaders;
            const response = await fetch(fullUrl, {
                method: opts.method,
                headers: {
                    'Content-Type': 'application/json',
                    ...(hasCustomAuth ? {} : { 'Authorization': `Bearer ${apiKey}` }),
                    ...customHeaders,
                },
                body: opts.method !== 'GET' ? JSON.stringify(body) : undefined,
            });

            if (opts.retryStatusCodes.includes(response.status)) {
                lastError = new HttpError(response.status, response.statusText);
                continue;
            }

            if (!response.ok) {
                throw new HttpError(response.status, response.statusText);
            }

            const json: unknown = await response.json();
            return responseSchema ? responseSchema.parse(json) : (json as T);
        } catch (err) {
            if (err instanceof HttpError && !opts.retryStatusCodes.includes(err.status)) {
                throw err;
            }
            if (err instanceof Error) lastError = err;
            if (attempt === opts.maxRetries) throw lastError;
        }
    }

    throw lastError;
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
