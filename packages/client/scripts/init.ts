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
    '0x2ef238dc49a7c63bc87549f6b084123a35953265d7028a30ad53fc004b892c26';

  const privateKey = process.env.PRIVATE_KEY;

  const templs = new Templs({
    networkType: network,
    packageId: packageId,
    // metadata: metadata,
    secretKey: privateKey,
  });

  // console.log(await templs.getAddress());
  let addr = await templs.getAddress();
  console.log('address: ' + addr);

  let metadata = await templs.getMetadata(packageId);
  console.log('metadata: ' + metadata);

  let data = await templs.varaInteractor.queryState(packageId);
  console.log('data: ', data);
}

init();
