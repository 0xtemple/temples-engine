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
  const network = Network.LOCAL;
  const packageId =
    '0xfdaff20a60c7762c3425f1e8d8fa001ddfbee1167a18428e720f9d7dc877b822';

  const privateKey = process.env.PRIVATE_KEY;
  const metadata =
    '00020000000100000000000000000001010000000102000000490210000828636f756e7465725f696f3053797374656d416374696f6e0001040c41646400000000040828636f756e7465725f696f28537461746551756572790001044047657443757272656e744e756d62657200000000080828636f756e7465725f696f2853746174655265706c790001043443757272656e744e756d62657204000c011075313238000000000c0000050700';
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
