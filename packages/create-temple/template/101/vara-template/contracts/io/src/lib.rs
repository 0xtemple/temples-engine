#![no_std]

use gmeta::{In, InOut, Metadata};
use gstd::prelude::*;

pub struct CounterMetadata;

impl Metadata for CounterMetadata {
    type Init = ();
    type Handle = In<SystemAction>;
    type Others = ();
    type Reply = ();
    type Signal = ();
    type State = InOut<StateQuery, StateReply>;
}

#[derive(Encode, Decode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum StateQuery {
    GetCurrentNumber,
}

#[derive(Encode, Decode, TypeInfo, Debug)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum StateReply {
    CurrentNumber(u128),
}

#[derive(Debug, Clone, Encode, Decode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum SystemAction {
    Add,
}
