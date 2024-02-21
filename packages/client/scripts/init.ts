import {
  Templs,
  Network,
  // NetworkType,
  // TransactionResult,
  // loadMetadata,
} from '../src/index';
import * as process from 'process';
import dotenv from 'dotenv';
dotenv.config();

async function init() {
  const network = Network.TESTNET;
  const packageId =
    '0xdd1a5cabd1b187dfef39a7c04b2e112ad999ec46f521a408db89297b7973b6c6';

  const privateKey = process.env.PRIVATE_KEY;

  const templs = new Templs({
    networkType: network,
    packageId: packageId,
    // metadata: metadata,
    secretKey: privateKey,
  });

  console.log(templs.getAddress());
}

init();
