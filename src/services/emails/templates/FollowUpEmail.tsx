import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Preview,
    Tailwind,
    Text,
} from '@react-email/components';
import type { EmailTemplateProps } from './types';

const fallback = (value: string | undefined | null, text: string): string =>
    value && value.trim().length > 0 ? value.trim() : text;

export function FollowUpEmail(props: EmailTemplateProps) {
    const firstName = fallback(props.name, 'there').split(' ')[0];
    const domain = fallback(props.domain, 'your company');
    const senderName = fallback(props.senderName, 'The Reachr Team');
    const senderCompany = fallback(props.senderCompany, 'Reachr');

    return (
        <Html>
            <Head />
            <Preview>Following up — still worth a quick chat?</Preview>
            <Tailwind>
                <Body className="bg-gray-100 font-sans py-8">
                    <Container className="bg-white rounded-lg mx-auto max-w-xl p-10">
                        <Heading className="text-gray-900 text-2xl font-semibold mb-4">
                            Hi {firstName},
                        </Heading>

                        <Text className="text-gray-700 text-[15px] leading-6 mb-4">
                            Just floating this back to the top of your inbox in case it got
                            buried — I'd still love to share how we could help {domain} with
                            outreach and pipeline building.
                        </Text>

                        <Text className="text-gray-700 text-[15px] leading-6 mb-4">
                            Happy to keep this short: would a 15-minute call sometime this week
                            work, or is there a better person on your team I should reach out to?
                        </Text>

                        <Text className="text-gray-700 text-[15px] leading-6 mb-4">
                            Thanks either way,
                            <br />
                            {senderName}
                            <br />
                            {senderCompany}
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
}

FollowUpEmail.subject = (props: EmailTemplateProps): string => {
    const domain = fallback(props.domain, 'your company');
    return `Re: Quick idea for ${domain}`;
};

FollowUpEmail.PreviewProps = {
    name: 'Jordan Lee',
    title: 'Head of Growth',
    domain: 'acme.com',
    linkedinUrl: 'https://linkedin.com/in/jordan-lee',
    senderName: 'Alex Park',
    senderCompany: 'Reachr',
} satisfies EmailTemplateProps;

export default FollowUpEmail;
