import { ObjectContentFields } from '@mysten/sui.js/src/types';
import type { SerializedBcs } from '@mysten/bcs';
import type { TransactionArgument } from '@mysten/sui.js/transactions';
import type {
  TransactionBlock,
  TransactionObjectArgument,
  TransactionResult,
} from '@mysten/sui.js/transactions';
import type {
  SuiObjectRef,
  SuiMoveNormalizedModules,
  DevInspectResults,
  SuiTransactionBlockResponse,
  DisplayFieldsResponse,
  MoveStruct,
} from '@mysten/sui.js/client';
import type { SharedObjectRef, ObjectArg } from '@mysten/sui.js/bcs';
// export type TransactionResult = TransactionArgument & TransactionArgument[];

import { SuiMoveMoudleFuncType } from '../libs/suiContractFactory/types';

export type ObeliskObjectData = {
  objectId: string;
  objectType: string;
  objectVersion: number;
  objectDisplay: DisplayFieldsResponse;
  objectFields: ObjectContentFields;
};

export type ObeliskObjectContent = {
  dataType: 'moveObject';
  fields: MoveStruct;
  hasPublicTransfer: boolean;
  type: string;
};

export type ObeliskParams = {
  mnemonics?: string;
  secretKey?: string;
  fullnodeUrls?: string[];
  faucetUrl?: string;
  networkType?: NetworkType;
  packageId?: string;
  metadata?: SuiMoveNormalizedModules;
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

// export type SuiTxArgument =
//   | {
//       kind: 'Input';
//       index: number;
//       type?: 'object' | 'pure' | undefined;
//       value?: any;
//     }
//   | {
//       kind: 'GasCoin';
//     }
//   | {
//       kind: 'Result';
//       index: number;
//     }
//   | {
//       kind: 'NestedResult';
//       index: number;
//       resultIndex: number;
//     };

export type SchemaContentType = {
  type: string;
  fields: SchemaValueType;
  hasPublicTransfer: boolean;
  dataType: 'moveObject';
};

export interface MessageMeta {
  readonly meta: SuiMoveMoudleFuncType;
}

export interface ContractQuery extends MessageMeta {
  (
    tx: TransactionBlock,
    params: (TransactionArgument | SerializedBcs<any>)[],
    typeArguments?: string[],
    isRaw?: boolean
  ): Promise<DevInspectResults | TransactionResult>;
}

export interface ContractTx extends MessageMeta {
  (
    tx: TransactionBlock,
    params: (TransactionArgument | SerializedBcs<any>)[],
    typeArguments?: string[],
    isRaw?: boolean
  ): Promise<SuiTransactionBlockResponse | TransactionResult>;
}

export type MapMessageTx = Record<string, ContractTx>;
export type MapMessageQuery = Record<string, ContractQuery>;

export type MapMoudleFuncTx = Record<string, MapMessageTx>;
export type MapMoudleFuncQuery = Record<string, MapMessageQuery>;

export type MapMoudleFuncTest = Record<string, Record<string, string>>;
export type MapMoudleFuncQueryTest = Record<string, Record<string, string>>;

export type AccountMangerParams = {
  mnemonics?: string;
  secretKey?: string;
};

export type DerivePathParams = {
  accountIndex?: number;
  isExternal?: boolean;
  addressIndex?: number;
};

export type NetworkType = 'testnet' | 'mainnet' | 'devnet' | 'localnet';
export type FaucetNetworkType = 'testnet' | 'devnet' | 'localnet';

export type SuiKitParams = {
  mnemonics?: string;
  secretKey?: string;
  fullnodeUrls?: string[];
  faucetUrl?: string;
  networkType?: NetworkType;
};

export type ObjectData = {
  objectId: string;
  objectType: string;
  objectVersion: number;
  objectDigest: string;
  initialSharedVersion?: number;
  objectDisplay: DisplayFieldsResponse;
  objectFields: ObjectContentFields;
};
type TransactionBlockType = InstanceType<typeof TransactionBlock>;

export type PureCallArg = {
  Pure: number[];
};
export type ObjectCallArg = {
  Object: ObjectArg;
};

export type TransactionType = Parameters<TransactionBlockType['add']>;

export type TransactionPureArgument = Extract<
  TransactionArgument,
  {
    kind: 'Input';
    type: 'pure';
  }
>;

export type ObjectFieldType = {
  id: {
    id: string;
  };
  name: string;
  value: string;
};

export type EntityData = {
  objectId: string;
  index: string;
  key: string;
};

export type SuiAddressArg =
  | TransactionArgument
  | SerializedBcs<any>
  | string
  | PureCallArg;

export type SuiTxArg = SuiAddressArg | number | bigint | boolean;

export type SuiObjectArg =
  | TransactionObjectArgument
  | string
  | SharedObjectRef
  | SuiObjectRef
  | ObjectCallArg;

export type SuiVecTxArg =
  | { value: SuiTxArg[]; vecType: SuiInputTypes }
  | SuiTxArg[];

/**
 * These are the basics types that can be used in the SUI
 */
export type SuiBasicTypes =
  | 'address'
  | 'bool'
  | 'u8'
  | 'u16'
  | 'u32'
  | 'u64'
  | 'u128'
  | 'u256'
  | 'signer';

export type SuiInputTypes = 'object' | SuiBasicTypes;

export type SuiReturnValues = {
  returnValues: [number[], string][];
}[];

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
