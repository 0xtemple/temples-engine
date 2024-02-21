// import { ObjectContentFields } from '@mysten/sui.js/src/types';
// import type { SerializedBcs } from '@mysten/bcs';
// import type { TransactionArgument } from '@mysten/sui.js/transactions';
// import type {
//   TransactionBlock,
//   TransactionObjectArgument,
//   TransactionResult,
// } from '@mysten/sui.js/transactions';
// import type {
//   SuiObjectRef,
//   SuiMoveNormalizedModules,
//   DevInspectResults,
//   SuiTransactionBlockResponse,
//   DisplayFieldsResponse,
//   MoveStruct,
// } from '@mysten/sui.js/client';
// import type { SharedObjectRef, ObjectArg } from '@mysten/sui.js/bcs';
// export type TransactionResult = TransactionArgument & TransactionArgument[];

import { ProgramMetadata } from '@gear-js/api';

// import { SuiMoveMoudleFuncType } from '../libs/suiContractFactory/types';

// export type ObeliskObjectData = {
//   objectId: string;
//   objectType: string;
//   objectVersion: number;
//   objectDisplay: DisplayFieldsResponse;
//   objectFields: ObjectContentFields;
// };

// export type ObeliskObjectContent = {
//   dataType: 'moveObject';
//   fields: MoveStruct;
//   hasPublicTransfer: boolean;
//   type: string;
// };

export type TemplsParams = {
  mnemonics?: string;
  secretKey?: string;
  fullnodeUrls?: string[];
  faucetUrl?: string;
  networkType?: Network;
  packageId?: string;
  metadata?: ProgramMetadata;
};

export type SchemaFieldType = {
  schemas: {
    type: string;
    fields: {
      id: {
        id: string;
      };
      size: string;
    };
  };
};

export type SchemaValueType = {
  id: {
    id: string;
  };
  name: string;
  value: {
    type: string;
    fields: SchemaFieldType;
  };
};

export type SchemaContentType = {
  type: string;
  fields: SchemaValueType;
  hasPublicTransfer: boolean;
  dataType: 'moveObject';
};

// export interface MessageMeta {
//   readonly meta: SuiMoveMoudleFuncType;
// }

// export interface ContractQuery extends MessageMeta {
//   (
//     tx: TransactionBlock,
//     params: (TransactionArgument | SerializedBcs<any>)[],
//     typeArguments?: string[],
//     isRaw?: boolean
//   ): Promise<DevInspectResults | TransactionResult>;
// }

// export interface ContractTx extends MessageMeta {
//   (
//     tx: TransactionBlock,
//     params: (TransactionArgument | SerializedBcs<any>)[],
//     typeArguments?: string[],
//     isRaw?: boolean
//   ): Promise<SuiTransactionBlockResponse | TransactionResult>;
// }

// export type MapMessageTx = Record<string, ContractTx>;
// export type MapMessageQuery = Record<string, ContractQuery>;

// export type MapMoudleFuncTx = Record<string, MapMessageTx>;
// export type MapMoudleFuncQuery = Record<string, MapMessageQuery>;

// export type MapMoudleFuncTest = Record<string, Record<string, string>>;
// export type MapMoudleFuncQueryTest = Record<string, Record<string, string>>;

export type AccountMangerParams = {
  mnemonics?: string;
  secretKey?: string;
};

export type DerivePathParams = {
  accountIndex?: number;
  isExternal?: boolean;
  addressIndex?: number;
};

// export type NetworkType = 'testnet' | 'mainnet' | 'devnet' | 'localnet';
export enum Network {
  MAINNET = 'mainnet',
  TESTNET = 'testnet',
  DEVNET = 'devnet',
  LOCAL = 'local',
}
export type FaucetNetworkType = 'testnet' | 'devnet' | 'localnet';

export type PureCallArg = {
  Pure: number[];
};

/**
 * These are the basics types that can be used in the SUI
 */
export type VaraBasicTypes =
  | 'address'
  | 'bool'
  | 'u8'
  | 'u16'
  | 'u32'
  | 'u64'
  | 'u128'
  | 'u256'
  | 'signer';

export type VaraInputTypes = 'object' | VaraBasicTypes;

export type DynamicFieldContentType = {
  type: string;
  fields: Record<string, any>;
  hasPublicTransfer: boolean;
  dataType: string;
};

export type ObjectContent = {
  type: string;
  fields: Record<string, any>;
  hasPublicTransfer: boolean;
  dataType: string;
};
