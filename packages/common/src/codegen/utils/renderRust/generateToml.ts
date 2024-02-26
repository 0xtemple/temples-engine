import { writeToml} from "../formatAndWrite";

export function generateMetaDataToml(name: string, path: string) {
  let code =
`[package]
name = "${name}-metadata"
version = "0.1.0"
edition = "2021"

# See more keys and their definitions at https://doc.rust-lang.org/cargo/reference/manifest.html

[dependencies]
engine-systems = { path = "../systems" }
engine-schema = { path = "../schema" }
gstd = { git = "https://github.com/gear-tech/gear.git", tag = "v1.1.1", features = ["debug"] }
gmeta = { git = "https://github.com/gear-tech/gear", tag = "v1.1.1" }
`;
  writeToml(
    code,
    `${path}/contracts/metadata/Cargo.toml`,
    "writeToml"
  );
}
