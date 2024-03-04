import { TempleConfig } from "../../types";
import { formatAndWriteRust } from "../formatAndWrite";
import {convertToCamelCase} from "./common";

export function generateLib(config: TempleConfig, path: string) {
  let code = `
#![no_std]

use ${config.name}_metadata::{StateQuery, StateReply, SystemAction};
use gstd::msg;

#[no_mangle]
extern fn init() {
${    Object.entries(config.schemas)
      .map(([key, _]) => `${config.name}_components::${key}::${convertToCamelCase(key)}Component.register();`)
        .join('')
}
}

#[no_mangle]
extern fn handle() {
    let action: SystemAction = msg::load().expect("Unable to load the system action");
    match action { }
}

#[no_mangle]
extern fn state() {
    let query: StateQuery = msg::load().expect("Unable to load the state query");
    match query { }
}
`;
  formatAndWriteRust(
    code,
    `${path}/contracts/src/lib.rs`,
    "formatAndWriteRust"
  );
}

export function generateSrc(config: TempleConfig, path: string) {
  generateLib(config, path);
}
