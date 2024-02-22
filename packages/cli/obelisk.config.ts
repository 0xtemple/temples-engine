import { ObeliskConfig } from "@0xtempl/common";

export const obeliskConfig = {
  name: "examples",
  schemas: {
    test1: {
      keyType: {},
      valueType: {
        state: "Vec<u8>",
        last_update_time: "u64",
      },
    },
    test2: {
      keyType: {
        key: "u128"
      },
      valueType: {
        state: "Vec<u8>",
        last_update_time: "u64",
      },
    },
    // multi_column: {
    //   valueType: {
    //     state: "Vec<u8>",
    //     last_update_time: "u64",
    //   },
    // },
    // ephemeral: {
    //   ephemeral: true,
    //   valueType: "u64",
    // },
    // single_value: {
    //   valueType: "u64",
    //   defaultValue: 1000,
    // },
  },
} as ObeliskConfig;