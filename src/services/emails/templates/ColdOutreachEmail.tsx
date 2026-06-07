import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Link,
    Preview,
    Section,
    Tailwind,
    Text,
} from '@react-email/components';
import type { EmailTemplateProps } from './types';

const fallback = (value: string | undefined | null, text: string): string =>
    value && value.trim().length > 0 ? value.trim() : text;

export function ColdOutreachEmail(props: EmailTemplateProps) {
    const firstName = fallback(props.name, 'there').split(' ')[0];
    const title = fallback(props.title, 'what you do');
    const domain = fallback(props.domain, 'your company');
    const senderName = fallback(props.senderName, 'The Reachr Team');
    const senderCompany = fallback(props.senderCompany, 'Reachr');

    return (
        <Html>
            <Head />
            <Preview>A quick note for {firstName} at {domain}</Preview>
            <Tailwind>
                <Body className="bg-gray-100 font-sans py-8">
                    <Container className="bg-white rounded-lg mx-auto max-w-xl p-10">
                        <Heading className="text-gray-900 text-2xl font-semibold mb-4">
                            Hi {firstName},
                        </Heading>

                        <Text className="text-gray-700 text-[15px] leading-6 mb-4">
                            I came across your profile and saw you work as{' '}
                            <strong>{title}</strong> at <strong>{domain}</strong> — really
                            impressive work.
                        </Text>

                        <Text className="text-gray-700 text-[15px] leading-6 mb-4">
                            I'm {senderName} from {senderCompany}. We help teams like yours move
                            faster on outreach and pipeline building, and I'd love to share a quick
                            idea that could be useful for {domain}.
                        </Text>

                        <Section className="my-6">
                            <Button
                                href="https://cal.com/reachr/intro"
                                className="bg-gray-900 text-white text-[15px] font-semibold rounded-md px-6 py-3 text-center"
                            >
                                Book a 15-minute intro call
                            </Button>
                        </Section>

                        <Text className="text-gray-700 text-[15px] leading-6 mb-4">
                            No pressure at all — if now isn't the right time, just let me know and
                            I won't follow up again.
                        </Text>

                        <Text className="text-gray-700 text-[15px] leading-6 mb-4">
                            Best,
                            <br />
                            {senderName}
                            <br />
                            {senderCompany}
                        </Text>

                        <Hr className="border-gray-200 my-8" />

                        {props.linkedinUrl && (
                            <Text className="text-gray-400 text-xs leading-5">
                                Found via{' '}
                                <Link href={props.linkedinUrl} className="text-gray-400 underline">
                                    LinkedIn
                                </Link>
                                . If you'd rather not hear from us, just reply and let us know.
                            </Text>
                        )}
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
}

ColdOutreachEmail.subject = (props: EmailTemplateProps): string => {
    const domain = fallback(props.domain, 'your company');
    return `Quick idea for ${domain}`;
};

ColdOutreachEmail.PreviewProps = {
    name: 'Jordan Lee',
    title: 'Head of Growth',
    domain: 'acme.com',
    linkedinUrl: 'https://linkedin.com/in/jordan-lee',
    senderName: 'Alex Park',
    senderCompany: 'Reachr',
} satisfies EmailTemplateProps;

export default ColdOutreachEmail;
