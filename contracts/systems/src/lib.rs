#![no_std]

use gstd::{Decode, Encode, TypeInfo};

#[derive(Debug, Decode, Encode, TypeInfo)]
#[codec(crate = gstd::codec)]
#[scale_info(crate = gstd::scale_info)]
pub enum SystemAction {
    Add,
    SetEntityLevel(u128, u128),
}

pub mod counter_system;
pub mod level_system;

