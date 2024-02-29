import type { CommandModule } from "yargs";
import { logError } from "../utils/errors";
import { uploadHandler } from "../utils";
import { loadConfig, TempleConfig } from "@0xtemple/common";
import {
  GearApi,
  GearKeyring,
  GearMetadata,
  ProgramMetadata
} from '@gear-js/api';
import * as fs from "fs";

type Options = {
  network: any;
  configPath: string;
};

const commandModule: CommandModule<Options, Options> = {
  command: "upload",

  describe: "Upload templs rust contracts",

  builder(yargs) {
    return yargs.options({
      network: {
        type: "string",
        choices: ["mainnet", "testnet", "devnet", "localnet"],
        desc: "Network of the node (mainnet/testnet/devnet/localnet)",
      },
      configPath: {
        type: "string",
        default: "templs.config.ts",
        decs: "Path to the config file",
      },
    });
  },

  async handler({ network, configPath }) {
      const gearApi = await GearApi.create({
        providerAddress: 'ws://localhost:9944',
      });
      const templeConfig = (await loadConfig(configPath)) as TempleConfig;
      console.log(templeConfig.name)
      const code = fs.readFileSync(process.cwd()+`/contracts/target/wasm32-unknown-unknown/release/${templeConfig.name}.wasm`);

      const program = {
        code,
        gasLimit: 750000000000,
      };

      const metaHex = fs.readFileSync(process.cwd()+`/contracts/target/wasm32-unknown-unknown/release/${templeConfig.name}.meta.txt`, 'utf-8');
    const meta = ProgramMetadata.from(`0x${metaHex}`);

      const { programId, codeId, salt, extrinsic } = gearApi.program.upload(program, meta);
    const mnemonic = process.env.MNEMONIC;
    if (!mnemonic)
      throw new Error(
          `Missing PRIVATE_KEY environment variable.
    Run 'echo "PRIVATE_KEY=YOUR_PRIVATE_KEY" > .env'
    in your contracts directory to use the default sui private key.`
      );
    const keyring = await GearKeyring.fromMnemonic(mnemonic, 'Developer');
    await extrinsic.signAndSend(keyring)
    process.exit(0);
  },
};

export default commandModule;
