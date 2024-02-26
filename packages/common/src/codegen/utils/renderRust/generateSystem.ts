import { TempleConfig } from "../../types";
import { formatAndWriteRust, writeToml } from "../formatAndWrite";
import { existsSync } from "fs";
import path from "path";

export function generateLib(name: string, path: string) {
  let code = `
#![no_std]

use gstd::{Decode, Encode, TypeInfo};

#[derive(Debug, Decode, Encode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum SystemAction {
}
`;
  formatAndWriteRust(
    code,
    `${path}/contracts/systems/src/lib.rs`,
    "formatAndWriteRust"
  );
}

export function generateToml(name: string, path: string) {
  let code = `
[package]
name = "${name}-systems"
version = "0.1.0"
edition = "2021"

# See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html

[dependencies]
${name}-schemas = { path = "../schemas" }
gstd = { git = "https://github.com/gear-tech/gear.git", tag = "v1.1.1", features = ["debug"] }
gmeta = { git = "https://github.com/gear-tech/gear", tag = "v1.1.1" }
`;
  writeToml(code, `${path}/contracts/systems/Cargo.toml`, "writeToml");
}

export function generateSystems(name: string, path: string) {
  generateLib(name, path);
  generateToml(name, path);
}
