// import { RawSigner, SuiAddress } from '@mysten/sui.js';

import { VaraAccountManager } from './libs/varaAccountManager';
import { VaraInteractor, getDefaultURL } from './libs/varaInteractor';
// import type { ApiTypes, DecorateMethod } from '@polkadot/api/types';

import {
  // ContractQuery,
  // ContractTx,
  DerivePathParams,
  FaucetNetworkType,
  TemplesParams,
  // SuiTxArgument,
  Network,
} from './types';
import { GearApi, ProgramMetadata, HexString } from '@gear-js/api';
import { AbiMessage } from '@polkadot/api-contract/types';
import { normalizeHexAddress, numberToAddressHex } from './utils';

export function isUndefined(value?: unknown): value is undefined {
  return value === undefined;
}

export function withMeta<T extends { meta: AbiMessage }>(
  meta: AbiMessage,
  creator: Omit<T, 'meta'>
): T {
  (creator as T).meta = meta;

  return creator as T;
}

// function createQuery(
//   meta: AbiMessage,
//   fn: (
//     tx: TransactionBlock,
//     params: (TransactionArgument | SerializedBcs<any>)[],
//     typeArguments?: string[],
//     isRaw?: boolean
//   ) => Promise<DevInspectResults | TransactionResult>
// ): ContractQuery {
//   return withMeta(
//     meta,
//     async (
//       tx: TransactionBlock,
//       params: (TransactionArgument | SerializedBcs<any>)[],
//       typeArguments?: string[],
//       isRaw?: boolean
//     ): Promise<DevInspectResults | TransactionResult> => {
//       const result = await fn(tx, params, typeArguments, isRaw);
//       return result;
//     }
//   );
// }

// function createTx(
//   meta: SuiMoveMoudleFuncType,
//   fn: (
//     tx: TransactionBlock,
//     params: (TransactionArgument | SerializedBcs<any>)[],
//     typeArguments?: string[],
//     isRaw?: boolean
//   ) => Promise<SuiTransactionBlockResponse | TransactionResult>
// ): ContractTx {
//   return withMeta(
//     meta,
//     async (
//       tx: TransactionBlock,
//       params: (TransactionArgument | SerializedBcs<any>)[],
//       typeArguments?: string[],
//       isRaw?: boolean
//     ): Promise<SuiTransactionBlockResponse | TransactionResult> => {
//       // const result = await fn(tx, params, typeArguments, isRaw);
//       return await fn(tx, params, typeArguments, isRaw);
//     }
//   );
// }

/**
 * @class Temples
 * @description This class is used to aggregate the tools that used to interact with SUI network.
 */
export class Temples {
  public accountManager: VaraAccountManager;
  public varaInteractor: VaraInteractor;
  // public contractFactory: SuiContractFactory;
  public packageId: string | undefined;
  public metadata: ProgramMetadata | undefined;

