import type { CommandModule } from "yargs";
import { execa } from "execa";

const commandModule: CommandModule = {
  command: "localnode",

  describe: "Start a local gear node for development",

  builder(yargs) {
    return yargs;
  },

  async handler() {
    console.log(`Startting: gear node`);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    console.log(`Running: gear node`);
    const child = execa("gear", ["--dev"]);

    process.on("SIGINT", () => {
      console.log("\ngracefully shutting down from SIGINT (Crtl-C)");
      child.kill();
      process.exit();
    });
    await child;
  },
};

export default commandModule;
