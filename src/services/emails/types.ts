export interface EmailDiscoveryProvider {
    findEmail(personId: string): Promise<string | null>;
}
