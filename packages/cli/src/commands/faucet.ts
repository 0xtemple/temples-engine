import type { CommandModule } from "yargs";

type Options = {
  network: any;
  recipient?: string;
};

const commandModule: CommandModule<Options, Options> = {
  command: "faucet",

  describe: "Interact with a Templs faucet",

  builder(yargs) {
    return yargs.options({
      network: {
        type: "string",
        desc: "URL of the Templs faucet",
        choices: ["testnet", "localnet"],
        default: "localnet",
      },
      recipient: {
        type: "string",
        desc: "Vara address to fund",
      },
    });
  },

  async handler({ network, recipient }) {
    console.log(network, recipient)
  }
};

export default commandModule;
