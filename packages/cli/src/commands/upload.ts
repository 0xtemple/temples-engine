import chalk from "chalk";
import { execSync } from "child_process";
import type { CommandModule } from "yargs";
import { logError } from "../utils/errors";
import { saveContractData } from "../utils";
import { loadConfig, TempleConfig } from "@0xtemple/common";
import {
  GearApi,
  GearKeyring,
  GearMetadata,
  ProgramMetadata,
} from "@gear-js/api";
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
        default: "localnet",
        choices: ["mainnet", "testnet", "localnet"],
        desc: "Network of the node (mainnet/testnet/localnet)",
      },
      configPath: {
        type: "string",
        default: "temple.config.ts",
        decs: "Path to the config file",
      },
    });
  },

  async handler({ network, configPath }) {
    const gearApi = await GearApi.create({
      providerAddress: "ws://localhost:9944",
    });
    if (!gearApi.isConnected) {
      await gearApi.connect();
    }
    const templeConfig = (await loadConfig(configPath)) as TempleConfig;
    console.log(templeConfig.name);
    const path = process.cwd();

    // try {
    //   const { Result: compileResult } = JSON.parse(
    //     execSync(`cargo build --manifest-path ${path}/contracts/Cargo.toml`, {
    //       encoding: "utf-8",
    //     })
    //   );
    //   console.log(compileResult);
    // } catch (error: any) {
    //   console.error(chalk.red("Error executing aptos move compile:"));
    //   console.error(error.stdout);
    //   process.exit(1); // You might want to exit with a non-zero status code to indicate an error
    // }
    const code = fs.readFileSync(
      process.cwd() +
        `/contracts/target/wasm32-unknown-unknown/release/${templeConfig.name}.wasm`
    );

    const program = {
      code,
      gasLimit: 750000000000,
    };

    const metaHex = fs.readFileSync(
      process.cwd() +
        `/contracts/target/wasm32-unknown-unknown/release/${templeConfig.name}.meta.txt`,
      "utf-8"
    );
    const meta = ProgramMetadata.from(`0x${metaHex}`);
    console.log(chalk.blue(`Saving contract info...`));
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const { programId, codeId, salt, extrinsic } = gearApi.program.upload(
      program,
      meta
    );
    const mnemonic = process.env.MNEMONIC;
    if (!mnemonic)
      throw new Error(
        `Missing PRIVATE_KEY environment variable.
    Run 'echo "PRIVATE_KEY=YOUR_PRIVATE_KEY" > .env'
    in your contracts directory to use the default sui private key.`
      );
    const keyring = await GearKeyring.fromMnemonic(mnemonic, "Developer");
    await extrinsic.signAndSend(keyring);

    console.log(chalk.blue(`Network: ${network}`));
    console.log(chalk.blue(`Contract program id: ${programId}`));
    saveContractData(templeConfig.name, network, programId, metaHex);

    await gearApi.disconnect();
  },
};

export default commandModule;
