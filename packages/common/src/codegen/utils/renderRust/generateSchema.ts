import {
  TempleConfig,
  BaseType,
  RenderSchemaOptions,
  SchemaInfo,
} from "../../types";
import { formatAndWriteRust, writeToml } from "../formatAndWrite";
import {
  convertToCamelCase,
} from "./common";
import { generateSrc } from "./generateSrc";

export function getRenderSchemaOptions(config: TempleConfig) {
  const options: RenderSchemaOptions[] = [];
  for (const schemaName of Object.keys(config.schemas)) {
    const schemaData = config.schemas[schemaName];
    let keyType: BaseType | Record<string, BaseType>;
    let valueType: BaseType | Record<string, BaseType>;
    let singleton = false;
    let ephemeral =
      schemaData.ephemeral !== undefined ? schemaData.ephemeral : false;

    if (typeof schemaData === "string") {
      valueType = schemaData;
      keyType = {};
    } else {
      valueType = schemaData.valueType;
      keyType = schemaData.keyType;

      singleton =
        typeof schemaData.valueType !== "object" ||
        schemaData.valueType === null ||
        Object.keys(schemaData.valueType).length === 0
          ? true
          : false;
    }

    let schemaInfo: SchemaInfo = {
      structName: convertToCamelCase(schemaName),
      keyTypes: getTypes(keyType),
      keyNames: getNames(keyType),
      valueTypes: getTypes(valueType),
      valueNames: getNames(valueType),
    };

    options.push({
      projectName: config.name,
      schemaName: schemaName,
      singleton,
      valueType,
      keyType,
      ephemeral,
      schemaInfo,
    });
  }
  return options;
}

function getTypes(input: string | Record<string, any>): string[] {
  if (typeof input === "string") {
    return [input];
  } else if (typeof input === "object" && input !== null) {
    return Object.values(input);
  } else {
    throw new Error("Invalid input type");
  }
}

function getNames(input: string | Record<string, any>): string[] {
  if (typeof input === "string") {
    return ["value"];
  } else if (typeof input === "object" && input !== null) {
    return Object.keys(input);
  } else {
    throw new Error("Invalid input type");
  }
}

function generateTuple(types: string[]): string {
  if (types.length === 1) {
    return types[0];
  } else {
    return `(${types.join(", ")})`;
  }
}

export function generateSchema(config: TempleConfig, path: string) {
  const options = getRenderSchemaOptions(config);
  for (const option of options) {
    let code = renderSchema(option);
    formatAndWriteRust(
      code,
      `${path}/contracts/components/src/${option.schemaName}.rs`,
      "formatAndWriteRust"
    );
  }
  generateLib(config, path);
  generateSchemaToml(config.name, path);

  generateSrc(config, path);
}

function generateComponentIdString(ComponentName: string, ephemeral: boolean): string {
  const prefix = ephemeral ? "10" : "00";
  const bytes = Buffer.from(ComponentName, 'utf-8');
  const buffer = Buffer.alloc(32).fill(0);
  buffer.write(prefix, 'hex');
  bytes.copy(buffer, 2);
  const hexString = buffer.toString('hex');
  return hexString;
}

function generateComponentIdU8Array(ComponentName: string, ephemeral: boolean) {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(ComponentName);
  const array = new Uint8Array(32);
  array.fill(0);
  if (ephemeral) {
    array[0] = 1;
  }
  array.set(bytes, 2);

  return array;
}


function decodeComponentId(componentId: string): { name: string, isOnchain: boolean } {
  const buffer = Buffer.from(componentId, 'hex');
  const prefixBytes = buffer.slice(0, 2);
  const isOnchain = prefixBytes.equals(Buffer.from('00', 'hex'));
  const nameBytes = buffer.slice(2);
  const name = nameBytes.toString('utf-8').replace(/\0/g, '');
  return { name, isOnchain };
}

function generateStructField(keys: string[], types: string[]) {
  let result = '';
  for (let i = 0; i < keys.length; i++) {
    result += `pub ${keys[i]}: ${types[i]},\n`;
  }
  return result;
}


function renderSchema(option: RenderSchemaOptions) {
  console.log(option);

  return `
#![allow(non_upper_case_globals)]

use lazy_static::lazy_static;
use temple_storage::value::StorageValue;
use gstd::prelude::*;

// 0x${generateComponentIdString(option.schemaInfo.structName, option.ephemeral)}
const COMPONENT_ID: [u8; 32] = [${generateComponentIdU8Array(option.schemaInfo.structName, option.ephemeral)}];

${option.schemaInfo.valueNames.length === 1 ? '' : `
#[derive(Debug, Default, Encode, Decode, TypeInfo)]
pub struct ${option.schemaInfo.structName} { 
${generateStructField(option.schemaInfo.valueNames,option.schemaInfo.valueTypes)}
}`  }

lazy_static! {
    pub static ref ${option.schemaInfo.structName}Component: StorageValue<${option.schemaInfo.valueNames.length === 1 ? option.schemaInfo.valueTypes[0] : option.schemaInfo.structName}> =
        StorageValue::new("${option.schemaInfo.structName}".into(), COMPONENT_ID);
}
`;
}

export function generateLib(config: TempleConfig, path: string) {
  let code = `
#![no_std]

${Object.keys(config.schemas)
  .map((schema) => `pub mod ${schema};`)
  .join("\n")}
`;
  formatAndWriteRust(
    code,
    `${path}/contracts/components/src/lib.rs`,
    "formatAndWriteRust"
  );
}

export function generateSchemaToml(name: string, path: string) {
  let code = `[package]
name = "${name}-components"
version = "0.1.0"
edition = "2021"

[dependencies]
gstd = { git = "https://github.com/gear-tech/gear.git", tag = "v1.1.1", features = ["debug"] }
gmeta = { git = "https://github.com/gear-tech/gear", tag = "v1.1.1" }
parity-scale-codec = { version = "3", default-features = false }
temple-storage = { path = "../../../../../temples/crates/storage" }
temple-types = { path = "../../../../../temples/crates/types" }
lazy_static = { version = "1.4.0", features = ["spin_no_std"] }
scale-info = { version = "2", default-features = false }
`;
  writeToml(code, `${path}/contracts/components/Cargo.toml`, "writeToml");
}
