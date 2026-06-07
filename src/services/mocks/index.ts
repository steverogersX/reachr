import type { Domain, DomainDiscoveryProvider } from '../domains/types';
import type { LinkedinDiscoveryProvider, LinkedinProfile } from '../profiles/types';
import type { EmailDiscoveryProvider, EmailSendProvider } from '../emails/types';
import type { RenderedEmail } from '../emails/templates/render';

const FIRST_NAMES = ['Avery', 'Jordan', 'Riley', 'Casey', 'Morgan', 'Quinn', 'Reese', 'Skyler', 'Dakota', 'Rowan'];
const LAST_NAMES  = ['Carter', 'Bennett', 'Hayes', 'Mercer', 'Sloane', 'Pierce', 'Whitman', 'Lange', 'Doyle', 'Marsh'];
const TITLES      = ['Head of Growth', 'VP of Sales', 'Marketing Director', 'Founder', 'Product Lead', 'CTO', 'Head of Partnerships'];
const PREFIXES    = ['get', 'try', 'use', 'go', 'join', 'meet', 'with'];

function delay(minMs: number, maxMs: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, minMs + Math.random() * (maxMs - minMs)));
}

function fails(rate: number): boolean {
    return Math.random() < rate;
}

function pick<T>(items: T[]): T {
    return items[Math.floor(Math.random() * items.length)];
}

function slugify(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export class MockDomainDiscoveryProvider implements DomainDiscoveryProvider {
    async discoverLookalikeDomains(domain: Domain, maxResults = 5): Promise<Domain[]> {
        await delay(300, 900);
        if (fails(0.15)) throw new Error(`mock: lookalike domain lookup failed for ${domain}`);

        return Array.from({ length: maxResults }, (_, i) => `${PREFIXES[i % PREFIXES.length]}-${domain}` as Domain);
    }
}

export class MockLinkedinDiscoveryProvider implements LinkedinDiscoveryProvider {
    async discoverLinkedinProfiles(domain: string, maxResultsPerDomain = 5): Promise<LinkedinProfile[]> {
        await delay(300, 900);
        if (fails(0.15)) throw new Error(`mock: profile discovery failed for ${domain}`);

        return Array.from({ length: maxResultsPerDomain }, (_, i) => {
            const name = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
            return {
                personId:   `mock-${slugify(domain)}-${i}`,
                name,
                title:      pick(TITLES),
                headline:   `${pick(TITLES)} at ${domain}`,
                profileUrl: `https://linkedin.com/in/${slugify(name)}-${i}`,
            };
        });
    }
}

export class MockEmailDiscoveryProvider implements EmailDiscoveryProvider {
    async findEmail(personId: string): Promise<string | null> {
        await delay(200, 600);
        if (fails(0.15)) throw new Error(`mock: email enrichment failed for ${personId}`);
        if (fails(0.2)) return null;

        return `${slugify(personId).replace(/^mock-/, '')}@example.com`;
    }
}

export class MockEmailSendProvider implements EmailSendProvider {
    async send(to: string, _email: RenderedEmail): Promise<{ messageId: string }> {
        await delay(200, 700);
        if (fails(0.15)) throw new Error(`mock: failed to send email to ${to}`);

        return { messageId: `mock-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}` };
    }
}
