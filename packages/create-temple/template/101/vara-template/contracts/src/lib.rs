#![no_std]

use counter_io::{StateQuery, StateReply, SystemAction};
use gstd::{msg, prelude::*};

static mut COUNTER: Option<Counter> = None;

#[derive(Debug, Default)]
struct Counter {
    pub value: u128,
}

#[no_mangle]
extern fn handle() {
    let counter = unsafe { COUNTER.get_or_insert(Default::default()) };
    let action: SystemAction = msg::load().expect("Failed to decode `SystemAction` message.");
    match action {
        SystemAction::Add => {
            counter.value = counter.value + 1;
        }
        SystemAction::Set(_) => {

        }
    }
}

#[no_mangle]
extern fn state() {
    let counter = unsafe { COUNTER.get_or_insert(Default::default()) };
    let query: StateQuery = msg::load().expect("Unable to load the state query");
    match query {
        StateQuery::GetCurrentNumber => {
            msg::reply(StateReply::CurrentNumber(counter.value), 0)
                .expect("Unable to share the state");
        },
        StateQuery::Get(_) => {

        }
    }
}
