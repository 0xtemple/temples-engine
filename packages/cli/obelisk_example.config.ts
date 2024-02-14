import { ObeliskConfig } from "@0xtempl/common";

export const obeliskConfig = {
  name: "examples",
  description: "examples",
  systems: ["example_system"],
  schemas: {
    single_column: "u64",
    multi_column: {
      valueType: {
        state: "vector<u8>",
        last_update_time: "u64",
      },
    },
    ephemeral: {
      ephemeral: true,
      valueType: "u64",
    },
    single_value: {
      valueType: "u64",
      defaultValue: 1000,
    },
    single_struct: {
      valueType: {
        admin: "address",
        fee: "u64",
      },
      defaultValue: {
        admin: "@0x1",
        fee: 100,
      },
    },
  },
} as ObeliskConfig;
