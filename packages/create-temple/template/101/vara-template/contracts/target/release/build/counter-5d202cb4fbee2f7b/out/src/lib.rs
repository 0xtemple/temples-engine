#![no_std] pub use orig_project::*;

#[allow(improper_ctypes)]
mod fake_gsys {
    extern "C" {
        pub fn gr_reply(
            payload: *const u8,
            len: u32,
            value: *const u128,
            err_mid: *mut [u8; 36],
        );
    }
}

#[no_mangle]
extern "C" fn metahash() {
    const METAHASH: [u8; 32] = [209, 39, 189, 16, 44, 178, 244, 127, 131, 197, 118, 236, 175, 7, 243, 66, 104, 12, 206, 130, 37, 187, 193, 143, 174, 37, 32, 195, 138, 150, 217, 175];
    let mut res: [u8; 36] = [0; 36];
    unsafe {
        fake_gsys::gr_reply(
            METAHASH.as_ptr(),
            METAHASH.len() as _,
            u32::MAX as _,
            &mut res as _,
        );
    }
}
