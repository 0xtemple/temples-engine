// import { RawSigner, SuiAddress } from '@mysten/sui.js';

import { VaraAccountManager } from './libs/varaAccountManager';
import { VaraInteractor } from './libs/varaInteractor';

import {
  ContractQuery,
  ContractTx,
  DerivePathParams,
  FaucetNetworkType,
  MapMoudleFuncQuery,
  MapMoudleFuncTx,
  TemplsParams,
  SuiTxArg,
  // SuiTxArgument,
  SuiVecTxArg,
} from './types';
import { normalizeHexAddress, numberToAddressHex } from './utils';
import keccak256 from 'keccak256';

export function isUndefined(value?: unknown): value is undefined {
  return value === undefined;
}

export function withMeta<T extends { meta: SuiMoveMoudleFuncType }>(
  meta: SuiMoveMoudleFuncType,
  creator: Omit<T, 'meta'>
): T {
  (creator as T).meta = meta;

  return creator as T;
}

function createQuery(
  meta: SuiMoveMoudleFuncType,
  fn: (
    tx: TransactionBlock,
    params: (TransactionArgument | SerializedBcs<any>)[],
    typeArguments?: string[],
    isRaw?: boolean
  ) => Promise<DevInspectResults | TransactionResult>
): ContractQuery {
  return withMeta(
    meta,
    async (
      tx: TransactionBlock,
      params: (TransactionArgument | SerializedBcs<any>)[],
      typeArguments?: string[],
      isRaw?: boolean
    ): Promise<DevInspectResults | TransactionResult> => {
      const result = await fn(tx, params, typeArguments, isRaw);
      return result;
    }
  );
}

function createTx(
  meta: SuiMoveMoudleFuncType,
  fn: (
    tx: TransactionBlock,
    params: (TransactionArgument | SerializedBcs<any>)[],
    typeArguments?: string[],
    isRaw?: boolean
  ) => Promise<SuiTransactionBlockResponse | TransactionResult>
): ContractTx {
  return withMeta(
    meta,
    async (
      tx: TransactionBlock,
      params: (TransactionArgument | SerializedBcs<any>)[],
      typeArguments?: string[],
      isRaw?: boolean
    ): Promise<SuiTransactionBlockResponse | TransactionResult> => {
      // const result = await fn(tx, params, typeArguments, isRaw);
      return await fn(tx, params, typeArguments, isRaw);
    }
  );
}

/**
 * @class Templs
 * @description This class is used to aggregate the tools that used to interact with SUI network.
 */
