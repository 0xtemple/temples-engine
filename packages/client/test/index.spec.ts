import * as dotenv from 'dotenv';
import { describe, it, expect } from 'vitest';
import { Templs } from '../src/index';
import { NetworkType } from '../src/index';

dotenv.config();

const NETWORK: NetworkType = 'testnet';
