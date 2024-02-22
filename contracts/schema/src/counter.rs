use gstd::{msg, prelude::*};
use gstd::ActorId;
use crate::storage::{ SchemaType, TEMPLE_STORAGE};

#[derive(Debug, Default,  Encode, Decode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub struct Counter {
    pub value: u128,
}

pub fn get_schema_id() -> ActorId {
  crate::storage::get_schema_id(SchemaType::Onchain, String::from("Counter"))
}

pub fn get_keys() -> Vec<String> {
    vec![String::from("")]
}

pub fn get_key_names() -> Vec<String> {
    vec![String::from("")]
}

pub fn get_values() -> Vec<String> {
    vec![String::from("u128")]
}

pub fn get_value_names() -> Vec<String> {
    vec![String::from("value")]
}

pub fn register() -> (ActorId,Vec<u8>) {
    let temple_schema = unsafe { TEMPLE_STORAGE.get_or_insert(Default::default()) };
    temple_schema.set_schema_metadata(
        get_schema_id(),
        get_keys(),
        get_key_names(),
        get_values(),
        get_value_names(),
    )
}

pub fn get() -> u128 {
    let temple_schema = unsafe { TEMPLE_STORAGE.get_or_insert(Default::default()) };
    let temple_key_tuple = vec![];
    let temple_raw_value = temple_schema.get(get_schema_id(), temple_key_tuple);
    let (value): (u128) = Decode::decode(&mut &temple_raw_value[..]).unwrap_or(Default::default());
    value
}

pub fn set(value: u128) {
    let temple_schema = unsafe { TEMPLE_STORAGE.get_or_insert(Default::default()) };
    let temple_key_tuple = vec![];
    let temple_raw_value = (value).encode();
    temple_schema.set(get_schema_id(), temple_key_tuple, temple_raw_value);
}
