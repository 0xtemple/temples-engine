import type { CommandModule } from "yargs";
import { printObelisk } from "../utils";

const commandModule: CommandModule = {
  command: "hello",

  describe: "hello, temples",

  builder(yargs) {
    return yargs;
  },

  async handler() {
    printObelisk();
  },
};

export default commandModule;
