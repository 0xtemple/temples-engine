import { TransactionBlock } from "@mysten/sui.js/transactions";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import {
  getFullnodeUrl,
  SuiClient,
  SuiTransactionBlockResponse,
} from "@mysten/sui.js/client";
import { execSync } from "child_process";
import chalk from "chalk";
import { ObeliskCliError } from "./errors";
import {
  updateVersionInFile,
  saveContractData,
  validatePrivateKey,
} from "./utils";

export async function publishHandler(
  name: string,
  network: "mainnet" | "testnet" | "devnet" | "localnet"
) {
  const path = process.cwd();
  const projectPath = `${path}/contracts/${name}`;

  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey)
    throw new ObeliskCliError(
      `Missing PRIVATE_KEY environment variable.
Run 'echo "PRIVATE_KEY=YOUR_PRIVATE_KEY" > .env'
in your contracts directory to use the default sui private key.`
    );

  const privateKeyFormat = validatePrivateKey(privateKey);
  if (privateKeyFormat === false) {
    throw new ObeliskCliError(`Please check your privateKey.`);
  }
  const privateKeyRaw = Buffer.from(privateKeyFormat as string, "hex");
  const keypair = Ed25519Keypair.fromSecretKey(privateKeyRaw);
  const client = new SuiClient({
    url: getFullnodeUrl(network),
  });

  // Set version 1
  await updateVersionInFile(projectPath, "1");
  let modules: any, dependencies: any;
  try {
    const { modules: extractedModules, dependencies: extractedDependencies } =
      JSON.parse(
        execSync(
          `sui move build --dump-bytecode-as-base64 --path ${projectPath}`,
          {
            encoding: "utf-8",
          }
        )
      );
    modules = extractedModules;
    dependencies = extractedDependencies;
  } catch (error: any) {
    console.error(chalk.red("Error executing sui move build:"));
    console.error(error.stdout);
    process.exit(1); // You might want to exit with a non-zero status code to indicate an error
  }

  console.log(chalk.blue(`Account: ${keypair.toSuiAddress()}`));

  const tx = new TransactionBlock();
  const [upgradeCap] = tx.publish({
    modules,
    dependencies,
  });
  tx.transferObjects(
    [upgradeCap],
    tx.pure(keypair.getPublicKey().toSuiAddress())
  );

  let result: SuiTransactionBlockResponse;
  try {
    result = await client.signAndExecuteTransactionBlock({
      signer: keypair,
      transactionBlock: tx,
      options: {
        showObjectChanges: true,
      },
    });
  } catch (error: any) {
    console.error(chalk.red(`Failed to execute publish, please republish`));
    console.error(error.message);
    process.exit(1);
  }

  if (result.effects?.status.status === "failure") {
    console.log(chalk.red(`Failed to execute publish, please republish`));
    process.exit(1);
  }

  let version = 1;
  let packageId = "";
  let worldId = "";
  let upgradeCapId = "";
  let adminCapId = "";
  result.objectChanges!.map((object) => {
    if (object.type === "published") {
      console.log(chalk.blue(`${name} PackageId: ${object.packageId}`));
      packageId = object.packageId;
    }
    if (
      object.type === "created" &&
      object.objectType.endsWith("::world::World")
    ) {
      console.log(chalk.blue(`${name} WorldId: ${object.objectId}`));
      worldId = object.objectId;
    }
    if (
      object.type === "created" &&
      object.objectType === "0x2::package::UpgradeCap"
    ) {
      console.log(chalk.blue(`${name} UpgradeCap: ${object.objectId}`));
      upgradeCapId = object.objectId;
    }
    if (
      object.type === "created" &&
      object.objectType.endsWith("::world::AdminCap")
    ) {
      console.log(chalk.blue(`${name} AdminCapId: ${object.objectId}`));
      adminCapId = object.objectId;
    }
  });

  console.log(chalk.green(`Publish transaction digest: ${result.digest}`));

  saveContractData(
    name,
    network,
    packageId,
    worldId,
    upgradeCapId,
    adminCapId,
    version
  );

  console.log("Executing the deployHook: ");
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));
  await delay(5000);

  const deployHookTx = new TransactionBlock();

  deployHookTx.moveCall({
    target: `${packageId}::deploy_hook::run`,
    arguments: [deployHookTx.object(worldId), deployHookTx.object(adminCapId)],
  });

  let deployHookResult: SuiTransactionBlockResponse;
  try {
    deployHookResult = await client.signAndExecuteTransactionBlock({
      signer: keypair,
      transactionBlock: deployHookTx,
      options: {
        showEffects: true,
      },
    });
  } catch (error: any) {
    console.error(
      chalk.red(
        `Failed to execute deployHook, please republish or manually call deploy_hook::run`
      )
    );
    console.error(error.message);
    process.exit(1);
  }

  if (deployHookResult.effects?.status.status === "success") {
    console.log(
      chalk.green(
        `Successful auto-execution of deployHook, please check the transaction digest: ${deployHookResult.digest}`
      )
    );
  } else {
    console.log(
      chalk.yellow(
        `Failed to execute deployHook, please republish or manually call deploy_hook::run`
      )
    );
  }
}
