import { config } from '@/config';
import { MockEmailDiscoveryProvider } from '../mocks';
import { ProspeoEmailProvider } from './providers/ProspeoEmailProvider';
import { ResendEmailProvider } from './providers/ResendEmailProvider';
import { SmtpEmailProvider } from './providers/SmtpEmailProvider';
import type { EmailDiscoveryProvider, EmailSendProvider } from './types';

export { ProspeoEmailProvider } from './providers/ProspeoEmailProvider';
export { ResendEmailProvider } from './providers/ResendEmailProvider';
export { SmtpEmailProvider } from './providers/SmtpEmailProvider';
export type { EmailDiscoveryProvider, EmailSendProvider } from './types';
export { emailTemplates, renderEmail } from './templates/render';
export type { EmailTemplateName, RenderedEmail } from './templates/render';
export type { EmailTemplateProps } from './templates/types';

export function createEmailDiscoveryProvider(): EmailDiscoveryProvider {
    return config.mock.emails ? new MockEmailDiscoveryProvider() : new ProspeoEmailProvider();
}

export function createEmailSendProvider(): EmailSendProvider {
    return config.mock.send ? new SmtpEmailProvider() : new ResendEmailProvider();
}
