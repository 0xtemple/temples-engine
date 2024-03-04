import { TempleConfig } from "../../types";
import { formatAndWriteRust, writeToml } from "../formatAndWrite";
import { existsSync } from "fs";

export function generateBuild(name: string, path: string) {
  let code = `
use ${name}_metadata::WorldMetadata;

fn main() {
    gear_wasm_builder::build_with_metadata::<WorldMetadata>();
}

`;
  formatAndWriteRust(code, `${path}/contracts/build.rs`, "formatAndWriteRust");
}

export function generateCargoToml(name: string, path: string) {
  let code = `
[package]
name = "${name}"
version = "0.1.0"
edition = "2021"

# See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html

[dependencies]
${name}-systems = { path = "systems" }
${name}-components = { path = "components" }
${name}-metadata = { path = "metadata" }
gstd = { git = "https://github.com/gear-tech/gear.git", tag = "v1.1.1", features = ["debug"] }
gmeta = { git = "https://github.com/gear-tech/gear", tag = "v1.1.1" }
temple-storage = { path = "../../../../temples/crates/storage" }
temple-types = { path = "../../../../temples/crates/types" }
scale-info = { version = "2", default-features = false }

[build-dependencies]
gear-wasm-builder = { git = "https://github.com/gear-tech/gear.git", tag = "v1.1.1" }
${name}-metadata = { path = "metadata" }

[dev-dependencies]
gtest = { git = "https://github.com/gear-tech/gear.git", tag = "v1.1.1" }
`;
  writeToml(code, `${path}/contracts/Cargo.toml`, "formatAndWriteRust");
}

export function generateToolchainToml(name: string, path: string) {
  let code = `
[toolchain]
channel = "nightly-2023-09-18"
targets = ["wasm32-unknown-unknown"]
profile = "minimal"
components = ["rustfmt", "clippy"]
`;
  formatAndWriteRust(
    code,
    `${path}/contracts/rust-toolchain.toml`,
    "formatAndWriteRust"
  );
}

export function generateRustfmtToml(name: string, path: string) {
  let code = `
use_field_init_shorthand = true
newline_style = "Unix"
force_explicit_abi = false
`;
  formatAndWriteRust(
    code,
    `${path}/contracts/rustfmt.toml`,
    "formatAndWriteRust"
  );
}

export function generateOther(name: string, path: string) {
  generateBuild(name, path);
  generateCargoToml(name, path);
  generateToolchainToml(name, path);
  generateRustfmtToml(name, path);
}
