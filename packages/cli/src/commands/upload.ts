import type { CommandModule } from "yargs";
import { logError } from "../utils/errors";
import { uploadHandler } from "../utils";
import { loadConfig, TempleConfig } from "@0xtemple/common";

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
    try {
      const obeliskConfig = (await loadConfig(configPath)) as TempleConfig;
      await uploadHandler(obeliskConfig.name, network);
    } catch (error: any) {
      logError(error);
      process.exit(1);
    }
    process.exit(0);
  },
};

export default commandModule;
