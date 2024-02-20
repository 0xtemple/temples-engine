use engine_systems::SystemAction;
use gstd::msg;

#[no_mangle]
extern fn handle() {
    let action: SystemAction = msg::load().expect("Could not load Action");
    match action {
        SystemAction::Add => engine_systems::counter_system::add(),
        SystemAction::SetEntityLevel(entity, value) => {
            engine_systems::level_system::set_level(entity, value)
        }
    }
}
