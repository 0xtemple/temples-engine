use gstd::collections::HashMap;
use gstd::prelude::*;

#[derive(Debug, Default)]
pub struct World {
    pub entities: Vec<u128>,
    pub entity_to_value: HashMap<u128, Vec<u8>>,
    pub systems: Vec<u128>,
    pub components: Vec<u128>,
    pub desc: String,
    pub name: String,
}
