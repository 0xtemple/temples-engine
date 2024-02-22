import { CommandModule } from "yargs";

import localnode from "./localnode";
import faucet from "./faucet";
import schemagen from "./schemagen";
import upload from "./upload";
import hello from "./hello";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Each command has different options
export const commands: CommandModule<any, any>[] = [
  upload,
  localnode,
  faucet,
  schemagen,
  hello,
];
