import {
  Templs,
  NetworkType,
  TransactionResult,
  loadMetadata,
} from '../src/index';
import * as process from 'process';
import dotenv from 'dotenv';
dotenv.config();

async function init() {
  const network = 'devnet';
  const packageId =
    '0xdd1a5cabd1b187dfef39a7c04b2e112ad999ec46f521a408db89297b7973b6c6';

  const metadata = await loadMetadata(network as NetworkType, packageId);

  const privateKey = process.env.PRIVATE_KEY;

  const templs = new Templs({
    networkType: network as NetworkType,
    packageId: packageId,
    metadata: metadata,
    secretKey: privateKey,
  });

  console.log(templs.getAddress());

  // let txb = new TransactionBlock();

  // const [coin] = txb.splitCoins(txb.gas, [txb.pure(2n * MIST_PER_SUI)]);
  // const params = [coin];

  // let [coins] = (await templs.tx.example_system.get_object(
  //   txb,
  //   params,
  //   undefined,
  //   true
  // )) as TransactionResult;
  // txb.transferObjects(
  //   [coins],
  //   txb.pure(
  //     '0xd2c36eea220c7deb9d1c7d4b01269eca9d9543050255432896cd13ade6550d90'
  //   )
  // );
  // let res = await templs.signAndSendTxn(txb);
  // console.log(res);
  let comsName = await templs.listSchemaNames(
    '0xacfec03b65c34a4afff82e0913e00759e5c799fbcbbd4bdf6299de4749766304'
  );

  console.log(comsName);

  // let entities = await templs.getEntities(
  //   '0x1541f3a2e7ac48e3e68e60bb97a7cee94e16316cc3f9043a9c0f5e6790ea3af0',
  //   'multi_column'
  // );
  // console.log(entities);

  // let entityData = await templs.getEntity(
  //   '0xdca3675091c8fdccd4fb46f9f70de0bd65053fbc8104600daf86a959ca9b7120',
  //   'single_value'
  // );
  // console.log(entityData);

  // // let tx = new TransactionBlock();

  // // let params = [
  // //   tx.pure(
  // //     '0xdca3675091c8fdccd4fb46f9f70de0bd65053fbc8104600daf86a959ca9b7120'
  // //   ),
  // // ];
  // // let inc_res = await templs.tx.example_system.increase(tx, params);
  // // console.log(inc_res);

  // let txb = new TransactionBlock();

  // let params = [
  //   txb.pure(
  //     '0xdca3675091c8fdccd4fb46f9f70de0bd65053fbc8104600daf86a959ca9b7120'
  //   ),
  //   txb.pure(
  //     '0x6761ca73d8793006a3d0ac74ed2ad541487d4010c706f7c6d0d41d96eff9e4cf'
  //   ),
  // ];

  // let typeArguments = ['0x2::coin::Coin<0x2::sui::SUI>'];
  // let inc_with_type_res = await templs.tx.example_system.increase_with_type(
  //   txb,
  //   params,
  //   typeArguments
  // );
  // console.log(inc_with_type_res);

  // let containData = await templs.containEntity(
  //   '0x9f2b0bd5153799eb97c8d604472f0993a10586ce6725cdeb175b02dedc2dd10a',
  //   'position',
  //   '0x59a5fbf2c56da3a4a2ac761f062cb0e8ed6c6cb1812136178cf2321586736cc7'
  // );

  // console.log(containData);

  // let objectAddress = await templs.entity_key_from_object(
  //   '0x1541f3a2e7ac48e3e68e60bb97a7cee94e16316cc3f9043a9c0f5e6790ea3af0'
  // );
  // console.log(objectAddress);

  // let bytesAddress = await templs.entity_key_from_bytes('hello');
  // console.log(bytesAddress);

  // let numberAddress = await templs.entity_key_from_u256(123);
  // console.log(numberAddress);
}

init();