  // readonly #query: MapMessageQuery = {};
  // readonly #tx: MapMessageTx = {};
  /**
   * Support the following ways to init the ObeliskClient:
   * 1. mnemonics
   * 2. secretKey (base64 or hex)
   * If none of them is provided, will generate a random mnemonics with 24 words.
   *
   * @param mnemonics, 12 or 24 mnemonics words, separated by space
   * @param secretKey, base64 or hex string, when mnemonics is provided, secretKey will be ignored
   * @param networkType, 'testnet' | 'mainnet' | 'devnet' | 'localnet', default is 'devnet'
   * @param fullnodeUrl, the fullnode url, default is the preconfig fullnode url for the given network type
   * @param packageId
   */
  constructor({
    mnemonics,
    secretKey,
    networkType,
    fullnodeUrls,
    packageId,
    metaHash,
    connectWs,
  }: TemplesParams = {}) {
    // Init the account manager
    this.accountManager = new VaraAccountManager({ mnemonics, secretKey });
    // Init the rpc provider
    fullnodeUrls = fullnodeUrls || [
      getDefaultURL(networkType ?? Network.MAINNET),
    ];
    this.varaInteractor = new VaraInteractor(
      fullnodeUrls,
      networkType,
      connectWs
    );

    this.packageId = packageId;
    if (metaHash !== undefined) {
      const meta = ProgramMetadata.from(
        metaHash
        // '00020000010000000001070000000100000000000000000109000000010a000000d5072c000c34656e67696e655f736368656d611c73746f726167652c536368656d614576656e7400010c245365745265636f72640c0004011c4163746f724964000010011c5665633c75383e000010011c5665633c75383e0000003044656c6574655265636f7264080004011c4163746f724964000010011c5665633c75383e000100205265676973746572040014015c5665633c284163746f7249642c205665633c75383e293e000200000410106773746418636f6d6d6f6e287072696d6974697665731c4163746f724964000004000801205b75383b2033325d000008000003200000000c000c0000050300100000020c0014000002180018000004080410001c0838656e67696e655f73797374656d733053797374656d416374696f6e0001080c41646400000038536574456e746974794c6576656c08002001107531323800002001107531323800010000200000050700240838656e67696e655f73797374656d731c5374617465496e000108404765744c6576656c4279456e746974790400200110753132380000004447657443757272656e74436f756e74657200010000280838656e67696e655f73797374656d732053746174654f75740001083843757272656e74436f756e746572040020011075313238000000344c6576656c4279456e7469747904002001107531323800010000'
      );
      // console.log(meta.getAllTypes());
      this.metadata = meta;

      const allTypes = meta.getAllTypes();
      const execMethodTypes = allTypes['EngineSystemsSystemAction'];
      // for (const [key, value] of Object.entries(queryMethodTypes)) {
      const execEnumObj = JSON.parse(execMethodTypes as string)._enum;
      console.log(execEnumObj);
      for (const [funcName, enumValue] of Object.entries(execEnumObj)) {
        console.log(`  ${funcName}: ${enumValue}`);
      }

      const queryMethodTypes = allTypes['EngineSystemsStateIn'];
      const queryEnumObj = JSON.parse(queryMethodTypes as string)._enum;
      console.log(queryEnumObj);
      for (const [funcName, enumValue] of Object.entries(queryEnumObj)) {
        console.log(`  ${funcName}: ${enumValue}`);

        // if (isUndefined(this.#query['contract'])) {
        //   this.#query['contract'] = {};
        // }
        // if (isUndefined(this.#query['contract'][funcName])) {
        //   this.#query['contract'][funcName] = createQuery(
        //     meta,
        //     (tx, p, typeArguments, isRaw) =>
        //       this.#read(meta, tx, p, typeArguments, isRaw)
        //   );
        // }
      }
      // }
      // Object.values(metadata as SuiMoveNormalizedModules).forEach((value) => {
      //   const data = value as SuiMoveMoudleValueType;
      //   const moduleName = data.name;
      //   Object.entries(data.exposedFunctions).forEach(([funcName, value]) => {
      //     const meta = value as SuiMoveMoudleFuncType;
      //     meta.moduleName = moduleName;
      //     meta.funcName = funcName;

      //     if (isUndefined(this.#query[moduleName])) {
      //       this.#query[moduleName] = {};
      //     }
      //     if (isUndefined(this.#query[moduleName][funcName])) {
      //       this.#query[moduleName][funcName] = createQuery(
      //         meta,
      //         (tx, p, typeArguments, isRaw) =>
      //           this.#read(meta, tx, p, typeArguments, isRaw)
      //       );
      //     }

      //     if (isUndefined(this.#tx[moduleName])) {
      //       this.#tx[moduleName] = {};
      //     }
      //     if (isUndefined(this.#tx[moduleName][funcName])) {
      //       this.#tx[moduleName][funcName] = createTx(
      //         meta,
      //         (tx, p, typeArguments, isRaw) =>
      //           this.#exec(meta, tx, p, typeArguments, isRaw)
      //       );
      //     }
      //   });
      // });
    }
  }

  // public get query(): MapMoudleFuncQuery {
  //   return this.#query;
  // }

  // public get tx(): MapMoudleFuncTx {
  //   return this.#tx;
  // }

  // #exec = async (
  //   meta: SuiMoveMoudleFuncType,
  //   tx: TransactionBlock,
  //   params: (TransactionArgument | SerializedBcs<any>)[],
  //   typeArguments?: string[],
  //   isRaw?: boolean
  // ) => {
  //   if (isRaw === true) {
  //     return tx.moveCall({
  //       target: `${this.contractFactory.packageId}::${meta.moduleName}::${meta.funcName}`,
  //       arguments: params,
  //       typeArguments,
  //     });
  //   }

  //   tx.moveCall({
  //     target: `${this.contractFactory.packageId}::${meta.moduleName}::${meta.funcName}`,
  //     arguments: params,
  //     typeArguments,
  //   });
  //   return await this.signAndSendTxn(tx);
  // };

