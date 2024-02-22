import {
  ObeliskConfig,
  BaseValueType,
  BaseType,
  RenderSchemaOptions,
  MoveType, SchemaInfo,
} from "../../types";
import {formatAndWriteRust, writeToml} from "../formatAndWrite";
import {
  getFriendSystem,
  renderKeyName,
  renderSetFunc,
  renderContainFunc,
  renderRemoveFunc,
  renderStruct,
  renderNewStructFunc,
  convertToCamelCase,
  renderSetAttrsFunc,
  renderRegisterFunc,
  renderGetAllFunc,
  renderGetAttrsFunc,
  getStructAttrsWithType,
  getStructAttrs,
  renderRegisterFuncWithInit,
  renderSingleSetFunc,
  renderSingleSetAttrsFunc,
  renderSingleGetAllFunc,
  renderSingleGetAttrsFunc,
} from "./common";
import {generateSrc} from "./generateSrc";

export function getRenderSchemaOptions(config: ObeliskConfig) {
  const options: RenderSchemaOptions[] = [];
  for (const schemaName of Object.keys(config.schemas)) {
    const schemaData = config.schemas[schemaName];
    let keyType: BaseType | Record<string, BaseType>;
    let valueType: BaseType | Record<string, BaseType>;
    let singleton = false;
    let ephemeral = schemaData.ephemeral !== undefined ? schemaData.ephemeral : false;;

    if (typeof schemaData === "string") {
        valueType = schemaData;
        keyType = {}
    } else {
      valueType = schemaData.valueType;
      keyType = schemaData.keyType;

      singleton = typeof schemaData.valueType !== 'object' || schemaData.valueType === null || Object.keys(schemaData.valueType).length === 0 ? true : false;
    }

    let schemaInfo: SchemaInfo =  {
      structName: convertToCamelCase(schemaName),
      keyTypes: getTypes(keyType),
      keyNames: getNames(keyType),
      valueTypes: getTypes(valueType),
      valueNames: getNames(valueType)
    };

    options.push({
      projectName: config.name,
      schemaName: schemaName,
      singleton,
      valueType,
      keyType,
      ephemeral,
      schemaInfo
    });
  }
  return options;
}

function getTypes(input: string | Record<string, any>): string[] {
  if (typeof input === 'string') {
    return [input];
  } else if (typeof input === 'object' && input !== null) {
    return Object.values(input);
  } else {
    throw new Error('Invalid input type');
  }
}

function getNames(input: string | Record<string, any>): string[] {
  if (typeof input === 'string') {
    return ["value"];
  } else if (typeof input === 'object' && input !== null) {
    return Object.keys(input);
  } else {
    throw new Error('Invalid input type');
  }
}

function generateTuple(types: string[]): string {
  if (types.length === 1) {
    return types[0];
  } else {
    return `(${types.join(', ')})`;
  }
}

export function generateSchema(config: ObeliskConfig, path: string) {
  const options = getRenderSchemaOptions(config);
  for (const option of options) {
    let code =  renderSchema(option)
    formatAndWriteRust(
      code,
      `${path}/contracts/schemas/src/${option.schemaName}.rs`,
      "formatAndWriteRust"
    );
  }
  generateLib(config, path)
  generateStorage(config.name, path)
  generateSchemaToml(config.name, path)

  generateSrc(config, path)

}

