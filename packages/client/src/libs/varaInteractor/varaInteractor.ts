import {
  GearApi,
  MessageSendOptions,
  PayloadType,
  HexString,
  GearKeyring,
  decodeAddress,
} from '@gear-js/api';
import { blake2AsHex } from '@polkadot/util-crypto';
// import { SubmittableExtrinsic } from '@polkadot/api/types';
import type { SubmittableExtrinsic } from '@polkadot/api/submittable/types';
import { ISubmittableResult } from '@polkadot/types/types';
import { FaucetNetworkType, Network, NodeUrlType } from '../../types';
// import { SuiOwnedObject, SuiSharedObject } from '../suiModel';
import { delay } from './util';
import { Keyring } from '@polkadot/keyring';
import { ProgramMetadata, GearProgram } from '@gear-js/api';
import { ApiPromise, WsProvider, HttpProvider } from '@polkadot/api';
import { metadata } from '@polkadot/types/interfaces/essentials';
import { KeyringPair } from '@polkadot/keyring/types';

function hexToBinary(hex: string): string {
  let binaryString = '';
  for (let i = 0; i < hex.length; i++) {
    const bin = parseInt(hex[i], 16).toString(2).padStart(4, '0');
    binaryString += bin;
  }
  return binaryString;
}

/**
 * `SuiTransactionSender` is used to send transaction with a given gas coin.
 * It always uses the gas coin to pay for the gas,
 * and update the gas coin after the transaction.
 */
export class VaraInteractor {
  public readonly clients: GearApi[];
  public currentClient: GearApi;
  public readonly fullNodes: NodeUrlType[];
  public currentFullNode: NodeUrlType;

  public readonly wsProviders?: WsProvider[];
  public wsProvider?: WsProvider;
  public wsApi?: Promise<ApiPromise>;
  public network?: Network;

  constructor(
    fullNodeUrls: NodeUrlType[],
    network?: Network,
    connectWs?: boolean
  ) {
    if (fullNodeUrls.length === 0)
      throw new Error('fullNodeUrls must not be empty');
    this.fullNodes = fullNodeUrls;

    if (connectWs === true) {
      this.wsProviders = fullNodeUrls.map(
        (providerAddress) => new WsProvider(providerAddress.ws)
      );
      this.wsProvider = this.wsProviders[0];
      this.wsApi = ApiPromise.create({ provider: this.wsProvider });
    }

    this.clients = fullNodeUrls.map((fullNodeUrl) => {
      const httpProvider = new HttpProvider(fullNodeUrl.http);
      return new GearApi({ provider: httpProvider, noInitWarn: true });
    });

    this.currentFullNode = fullNodeUrls[0];
    this.currentClient = this.clients[0];

    this.network = network;
  }

  async nodeInfo() {
    for (const clientIdx in this.clients) {
      try {
        const chain = await this.clients[clientIdx].chain();
        const nodeName = await this.clients[clientIdx].nodeName();
        const nodeVersion = await this.clients[clientIdx].nodeVersion();
        // const genesis = this.clients[clientIdx].genesisHash.toHex();

        return {
          chain,
          nodeName,
          nodeVersion,
        };
      } catch (err) {
        console.warn(
          `Failed to query node info with fullnode ${this.fullNodes[clientIdx]}: ${err}`
        );
        await delay(2000);
      }
    }
    throw new Error('Failed to send transaction with all fullnodes');
  }

  switchToNextClient() {
    const currentClientIdx = this.clients.indexOf(this.currentClient);
    this.currentClient =
      this.clients[(currentClientIdx + 1) % this.clients.length];
    this.currentFullNode =
      this.fullNodes[(currentClientIdx + 1) % this.clients.length];
  }

  async signAndSend(
    signer: KeyringPair,
    // programId: HexString,
    tx: SubmittableExtrinsic
  ) {
    for (const clientIdx in this.clients) {
      try {
        return await tx.signAndSend(signer, (event: any) => {
          console.log(event.toHuman());
        });
      } catch (err) {
        console.warn(
          `Failed to send transaction with fullnode ${this.fullNodes[clientIdx]}: ${err}`
        );
        await delay(2000);
      }
    }
    throw new Error('Failed to send transaction with all fullnodes');
  }

