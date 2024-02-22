use engine_schema::*;

pub fn add() {
    let number = counter::get();
    counter::set(number + 1);
}
