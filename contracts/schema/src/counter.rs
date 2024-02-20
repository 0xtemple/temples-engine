use gstd::{msg, prelude::*};

#[derive(Debug, Clone, Default, Encode, Decode, PartialEq)]
#[codec(crate = gstd::codec)]
pub struct Counter {
    pub value: u128,
}

impl Counter {
    pub fn get_schema(&self) -> (Vec<String>, Vec<String>) {
        (vec![String::from("value")], vec![String::from("u128")])
    }

    pub fn get(&self) -> u128 {
        self.value
    }

    pub fn set(&mut self, value: u128) {
        self.value = value;
        msg::reply(value, 0).expect("Failed to encode or reply with `NftEvent`.");
    }
}

pub static mut COUNTER: Option<Counter> = None;

#[test]
fn mint() {
    let c = unsafe { COUNTER.get_or_insert(Default::default()) };
    let schema = (vec![String::from("value")], vec![String::from("u128")]);
    assert_eq!(schema, c.get_schema());

    assert_eq!(c.get(), Some(Counter { value: 0 }));
    c.set(Counter { value: 1000 });
    assert_eq!(c.get(), Some(Counter { value: 1000 }));
}
