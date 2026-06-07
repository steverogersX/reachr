import type { RenderedEmail } from './templates/render';

export interface EmailDiscoveryProvider {
    findEmail(personId: string): Promise<string | null>;
}

export interface EmailSendProvider {
    send(to: string, email: RenderedEmail): Promise<{ messageId: string }>;
}
