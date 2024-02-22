import { ObeliskConfig } from "../../types";
import {formatAndWriteRust, writeToml} from "../formatAndWrite";
import { existsSync } from "fs";

export function generateLib(name: string, path: string) {
    let code = `
#![no_std]

use ${name}_systems::SystemAction;
use ${name}_schemas::storage::{SchemaEvent};
use gmeta::{InOut, Metadata, Out};

pub struct WorldMetadata;

impl Metadata for WorldMetadata {
    type Init = Out<SchemaEvent>;
    type Handle = InOut<SystemAction, SchemaEvent>;
    type Others = ();
    type Reply = ();
    type Signal = ();
    type State = ();
}
`;
    formatAndWriteRust(
      code,
      `${path}/contracts/metadata/src/lib.rs`,
      "formatAndWriteRust"
    );
}

export function generateMetaDataToml(name: string, path: string) {
    let code =
        `
[package]
name = "${name}-metadata"
version = "0.1.0"
edition = "2021"

# See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html

[dependencies]
${name}-systems = { path = "../systems" }
${name}-schemas = { path = "../schemas" }
gstd = { git = "https://github.com/gear-tech/gear.git", tag = "v1.1.1", features = ["debug"] }
gmeta = { git = "https://github.com/gear-tech/gear", tag = "v1.1.1" }
`;
    writeToml(
        code,
        `${path}/contracts/metadata/Cargo.toml`,
        "writeToml"
    );
}

export function generateMetadata(name: string, path: string) {
    generateLib(name, path)
    generateMetaDataToml(name, path)
}