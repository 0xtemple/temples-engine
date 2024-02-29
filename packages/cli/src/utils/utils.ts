import chalk from "chalk";
import { mkdirSync, writeFileSync } from "fs";
import { dirname } from "path";

export async function writeOutput(
  output: string,
  fullOutputPath: string,
  logPrefix?: string
): Promise<void> {
  mkdirSync(dirname(fullOutputPath), { recursive: true });

  writeFileSync(fullOutputPath, output);
  if (logPrefix !== undefined) {
    console.log(`${logPrefix}: ${fullOutputPath}`);
  }
}

export type DeploymentJsonType = {
  projectName: string;
  network: "mainnet" | "testnet" | "localnet";
  programId: string;
  metadata: string;
};

export function saveContractData(
  projectName: string,
  network: "mainnet" | "testnet" | "localnet",
  programId: string,
  metadata: string
) {
  const DeploymentData: DeploymentJsonType = {
    projectName,
    network,
    programId,
    metadata,
  };

  const path = process.cwd();
  const storeDeploymentData = JSON.stringify(DeploymentData, null, 2);
  writeOutput(
    storeDeploymentData,
    `${path}/contracts/.history/vara_${network}/latest.json`,
    "Update deploy log"
  );
}

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
