import { Temples, GearKeyring } from '@0xtemple/client';
import * as fs from 'fs';
import { generateMnemonic as genMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';

export const generateMnemonic = (numberOfWords: 12 | 24 = 24) => {
  const strength = numberOfWords === 12 ? 128 : 256;
  return genMnemonic(wordlist, strength);
};

async function generateAccount() {
  const mnemonic = generateMnemonic(12);
  const keyring = await GearKeyring.fromMnemonic(mnemonic);
  const path = process.cwd();
  const chainFolderPath = `${path}/src/chain`;
  fs.mkdirSync(chainFolderPath, { recursive: true });

  fs.writeFileSync(`${path}/.env`, `MNEMONIC='${mnemonic}'`);

  fs.writeFileSync(
    `${path}/src/chain/key.ts`,
    `export const PRIVATEKEY = '${mnemonic}';
export const ACCOUNT = '${keyring.address}';
  `,
  );

  console.log(`Generate new Account: ${keyring.address}`);
}

generateAccount();
