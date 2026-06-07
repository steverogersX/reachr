import { render } from '@react-email/render';
import { ColdOutreachEmail } from './ColdOutreachEmail';
import { FollowUpEmail } from './FollowUpEmail';
import type { EmailTemplateProps } from './types';

export interface RenderedEmail {
    subject: string;
    html: string;
    text: string;
}

type EmailTemplate = ((props: EmailTemplateProps) => React.ReactElement) & {
    subject: (props: EmailTemplateProps) => string;
};

export const emailTemplates = {
    coldOutreach: ColdOutreachEmail,
    followUp: FollowUpEmail,
} satisfies Record<string, EmailTemplate>;

export type EmailTemplateName = keyof typeof emailTemplates;

export async function renderEmail(
    name: EmailTemplateName,
    props: EmailTemplateProps,
): Promise<RenderedEmail> {
    const Template = emailTemplates[name];
    const element = Template(props);

    const [html, text] = await Promise.all([
        render(element),
        render(element, { plainText: true }),
    ]);

    return { subject: Template.subject(props), html, text };
}
