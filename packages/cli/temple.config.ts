import { TempleConfig } from "@0xtemple/common";

export const templeConfig = {
  name: "counter",
  schemas: {
    counter: {
      keyType: {},
      valueType: {
        value: "u64",
      },
    },
  },
} as TempleConfig;
