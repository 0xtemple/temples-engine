import type { CommandModule } from "yargs";
import { GearApi, GearKeyring } from "@gear-js/api";
import { ApiPromise, WsProvider } from "@polkadot/api";

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
    console.log(network, recipient);
    let address = "";
    if (recipient === undefined) {
      const mnemonic = process.env.MNEMONIC;
      if (!mnemonic)
        throw new Error(
          `Missing PRIVATE_KEY environment variable.
    Run 'echo "PRIVATE_KEY=YOUR_PRIVATE_KEY" > .env'
    in your contracts directory to use the default sui private key.`
        );
      const keyring = await GearKeyring.fromMnemonic(mnemonic, "Developer");
      address = keyring.address;
    } else {
      address = recipient;
    }

    const wsProvider = new WsProvider("ws://localhost:9944");
    const gearApi = await ApiPromise.create({ provider: wsProvider });
    if (!gearApi.isConnected) {
      await gearApi.connect();
    }

    const aliceKeyring = await GearKeyring.fromSuri("//Alice");
    const result = await gearApi.tx.balances
      .transfer(address, 1000e12)
      .signAndSend(aliceKeyring);
    console.log(address);
    await gearApi.disconnect();
  },
};

export default commandModule;
