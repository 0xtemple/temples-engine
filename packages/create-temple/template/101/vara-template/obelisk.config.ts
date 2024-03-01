import { TempleConfig } from '@0xtemple/common';

export const templeConfig = {
  name: 'counter',
  description: 'counter',
  systems: ['counter_system'],
  schemas: {
    counter: {
      valueType: 'u64',
      defaultValue: 0,
    },
  },
} as TempleConfig;
