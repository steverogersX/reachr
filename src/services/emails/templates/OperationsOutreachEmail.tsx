import {
    Body,
    Button,
    Column,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Row,
    Section,
    Tailwind,
    Text,
} from '@react-email/components';
import type { EmailTemplateProps } from './types';

const fallback = (value: string | undefined | null, text: string): string =>
    value && value.trim().length > 0 ? value.trim() : text;

const STEPS: Array<{ n: string; title: string; detail: string }> = [
    { n: '01', title: 'Map the lookalikes',  detail: 'We surface accounts that match your best customers — automatically.' },
    { n: '02', title: 'Resolve the contacts', detail: 'Verified emails and roles, ready to hand to your team — no spreadsheet relay.' },
    { n: '03', title: 'Send and track',       detail: 'Outreach goes out on a schedule your team controls, with results you can audit.' },
];

// VP / Director of Operations — process-first, structured: a numbered
// workflow laid out like a runbook, plus a before/after comparison row.
export function OperationsOutreachEmail(props: EmailTemplateProps) {
    const firstName = fallback(props.name, 'there').split(' ')[0];
    const domain = fallback(props.domain, 'your company');
    const senderName = fallback(props.senderName, 'The Reachr Team');
    const senderCompany = fallback(props.senderCompany, 'Reachr');

    return (
        <Html>
            <Head />
            <Preview>A simpler workflow for outbound at {domain}</Preview>
            <Tailwind>
                <Body className="bg-white font-sans py-10">
                    <Container className="mx-auto max-w-xl px-10">
                        <Text className="text-teal-700 text-xs font-semibold tracking-widest uppercase mb-2">
                            Workflow review
                        </Text>
                        <Heading className="text-slate-900 text-[22px] font-semibold mb-4 leading-8">
                            Three steps to remove the manual handoffs in your outbound process
                        </Heading>

                        <Text className="text-slate-600 text-[15px] leading-6 mb-8">
                            Hi {firstName} — I work with operations leads at companies like{' '}
                            {domain} who are tired of outbound depending on three tools and a
                            spreadsheet. Here's the version of that workflow we run instead:
                        </Text>

                        <Section className="border border-slate-200 rounded-lg overflow-hidden mb-8">
                            {STEPS.map((step, i) => (
                                <Row key={step.n} className={i > 0 ? 'border-t border-slate-200' : ''}>
                                    <Column className="w-16 align-top bg-slate-50 px-4 py-4">
                                        <Text className="text-slate-400 text-sm font-bold m-0">{step.n}</Text>
                                    </Column>
                                    <Column className="px-4 py-4">
                                        <Text className="text-slate-900 text-[15px] font-semibold leading-6 m-0">
                                            {step.title}
                                        </Text>
                                        <Text className="text-slate-600 text-sm leading-6 mt-1 mb-0">
                                            {step.detail}
                                        </Text>
                                    </Column>
                                </Row>
                            ))}
                        </Section>

                        <Row className="mb-8">
                            <Column className="w-1/2 align-top pr-3">
                                <Text className="text-slate-400 text-xs font-semibold tracking-widest uppercase mb-1">
                                    Today
                                </Text>
                                <Text className="text-slate-600 text-sm leading-6 m-0">
                                    Lists built by hand, contacts verified one by one, handoffs
                                    tracked over Slack and spreadsheets.
                                </Text>
                            </Column>
                            <Column className="w-1/2 align-top pl-3 border-l border-slate-200">
                                <Text className="text-teal-700 text-xs font-semibold tracking-widest uppercase mb-1">
                                    With {senderCompany}
                                </Text>
                                <Text className="text-slate-600 text-sm leading-6 m-0">
                                    One pipeline, one owner, one place to see what went out and
                                    what came back.
                                </Text>
                            </Column>
                        </Row>

                        <Section className="mb-2">
                            <Button
                                href="https://cal.com/reachr/ops-walkthrough"
                                className="bg-slate-900 text-white text-[15px] font-semibold rounded-md px-6 py-3 text-center"
                            >
                                Walk through the workflow — 15 minutes
                            </Button>
                        </Section>

                        <Hr className="border-slate-100 my-8" />
                        <Text className="text-slate-400 text-xs leading-5">
                            {senderName} · {senderCompany} — reply anytime if this isn't a fit
                            and I'll close the loop.
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
}

OperationsOutreachEmail.subject = (props: EmailTemplateProps): string => {
    const domain = fallback(props.domain, 'your company');
    return `A simpler outbound workflow for ${domain}`;
};

OperationsOutreachEmail.PreviewProps = {
    name: 'Jamie Castillo',
    title: 'Director of Operations',
    domain: 'acme.com',
    linkedinUrl: 'https://linkedin.com/in/jamie-castillo',
    senderName: 'Alex Park',
    senderCompany: 'Reachr',
} satisfies EmailTemplateProps;

export default OperationsOutreachEmail;
