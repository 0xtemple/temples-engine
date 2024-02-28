import type { CommandModule } from "yargs";
import { printTemple } from "../utils";

const commandModule: CommandModule = {
  command: "hello",

  describe: "hello, temples",

  builder(yargs) {
    return yargs;
  },

  async handler() {
    printTemple();
  },
};

export default commandModule;
