import { GearKeyring } from '@gear-js/api';
import { createAccount } from './keypair';
import { generateMnemonic } from './crypto';
import type { AccountMangerParams, DerivePathParams } from '../../types';
import { KeyringPair } from '@polkadot/keyring/types';

export class VaraAccountManager {
  private mnemonics: string;
  private secretKey: string;
  public currentKeyPair: Promise<KeyringPair>;
  public currentAddress!: string;

  /**
   * Support the following ways to init the VaraToolkit:
   * 1. mnemonics
   * 2. secretKey (base64 or hex)
   * If none of them is provided, will generate a random mnemonics with 24 words.
   *
   * @param mnemonics, 12 or 24 mnemonics words, separated by space
   * @param secretKey, base64 or hex string, when mnemonics is provided, secretKey will be ignored
   */
  constructor({ mnemonics, secretKey }: AccountMangerParams = {}) {
    // If the mnemonics or secretKey is provided, use it
    // Otherwise, generate a random mnemonics with 24 words
    this.mnemonics = mnemonics || '';
    this.secretKey = secretKey || '';
    if (!this.mnemonics && !this.secretKey) {
      this.mnemonics = generateMnemonic(24);
    }

    // Init the current account
    this.currentKeyPair = this.secretKey
      ? createAccount(this.secretKey)
      : createAccount(this.mnemonics);
    // Wait for the promise to resolve and then set the currentAddress
    this.currentKeyPair.then((keyPair: KeyringPair) => {
      this.currentAddress = keyPair.address;
    });
  }

  getKeyPair() {
    if (!this.mnemonics) return this.currentKeyPair;
    return createAccount(this.mnemonics);
  }

  async getAddress() {
    if (!this.mnemonics) return this.currentAddress;
    return (await createAccount(this.mnemonics)).address;
  }

  /**
   * Switch the current account with the given derivePathParams.
   * This is only useful when the mnemonics is provided. For secretKey mode, it will always use the same account.
   */
  switchAccount() {
    if (this.mnemonics) {
      this.currentKeyPair = createAccount(this.mnemonics);
      this.currentKeyPair.then((keyPair: KeyringPair) => {
        this.currentAddress = keyPair.address;
      });
    }
  }
}
