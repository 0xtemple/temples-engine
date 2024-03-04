import { formatAndWriteRust, writeToml } from "../formatAndWrite";

export function generateLib(name: string, path: string) {
  let code = `
#![no_std]

use gmeta::{In, InOut, Metadata};
use gstd::prelude::*;

pub struct WorldMetadata;

impl Metadata for WorldMetadata {
    type Init = ();
    type Handle = In<SystemAction>;
    type Others = ();
    type Reply = ();
    type Signal = ();
    type State = InOut<StateQuery, StateReply>;
}

#[derive(Encode, Decode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum StateQuery { }

#[derive(Encode, Decode, TypeInfo, Debug)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum StateReply { }

#[derive(Debug, Clone, Encode, Decode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum SystemAction { }
`;
  formatAndWriteRust(
    code,
    `${path}/contracts/metadata/src/lib.rs`,
    "formatAndWriteRust"
  );
}

export function generateMetaDataToml(name: string, path: string) {
  let code = `
[package]
name = "${name}-metadata"
version = "0.1.0"
edition = "2021"

[dependencies]
gstd = { git = "https://github.com/gear-tech/gear.git", tag = "v1.1.1", features = ["debug"] }
gmeta = { git = "https://github.com/gear-tech/gear", tag = "v1.1.1" }
`;
  writeToml(code, `${path}/contracts/metadata/Cargo.toml`, "writeToml");
}

export function generateMetadata(name: string, path: string) {
  generateLib(name, path);
  generateMetaDataToml(name, path);
}
