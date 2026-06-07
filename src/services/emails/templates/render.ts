import { render } from '@react-email/render';
import { ColdOutreachEmail } from './ColdOutreachEmail';
import { FollowUpEmail } from './FollowUpEmail';
import { ExecutiveOutreachEmail } from './ExecutiveOutreachEmail';
import { SalesLeaderOutreachEmail } from './SalesLeaderOutreachEmail';
import { OperationsOutreachEmail } from './OperationsOutreachEmail';
import { HrOutreachEmail } from './HrOutreachEmail';
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
    executiveOutreach: ExecutiveOutreachEmail,
    salesLeaderOutreach: SalesLeaderOutreachEmail,
    operationsOutreach: OperationsOutreachEmail,
    hrOutreach: HrOutreachEmail,
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
