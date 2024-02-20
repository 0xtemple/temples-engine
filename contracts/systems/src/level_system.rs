use crate::StateOut;
use engine_schema::level::LEVEL;
use gstd::msg;

pub fn set_level(entity: u128, amount: u128) {
    let level_schema = unsafe { LEVEL.get_or_insert(Default::default()) };
    level_schema.set(entity, amount);
}

pub fn get_level_by_entity(entity: u128) {
    let level_schema = unsafe { LEVEL.get_or_insert(Default::default()) };
    msg::reply(StateOut::LevelByEntity(level_schema.get(entity)), 0)
        .expect("Unable to share the state");
}
