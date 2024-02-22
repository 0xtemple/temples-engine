export type DeploymentJsonType = {
  projectName: string;
  network: "mainnet" | "testnet" | "devnet" | "localnet";
  packageId: string;
  worldId: string;
  upgradeCap: string;
  adminCap: string;
  version: number;
};

export function validatePrivateKey(privateKey: string): boolean | string {
  if (privateKey.startsWith("0x")) {
    const strippedPrivateKey = privateKey.slice(2);
    if (strippedPrivateKey.length === 64) {
      return strippedPrivateKey;
    } else {
      return false;
    }
  } else {
    if (privateKey.length === 64) {
      return privateKey;
    } else {
      return false;
    }
  }
}