  // #read = async (
  //   meta: SuiMoveMoudleFuncType,
  //   tx: TransactionBlock,
  //   params: (TransactionArgument | SerializedBcs<any>)[],
  //   typeArguments?: string[],
  //   isRaw?: boolean
  // ) => {
  //   if (isRaw === true) {
  //     return tx.moveCall({
  //       target: `${this.contractFactory.packageId}::${meta.moduleName}::${meta.funcName}`,
  //       arguments: params,
  //       typeArguments,
  //     });
  //   }

  //   tx.moveCall({
  //     target: `${this.contractFactory.packageId}::${meta.moduleName}::${meta.funcName}`,
  //     arguments: params,
  //     typeArguments,
  //   });
  //   return await this.inspectTxn(tx);
  // };

  /**
   * if derivePathParams is not provided or mnemonics is empty, it will return the keypair.
   * else:
   * it will generate signer from the mnemonic with the given derivePathParams.
   * @param derivePathParams, such as { accountIndex: 2, isExternal: false, addressIndex: 10 }, comply with the BIP44 standard
   */
  getKeypair() {
    return this.accountManager.getKeyPair();
  }

  /**
   * @description Switch the current account with the given derivePathParams
   * @param derivePathParams, such as { accountIndex: 2, isExternal: false, addressIndex: 10 }, comply with the BIP44 standard
   */
  switchAccount() {
    this.accountManager.switchAccount();
  }

  /**
   * @description Get the address of the account for the given derivePathParams
   * @param derivePathParams, such as { accountIndex: 2, isExternal: false, addressIndex: 10 }, comply with the BIP44 standard
   */
  getAddress() {
    return this.accountManager.getAddress();
  }

  async currentAddress() {
    return await this.accountManager.getAddress();
  }

  getPackageId() {
    return this.packageId;
  }

  async getMetadata(programId: HexString) {
    return await this.varaInteractor.getMetaHash(programId);
  }

  async getBalance(account?: String) {
    if (account === undefined) {
      account = await this.accountManager.getAddress();
    }
    return await this.varaInteractor.queryBalance(account);
  }

  client() {
    return this.varaInteractor.currentClient;
  }

  wsProvider() {
    return this.varaInteractor.wsApi;
  }

  // async signTxn(
  //   tx: Uint8Array | TransactionBlock | SuiTxBlock,
  //   derivePathParams?: DerivePathParams
  // ) {
  //   if (tx instanceof SuiTxBlock || tx instanceof TransactionBlock) {
  //     tx.setSender(this.getAddress(derivePathParams));
  //   }
  //   const txBlock = tx instanceof SuiTxBlock ? tx.txBlock : tx;
  //   const txBytes =
  //     txBlock instanceof TransactionBlock
  //       ? await txBlock.build({ client: this.client() })
  //       : txBlock;
  //   const keyPair = await this.getKeypair();
  //   return await keyPair.signTransactionBlock(txBytes);
  // }

  // async signAndSend(
  //   signer: Keyring,
  //   programId: HexString,
  //   metaHash: HexString,
  //   payload: PayloadType,
  //   gasLimit: number | undefined,
  //   value: number | undefined

  // async signAndSendTxn(
  //   tx: Uint8Array | TransactionBlock | SuiTxBlock,
  //   derivePathParams?: DerivePathParams
  // ): Promise<SuiTransactionBlockResponse> {
  //   const { bytes, signature } = await this.signTxn(tx, derivePathParams);
  //   return this.suiInteractor.sendTx(bytes, signature);
  // }

  // /**
  //  * Transfer the given amount of SUI to the recipient
  //  * @param recipient
  //  * @param amount
  //  * @param derivePathParams
  //  */
  // async transferVara(
  //   recipient: string,
  //   amount: number,
  //   derivePathParams?: DerivePathParams
  // ) {
  //   const tx = new SuiTxBlock();
  //   tx.transferSui(recipient, amount);
  //   return this.signAndSendTxn(tx, derivePathParams);
  // }

  // /**
  //  * Transfer to mutliple recipients
  //  * @param recipients the recipients addresses
  //  * @param amounts the amounts of SUI to transfer to each recipient, the length of amounts should be the same as the length of recipients
  //  * @param derivePathParams
  //  */
  // async transferSuiToMany(
  //   recipients: string[],
  //   amounts: number[],
  //   derivePathParams?: DerivePathParams
  // ) {
  //   const tx = new SuiTxBlock();
  //   tx.transferSuiToMany(recipients, amounts);
  //   return this.signAndSendTxn(tx, derivePathParams);
  // }

