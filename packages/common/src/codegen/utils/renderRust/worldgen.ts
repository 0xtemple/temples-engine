import { SchemaMapType, TempleConfig } from "../../types";
import { rmdirSync, existsSync } from "fs";
import { deleteFolderRecursive } from "./common";
import { generateSystem, generateSystems } from "./generateSystem";
import { generateMetaDataToml, generateSchemaToml } from "./generateToml";
import { generateEntityKey } from "./generateEntityKey";
import { generateInit } from "./generateInit";
import { generateEps } from "./generateEps";
import { generateSchema, generateSchemas } from "./generateSchema";
import { generateScript } from "./generateScript";
import { generateMetadata } from "./generateMetadata";
import { generateSrc } from "./generateSrc";
import { generateOther } from "./generateOther";

export function worldgen(config: TempleConfig, srcPrefix?: string) {
  let path = "";
  if (srcPrefix === undefined) {
    path = process.cwd();
  } else {
    path = srcPrefix;
  }

  console.log(config);
  console.log(path);

  generateMetadata(config.name, path);
  generateSchema(config, path);
  generateSystems(config.name, path);
  generateOther(config.name, path);


  // if (existsSync(`${path}/contracts/${config.name}`)) {
  //   deleteFolderRecursive(`${path}/contracts/${config.name}/sources/codegen`);
  // } else {
  //   generateToml(config, path);
  //   generateEntityKey(config, path);
  // }
  //
  // generateSystem(config, path);
  // generateScript(config, path);

  // generate codegen
  // generateSchema(config, path);
  // generateEps(config.name, path);
  // generateInit(config, path);
}