  async structuredTransaction(
    signer: KeyringPair,
    programId: HexString,
    payload: PayloadType,
    metaHash?: string,
    gasLimit?: number,
    value?: number
  ) {
    for (const clientIdx in this.clients) {
      try {
        await delay(1500);

        if (metaHash === undefined) {
          metaHash = await this.clients[clientIdx].program.metaHash(programId);
        }
        const meta = ProgramMetadata.from(
          metaHash
          // '00020000010000000001070000000100000000000000000109000000010a000000d5072c000c34656e67696e655f736368656d611c73746f726167652c536368656d614576656e7400010c245365745265636f72640c0004011c4163746f724964000010011c5665633c75383e000010011c5665633c75383e0000003044656c6574655265636f7264080004011c4163746f724964000010011c5665633c75383e000100205265676973746572040014015c5665633c284163746f7249642c205665633c75383e293e000200000410106773746418636f6d6d6f6e287072696d6974697665731c4163746f724964000004000801205b75383b2033325d000008000003200000000c000c0000050300100000020c0014000002180018000004080410001c0838656e67696e655f73797374656d733053797374656d416374696f6e0001080c41646400000038536574456e746974794c6576656c08002001107531323800002001107531323800010000200000050700240838656e67696e655f73797374656d731c5374617465496e000108404765744c6576656c4279456e746974790400200110753132380000004447657443757272656e74436f756e74657200010000280838656e67696e655f73797374656d732053746174654f75740001083843757272656e74436f756e746572040020011075313238000000344c6576656c4279456e7469747904002001107531323800010000'
        );

        if (gasLimit === undefined) {
          const gas = await this.clients[clientIdx].program.calculateGas.handle(
            decodeAddress(signer.address),
            programId,
            payload,
            value,
            true,
            meta
          );
          gasLimit = gas.min_limit;
        }
        if (value === undefined) {
          value = 10000000000000;
        }

        const tx = await this.clients[clientIdx].message.send(
          {
            destination: programId,
            payload,
            gasLimit: gasLimit,
            value: value,
          },
          meta
        );

        return tx;
      } catch (err) {
        console.warn(
          `Failed to structured transaction with fullnode ${this.fullNodes[clientIdx]}: ${err}`
        );
        await delay(2000);
      }
    }
    throw new Error('Failed to structured transaction with all fullnodes');
  }

  async getMetaHash(programId: HexString) {
    for (const clientIdx in this.clients) {
      try {
        await delay(1500);
        const metaHash = await this.clients[clientIdx].program.metaHash(
          programId
        );
        return metaHash;
      } catch (err) {
        console.warn(
          `Failed to get metaHash with fullnode ${this.fullNodes[clientIdx]}: ${err}`
        );
        await delay(2000);
      }
    }
    throw new Error('Failed to get metaHash with all fullnodes');
  }

  async queryState(
    programId: HexString,
    payload: PayloadType,
    metaHash?: string
  ) {
    for (const clientIdx in this.clients) {
      try {
        await delay(1500);
        if (metaHash === undefined) {
          metaHash = await this.clients[clientIdx].program.metaHash(programId);
        }
        const meta = ProgramMetadata.from(
          metaHash
          // '00020000010000000001070000000100000000000000000109000000010a000000d5072c000c34656e67696e655f736368656d611c73746f726167652c536368656d614576656e7400010c245365745265636f72640c0004011c4163746f724964000010011c5665633c75383e000010011c5665633c75383e0000003044656c6574655265636f7264080004011c4163746f724964000010011c5665633c75383e000100205265676973746572040014015c5665633c284163746f7249642c205665633c75383e293e000200000410106773746418636f6d6d6f6e287072696d6974697665731c4163746f724964000004000801205b75383b2033325d000008000003200000000c000c0000050300100000020c0014000002180018000004080410001c0838656e67696e655f73797374656d733053797374656d416374696f6e0001080c41646400000038536574456e746974794c6576656c08002001107531323800002001107531323800010000200000050700240838656e67696e655f73797374656d731c5374617465496e000108404765744c6576656c4279456e746974790400200110753132380000004447657443757272656e74436f756e74657200010000280838656e67696e655f73797374656d732053746174654f75740001083843757272656e74436f756e746572040020011075313238000000344c6576656c4279456e7469747904002001107531323800010000'
        );
        // console.log(meta.getAllTypes());
        const state = await this.clients[clientIdx].programState.read(
          {
            programId: programId as HexString,
            payload,
            // payload: {
            //   GetCurrentCounter: null,
            // },
          },
          meta
        );
        return state.toHuman();
      } catch (err) {
        console.warn(
          `Failed to get metaHash with fullnode ${this.fullNodes[clientIdx]}: ${err}`
        );
        await delay(2000);
      }
    }
    throw new Error('Failed to get metaHash with all fullnodes');
  }

