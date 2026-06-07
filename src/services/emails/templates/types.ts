import type { ProfileRecord } from '@/pipeline/state';

export type EmailTemplateProps = Pick<ProfileRecord, 'domain' | 'name' | 'title' | 'linkedinUrl'> & {
    senderName: string;
    senderCompany: string;
};
