use counter_io::CounterMetadata;

fn main() {
    gear_wasm_builder::build_with_metadata::<CounterMetadata>();
}
