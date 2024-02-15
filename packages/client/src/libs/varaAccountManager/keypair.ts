import { GearKeyring } from '@gear-js/api';
import { KeyringPair } from '@polkadot/keyring/types';
import type { DerivePathParams } from '../../types';

/**
 * @description Get ed25519 derive path for Vara
 * @param derivePathParams
 */
export const getDerivePathForVARA = (
  derivePathParams: DerivePathParams = {}
) => {
  const {
    accountIndex = 0,
    isExternal = false,
    addressIndex = 0,
  } = derivePathParams;
  return `m/44'/913'/${accountIndex}'/${isExternal ? 1 : 0}'/${addressIndex}'`;
};

export function createAccount(seed: string): Promise<KeyringPair> {
  if (seed.startsWith('//')) {
    return GearKeyring.fromSuri(seed);
  }
  if (seed.startsWith('0x')) {
    return GearKeyring.fromSeed(seed);
  }

  return GearKeyring.fromMnemonic(seed);
}
