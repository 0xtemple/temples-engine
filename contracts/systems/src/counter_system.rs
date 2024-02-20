use crate::StateOut;
use engine_schema::counter::COUNTER;
use gstd::msg;

pub fn get_current_number() {
    let counter = unsafe { COUNTER.get_or_insert(Default::default()) };
    let number = counter.get();
    msg::reply(StateOut::CurrentCounter(number), 0).expect("Unable to share the state");
}

pub fn add() {
    let counter = unsafe { COUNTER.get_or_insert(Default::default()) };
    let number = counter.get();
    counter.set(number + 1);
}