  // async moveCall(callParams: {
  //   target: string;
  //   arguments?: (SuiTxArg | SuiVecTxArg)[];
  //   typeArguments?: string[];
  //   derivePathParams?: DerivePathParams;
  // }) {
  //   const {
  //     target,
  //     arguments: args = [],
  //     typeArguments = [],
  //     derivePathParams,
  //   } = callParams;
  //   const tx = new SuiTxBlock();
  //   tx.moveCall(target, args, typeArguments);
  //   return this.signAndSendTxn(tx, derivePathParams);
  // }

  // async getWorld(worldObjectId: string) {
  //   return this.suiInteractor.getObject(worldObjectId);
  // }

  // async listSchemaNames(worldId: string) {
  //   const worldObject = await this.getObject(worldId);
  //   const newObjectContent = worldObject.content;
  //   if (newObjectContent != null) {
  //     const objectContent = newObjectContent as ObeliskObjectContent;
  //     const objectFields = objectContent.fields as Record<string, any>;
  //     return objectFields['schema_names'];
  //   } else {
  //     return [];
  //   }
  // }

  // async getEntity(
  //   worldId: string,
  //   schemaName: string,
  //   entityId?: string
  // ): Promise<any[] | undefined> {
  //   const schemaModuleName = `${schemaName}_schema`;
  //   const tx = new TransactionBlock();
  //   const params = [tx.pure(worldId)] as TransactionArgument[];

  //   if (entityId !== undefined) {
  //     params.push(tx.pure(entityId));
  //   }

  //   const getResult = (await this.query[schemaModuleName].get(
  //     tx,
  //     params
  //   )) as DevInspectResults;
  //   const returnValue = [];

  //   // "success" | "failure";
  //   if (getResult.effects.status.status === 'success') {
  //     const resultList = getResult.results![0].returnValues!;
  //     for (const res of resultList) {
  //       const bcs = new BCS(getSuiMoveConfig());
  //       const value = Uint8Array.from(res[0]);
  //       const bcsType = res[1].replace(/0x1::ascii::String/g, 'string');
  //       const data = bcs.de(bcsType, value);
  //       returnValue.push(data);
  //     }
  //     return returnValue;
  //   } else {
  //     return undefined;
  //   }
  // }

  // async containEntity(
  //   worldId: string,
  //   schemaName: string,
  //   entityId?: string
  // ): Promise<boolean | undefined> {
  //   const schemaModuleName = `${schemaName}_schema`;
  //   const tx = new TransactionBlock();
  //   const params = [tx.pure(worldId)] as TransactionArgument[];

  //   if (entityId !== undefined) {
  //     params.push(tx.pure(entityId));
  //   }

  //   const getResult = (await this.query[schemaModuleName].contains(
  //     tx,
  //     params
  //   )) as DevInspectResults;

  //   // "success" | "failure";
  //   if (getResult.effects.status.status === 'success') {
  //     const res = getResult.results![0].returnValues![0];
  //     const bcs = new BCS(getSuiMoveConfig());
  //     const value = Uint8Array.from(res[0]);
  //     return bcs.de(res[1], value);
  //   } else {
  //     return undefined;
  //   }
  // }

  // async getEntities(
  //   worldId: string,
  //   schemaName: string,
  //   cursor?: string,
  //   limit?: number
  // ) {
  //   let schemaModuleName = `${schemaName}_schema`;

  //   const tx = new TransactionBlock();
  //   let params = [tx.pure(worldId)] as SuiTxArgument[];

  //   const tableResult = (await this.query[schemaonentModuleName].entities(
  //     tx,
  //     params
  //   )) as DevInspectResults;
  //   const entities = tableResult.results as SuiReturnValues;
  //   const bcs = new BCS(getSuiMoveConfig());

  //   let value = Uint8Array.from(entities[0].returnValues[0][0]);
  //   let tableId = '0x' + bcs.de('address', value);
  //   let dynamicFields = await this.suiInteractor.getDynamicFields(
  //     tableId,
  //     cursor,
  //     limit
  //   );
  //   let objectIds = dynamicFields.data.map((field) => field.objectId);
  //   let objectDatas = await this.suiInteractor.getEntitiesObjects(objectIds);
  //   return {
  //     data: objectDatas,
  //     nextCursor: dynamicFields.nextCursor,
  //     hasNextPage: dynamicFields.hasNextPage,
  //   };
  // }

  async entity_key_from_hex_string(hexString: string) {
    const checkObjectId = normalizeHexAddress(hexString);
    if (checkObjectId !== null) {
      hexString = checkObjectId;
      return hexString;
    } else {
      return undefined;
    }
  }

  async entity_key_from_u256(x: number) {
    return numberToAddressHex(x);
  }
}
