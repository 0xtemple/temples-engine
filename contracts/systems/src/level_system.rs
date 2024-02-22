use engine_schema::*;

pub fn set_level(entity: u128, amount: u128) {
    level::set(entity, amount);
}
