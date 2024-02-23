// import { RawSigner, SuiAddress } from '@mysten/sui.js';

import { VaraAccountManager } from './libs/varaAccountManager';
import { VaraInteractor, getDefaultURL } from './libs/varaInteractor';
import type { SubmittableExtrinsic } from '@polkadot/api/submittable/types';

import {
  ContractQuery,
  ContractTx,
  MapMessageQuery,
  MapMessageTx,
  MapMoudleFuncQuery,
  MapMoudleFuncTx,
  TemplesParams,
  // SuiTxArgument,
  Network,
  VaraFuncType,
} from './types';
import { GearApi, ProgramMetadata, HexString } from '@gear-js/api';
// import { AbiMessage } from '@polkadot/api-contract/types';
import { normalizeHexAddress, numberToAddressHex } from './utils';

export function isUndefined(value?: unknown): value is undefined {
  return value === undefined;
}

export function withMeta<T extends { meta: VaraFuncType }>(
  meta: VaraFuncType,
  creator: Omit<T, 'meta'>
): T {
  (creator as T).meta = meta;

  return creator as T;
}

function createQuery(
  meta: VaraFuncType,
  fn: (params?: unknown[] | null) => any
): ContractQuery {
  return withMeta(meta, async (params?: unknown[] | null): Promise<any> => {
    const result = await fn(params);
    return result;
  });
}

function createTx(
  meta: VaraFuncType,
  fn: (
    params?: unknown[] | null,
    isRaw?: boolean
  ) => Promise<SubmittableExtrinsic>
): ContractTx {
  return withMeta(
    meta,
    async (
      params?: unknown[] | null,
      isRaw?: boolean
    ): Promise<SubmittableExtrinsic> => {
      return await fn(params, isRaw);
    }
  );
}

/**
 * @class Temples
 * @description This class is used to aggregate the tools that used to interact with SUI network.
 */
export class Temples {
  public accountManager: VaraAccountManager;
  public varaInteractor: VaraInteractor;
  public packageId: string | undefined;
  public metadata: string | undefined;

  readonly #query: MapMoudleFuncQuery = {};
  readonly #tx: MapMoudleFuncTx = {};
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
    metadata,
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
    if (metadata !== undefined) {
      this.metadata = metadata;
      const metaraw = ProgramMetadata.from(metadata);
      const allTypes = metaraw.getAllTypes();
      const execMethodTypes = allTypes['EngineSystemsSystemAction'];
      // for (const [key, value] of Object.entries(queryMethodTypes)) {
      const execEnumObj = JSON.parse(execMethodTypes as string)._enum;
      console.log(execEnumObj);
      for (const [funcName, enumValue] of Object.entries(execEnumObj)) {
        const meta = {
          funcName,
          paramType: enumValue,
        } as VaraFuncType;
        if (isUndefined(this.#tx['contract'])) {
          this.#tx['contract'] = {};
        }
        if (isUndefined(this.#tx['contract'][funcName])) {
          this.#tx['contract'][funcName] = createTx(meta, (p, isRaw) =>
            this.#exec(meta, p, isRaw)
          );
        }
      }

      const queryMethodTypes = allTypes['EngineSystemsStateIn'];
      const queryEnumObj = JSON.parse(queryMethodTypes as string)._enum;

      for (const [funcName, enumValue] of Object.entries(queryEnumObj)) {
        const meta = {
          funcName,
          paramType: enumValue,
        } as VaraFuncType;
        if (isUndefined(this.#query['contract'])) {
          this.#query['contract'] = {};
        }
        if (isUndefined(this.#query['contract'][funcName])) {
          this.#query['contract'][funcName] = createQuery(meta, (p) =>
            this.#read(meta, p)
          );
        }
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

  public get query(): MapMoudleFuncQuery {
    return this.#query;
  }

  public get tx(): MapMoudleFuncTx {
    return this.#tx;
  }

  #exec = async (
    meta: VaraFuncType,
    params?: unknown[] | null,
    isRaw?: boolean
  ) => {
    if (params === undefined) {
      params = null;
    }
    const payload = {
      [meta.funcName]: params,
    };
    const account = await this.accountManager.getKeyPair();
    const tx = await this.varaInteractor.structuredTransaction(
      account,
      this.packageId!,
      payload,
      this.metadata!
    );
    if (isRaw === true) {
      return tx;
    }
    return await this.varaInteractor.signAndSend(account, tx);
  };

  #read = async (meta: VaraFuncType, params?: unknown[] | null) => {
    if (params === undefined) {
      params = null;
    }
    const payload = {
      [meta.funcName]: params,
    };
    let state = await this.varaInteractor.queryState(
      this.packageId!,
      payload,
      this.metadata!
    );
    return state;
  };

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

  async getMetaHash(programId: HexString) {
    return await this.varaInteractor.getMetaHash(programId);
  }

  getMetadata() {
    return this.metadata;
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
