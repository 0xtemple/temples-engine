use engine_schema::*;
use engine_schema::storage::SchemaEvent;
use gstd::{msg, vec};

#[no_mangle]
extern fn init() {
    msg::reply(SchemaEvent::Register(vec![
        counter::register(),
        level::register()
    ]), 0).expect("Unable to share the state");
}
