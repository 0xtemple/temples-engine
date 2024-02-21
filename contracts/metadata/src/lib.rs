#![no_std]

use engine_systems::StateOut;
use engine_systems::SystemAction;
use engine_systems::{StateIn, SystemEvent};
use gmeta::{InOut, Metadata};

pub struct WorldMetadata;

impl Metadata for WorldMetadata {
    type Init = ();
    type Handle = InOut<SystemAction, SystemEvent>;
    type Others = ();
    type Reply = ();
    type Signal = ();
    type State = InOut<StateIn, StateOut>;
}
