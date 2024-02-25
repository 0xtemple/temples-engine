import {
  Temples,
  PayloadType,
  Network,
  // NetworkType,
  // TransactionResult,
  // loadMetadata,
  decodeAddress,
} from '../src/index';
import * as process from 'process';
import dotenv from 'dotenv';
dotenv.config();

async function init() {
  const network = Network.TESTNET;
  const packageId =
    '0xfa68d539c65557d22cc475e807163a5c80d57ed848180f3609ee9be181165abb';

  const privateKey = process.env.PRIVATE_KEY;
  const metadata =
    '00020000010000000001070000000100000000000000000000a90420000c406578616d706c65735f736368656d61731c73746f726167652c536368656d614576656e7400010c245365745265636f72640c00040120536368656d614964000010011c5665633c75383e000010011c5665633c75383e0000003044656c6574655265636f72640800040120536368656d614964000010011c5665633c75383e00010020526567697374657204001401605665633c28536368656d6149642c205665633c75383e293e000200000410106773746418636f6d6d6f6e287072696d6974697665731c4163746f724964000004000801205b75383b2033325d000008000003200000000c000c0000050300100000020c0014000002180018000004080410001c08406578616d706c65735f73797374656d733053797374656d416374696f6e00010000';
  const temples = new Temples({
    networkType: network,
    packageId: packageId,
    metadata: metadata,
    secretKey: privateKey,
    // connectWs: true,
  });

  // console.log(await temples.getAddress());
  let addr = await temples.getAddress();
  console.log('address: ' + addr);
  console.log('decodeAddress: ', decodeAddress(addr));

  let metaHash = await temples.getMetaHash(packageId);
  console.log('metaHash: ' + metaHash);

  let metatypes = temples.getAllTypes();
  console.log(metatypes);
  // let payload = {
  //   GetCurrentCounter: null,
  // };
  // let data = await temples.varaInteractor.queryState(
  //   packageId,
  //   payload,
  //   metadata
  // );
  // console.log('data: ', data);

  // let balance_data = await temples.getBalance();
  // console.log(balance_data);

  // let datares = await temples.query.contract.GetCurrentCounter();
  // console.log('datares: ', datares);

  // // let payload = {
  // //   Add: null,
  // // } as PayloadType;
  // // let account = await temples.accountManager.getKeyPair();
  // // let tx = await temples.varaInteractor.structuredTransaction(
  // //   account,
  // //   packageId,
  // //   payload,
  // //   metaHash
  // // );
  // // await temples.varaInteractor.signAndSend(account, tx);

  // // let datares = await temples.varaInteractor.queryState(packageId, metaHash);
  // // console.log('data: ', datares);
  // await temples.tx.contract.Add();

  // let datares2 = await temples.query.contract.GetCurrentCounter();
  // console.log('datares2: ', datares2);
}

init();
