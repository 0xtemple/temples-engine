#![no_std]

pub mod counter;
pub mod level;

use gstd::prelude::*;
use gstd::Vec;

pub trait ISchemaMap<T> {
    fn get_schema(&self) -> (Vec<String>, Vec<String>);
    fn get(&self, entity: u128) -> Option<T>;
    // fn get_raw_value(&self, entity: u128) -> Option<Vec<u8>>;
    fn set(&mut self, entity: u128, value: T);
    // fn set_raw_value(&mut self, entity: u128, value: Vec<u8>);
    fn remove(&mut self, entity: u128);
    fn has(&self, entity: u128) -> bool;

    fn get_entities(&self) -> Vec<u128>;
    fn get_entities_with_value(&self, value: T) -> Vec<u128>;
}

pub trait ISchemaValue<T> {
    fn get_schema(&self) -> (Vec<String>, Vec<String>);
    fn get(&self) -> Option<T>;
    fn set(&mut self, value: T);
}
