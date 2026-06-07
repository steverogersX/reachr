import { config } from '@/config';
import { MockLinkedinDiscoveryProvider } from '../mocks';
import { ProspeoProfileDiscoveryProvider } from './providers/ProspeoProvider';
import type { LinkedinDiscoveryProvider } from './types';

export * from './types';
export { ProspeoProfileDiscoveryProvider } from './providers/ProspeoProvider';

export function createProfileDiscoveryProvider(): LinkedinDiscoveryProvider {
    return config.mock.profiles ? new MockLinkedinDiscoveryProvider() : new ProspeoProfileDiscoveryProvider();
}
