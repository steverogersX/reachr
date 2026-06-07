import { config } from '@/config';
import { SmtpEmailProvider, emailTemplates, renderEmail, type EmailTemplateName, type EmailTemplateProps } from '@/services/emails';

const sampleProfile: EmailTemplateProps = {
    domain: 'acme.com',
    name: 'Jordan Lee',
    title: 'Head of Growth',
    linkedinUrl: 'https://linkedin.com/in/jordan-lee',
    senderName: 'Alex Park',
    senderCompany: 'Reachr',
};

export async function previewEmailCommand(template: string, to: string): Promise<void> {
    if (!(template in emailTemplates)) {
        const names = Object.keys(emailTemplates).join(', ');
        throw new Error(`Unknown template "${template}". Available templates: ${names}`);
    }

    const rendered = await renderEmail(template as EmailTemplateName, sampleProfile);
    await new SmtpEmailProvider().send(to, rendered);

    process.stdout.write(`\n  Sent "${template}" preview to ${to} via ${config.smtp.host}:${config.smtp.port}\n`);
    process.stdout.write(`  Open the MailDev UI at http://localhost:1080 to view it.\n\n`);
}
