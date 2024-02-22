use gstd::ActorId;
use gstd::collections::HashMap;
use gstd::prelude::*;
use crate::storage::{SchemaType, TEMPLE_STORAGE};

pub fn get_schema_id() -> ActorId {
    crate::storage::get_schema_id(SchemaType::Onchain, String::from("Level"))
}

pub fn get_keys() -> Vec<String> {
    vec![String::from("u128")]
}

pub fn get_key_names() -> Vec<String> {
    vec![String::from("key")]
}

pub fn get_values() -> Vec<String> {
    vec![String::from("u128")]
}

pub fn get_value_names() -> Vec<String> {
    vec![String::from("value")]
}

pub fn register() -> (ActorId, Vec<u8>) {
    let temple_schema = unsafe { TEMPLE_STORAGE.get_or_insert(Default::default()) };
    temple_schema.set_schema_metadata(
        get_schema_id(),
        get_keys(),
        get_key_names(),
        get_values(),
        get_value_names(),
    )
}

pub fn get(key: u128) -> u128 {
    let temple_schema = unsafe { TEMPLE_STORAGE.get_or_insert(Default::default()) };
    let temple_key_tuple = (key).encode();
    let temple_raw_value = temple_schema.get(get_schema_id(), temple_key_tuple);
    let (value): (u128) = Decode::decode(&mut &temple_raw_value[..]).unwrap_or(Default::default());
    value
}

pub fn set(key: u128, value: u128) {
    let temple_schema = unsafe { TEMPLE_STORAGE.get_or_insert(Default::default()) };
    let temple_key_tuple = (key).encode();
    let temple_raw_value = (value).encode();
    temple_schema.set(get_schema_id(), temple_key_tuple, temple_raw_value);
}
