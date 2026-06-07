import type { EmailTemplateName } from './render';


export const Persona = {
    CSuite: 'cSuite',
    SalesLeader: 'salesLeader',
    Operations: 'operations',
    Hr: 'hr',
    Other: 'other',
} as const;

export type Persona = (typeof Persona)[keyof typeof Persona];

const TEMPLATE_BY_PERSONA: Record<Persona, EmailTemplateName> = {
    [Persona.CSuite]: 'executiveOutreach',
    [Persona.SalesLeader]: 'salesLeaderOutreach',
    [Persona.Operations]: 'operationsOutreach',
    [Persona.Hr]: 'hrOutreach',
    [Persona.Other]: 'coldOutreach',
};

// Order matters — more specific checks go first so e.g. "VP of Sales
// Operations" lands on sales, not ops, and "Chief People Officer" lands
// on HR rather than the broader C-suite bucket.
function detectPersona(title: string): Persona {
    const t = title.toLowerCase();

    if (t.includes('hr') || t.includes('people') || t.includes('talent') || t.includes('recruit')) {
        return Persona.Hr;
    }
    if (t.includes('sales') || t.includes('revenue')) {
        return Persona.SalesLeader;
    }
    if (t.includes('operations') || t.includes('ops') || t.includes('coo')) {
        return Persona.Operations;
    }
    if (t.includes('ceo') || t.includes('founder') || t.includes('president') || t.includes('chairman')) {
        return Persona.CSuite;
    }
    return Persona.Other;
}

export function selectTemplateForTitle(title: string | undefined): EmailTemplateName {
    return TEMPLATE_BY_PERSONA[detectPersona(title ?? '')];
}
