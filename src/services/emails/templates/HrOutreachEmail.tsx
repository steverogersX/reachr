import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Section,
    Tailwind,
    Text,
} from '@react-email/components';
import type { EmailTemplateProps } from './types';

const fallback = (value: string | undefined | null, text: string): string =>
    value && value.trim().length > 0 ? value.trim() : text;

// HR / People — warm and conversational: soft rounded card, a pull-quote
// from a peer, and a low-pressure, friendly close. No metrics, no buttons
// shouting for attention.
export function HrOutreachEmail(props: EmailTemplateProps) {
    const firstName = fallback(props.name, 'there').split(' ')[0];
    const domain = fallback(props.domain, 'your company');
    const senderName = fallback(props.senderName, 'The Reachr Team');
    const senderCompany = fallback(props.senderCompany, 'Reachr');

    return (
        <Html>
            <Head />
            <Preview>A friendly note about hiring and outreach at {domain}</Preview>
            <Tailwind>
                <Body className="bg-rose-50 font-sans py-10">
                    <Container className="bg-white rounded-2xl mx-auto max-w-lg p-10">
                        <Text className="text-rose-400 text-2xl mb-4">✺</Text>

                        <Heading className="text-gray-900 text-xl font-semibold mb-4 leading-7">
                            Hi {firstName} — hoping I've got the right person
                        </Heading>

                        <Text className="text-gray-700 text-[15px] leading-7 mb-4">
                            I work with people teams at companies like {domain}, and I know
                            how much lands on your desk between hiring, culture, and
                            everything in between — so I'll be brief.
                        </Text>

                        <Section className="bg-rose-50 rounded-xl px-6 py-5 my-6">
                            <Text className="text-gray-700 text-[15px] leading-7 italic m-0">
                                "{senderCompany} took something that used to eat a full
                                afternoon every week off our team's plate — and the people
                                using it actually like using it."
                            </Text>
                            <Text className="text-gray-400 text-xs leading-5 mt-3 mb-0">
                                — Head of People, a company we work with
                            </Text>
                        </Section>

                        <Text className="text-gray-700 text-[15px] leading-7 mb-6">
                            If a quick, no-pressure chat about how teams like yours are using
                            {' '}{senderCompany} sounds useful, I'd love to find 15 minutes —
                            and if it's not the right time, just say the word and I'll leave
                            it there.
                        </Text>

                        <Section>
                            <Button
                                href="https://cal.com/reachr/people-chat"
                                className="bg-rose-500 text-white text-[15px] font-semibold rounded-full px-6 py-3 text-center"
                            >
                                Grab 15 minutes
                            </Button>
                        </Section>

                        <Text className="text-gray-400 text-xs leading-5 mt-8 mb-0">
                            Warmly, {senderName} · {senderCompany}
                            <br />
                            Reply anytime and I'll make sure you're taken off this list.
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
}

HrOutreachEmail.subject = (props: EmailTemplateProps): string => {
    const firstName = fallback(props.name, 'there').split(' ')[0];
    return `Quick hello for ${firstName}`;
};

HrOutreachEmail.PreviewProps = {
    name: 'Riley Chen',
    title: 'Head of HR',
    domain: 'acme.com',
    linkedinUrl: 'https://linkedin.com/in/riley-chen',
    senderName: 'Alex Park',
    senderCompany: 'Reachr',
} satisfies EmailTemplateProps;

export default HrOutreachEmail;
