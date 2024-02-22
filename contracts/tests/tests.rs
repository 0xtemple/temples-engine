use gstd::{ActorId, Encode, Decode};
use gtest::System;
use engine_schema::*;
use engine_schema::counter::Counter;
use engine_schema::storage::SchemaType;
use log::debug;

const USERS: &[u64] = &[3, 4, 5];
const ZERO_ID: u64 = 0;

#[test]
fn mint_success() {
    let schema_id1 = engine_schema::storage::get_schema_id(SchemaType::Onchain, String::from("Counter"));
    println!("{:?}", schema_id1);
    println!("{:?}", schema_id1.encode());

    let schema_type = engine_schema::storage::get_schema_type(schema_id1);
    println!("{:?}", schema_type.encode());

    println!("{:?}", Counter { value: 1 }.encode());
    println!("{:?}", (1u128, vec![1u128, 3]).encode());
    println!("{:?}", (1u128, String::from("Hello")).encode());
    let c = vec![1u8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20, 72, 101, 108, 108, 111];
    let (s, t): (u128, String) = Decode::decode(&mut &c[..]).unwrap();
    println!("{:?}", s);
    println!("{:?}", t);
}