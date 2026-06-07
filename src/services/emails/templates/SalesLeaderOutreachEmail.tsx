import {
    Body,
    Button,
    Column,
    Container,
    Head,
    Heading,
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

const STATS: Array<{ value: string; label: string }> = [
    { value: '2.4x',  label: 'faster pipeline' },
    { value: '+38%',  label: 'reply rate' },
    { value: '14 hrs', label: 'saved per rep / week' },
];

const POINTS: string[] = [
    'Lookalike accounts surfaced automatically — no list-building busywork',
    'Verified contact data for the people who actually hold budget',
    'Outreach that reps can send in one click, not one afternoon',
];

// VP Sales — energetic, metrics-first, scannable: a stat row up top, a
// checklist of value props, and a single high-contrast CTA button.
export function SalesLeaderOutreachEmail(props: EmailTemplateProps) {
    const firstName = fallback(props.name, 'there').split(' ')[0];
    const domain = fallback(props.domain, 'your company');
    const senderName = fallback(props.senderName, 'The Reachr Team');
    const senderCompany = fallback(props.senderCompany, 'Reachr');

    return (
        <Html>
            <Head />
            <Preview>{`${firstName}, here's how reps at companies like ${domain} are filling pipeline faster`}</Preview>
            <Tailwind>
                <Body className="bg-slate-100 font-sans py-8">
                    <Container className="bg-white rounded-xl mx-auto max-w-xl overflow-hidden">
                        <Section className="bg-indigo-600 px-10 py-6">
                            <Text className="text-indigo-200 text-xs font-semibold tracking-widest uppercase m-0">
                                For sales leaders
                            </Text>
                            <Heading className="text-white text-2xl font-bold mt-1 mb-0">
                                More qualified pipeline, less manual prospecting
                            </Heading>
                        </Section>

                        <Section className="px-10 pt-8">
                            <Text className="text-gray-700 text-[15px] leading-6 mb-4">
                                Hi {firstName} — quick one for your team at <strong>{domain}</strong>.
                                Reps using {senderCompany} skip the list-building grind and go
                                straight to qualified, contactable accounts:
                            </Text>
                        </Section>

                        <Section className="px-10 mb-2">
                            <Row>
                                {STATS.map(stat => (
                                    <Column key={stat.label} className="text-center px-2">
                                        <Text className="text-indigo-600 text-2xl font-bold m-0">
                                            {stat.value}
                                        </Text>
                                        <Text className="text-gray-500 text-xs leading-5 m-0">
                                            {stat.label}
                                        </Text>
                                    </Column>
                                ))}
                            </Row>
                        </Section>

                        <Section className="px-10 py-6">
                            {POINTS.map(point => (
                                <Row key={point} className="mb-2">
                                    <Column className="w-6 align-top">
                                        <Text className="text-indigo-600 text-[15px] font-bold m-0">✓</Text>
                                    </Column>
                                    <Column>
                                        <Text className="text-gray-700 text-[15px] leading-6 m-0">{point}</Text>
                                    </Column>
                                </Row>
                            ))}
                        </Section>

                        <Section className="px-10 pb-10">
                            <Button
                                href="https://cal.com/reachr/sales-demo"
                                className="bg-indigo-600 text-white text-[15px] font-semibold rounded-md px-6 py-3 text-center w-full box-border"
                            >
                                See it on your pipeline — book 15 minutes
                            </Button>
                            <Text className="text-gray-400 text-xs leading-5 mt-4 mb-0 text-center">
                                {senderName} · {senderCompany} · reply to opt out anytime
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
}

SalesLeaderOutreachEmail.subject = (props: EmailTemplateProps): string => {
    const domain = fallback(props.domain, 'your company');
    return `Filling pipeline faster at ${domain}`;
};

SalesLeaderOutreachEmail.PreviewProps = {
    name: 'Taylor Brooks',
    title: 'VP of Sales',
    domain: 'acme.com',
    linkedinUrl: 'https://linkedin.com/in/taylor-brooks',
    senderName: 'Alex Park',
    senderCompany: 'Reachr',
} satisfies EmailTemplateProps;

export default SalesLeaderOutreachEmail;
