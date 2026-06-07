import nodemailer from 'nodemailer';
import { config } from '@/config';
import type { EmailSendProvider } from '../types';
import type { RenderedEmail } from '../templates/render';

export class SmtpEmailProvider implements EmailSendProvider {
    private readonly cfg = config.smtp;
    private readonly transport = nodemailer.createTransport({
        host: this.cfg.host,
        port: this.cfg.port,
        secure: false,
    });

    async send(to: string, email: RenderedEmail): Promise<{ messageId: string }> {
        const info = await this.transport.sendMail({
            from: this.cfg.from,
            to,
            subject: email.subject,
            html: email.html,
            text: email.text,
        });

        return { messageId: info.messageId };
    }
}
