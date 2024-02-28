import { ProgramMetadata } from '@gear-js/api';
import type { SubmittableExtrinsic } from '@polkadot/api/submittable/types';

// import { SuiMoveMoudleFuncType } from '../libs/suiContractFactory/types';

// export type TempleObjectData = {
//   objectId: string;
//   objectType: string;
//   objectVersion: number;
//   objectDisplay: DisplayFieldsResponse;
//   objectFields: ObjectContentFields;
// };

// export type TempleObjectContent = {
//   dataType: 'moveObject';
//   fields: MoveStruct;
//   hasPublicTransfer: boolean;
//   type: string;
// };

export type NodeUrlType = {
  ws: string;
  http: string;
};

export type TemplesParams = {
  mnemonics?: string;
  secretKey?: string;
  fullnodeUrls?: NodeUrlType[];
  networkType?: Network;
  packageId?: string;
  metadata?: string;
  connectWs?: boolean;
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

export type VaraFuncType = {
  funcName: string;
  paramType: string;
};

export interface MessageMeta {
  readonly meta: VaraFuncType;
}

export interface ContractTx extends MessageMeta {
  (params?: unknown[] | null, isRaw?: boolean): SubmittableExtrinsic;
}

export interface ContractQuery extends MessageMeta {
  (params?: unknown[] | null): any;
}

export type MapMessageTx = Record<string, ContractTx>;
export type MapMessageQuery = Record<string, ContractQuery>;

export type MapMoudleFuncTx = Record<string, MapMessageTx>;
export type MapMoudleFuncQuery = Record<string, MapMessageQuery>;

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
