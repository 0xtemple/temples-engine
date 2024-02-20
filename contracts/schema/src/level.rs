use gstd::collections::HashMap;
use gstd::prelude::*;

#[derive(Debug, Clone, Default, Encode, Decode, PartialEq)]
#[codec(crate = gstd::codec)]
pub struct Level {
    pub value: u128,
}

#[derive(Debug, Default)]
pub struct LevelSchema {
    // keys: Vec<String>,
    // types: Vec<String>,
    entity_to_value: HashMap<u128, Level>,
}

impl LevelSchema {
    pub fn get_schema(&self) -> (Vec<String>, Vec<String>) {
        (vec![String::from("value")], vec![String::from("u128")])
        // (LEVEL::get_field_names(), LEVEL::get_field_types())
    }

    pub fn get(&self, entity: u128) -> u128 {
        let binding = Level::default();
        let value = self.entity_to_value.get(&entity).unwrap_or(&binding);
        value.value
    }

    pub fn set(&mut self, entity: u128, value: u128) {
        self.entity_to_value.insert(entity, Level { value });
    }

    pub fn remove(&mut self, entity: u128) {
        self.entity_to_value.remove(&entity);
    }

    pub fn has(&self, entity: u128) -> bool {
        self.entity_to_value.contains_key(&entity)
    }

    pub fn get_entities(&self) -> Vec<u128> {
        self.entity_to_value.keys().cloned().collect()
    }

    pub fn get_entities_with_value(&self, value: Level) -> Vec<u128> {
        let mut entities_with_value = Vec::new();

        for (entity, stored_value) in &self.entity_to_value {
            if stored_value == &value {
                entities_with_value.push(*entity);
            }
        }
        entities_with_value
    }
}

pub static mut LEVEL: Option<LevelSchema> = None;

#[test]
fn mint() {
    // let LEVEL  = LEVEL { value: 1000 };
    // // assert_eq!(vec![1,2], LEVEL.encode());
    //
    // let mut c: &[u8] = &vec![232u8, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0][..];
    // let c2: LEVEL = LEVEL::decode(&mut c).unwrap();
    // assert_eq!(c2, LEVEL);

    let c = unsafe { LEVEL.get_or_insert(Default::default()) };
    let schema = (vec![String::from("value")], vec![String::from("u128")]);
    assert_eq!(schema, c.get_schema());

    assert_eq!(c.get(0), 0);
    assert_eq!(c.has(0), false);
    c.set(0, 1000);
    assert_eq!(c.get(0), 1000);
    assert_eq!(c.has(0), true);

    assert_eq!(c.get_entities(), vec![0]);
    c.set(1, 1000);
    // assert_eq!(c.get_entities(), vec![0, 1]);

    // assert_eq!(c.get_entities_with_value(LEVEL { value: 1000 }), vec![1,0]);
}
