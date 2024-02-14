module counter::counter_system {
    use counter::world::World;
    use counter::counter_schema;

    public entry fun inc(world: &mut World){
        let value = counter_schema::get(world) + 1;
        counter_schema::set(world,value);
    }
}
