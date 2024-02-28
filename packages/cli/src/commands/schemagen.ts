import type { CommandModule } from "yargs";
import { worldgen, loadConfig, TempleConfig } from "@0xtemple/common";
import chalk from "chalk";

type Options = {
  configPath?: string;
};

const commandModule: CommandModule<Options, Options> = {
  command: "schemagen <configPath>",

  describe: "Autogenerate Temples schemas based on the config file",

  builder(yargs) {
    return yargs.options({
      configPath: { type: "string", desc: "Path to the config file" },
    });
  },

  async handler({ configPath }) {
    try {
      const templeConfig = (await loadConfig(configPath)) as TempleConfig;
      worldgen(templeConfig);
      process.exit(0);
    } catch (error: any) {
      console.log(chalk.red("Schemagen failed!"));
      console.error(error.message);
    }
  },
};

export default commandModule;
