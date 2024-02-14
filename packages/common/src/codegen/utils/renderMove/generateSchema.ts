import {
  ObeliskConfig,
  BaseValueType,
  BaseType,
  RenderSchemaOptions,
  MoveType,
} from "../../types";
import { formatAndWriteMove } from "../formatAndWrite";
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

export function getRenderSchemaOptions(config: ObeliskConfig) {
  const options: RenderSchemaOptions[] = [];
  for (const schemaName of Object.keys(config.schemas)) {
    const schemaData = config.schemas[schemaName];
    let valueType: MoveType | Record<string, MoveType>;
    let realType: BaseType | Record<string, BaseType>;
    let defaultValue: BaseValueType | Record<string, BaseValueType> | undefined;
    let ephemeral = false;
    let singleton = false;
    let needImportString = false;
    if (typeof schemaData === "string") {
      realType = schemaData;

      if (schemaData === "string") {
        valueType = "String";
        needImportString = true;
      } else if (schemaData === "vector<string>") {
        valueType = "vector<String>";
        needImportString = true;
      } else {
        valueType = schemaData;
      }
    } else {
      realType = schemaData.valueType;

      if (typeof schemaData.valueType === "string") {
        if (schemaData.valueType === "string") {
          valueType = "String";
          needImportString = true;
        } else if (schemaData.valueType === "vector<string>") {
          valueType = "vector<String>";
          needImportString = true;
        } else {
          valueType = schemaData.valueType;
        }
      } else {
        valueType = { ...schemaData.valueType };
        for (const key in valueType) {
          if (valueType.hasOwnProperty(key)) {
            if (valueType[key] === "string") {
              valueType[key] = "String";
              needImportString = true;
            } else if (valueType[key] === "vector<string>") {
              valueType[key] = "vector<String>";
              needImportString = true;

              // needImport = "\tuse std::ascii::{String, string};";
            }
          }
        }
      }
      defaultValue = schemaData.defaultValue;
      ephemeral =
        schemaData.ephemeral !== undefined ? schemaData.ephemeral : false;
      singleton = schemaData.defaultValue !== undefined ? true : false;
    }

    options.push({
      projectName: config.name,
      systems: config.systems,
      schemaName: schemaName,
      structName: convertToCamelCase(schemaName),
      ephemeral,
      singleton,
      valueType,
      realType,
      // structAttrs: [renderKeyName(valueType)],
      // structTypes: [renderStruct(convertToCamelCase(schemaName), valueType)],
      defaultValue,
      needImportString,
    });
  }
  return options;
}

export function generateSchema(config: ObeliskConfig, srcPrefix: string) {
  const options = getRenderSchemaOptions(config);
  for (const option of options) {
    let code: string;
    if (option.ephemeral) {
      code = renderEphemeralSchema(option);
    } else if (option.defaultValue !== undefined) {
      code = renderSingleSchema(option);
    } else {
      code = renderSchema(option);
    }
    formatAndWriteMove(
      code,
      `${srcPrefix}/contracts/${option.projectName}/sources/codegen/schemas/${option.schemaName}.move`,
      "formatAndWriteMove"
    );
  }
}

function renderEphemeralSchema(option: RenderSchemaOptions): string {
  return `module ${option.projectName}::${option.schemaName}_schema {
    use std::option::none;
    use ${option.projectName}::events;
    
    const SCHEMA_ID: vector<u8> = b"${option.schemaName}";
    const SCHEMA_TYPE: u8 = 2;
    
${renderKeyName(option.valueType)}
${renderStruct(option.structName, option.valueType, option.ephemeral)}  
\tpublic fun emit_${option.schemaName}(${getStructAttrsWithType(
    option.valueType,
    " "
  )}) {
\t\tevents::emit_set(SCHEMA_ID, SCHEMA_TYPE, none(), ${option.structName} { ${getStructAttrs(
    option.valueType,
    " "
  )} })
\t}
}`;
}

function renderSingleSchema(option: RenderSchemaOptions): string {
  return `module ${option.projectName}::${option.schemaName}_schema {
${
  option.needImportString ? "\tuse std::ascii::{String,string};\n\t" : "\t"
}use std::option::none;
    use sui::tx_context::TxContext;
    use ${option.projectName}::events;
    use ${option.projectName}::world::{Self, World, AdminCap};
    // Systems
${getFriendSystem(option.projectName, option.systems)}

\tconst SCHEMA_ID: vector<u8> = b"${option.schemaName}";
\tconst SCHEMA_TYPE: u8 = 1;

${renderKeyName(option.valueType)}
${renderStruct(option.structName, option.valueType)}
${renderNewStructFunc(option.structName, option.valueType)}
${renderRegisterFuncWithInit(
  option.structName,
  option.realType,
  option.defaultValue!
)}

${renderSingleSetFunc(
  option.structName,
  option.valueType
)}${renderSingleSetAttrsFunc(option.structName, option.valueType)}

${renderSingleGetAllFunc(
  option.structName,
  option.valueType
)}${renderSingleGetAttrsFunc(option.structName, option.valueType)}
}
`;
}

function renderSchema(option: RenderSchemaOptions) {
  return `module ${option.projectName}::${option.schemaName}_schema {
${
  option.needImportString ? "\tuse std::ascii::String;\n\t" : "\t"
}use std::option::some;
    use sui::tx_context::TxContext;
    use sui::table::{Self, Table};
    use ${option.projectName}::events;
    use ${option.projectName}::world::{Self, World, AdminCap};

    // Systems
${getFriendSystem(option.projectName, option.systems)}

\t/// Entity does not exist
\tconst EEntityDoesNotExist: u64 = 0;

\tconst SCHEMA_ID: vector<u8> = b"${option.schemaName}";
\tconst SCHEMA_TYPE: u8 = 0;

${renderKeyName(option.valueType)}
${renderStruct(option.structName, option.valueType)}
${renderNewStructFunc(option.structName, option.valueType)}
${renderRegisterFunc(option.structName)}

${renderSetFunc(option.structName, option.valueType)}${renderSetAttrsFunc(
    option.structName,
    option.valueType
  )}
${renderGetAllFunc(option.structName, option.valueType)}${renderGetAttrsFunc(
    option.structName,
    option.valueType
  )}
${renderRemoveFunc(option.structName)}
${renderContainFunc(option.structName)}
}
`;
}
