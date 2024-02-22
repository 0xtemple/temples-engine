#![no_std]

use engine_systems::SystemAction;
use engine_schema::storage::{SchemaEvent};
use gmeta::{InOut, Metadata, Out};

pub struct WorldMetadata;

impl Metadata for WorldMetadata {
    type Init = Out<SchemaEvent>;
    type Handle = InOut<SystemAction, SchemaEvent>;
    type Others = ();
    type Reply = ();
    type Signal = ();
    type State = ();
}
