#![no_std]

pub mod counter_system;
pub mod level_system;

use gstd::{Decode, Encode, TypeInfo};

#[derive(Debug, Decode, Encode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum SystemAction {
    Add,
    SetEntityLevel(u128, u128),
}

#[derive(Debug, Encode, Decode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum SystemEvent {}

#[derive(Encode, Decode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum StateIn {
    GetLevelByEntity(u128),
    GetCurrentCounter,
}

#[derive(Encode, Decode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum StateOut {
    CurrentCounter(u128),
    LevelByEntity(u128),
}
