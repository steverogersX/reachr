export interface Field {
  name: string;
}

export interface LinkedInProfile {
  url: string;
  name: string;
  title: string;
}

export interface Contact {
  email: string;
  name: string;
  title: string;
  linkedinUrl: string;
}

export type StageStatus = 'idle' | 'running' | 'done' | 'error';

export interface ReachServices {
  getFields(domain: string): AsyncGenerator<Field>;
  getProfiles(domain: string, fields: Field[]): AsyncGenerator<LinkedInProfile>;
  getEmails(domain: string, profiles: LinkedInProfile[]): AsyncGenerator<Contact>;
}
