export type BaseType =
  | "String"
  | "Vec<String>"
  | "ActorId"
  | "bool"
  | "u8"
  | "u64"
  | "u128"
  | "Vec<bool>"
  | "Vec<u8>"
  | "Vec<u64>"
  | "Vec<u128>";

type Bool = boolean;
type U8 = number;
type U64 = number;
type U128 = number;
type Vector<T> = T[];

export type BaseValueType =
  | String
  | Bool
  | U8
  | U64
  | U128
  | Vector<Bool>
  | Vector<U8>
  | Vector<Vector<U8>>
  | Vector<U64>
  | Vector<U128>;

export interface ValueType {
  keyType: BaseType | Record<string, BaseType>;
  valueType: BaseType | Record<string, BaseType>;
  ephemeral?: boolean;
  defaultValue?: BaseValueType | Record<string, BaseValueType>;
}

export type SchemaMapType = BaseType | ValueType;

export type ObeliskConfig = {
  name: string;
  schemas: Record<string, SchemaMapType>;
};

export type MoveType =
  | "string"
  | "vector<string>"
  | "String"
  | "vector<String>"
  | "address"
  | "bool"
  | "u8"
  | "u64"
  | "u128"
  | "vector<address>"
  | "vector<bool>"
  | "vector<u8>"
  | "vector<vector<u8>>"
  | "vector<u64>"
  | "vector<u128>";

export type SchemaInfo =  {
  structName: string,
  keyTypes: string[],
  keyNames: string[],
  valueTypes: string[],
  valueNames: string[],
}

export interface RenderSchemaOptions {
  projectName: string;
  schemaName: string;
  ephemeral: boolean;
  singleton: boolean;
  keyType: BaseType | Record<string, BaseType>; // move type
  valueType: BaseType | Record<string, BaseType>; // move type
  schemaInfo: SchemaInfo
}