function renderSchema(option: RenderSchemaOptions) {
  console.log(option.schemaInfo.keyNames)
  console.log(generateTuple(option.schemaInfo.keyNames).length)
  console.log(option.schemaInfo.keyNames.length === 0 ? `vec![]` : generateTuple(option.schemaInfo.keyNames) + `.encode()`)
  return `
use gstd::ActorId;
use gstd::collections::HashMap;
use gstd::prelude::*;
use crate::storage::{SchemaType, TEMPLE_STORAGE};

pub fn get_schema_id() -> ActorId {
    crate::storage::get_schema_id(SchemaType::${option.ephemeral ? 'Offchain' : 'Onchain'}, String::from("${option.schemaInfo.structName}"))
}

pub fn get_key_types() -> Vec<String> {
    vec![${option.schemaInfo.keyTypes.map(type => `String::from("${type}")`)}]
}

pub fn get_key_names() -> Vec<String> {
    vec![${option.schemaInfo.keyNames.map(name => `String::from("${name}")`)}]
}

pub fn get_value_types() -> Vec<String> {
     vec![${option.schemaInfo.valueTypes.map(type => `String::from("${type}")`)}]
}

pub fn get_value_names() -> Vec<String> {
    vec![${option.schemaInfo.valueNames.map(name => `String::from("${name}")`)}]
}

pub fn register() -> (ActorId, Vec<u8>) {
    let temple_schema = unsafe { TEMPLE_STORAGE.get_or_insert(Default::default()) };
    temple_schema.set_schema_metadata(
        get_schema_id(),
        get_key_types(),
        get_key_names(),
        get_value_types(),
        get_value_names(),
    )
}

pub fn get(${option.schemaInfo.keyNames.map((key, index) => `${key}: ${option.schemaInfo.keyTypes[index]}`)}) -> ${generateTuple(option.schemaInfo.valueTypes)} {
    let temple_schema = unsafe { TEMPLE_STORAGE.get_or_insert(Default::default()) };
    let temple_key_tuple = ${option.schemaInfo.keyNames.length === 0 ? `vec![]` : generateTuple(option.schemaInfo.keyNames) + `.encode()`};
    let temple_raw_value = temple_schema.get(get_schema_id(), temple_key_tuple);
    Decode::decode(&mut &temple_raw_value[..]).unwrap_or(Default::default())
}

pub fn set(${(option.schemaInfo.keyNames.map((key, index) => `${key}: ${option.schemaInfo.keyTypes[index]}`)).concat(option.schemaInfo.valueNames.map((key, index) => `${key}: ${option.schemaInfo.valueTypes[index]}`))}) {
    let temple_schema = unsafe { TEMPLE_STORAGE.get_or_insert(Default::default()) };
    let temple_key_tuple = ${option.schemaInfo.keyNames.length === 0 ? `vec![]` : generateTuple(option.schemaInfo.keyNames) + `.encode()`};
    let temple_raw_value = ${generateTuple(option.schemaInfo.valueNames)}.encode();
    temple_schema.set(get_schema_id(), temple_key_tuple, temple_raw_value);
}
`;
}


export function generateLib(config: ObeliskConfig, path: string) {
  let code = `
#![no_std]

pub mod storage;
${(Object.keys(config.schemas).map(schema => `pub mod ${schema};`).join("\n"))}
`;
  formatAndWriteRust(
      code,
      `${path}/contracts/schemas/src/lib.rs`,
      "formatAndWriteRust"
  );
}

