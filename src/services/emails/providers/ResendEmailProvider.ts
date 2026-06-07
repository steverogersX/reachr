import { z } from 'zod';
import { config } from '@/config';
import { withRetry } from '@/utils/http';
import type { EmailSendProvider } from '../types';
import type { RenderedEmail } from '../templates/render';

const ResendSendResponseSchema = z.object({
    id: z.string(),
});

export class ResendEmailProvider implements EmailSendProvider {
    private readonly cfg = config.resend;

    async send(to: string, email: RenderedEmail): Promise<{ messageId: string }> {
        if (!this.cfg.apiKey) throw new Error('RESEND_API_KEY is required to send via Resend');

        const data = await withRetry(
            `${this.cfg.baseUrl}/emails`,
            this.cfg.apiKey,
            {
                from: this.cfg.from,
                to,
                subject: email.subject,
                html: email.html,
                text: email.text,
            },
            undefined,
            {
                responseSchema: ResendSendResponseSchema,
                maxRetries: this.cfg.maxAttempts - 1,
                initialDelayMs: this.cfg.backoffMs,
            },
        );

        return { messageId: data.id };
    }
}
