import { _decorator, Component, find, LabelComponent, sys } from "cc";
import { templeConfig } from "./temples.config";
import { NETWORK, PACKAGE_ID, WORLD_ID } from "./chain/config";

const { ccclass, property } = _decorator;

@ccclass("sui")
export class sui extends Component {
  async start() {
    this.sui_account_create();
  }

  async sui_account_create() {
    // @ts-ignore
    const temple_sdk = window.temples;
    const decode = JSON.parse(sys.localStorage.getItem("userWalletData"));
    if (decode == null) {
      const keypair = new temple_sdk.Ed25519Keypair();
      const wallet = keypair.export();
      const code = JSON.stringify(wallet);
      sys.localStorage.setItem("userWalletData", code);
      const metadata = await temple_sdk.loadMetadata(NETWORK, PACKAGE_ID);
      const temples = new temple_sdk.Temples({
        networkType: NETWORK,
        packageId: PACKAGE_ID,
        metadata: metadata,
      });
      const address = keypair.getPublicKey().toSuiAddress();
      await temples.requestFaucet(address, NETWORK);
      const component_name = Object.keys(templeConfig.schemas)[0];
      const component_value = await temples.getEntity(WORLD_ID, component_name);
      console.log(component_value);
    } else {
      const metadata = await temple_sdk.loadMetadata(NETWORK, PACKAGE_ID);
      const temples = new temple_sdk.Temples({
        networkType: NETWORK,
        packageId: PACKAGE_ID,
        metadata: metadata,
      });
      const component_name = Object.keys(templeConfig.schemas)[0];
      const component_value = await temples.getEntity(WORLD_ID, component_name);
      const counter_node = find("Canvas/Camera/counter");
      const label = counter_node.getComponent("cc.Label") as LabelComponent;
      label.string = `Counter: ${component_value}`;
    }
  }

  async export_wallet() {
    // @ts-ignore
    const temple_sdk = window.temples;
    const fromB64 = temple_sdk.fromB64;
    const decode = JSON.parse(sys.localStorage.getItem("userWalletData"));
    const decode_private_key = decode.privateKey;
    const base_64_privkey = fromB64(decode_private_key);
    const keypair = temple_sdk.Ed25519Keypair.fromSecretKey(base_64_privkey, {
      skipValidation: false,
    });
    const address = keypair.getPublicKey().toSuiAddress();
    console.log(address);
    const hex_privkey = Array.prototype.map
      .call(base_64_privkey, (x) => ("00" + x.toString(16)).slice(-2))
      .join("");
    return hex_privkey;
  }

  async gameStart() {
    // @ts-ignore
    const temple_sdk = window.temples;
    const metadata = await temple_sdk.loadMetadata(NETWORK, PACKAGE_ID);
    console.log(metadata);

    const privateKey = await this.export_wallet();
    // new temples class
    const temples = new temple_sdk.Temples({
      networkType: NETWORK,
      packageId: PACKAGE_ID,
      metadata: metadata,
      secretKey: privateKey,
    });

    const tx = new temple_sdk.TransactionBlock();
    const world = tx.pure(WORLD_ID);

    const params = [world];

    const result = await temples.tx.counter_system.inc(tx, params);
    console.log(result);
    setTimeout(async () => {
      const metadata = await temple_sdk.loadMetadata(NETWORK, PACKAGE_ID);
      const temples = new temple_sdk.Temples({
        networkType: NETWORK,
        packageId: PACKAGE_ID,
        metadata: metadata,
      });
      const component_name = Object.keys(templeConfig.schemas)[0];
      const component_value = await temples.getEntity(WORLD_ID, component_name);
      const counter_node = find("Canvas/Camera/counter");
      const label = counter_node.getComponent("cc.Label") as LabelComponent;
      label.string = `Counter: ${component_value}`;
    }, 100);
  }

  update(deltaTime: number) {}
}