  async queryBalance(addr: String) {
    for (const clientIdx in this.clients) {
      try {
        let balances_amount = await this.clients[
          clientIdx
        ].query.system.account(addr);
        return balances_amount.toHuman();
      } catch (err) {
        console.warn(
          `Failed to query(${addr}) balance with fullnode ${this.fullNodes[clientIdx]}: ${err}`
        );
        await delay(2000);
      }
    }
    throw new Error(`Failed to query(${addr}) balance with all fullnodes`);
  }
  // async getObjects(
  //   ids: string[],
  //   options?: SuiObjectDataOptions
  // ): Promise<SuiObjectData[]> {
  //   const opts: SuiObjectDataOptions = options ?? {
  //     showContent: true,
  //     showDisplay: true,
  //     showType: true,
  //     showOwner: true,
  //   };

  //   for (const clientIdx in this.clients) {
  //     try {
  //       const objects = await this.clients[clientIdx].multiGetObjects({
  //         ids,
  //         options: opts,
  //       });
  //       const parsedObjects = objects
  //         .map((object) => {
  //           return object.data;
  //         })
  //         .filter((object) => object !== null && object !== undefined);
  //       return parsedObjects as SuiObjectData[];
  //     } catch (err) {
  //       await delay(2000);
  //       console.warn(
  //         `Failed to get objects with fullnode ${this.fullNodes[clientIdx]}: ${err}`
  //       );
  //     }
  //   }
  //   throw new Error('Failed to get objects with all fullnodes');
  // }

  // async getObject(id: string) {
  //   const objects = await this.getObjects([id]);
  //   return objects[0];
  // }

  // async getDynamicFieldObject(
  //   parentId: string,
  //   name: RpcTypes.DynamicFieldName
  // ) {
  //   for (const clientIdx in this.clients) {
  //     try {
  //       return await this.clients[clientIdx].getDynamicFieldObject({
  //         parentId,
  //         name,
  //       });
  //     } catch (err) {
  //       await delay(2000);
  //       console.warn(
  //         `Failed to get DynamicFieldObject with fullnode ${this.fullNodes[clientIdx]}: ${err}`
  //       );
  //     }
  //   }
  //   throw new Error('Failed to get DynamicFieldObject with all fullnodes');
  // }

  // async getDynamicFields(parentId: string, cursor?: string, limit?: number) {
  //   for (const clientIdx in this.clients) {
  //     try {
  //       return await this.clients[clientIdx].getDynamicFields({
  //         parentId,
  //         cursor,
  //         limit,
  //       });
  //     } catch (err) {
  //       await delay(2000);
  //       console.warn(
  //         `Failed to get DynamicFields with fullnode ${this.fullNodes[clientIdx]}: ${err}`
  //       );
  //     }
  //   }
  //   throw new Error('Failed to get DynamicFields with all fullnodes');
  // }

  // async getTxDetails(digest: string) {
  //   for (const clientIdx in this.clients) {
  //     try {
  //       const txResOptions: SuiTransactionBlockResponseOptions = {
  //         showEvents: true,
  //         showEffects: true,
  //         showObjectChanges: true,
  //         showBalanceChanges: true,
  //       };

  //       return await this.clients[clientIdx].getTransactionBlock({
  //         digest,
  //         options: txResOptions,
  //       });
  //     } catch (err) {
  //       await delay(2000);
  //       console.warn(
  //         `Failed to get TransactionBlocks with fullnode ${this.fullNodes[clientIdx]}: ${err}`
  //       );
  //     }
  //   }
  //   throw new Error('Failed to get TransactionBlocks with all fullnodes');
  // }

