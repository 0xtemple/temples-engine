use engine_metadata::WorldMetadata;

fn main() {
    gear_wasm_builder::build_with_metadata::<WorldMetadata>();
}
