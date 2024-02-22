use gstd::collections::HashMap;
use gstd::prelude::*;
use gstd::{ActorId, msg};
use parity_scale_codec::{Decode, Encode};

type SchemaId = ActorId;
type Keys = Vec<String>;
type KeyNames = Vec<String>;
type Types = Vec<String>;
type TypeNames = Vec<String>;

#[derive(Debug, Default, Encode, Decode)]
pub struct SchemaInfo {
    keys: Keys,
    key_names: KeyNames,
    types: Types,
    type_names: TypeNames,
}

#[derive(Debug, Encode, Decode, TypeInfo)]
pub enum SchemaEvent {
    SetRecord(SchemaId, Vec<u8>, Vec<u8>),
    DeleteRecord(SchemaId, Vec<u8>),
    Register(Vec<(SchemaId, Vec<u8>)>)
}

#[derive(Debug, Encode, Decode)]
pub enum SchemaType {
    Onchain,
    Offchain,
}

#[derive(Debug, Default)]
pub struct Schema {
    table: HashMap<ActorId, HashMap<Vec<u8>, Vec<u8>>>,
}

pub fn get_schema_id(schema_type: SchemaType, schema_name: String) -> ActorId {
    let mut bytes = Vec::new();

    match schema_type {
        SchemaType::Onchain => bytes.extend(&vec![0,0]),
        SchemaType::Offchain => bytes.extend(&vec![1,0])
    }
    let mut schema_name_bytes = schema_name.into_bytes();
    schema_name_bytes.resize(30, 0);
    bytes.extend(&schema_name_bytes);
    let bytes:[u8;32] = bytes.try_into().expect("Failed");
    ActorId::from(bytes)
}

pub fn get_schema_type(schema_id: ActorId) -> SchemaType {
    if let [0, 0, ..] = schema_id.encode().as_slice() {
        SchemaType::Onchain
    } else if let [1, 0, ..] = schema_id.encode().as_slice() {
        SchemaType::Offchain
    } else {
        panic!("Invalid schema_id")
    }
}

impl Schema {
    pub fn set_schema_metadata(&mut self, schema_id: ActorId,  keys: Keys, key_names: KeyNames, types: Types, type_names: TypeNames) -> (ActorId, Vec<u8>) {
        let schema_info = SchemaInfo {
            keys,
            key_names,
            types,
            type_names,
        };
        let key_tuple = schema_id.encode();
        let data = schema_info.encode();
        let mut hash_map: HashMap<Vec<u8>, Vec<u8>> = HashMap::new();
        hash_map.insert(key_tuple.clone(), data.clone());
        self.table.insert(schema_id, hash_map);
        (schema_id, data)
    }

    pub fn get_schema_metadata(&mut self, schema_id: ActorId) -> SchemaInfo {
        let table = self.table.get(&schema_id).expect("Failed");
        let data = table.get(&schema_id.encode()).expect("Failed");
        SchemaInfo::decode(&mut &data[..]).expect("Failed")
    }

    pub fn get(&self, schema_id: ActorId, key_tuple: Vec<u8>) -> Vec<u8> {
        let table = self.table.get(&schema_id).expect("Failed");
        table.get(&key_tuple).unwrap_or(&Vec::new()).clone()
    }

    pub fn set(&mut self, schema_id: ActorId, key_tuple: Vec<u8>, data: Vec<u8>) {
        let table = self.table.entry(schema_id).or_insert_with(|| panic!("Failed"));
        table.insert(key_tuple.clone(), data.clone());
        msg::reply(SchemaEvent::SetRecord(schema_id, key_tuple, data), 0).expect("Unable to share the state");
    }

    pub fn delete(&mut self, schema_id: ActorId, key_tuple: Vec<u8>, data: Vec<u8>) {
        let table = self.table.entry(schema_id).or_insert_with(|| panic!("Failed"));
        table.remove(&key_tuple);
        msg::reply(SchemaEvent::DeleteRecord(schema_id, key_tuple), 0).expect("Unable to share the state");
    }
}

pub static mut TEMPLE_STORAGE: Option<Schema> = None;