export class Templs {
  public accountManager: SuiAccountManager;
  public suiInteractor: SuiInteractor;
  public contractFactory: SuiContractFactory;
  public packageId: string | undefined;
  public metadata: SuiMoveNormalizedModules | undefined;

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
  }: ObeliskParams = {}) {
    // Init the account manager
    this.accountManager = new SuiAccountManager({ mnemonics, secretKey });
    // Init the rpc provider
    fullnodeUrls = fullnodeUrls || [getFullnodeUrl(networkType ?? 'mainnet')];
    this.suiInteractor = new SuiInteractor(fullnodeUrls, networkType);

    this.packageId = packageId;
    if (metadata !== undefined) {
      this.metadata = metadata as SuiMoveNormalizedModules;
      Object.values(metadata as SuiMoveNormalizedModules).forEach((value) => {
        const data = value as SuiMoveMoudleValueType;
        const moduleName = data.name;
        Object.entries(data.exposedFunctions).forEach(([funcName, value]) => {
          const meta = value as SuiMoveMoudleFuncType;
          meta.moduleName = moduleName;
          meta.funcName = funcName;

          if (isUndefined(this.#query[moduleName])) {
            this.#query[moduleName] = {};
          }
          if (isUndefined(this.#query[moduleName][funcName])) {
            this.#query[moduleName][funcName] = createQuery(
              meta,
              (tx, p, typeArguments, isRaw) =>
                this.#read(meta, tx, p, typeArguments, isRaw)
            );
          }

          if (isUndefined(this.#tx[moduleName])) {
            this.#tx[moduleName] = {};
          }
          if (isUndefined(this.#tx[moduleName][funcName])) {
            this.#tx[moduleName][funcName] = createTx(
              meta,
              (tx, p, typeArguments, isRaw) =>
                this.#exec(meta, tx, p, typeArguments, isRaw)
            );
          }
        });
      });
    }
    this.contractFactory = new SuiContractFactory({
      packageId,
      metadata,
    });
  }

  public get query(): MapMoudleFuncQuery {
    return this.#query;
  }

  public get tx(): MapMoudleFuncTx {
    return this.#tx;
  }

  #exec = async (
    meta: SuiMoveMoudleFuncType,
    tx: TransactionBlock,
    params: (TransactionArgument | SerializedBcs<any>)[],
    typeArguments?: string[],
    isRaw?: boolean
  ) => {
    if (isRaw === true) {
      return tx.moveCall({
        target: `${this.contractFactory.packageId}::${meta.moduleName}::${meta.funcName}`,
        arguments: params,
        typeArguments,
      });
    }

    tx.moveCall({
      target: `${this.contractFactory.packageId}::${meta.moduleName}::${meta.funcName}`,
      arguments: params,
      typeArguments,
    });
    return await this.signAndSendTxn(tx);
  };

  #read = async (
    meta: SuiMoveMoudleFuncType,
    tx: TransactionBlock,
    params: (TransactionArgument | SerializedBcs<any>)[],
    typeArguments?: string[],
    isRaw?: boolean
  ) => {
    if (isRaw === true) {
      return tx.moveCall({
        target: `${this.contractFactory.packageId}::${meta.moduleName}::${meta.funcName}`,
        arguments: params,
        typeArguments,
      });
    }

    tx.moveCall({
      target: `${this.contractFactory.packageId}::${meta.moduleName}::${meta.funcName}`,
      arguments: params,
      typeArguments,
    });
    return await this.inspectTxn(tx);
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
  switchAccount(derivePathParams: DerivePathParams) {
    this.accountManager.switchAccount(derivePathParams);
  }

  /**
   * @description Get the address of the account for the given derivePathParams
   * @param derivePathParams, such as { accountIndex: 2, isExternal: false, addressIndex: 10 }, comply with the BIP44 standard
   */
  getAddress(derivePathParams?: DerivePathParams) {
    return this.accountManager.getAddress(derivePathParams);
  }

  currentAddress() {
    return this.accountManager.currentAddress;
  }

  getPackageId() {
    return this.contractFactory.packageId;
  }

  getMetadata() {
    return this.contractFactory.metadata;
  }
  /**
   * Request some SUI from faucet
   * @Returns {Promise<boolean>}, true if the request is successful, false otherwise.
   */
  async requestFaucet(address: string, network: FaucetNetworkType) {
    // const addr = this.accountManager.getAddress(derivePathParams);
    return this.suiInteractor.requestFaucet(address, network);
  }

  async getBalance(coinType?: string, derivePathParams?: DerivePathParams) {
    const owner = this.accountManager.getAddress(derivePathParams);
    return this.suiInteractor.currentClient.getBalance({ owner, coinType });
  }

  client() {
    return this.suiInteractor.currentClient;
  }

  async getObject(objectId: string) {
    return this.suiInteractor.getObject(objectId);
  }

  async getObjects(objectIds: string[]) {
    return this.suiInteractor.getObjects(objectIds);
  }

  async signTxn(
    tx: Uint8Array | TransactionBlock | SuiTxBlock,
    derivePathParams?: DerivePathParams
  ) {
    if (tx instanceof SuiTxBlock || tx instanceof TransactionBlock) {
      tx.setSender(this.getAddress(derivePathParams));
    }
    const txBlock = tx instanceof SuiTxBlock ? tx.txBlock : tx;
    const txBytes =
      txBlock instanceof TransactionBlock
        ? await txBlock.build({ client: this.client() })
        : txBlock;
    const keyPair = await this.getKeypair();
    return await keyPair.signTransactionBlock(txBytes);
  }

  async signAndSendTxn(
    tx: Uint8Array | TransactionBlock | SuiTxBlock,
    derivePathParams?: DerivePathParams
  ): Promise<SuiTransactionBlockResponse> {
    const { bytes, signature } = await this.signTxn(tx, derivePathParams);
    return this.suiInteractor.sendTx(bytes, signature);
  }

  /**
   * Transfer the given amount of SUI to the recipient
   * @param recipient
   * @param amount
   * @param derivePathParams
   */
  async transferSui(
    recipient: string,
    amount: number,
    derivePathParams?: DerivePathParams
  ) {
    const tx = new SuiTxBlock();
    tx.transferSui(recipient, amount);
    return this.signAndSendTxn(tx, derivePathParams);
  }

  /**
   * Transfer to mutliple recipients
   * @param recipients the recipients addresses
   * @param amounts the amounts of SUI to transfer to each recipient, the length of amounts should be the same as the length of recipients
   * @param derivePathParams
   */
  async transferSuiToMany(
    recipients: string[],
    amounts: number[],
    derivePathParams?: DerivePathParams
  ) {
    const tx = new SuiTxBlock();
    tx.transferSuiToMany(recipients, amounts);
    return this.signAndSendTxn(tx, derivePathParams);
  }

  /**
   * Transfer the given amounts of coin to multiple recipients
   * @param recipients the list of recipient address
   * @param amounts the amounts to transfer for each recipient
   * @param coinType any custom coin type but not SUI
   * @param derivePathParams the derive path params for the current signer
   */
  async transferCoinToMany(
    recipients: string[],
    amounts: number[],
    coinType: string,
    derivePathParams?: DerivePathParams
  ) {
    const tx = new SuiTxBlock();
    const owner = this.accountManager.getAddress(derivePathParams);
    const totalAmount = amounts.reduce((a, b) => a + b, 0);
    const coins = await this.suiInteractor.selectCoins(
      owner,
      totalAmount,
      coinType
    );
    tx.transferCoinToMany(
      coins.map((c) => c.objectId),
      owner,
      recipients,
      amounts
    );
    return this.signAndSendTxn(tx, derivePathParams);
  }

  async transferCoin(
    recipient: string,
    amount: number,
    coinType: string,
    derivePathParams?: DerivePathParams
  ) {
    return this.transferCoinToMany(
      [recipient],
      [amount],
      coinType,
      derivePathParams
    );
  }

  async transferObjects(
    objects: string[],
    recipient: string,
    derivePathParams?: DerivePathParams
  ) {
    const tx = new SuiTxBlock();
    tx.transferObjects(objects, recipient);
    return this.signAndSendTxn(tx, derivePathParams);
  }

  async moveCall(callParams: {
    target: string;
    arguments?: (SuiTxArg | SuiVecTxArg)[];
    typeArguments?: string[];
    derivePathParams?: DerivePathParams;
  }) {
    const {
      target,
      arguments: args = [],
      typeArguments = [],
      derivePathParams,
    } = callParams;
    const tx = new SuiTxBlock();
    tx.moveCall(target, args, typeArguments);
    return this.signAndSendTxn(tx, derivePathParams);
  }

  /**
   * Select coins with the given amount and coin type, the total amount is greater than or equal to the given amount
   * @param amount
   * @param coinType
   * @param owner
   */
  async selectCoinsWithAmount(
    amount: number,
    coinType: string,
    owner?: string
  ) {
    owner = owner || this.accountManager.currentAddress;
    const coins = await this.suiInteractor.selectCoins(owner, amount, coinType);
    return coins.map((c) => c.objectId);
  }

  /**
   * stake the given amount of SUI to the validator
   * @param amount the amount of SUI to stake
   * @param validatorAddr the validator address
   * @param derivePathParams the derive path params for the current signer
   */
  async stakeSui(
    amount: number,
    validatorAddr: string,
    derivePathParams?: DerivePathParams
  ) {
    const tx = new SuiTxBlock();
    tx.stakeSui(amount, validatorAddr);
    return this.signAndSendTxn(tx, derivePathParams);
  }

  /**
   * Execute the transaction with on-chain data but without really submitting. Useful for querying the effects of a transaction.
   * Since the transaction is not submitted, its gas cost is not charged.
   * @param tx the transaction to execute
   * @param derivePathParams the derive path params
   * @returns the effects and events of the transaction, such as object changes, gas cost, event emitted.
   */
  async inspectTxn(
    tx: Uint8Array | TransactionBlock | SuiTxBlock,
    derivePathParams?: DerivePathParams
  ): Promise<DevInspectResults> {
    const txBlock = tx instanceof SuiTxBlock ? tx.txBlock : tx;
    return this.suiInteractor.currentClient.devInspectTransactionBlock({
      transactionBlock: txBlock,
      sender: this.getAddress(derivePathParams),
    });
  }

  async getWorld(worldObjectId: string) {
    return this.suiInteractor.getObject(worldObjectId);
  }

  async listSchemaNames(worldId: string) {
    const worldObject = await this.getObject(worldId);
    const newObjectContent = worldObject.content;
    if (newObjectContent != null) {
      const objectContent = newObjectContent as ObeliskObjectContent;
      const objectFields = objectContent.fields as Record<string, any>;
      return objectFields['schema_names'];
    } else {
      return [];
    }
  }

  async getEntity(
    worldId: string,
    schemaName: string,
    entityId?: string
  ): Promise<any[] | undefined> {
    const schemaModuleName = `${schemaName}_schema`;
    const tx = new TransactionBlock();
    const params = [tx.pure(worldId)] as TransactionArgument[];

    if (entityId !== undefined) {
      params.push(tx.pure(entityId));
    }

    const getResult = (await this.query[schemaModuleName].get(
      tx,
      params
    )) as DevInspectResults;
    const returnValue = [];

    // "success" | "failure";
    if (getResult.effects.status.status === 'success') {
      const resultList = getResult.results![0].returnValues!;
      for (const res of resultList) {
        const bcs = new BCS(getSuiMoveConfig());
        const value = Uint8Array.from(res[0]);
        const bcsType = res[1].replace(/0x1::ascii::String/g, 'string');
        const data = bcs.de(bcsType, value);
        returnValue.push(data);
      }
      return returnValue;
    } else {
      return undefined;
    }
  }

  async containEntity(
    worldId: string,
    schemaName: string,
    entityId?: string
  ): Promise<boolean | undefined> {
    const schemaModuleName = `${schemaName}_schema`;
    const tx = new TransactionBlock();
    const params = [tx.pure(worldId)] as TransactionArgument[];

    if (entityId !== undefined) {
      params.push(tx.pure(entityId));
    }

    const getResult = (await this.query[schemaModuleName].contains(
      tx,
      params
    )) as DevInspectResults;

    // "success" | "failure";
    if (getResult.effects.status.status === 'success') {
      const res = getResult.results![0].returnValues![0];
      const bcs = new BCS(getSuiMoveConfig());
      const value = Uint8Array.from(res[0]);
      return bcs.de(res[1], value);
    } else {
      return undefined;
    }
  }

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

  async getOwnedObjects(owner: string, cursor?: string, limit?: number) {
    const ownedObjects = await this.suiInteractor.getOwnedObjects(
      owner,
      cursor,
      limit
    );
    const ownedObjectsRes: SuiObjectData[] = [];

    for (const object of ownedObjects.data) {
      const objectDetail = await this.getObject(object.data!.objectId);
      if (
        objectDetail.type!.split('::')[0] === this.contractFactory.packageId
      ) {
        ownedObjectsRes.push(objectDetail);
      }
    }

    return ownedObjectsRes;
  }

  async entity_key_from_object(objectId: string) {
    const checkObjectId = normalizeHexAddress(objectId);
    if (checkObjectId !== null) {
      objectId = checkObjectId;
      return objectId;
    } else {
      return undefined;
    }
  }

  async entity_key_from_bytes(bytes: Uint8Array | Buffer | string) {
    const hashBytes = keccak256(bytes);
    const hashU8Array: number[] = Array.from(hashBytes);
    const bcs = new BCS(getSuiMoveConfig());
    const value = Uint8Array.from(hashU8Array);
    const data = bcs.de('address', value);
    return '0x' + data;
  }

  async entity_key_from_address_with_seed(objectId: string, seed: string) {
    const checkObjectId = normalizeHexAddress(objectId);
    if (checkObjectId !== null) {
      objectId = checkObjectId;
      const bytes = Buffer.from(objectId.slice(2), 'hex');
      const newBuffer = Buffer.concat([bytes, Buffer.from(seed, 'utf-8')]);
      return this.entity_key_from_bytes(newBuffer);
    } else {
      return undefined;
    }
  }

  async entity_key_from_address_with_u256(objectId: string, x: number) {
    const checkObjectId = normalizeHexAddress(objectId);
    if (checkObjectId !== null) {
      objectId = checkObjectId;
      const bcs = new BCS(getSuiMoveConfig());
      const bytes = Buffer.from(objectId.slice(2), 'hex');
      const numberBytes = bcs.ser('u256', x).toBytes();
      return this.entity_key_from_bytes(Buffer.concat([bytes, numberBytes]));
    } else {
      return undefined;
    }
  }

  async entity_key_from_u256(x: number) {
    return numberToAddressHex(x);
  }

  async formatData(type: string, value: Buffer | number[] | Uint8Array) {
    const bcs = new BCS(getSuiMoveConfig());
    const u8Value = Uint8Array.from(value);
    return bcs.de(type, u8Value);
  }
}
