import { BaseType, SchemaMapType, BaseValueType, MoveType } from "../../types";
import fs from "fs";

export function deleteFolderRecursive(path: string) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach((file) => {
      const curPath = `${path}/${file}`;
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

export function capitalizeFirstLetter(input: string): string {
  return input.charAt(0).toUpperCase() + input.slice(1);
}

/**
 * Convert snake_case to camelCase
 * @param str
 */
export function convertToCamelCase(str: string): string {
  str = str.charAt(0).toUpperCase() + str.slice(1);
  let result = str.replace(/(_\w)/g, (match) => match[1].toUpperCase());
  return result;
}

/**
 *
 * @param name
 * @param values
 * @return [use name::name_schema, use name::info_schema]
 */
export function getUseSchema(
  name: string,
  values: Record<string, SchemaMapType>
): string[] {
  let schema: string[] = [];
  Object.entries(values).forEach(([key, value]) => {
    if (typeof value === "object" && value.ephemeral) {
    } else {
      schema.push(`\tuse ${name}::${key}_schema;`);
    }
  });
  return schema;
}

/**
 * @param values
 * @return [ name_schema::register(&mut _temple_world, ctx) ,info_schema::register(&mut _temple_world, ctx) ]
 */
export function getRegisterSchema(
  values: Record<string, SchemaMapType>
): string[] {
  let registers: string[] = [];
  Object.entries(values).forEach(([key, value]) => {
    if (typeof value === "object" && value.ephemeral) {
    } else {
      registers.push(
        `\t\t${key}_schema::register(&mut _temple_world, &admin_cap, ctx);`
      );
    }
  });
  return registers;
}

/**
 *
 * @param name
 * @param values
 * @return [ friend name::name_system, friend name::info_system ]
 */
export function getFriendSystem(name: string, values: string[]): string {
  return (
    values.map((key) => `\tfriend ${name}::${key};`).join("\n") +
    `\n\tfriend ${name}::deploy_hook;`
  );
}

/**
 *
 * @param values
 * @param prefixArgs
 * @return [ name, age, birth_time ]
 */
export function getStructAttrs(
  values: Record<string, string> | string,
  prefixArgs: string
): string[] {
  return typeof values === "string"
    ? [`${prefixArgs}value`]
    : Object.entries(values).map(([key, _]) => `${prefixArgs}${key}`);
}

function isAddress(str: string): boolean {
  const regex = /^0x[a-fA-F0-9]+$/;
  return regex.test(str);
}

export function getStructInitValue(
  keys: BaseType | Record<string, BaseType>,
  values: BaseValueType | Record<string, BaseValueType>
) {
  if (
    typeof values === "string" ||
    typeof values === "boolean" ||
    typeof values === "number"
  ) {
    if (keys === "string") {
      return [`string(b"${values}")`];
    }
    if (typeof values === "string") {
      if (isAddress(values)) {
        return [`@${values}`];
      }
    }
    return [`${values}`];
  } else if (Array.isArray(values)) {
    // Check the array element type
    if (values.length > 0) {
      if (
        typeof values[0] === "string" ||
        typeof values[0] === "boolean" ||
        typeof values[0] === "number"
      ) {
        if (keys === "vector<string>") {
          return [`vector[${values.map((item) => `string(b"${item}")`)}]`];
        }

        if (typeof values[0] === "string") {
          if (isAddress(values[0])) {
            return [`vector[${values.map((item) => `@${item}`)}]`];
          }
        }
        return [`vector[${values.map((item) => `${item}`)}]`];
      } else if (typeof values === "object") {
        let res = `vector[${values.map((item: any) => {
          return `vector[${item.map((data: any) => {
            return `${data}`;
          })}]`;
        })}]`;

        return [res];
      }
    } else {
      if (keys === "vector<string>") {
        return 'vector[string(b"")]';
      }
      return "vector[]";
    }
  } else if (typeof values === "object") {
    // It's an object, handle accordingly
    let res = Object.entries(values).map(([key, value]) => {
      if (
        typeof value === "string" ||
        typeof value === "boolean" ||
        typeof value === "number"
      ) {
        if (typeof keys === "string") {
          if (keys === "string") {
            return `string(b"${value}")`;
          }
        } else {
          if (keys[key] === "string") {
            return `string(b"${value}")`;
          }
        }

        if (typeof value === "string") {
          if (isAddress(value)) {
            return `@${value}`;
          }
        }
        return `${value}`;
      } else if (Array.isArray(value)) {
        // Check the array element type
        if (value.length > 0) {
          if (
            typeof value[0] === "string" ||
            typeof value[0] === "boolean" ||
            typeof value[0] === "number"
          ) {
            if (typeof keys === "string") {
              if (keys === "vector<string>") {
                return `vector[${value.map((item) => `string(b"${item}")`)}]`;
              }
            } else {
              if (keys[key] === "vector<string>") {
                return `vector[${value.map((item) => `string(b"${item}")`)}]`;
              }
            }

            if (typeof value[0] === "string") {
              if (isAddress(value[0])) {
                return `vector[${value.map((item) => `@${item}`)}]`;
              }
            }
            return `vector[${value.map((item) => `${item}`)}]`;
          } else if (typeof value === "object") {
            let res = `vector[${value.map((item: any) => {
              return `vector[${item.map((data: any) => {
                return `${data}`;
              })}]`;
            })}]`;

            return res;
          }
        } else {
          if (typeof keys !== "string") {
            if (keys[key] === "vector<string>") {
              return 'vector[string(b"")]';
            }
            return "vector[]";
          }
        }
      }
    });
    return res;
  }
  // Handle other cases or return an empty array if type not recognized
  return [];
}

/**
 *
 * @param values
 * @return ( bool , u64 , u64)
 */
// export function getStructTypes(values: SchemaMapType): string {
export function getStructTypes(
  values: MoveType | Record<string, MoveType>
): string {
  return typeof values === "string"
    ? values
    : `(${Object.entries(values).map(([_, type]) => `${type}`)})`;
}

/**
 *
 * @param values
 * @return Attributes and types of the struct. [ name: string, age: u64 ]
 */
export function getStructAttrsWithType(
  values: Record<string, string> | string,
  prefix: string
): string[] {
  return typeof values === "string"
    ? [`${prefix}value: ${values}`]
    : Object.entries(values).map(([key, type]) => `${prefix}${key}: ${type}`);
}

/**
 * @param values
 * @param prefixArgs
 * @return [ data.name, data.age ]
 */
export function getStructAttrsQuery(
  values: MoveType | Record<string, MoveType>,
  prefixArgs: string
): string[] {
  return typeof values === "string"
    ? [`${prefixArgs}_temple_data.value`]
    : Object.entries(values).map(
        ([key, _]) => `${prefixArgs}_temple_data.${key}`
      );
}

export function renderKeyName(values: Record<string, string> | string): string {
  return `\t${getStructAttrs(values, "// ").join("\n\t")}`;
}

export function renderStruct(
  structName: string,
  values: Record<string, string> | string,
  isEphemeral: boolean = false
): string {
  return `\tstruct ${structName} has copy, drop ${
    isEphemeral ? "" : ", store"
  } {
${getStructAttrsWithType(values, "\t\t").join(",\n")}
\t}\n`;
}

export function renderNewStructFunc(
  structName: string,
  values: Record<string, string> | string
): string {
  return `\tpublic fun new(${getStructAttrsWithType(values, "").join(
    ", "
  )}): ${structName} {
\t\t${structName} {
${getStructAttrs(values, "\t\t\t").join(", \n")}
\t\t}
\t}\n`;
}

export function renderRegisterFunc(structName: string): string {
  return `\tpublic fun register(_temple_world: &mut World, admin_cap: &AdminCap, ctx: &mut TxContext) {
\t\tworld::add_schema<Table<address,${structName}>>(_temple_world, SCHEMA_ID, table::new<address, ${structName}>(ctx), admin_cap);
\t}`;
}

export function renderSetFunc(
  structName: string,
  values: Record<string, string> | string
): string {
  return `\tpublic(friend) fun set(_temple_world: &mut World, _temple_entity_key: address, ${getStructAttrsWithType(
    values,
    " "
  )}) {
\t\tlet _temple_schema = world::get_mut_schema<Table<address,${structName}>>(_temple_world, SCHEMA_ID);
\t\tlet _temple_data = new(${getStructAttrs(values, " ")});
\t\tif(table::contains<address, ${structName}>(_temple_schema, _temple_entity_key)) {
\t\t\t*table::borrow_mut<address, ${structName}>(_temple_schema, _temple_entity_key) = _temple_data;
\t\t} else {
\t\t\ttable::add(_temple_schema, _temple_entity_key, _temple_data);
\t\t};
\t\tevents::emit_set(SCHEMA_ID, SCHEMA_TYPE, some(_temple_entity_key), _temple_data)
\t}
`;
}

export function renderRemoveFunc(structName: string): string {
  return `\tpublic(friend) fun remove(_temple_world: &mut World, _temple_entity_key: address) {
\t\tlet _temple_schema = world::get_mut_schema<Table<address,${structName}>>(_temple_world, SCHEMA_ID);
\t\tassert!(table::contains<address, ${structName}>(_temple_schema, _temple_entity_key), EEntityDoesNotExist);
\t\ttable::remove(_temple_schema, _temple_entity_key);
\t\tevents::emit_remove(SCHEMA_ID, _temple_entity_key)
\t}
`;
}

export function renderSetAttrsFunc(
  structName: string,
  struct: MoveType | Record<string, MoveType>
): string {
  return typeof struct === "string"
    ? ""
    : "\n" +
        Object.entries(struct)
          .map(
            ([key, type]) =>
              `\tpublic(friend) fun set_${key}(_temple_world: &mut World, _temple_entity_key: address, ${key}: ${type}) {
\t\tlet _temple_schema = world::get_mut_schema<Table<address,${structName}>>(_temple_world, SCHEMA_ID);
\t\tassert!(table::contains<address, ${structName}>(_temple_schema, _temple_entity_key), EEntityDoesNotExist);
\t\tlet _temple_data = table::borrow_mut<address, ${structName}>(_temple_schema, _temple_entity_key);
\t\t_temple_data.${key} = ${key};
\t\tevents::emit_set(SCHEMA_ID, SCHEMA_TYPE, some(_temple_entity_key), *_temple_data)
\t}
`
          )
          .join("\n");
}

export function renderGetAllFunc(
  structName: string,
  struct: MoveType | Record<string, MoveType>
): string {
  return `\tpublic fun get(_temple_world: &World, _temple_entity_key: address): ${getStructTypes(
    struct
  )} {
\t\tlet _temple_schema = world::get_schema<Table<address,${structName}>>(_temple_world, SCHEMA_ID);
\t\tassert!(table::contains<address, ${structName}>(_temple_schema, _temple_entity_key), EEntityDoesNotExist);
\t\tlet _temple_data = table::borrow<address, ${structName}>(_temple_schema, _temple_entity_key);
\t\t(
${getStructAttrsQuery(struct, "\t\t\t").join(",\n")}
\t\t)
\t}
`;
}

export function renderGetAttrsFunc(
  structName: string,
  struct: MoveType | Record<string, MoveType>
): string {
  return typeof struct === "string"
    ? ""
    : "\n" +
        Object.entries(struct)
          .map(
            ([
              key,
              type,
            ]) => `\tpublic fun get_${key}(_temple_world: &World, _temple_entity_key: address): ${type} {
\t\tlet _temple_schema = world::get_schema<Table<address,${structName}>>(_temple_world, SCHEMA_ID);
\t\tassert!(table::contains<address, ${structName}>(_temple_schema, _temple_entity_key), EEntityDoesNotExist);
\t\tlet _temple_data = table::borrow<address, ${structName}>(_temple_schema, _temple_entity_key);
\t\t_temple_data.${key}
\t}
`
          )
          .join("\n");
}

export function renderContainFunc(structName: string): string {
  return `\tpublic fun contains(_temple_world: &World, _temple_entity_key: address): bool {
\t\tlet _temple_schema = world::get_schema<Table<address,${structName}>>(_temple_world, SCHEMA_ID);
\t\ttable::contains<address, ${structName}>(_temple_schema, _temple_entity_key)
\t}`;
}

export function renderRegisterFuncWithInit(
  structName: string,
  valueType: BaseType | Record<string, BaseType>,
  defaultValue: BaseValueType | Record<string, BaseValueType>
): string {
  return `\tpublic fun register(_temple_world: &mut World, admin_cap: &AdminCap, _ctx: &mut TxContext) {
\t\tlet _temple_schema = new(${getStructInitValue(valueType, defaultValue)});
\t\tworld::add_schema<${structName}>(_temple_world, SCHEMA_ID, _temple_schema, admin_cap);
\t\tevents::emit_set(SCHEMA_ID, SCHEMA_TYPE, none(), _temple_schema);
\t}`;
}

export function renderSingleSetFunc(
  structName: string,
  values: Record<string, string> | string
): string {
  return `\tpublic(friend) fun set(_temple_world: &mut World, ${getStructAttrsWithType(
    values,
    " "
  )}) {
\t\tlet _temple_schema = world::get_mut_schema<${structName}>(_temple_world, SCHEMA_ID);
${
  typeof values === "string"
    ? `\t\t_temple_schema.value = value;`
    : Object.entries(values)
        .map(([key, _]) => `\t\t_temple_schema.${key} = ${key};`)
        .join("\n")
}
\t}`;
}

export function renderSingleSetAttrsFunc(
  structName: string,
  struct: MoveType | Record<string, MoveType>
): string {
  return typeof struct === "string"
    ? ""
    : "\n" +
        Object.entries(struct)
          .map(
            ([key, type]) => `
\tpublic(friend) fun set_${key}(_temple_world: &mut World, ${key}: ${type}) {
\t\tlet _temple_schema = world::get_mut_schema<${structName}>(_temple_world, SCHEMA_ID);
\t\t_temple_schema.${key} = ${key};
\t\tevents::emit_set(SCHEMA_ID, SCHEMA_TYPE, none(), *_temple_schema)
\t}`
          )
          .join("\n");
}

export function renderSingleGetAllFunc(
  structName: string,
  values: MoveType | Record<string, MoveType>
): string {
  return `\tpublic fun get(_temple_world: &World): ${getStructTypes(values)} {
\t\tlet _temple_schema = world::get_schema<${structName}>(_temple_world, SCHEMA_ID);
\t\t(
${
  typeof values === "string"
    ? `\t\t\t_temple_schema.value`
    : Object.entries(values)
        .map(([key, _]) => `\t\t\t_temple_schema.${key},`)
        .join("\n")
}
\t\t)
\t}`;
}

export function renderSingleGetAttrsFunc(
  structName: string,
  struct: MoveType | Record<string, MoveType>
): string {
  return typeof struct === "string"
    ? ""
    : "\n" +
        Object.entries(struct)
          .map(
            ([key, type]) => `
\tpublic fun get_${key}(_temple_world: &World): ${type} {
\t\tlet _temple_schema = world::get_schema<${structName}>(_temple_world, SCHEMA_ID);
\t\t_temple_schema.${key}
\t}`
          )
          .join("\n");
}
