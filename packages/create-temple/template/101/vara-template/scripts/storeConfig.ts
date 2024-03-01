import * as fsAsync from 'fs/promises';
import { mkdirSync, writeFileSync } from 'fs';
import { exit } from 'process';
import { templeConfig } from '../temple.config';
import { dirname } from 'path';

type DeploymentJsonType = {
  projectName: string;
  network: 'mainnet' | 'testnet' | 'local';
  programId: string;
  metadata: string;
};

async function getDeploymentJson(projectPath: string, network: string) {
  try {
    const data = await fsAsync.readFile(`contracts/.history/vara_localnet/latest.json`, 'utf8');
    return JSON.parse(data) as DeploymentJsonType;
  } catch {
    console.log('store config failed.');
    exit;
  }
}

function storeConfig(network: string, packageId: string, metadata: string) {
  let code = `import { Network } from '@0xtemple/client';

const NETWORK: Network = Network.${'local'.toUpperCase()};

const PACKAGE_ID = '${packageId}'

const METADATA = '${metadata}'

export {
    NETWORK,
    PACKAGE_ID,
    METADATA
}
`;
  const path = process.cwd();
  writeOutput(code, `${path}/src/chain/config.ts`, 'storeConfig');
}

async function writeOutput(output: string, fullOutputPath: string, logPrefix?: string): Promise<void> {
  mkdirSync(dirname(fullOutputPath), { recursive: true });

  writeFileSync(fullOutputPath, output);
  if (logPrefix !== undefined) {
    console.log(`${logPrefix}: ${fullOutputPath}`);
  }
}

async function main() {
  const path = process.cwd();
  const network = process.argv[2];
  const contractPath = `${path}/contracts/${templeConfig.name}`;
  const deployment = await getDeploymentJson(contractPath, network);
  console.log(deployment);
  storeConfig(deployment.network, deployment.programId, deployment.metadata);
}

main();