  // async getOwnedObjects(owner: string, cursor?: string, limit?: number) {
  //   for (const clientIdx in this.clients) {
  //     try {
  //       return await this.clients[clientIdx].getOwnedObjects({
  //         owner,
  //         cursor,
  //         limit,
  //       });
  //     } catch (err) {
  //       await delay(2000);
  //       console.warn(
  //         `Failed to get OwnedObjects with fullnode ${this.fullNodes[clientIdx]}: ${err}`
  //       );
  //     }
  //   }
  //   throw new Error('Failed to get OwnedObjects with all fullnodes');
  // }

  // async getNormalizedMoveModulesByPackage(packageId: string) {
  //   for (const clientIdx in this.clients) {
  //     try {
  //       return await this.clients[clientIdx].getNormalizedMoveModulesByPackage({
  //         package: packageId,
  //       });
  //     } catch (err) {
  //       await delay(2000);
  //       console.warn(
  //         `Failed to get NormalizedMoveModules with fullnode ${this.fullNodes[clientIdx]}: ${err}`
  //       );
  //     }
  //   }
  //   throw new Error('Failed to get NormalizedMoveModules with all fullnodes');
  // }

  // /**
  //  * @description Update objects in a batch
  //  * @param suiObjects
  //  */
  // async updateObjects(suiObjects: (SuiOwnedObject | SuiSharedObject)[]) {
  //   const objectIds = suiObjects.map((obj) => obj.objectId);
  //   const objects = await this.getObjects(objectIds);
  //   for (const object of objects) {
  //     const suiObject = suiObjects.find(
  //       (obj) => obj.objectId === object?.objectId
  //     );
  //     if (suiObject instanceof SuiSharedObject) {
  //       if (
  //         object.owner &&
  //         typeof object.owner === 'object' &&
  //         'Shared' in object.owner
  //       ) {
  //         suiObject.initialSharedVersion =
  //           object.owner.Shared.initial_shared_version;
  //       } else {
  //         suiObject.initialSharedVersion = undefined;
  //       }
  //     } else if (suiObject instanceof SuiOwnedObject) {
  //       suiObject.version = object?.version;
  //       suiObject.digest = object?.digest;
  //     }
  //   }
  // }

  // /**
  //  * @description Select coins that add up to the given amount.
  //  * @param addr the address of the owner
  //  * @param amount the amount that is needed for the coin
  //  * @param coinType the coin type, default is '0x2::SUI::SUI'
  //  */
  // async selectCoins(
  //   addr: string,
  //   amount: number,
  //   coinType: string = '0x2::SUI::SUI'
  // ) {
  //   const selectedCoins: {
  //     objectId: string;
  //     digest: string;
  //     version: string;
  //   }[] = [];
  //   let totalAmount = 0;
  //   let hasNext = true,
  //     nextCursor: string | null | undefined = null;
  //   while (hasNext && totalAmount < amount) {
  //     const coins = await this.currentClient.getCoins({
  //       owner: addr,
  //       coinType: coinType,
  //       cursor: nextCursor,
  //     });
  //     // Sort the coins by balance in descending order
  //     coins.data.sort((a, b) => parseInt(b.balance) - parseInt(a.balance));
  //     for (const coinData of coins.data) {
  //       selectedCoins.push({
  //         objectId: coinData.coinObjectId,
  //         digest: coinData.digest,
  //         version: coinData.version,
  //       });
  //       totalAmount = totalAmount + parseInt(coinData.balance);
  //       if (totalAmount >= amount) {
  //         break;
  //       }
  //     }

  //     nextCursor = coins.nextCursor;
  //     hasNext = coins.hasNextPage;
  //   }

  //   if (!selectedCoins.length) {
  //     throw new Error('No valid coins found for the transaction.');
  //   }
  //   return selectedCoins;
  // }

  // async requestFaucet(address: string, network: FaucetNetworkType) {
  //   await requestSuiFromFaucetV0({
  //     host: getFaucetHost(network),
  //     recipient: address,
  //   });
  // }
}
