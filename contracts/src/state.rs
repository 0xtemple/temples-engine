use engine_systems::StateIn;
use gstd::msg;

#[no_mangle]
extern fn state() {
    let query: StateIn = msg::load().expect("Unable to load the state query");
    match query {
        StateIn::GetCurrentCounter => {
            engine_systems::counter_system::get_current_number();
        }
        StateIn::GetLevelByEntity(entity) => {
            engine_systems::level_system::get_level_by_entity(entity)
        }
    }
}
