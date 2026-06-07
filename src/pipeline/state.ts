export interface ProfileRecord {
    domain:      string;
    name:        string;
    title:       string;
    linkedinUrl: string;
    email?:      string;
    sentAt?:     string;
    messageId?:  string;
}

export class PipelineState {
    readonly profiles: ProfileRecord[] = [];

    addProfile(record: ProfileRecord): void {
        this.profiles.push(record);
    }

    updateEmail(linkedinUrl: string, email: string): void {
        const record = this.profiles.find(p => p.linkedinUrl === linkedinUrl);
        if (record) record.email = email;
    }

    markSent(linkedinUrl: string, messageId: string): void {
        const record = this.profiles.find(p => p.linkedinUrl === linkedinUrl);
        if (record) {
            record.sentAt = new Date().toISOString();
            record.messageId = messageId;
        }
    }
}