export function generateStorage(name: string, path: string) {
  let code = `
use gstd::collections::HashMap;
use gstd::prelude::*;
use gstd::{ActorId, msg};
use parity_scale_codec::{Decode, Encode};

type SchemaId = ActorId;
type Keys = Vec<String>;
type KeyNames = Vec<String>;
type Types = Vec<String>;
type TypeNames = Vec<String>;

#[derive(Debug, Default, Encode, Decode)]
pub struct SchemaInfo {
    keys: Keys,
    key_names: KeyNames,
    types: Types,
    type_names: TypeNames,
}

#[derive(Debug, Encode, Decode, TypeInfo)]
pub enum SchemaEvent {
    SetRecord(SchemaId, Vec<u8>, Vec<u8>),
    DeleteRecord(SchemaId, Vec<u8>),
    Register(Vec<(SchemaId, Vec<u8>)>)
}

#[derive(Debug, Encode, Decode)]
pub enum SchemaType {
    Onchain,
    Offchain,
}

#[derive(Debug, Default)]
pub struct Schema {
    table: HashMap<ActorId, HashMap<Vec<u8>, Vec<u8>>>,
}

pub fn get_schema_id(schema_type: SchemaType, schema_name: String) -> ActorId {
    let mut bytes = Vec::new();

    match schema_type {
        SchemaType::Onchain => bytes.extend(&vec![0]),
        SchemaType::Offchain => bytes.extend(&vec![1])
    }
    let mut schema_name_bytes = schema_name.into_bytes();
    schema_name_bytes.resize(30, 0);
    bytes.extend(&schema_name_bytes);
    let bytes:[u8;32] = bytes.try_into().expect("Failed");
    ActorId::from(bytes)
}

pub fn get_schema_type(schema_id: ActorId) -> SchemaType {
    if let [0, 0, ..] = schema_id.encode().as_slice() {
        SchemaType::Onchain
    } else if let [1, 0, ..] = schema_id.encode().as_slice() {
        SchemaType::Offchain
    } else {
        panic!("Invalid schema_id")
    }
}

impl Schema {
    pub fn set_schema_metadata(&mut self, schema_id: ActorId,  keys: Keys, key_names: KeyNames, types: Types, type_names: TypeNames) -> (ActorId, Vec<u8>) {
        let schema_info = SchemaInfo {
            keys,
            key_names,
            types,
            type_names,
        };
        let key_tuple = schema_id.encode();
        let data = schema_info.encode();
        let mut hash_map: HashMap<Vec<u8>, Vec<u8>> = HashMap::new();
        hash_map.insert(key_tuple.clone(), data.clone());
        self.table.insert(schema_id, hash_map);
        (schema_id, data)
    }

    pub fn get_schema_metadata(&mut self, schema_id: ActorId) -> SchemaInfo {
        let table = self.table.get(&schema_id).expect("Failed");
        let data = table.get(&schema_id.encode()).expect("Failed");
        SchemaInfo::decode(&mut &data[..]).expect("Failed")
    }

    pub fn get(&self, schema_id: ActorId, key_tuple: Vec<u8>) -> Vec<u8> {
        let table = self.table.get(&schema_id).expect("Failed");
        table.get(&key_tuple).unwrap_or(&Vec::new()).clone()
    }

    pub fn set(&mut self, schema_id: ActorId, key_tuple: Vec<u8>, data: Vec<u8>) {
        let table = self.table.entry(schema_id).or_insert_with(|| panic!("Failed"));
        table.insert(key_tuple.clone(), data.clone());
        msg::reply(SchemaEvent::SetRecord(schema_id, key_tuple, data), 0).expect("Unable to share the state");
    }

    pub fn delete(&mut self, schema_id: ActorId, key_tuple: Vec<u8>) {
        let table = self.table.entry(schema_id).or_insert_with(|| panic!("Failed"));
        table.remove(&key_tuple);
        msg::reply(SchemaEvent::DeleteRecord(schema_id, key_tuple), 0).expect("Unable to share the state");
    }
}

pub static mut TEMPLE_STORAGE: Option<Schema> = None;
`;
  formatAndWriteRust(
      code,
      `${path}/contracts/schemas/src/storage.rs`,
      "formatAndWriteRust"
  );
}

export function generateSchemaToml(name: string, path: string) {
  let code =
      `[package]
name = "${name}-schemas"
version = "0.1.0"
edition = "2021"

# See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html

[dependencies]
gstd = { git = "https://github.com/gear-tech/gear.git", tag = "v1.1.1", features = ["debug"] }
gmeta = { git = "https://github.com/gear-tech/gear", tag = "v1.1.1" }
sp-core-hashing = { version = "10", default-features = false }
parity-scale-codec = { version = "3", default-features = false }
scale-info = { version = "2", default-features = false }
`;
  writeToml(
      code,
      `${path}/contracts/schemas/Cargo.toml`,
      "writeToml"
  );
}
