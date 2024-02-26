import { TempleConfig } from "../../types";
import { formatAndWriteRust } from "../formatAndWrite";
import { existsSync } from "fs";

export function generateLib(name: string, path: string) {
  let code = `
#![no_std]

mod handle;
mod init;
`;
  formatAndWriteRust(
    code,
    `${path}/contracts/src/lib.rs`,
    "formatAndWriteRust"
  );
}

export function generateHandle(name: string, path: string) {
  let code = `
use ${name}_systems::SystemAction;
use gstd::msg;

#[no_mangle]
extern fn handle() {
}
`;
  formatAndWriteRust(
    code,
    `${path}/contracts/src/handle.rs`,
    "formatAndWriteRust"
  );
}

export function generateInit(config: TempleConfig, path: string) {
  let code = `
use ${config.name}_schemas::*;
use ${config.name}_schemas::storage::SchemaEvent;
use gstd::{msg, vec};

#[no_mangle]
extern fn init() {
    msg::reply(SchemaEvent::Register(vec![
        ${Object.keys(config.schemas).map((schema) => `${schema}::register()`)}
    ]), 0).expect("Unable to share the state");
}
`;
  formatAndWriteRust(
    code,
    `${path}/contracts/src/init.rs`,
    "formatAndWriteRust"
  );
}

export function generateSrc(config: TempleConfig, path: string) {
  generateLib(config.name, path);
  generateHandle(config.name, path);
  generateInit(config, path);
}
