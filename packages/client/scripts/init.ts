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
    '0x2ef238dc49a7c63bc87549f6b084123a35953265d7028a30ad53fc004b892c26';

  const privateKey = process.env.PRIVATE_KEY;
  const metaHash =
    '00020000010000000001070000000100000000000000000109000000010a000000d5072c000c34656e67696e655f736368656d611c73746f726167652c536368656d614576656e7400010c245365745265636f72640c0004011c4163746f724964000010011c5665633c75383e000010011c5665633c75383e0000003044656c6574655265636f7264080004011c4163746f724964000010011c5665633c75383e000100205265676973746572040014015c5665633c284163746f7249642c205665633c75383e293e000200000410106773746418636f6d6d6f6e287072696d6974697665731c4163746f724964000004000801205b75383b2033325d000008000003200000000c000c0000050300100000020c0014000002180018000004080410001c0838656e67696e655f73797374656d733053797374656d416374696f6e0001080c41646400000038536574456e746974794c6576656c08002001107531323800002001107531323800010000200000050700240838656e67696e655f73797374656d731c5374617465496e000108404765744c6576656c4279456e746974790400200110753132380000004447657443757272656e74436f756e74657200010000280838656e67696e655f73797374656d732053746174654f75740001083843757272656e74436f756e746572040020011075313238000000344c6576656c4279456e7469747904002001107531323800010000';

  const temples = new Temples({
    networkType: network,
    packageId: packageId,
    metaHash: metaHash,
    secretKey: privateKey,
    // connectWs: true,
  });

  // console.log(await temples.getAddress());
  let addr = await temples.getAddress();
  console.log('address: ' + addr);
  console.log('decodeAddress: ', decodeAddress(addr));

  let metadata = await temples.getMetadata(packageId);
  console.log('metadata: ' + metadata);

  let payload = {
    GetCurrentCounter: null,
  };
  let data = await temples.varaInteractor.queryState(
    packageId,
    payload,
    metaHash
  );
  console.log('data: ', data);

  let balance_data = await temples.getBalance();
  console.log(balance_data);

  // let payload = {
  //   Add: null,
  // } as PayloadType;
  // let account = await temples.accountManager.getKeyPair();
  // let tx = await temples.varaInteractor.structuredTransaction(
  //   account,
  //   packageId,
  //   payload,
  //   metaHash
  // );
  // await temples.varaInteractor.signAndSend(account, tx);

  // let datares = await temples.varaInteractor.queryState(packageId, metaHash);
  // console.log('data: ', datares);
}

init();
