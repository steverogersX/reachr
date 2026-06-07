import {
    Body,
    Container,
    Head,
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

// C-Suite / Founder — read like a personal letter from a peer, not a pitch:
// no buttons, no color blocks, generous whitespace, a single quiet ask.
export function ExecutiveOutreachEmail(props: EmailTemplateProps) {
    const firstName = fallback(props.name, 'there').split(' ')[0];
    const title = fallback(props.title, 'leading your team');
    const domain = fallback(props.domain, 'your company');
    const senderName = fallback(props.senderName, 'The Reachr Team');
    const senderCompany = fallback(props.senderCompany, 'Reachr');

    return (
        <Html>
            <Head />
            <Preview>A short note, founder to founder</Preview>
            <Tailwind>
                <Body className="bg-white font-serif py-12">
                    <Container className="mx-auto max-w-lg px-6">
                        <Text className="text-gray-400 text-xs tracking-widest uppercase mb-8">
                            {senderCompany}
                        </Text>

                        <Text className="text-gray-900 text-[17px] leading-7 mb-5">
                            {firstName},
                        </Text>

                        <Text className="text-gray-800 text-[17px] leading-7 mb-5">
                            I'll keep this short — I know what your inbox looks like as{' '}
                            {title} at {domain}.
                        </Text>

                        <Text className="text-gray-800 text-[17px] leading-7 mb-5">
                            I'm {senderName}, and I built {senderCompany} to solve a problem
                            I ran into myself: spending more time chasing pipeline than
                            building the thing that was supposed to fill it. If that sounds
                            at all familiar, I'd value ten minutes of your time — not for a
                            pitch, just to compare notes.
                        </Text>

                        <Text className="text-gray-800 text-[17px] leading-7 mb-8">
                            If now isn't right, no worries at all — and no follow-ups. Just
                            reply "not now" and I'll leave it there.
                        </Text>

                        <Text className="text-gray-800 text-[17px] leading-7 mb-1">
                            — {senderName}
                        </Text>
                        <Text className="text-gray-400 text-sm leading-6">
                            Founder, {senderCompany}
                        </Text>

                        <Hr className="border-gray-100 my-10" />

                        {props.linkedinUrl && (
                            <Section>
                                <Text className="text-gray-300 text-xs leading-5">
                                    We connected via{' '}
                                    <Link href={props.linkedinUrl} className="text-gray-300 underline">
                                        LinkedIn
                                    </Link>
                                    . Reply anytime to opt out.
                                </Text>
                            </Section>
                        )}
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
}

ExecutiveOutreachEmail.subject = (props: EmailTemplateProps): string => {
    const firstName = fallback(props.name, 'there').split(' ')[0];
    return `A quick note for ${firstName}`;
};

ExecutiveOutreachEmail.PreviewProps = {
    name: 'Morgan Reyes',
    title: 'CEO',
    domain: 'acme.com',
    linkedinUrl: 'https://linkedin.com/in/morgan-reyes',
    senderName: 'Alex Park',
    senderCompany: 'Reachr',
} satisfies EmailTemplateProps;

export default ExecutiveOutreachEmail;
