import { mkdirSync, writeFileSync } from "fs";
import { dirname } from "path";
import { formatRust, formatTypescript } from "./format";

export async function formatAndWriteRust(
  output: string,
  fullOutputPath: string,
  logPrefix?: string
): Promise<void> {
  // const formattedOutput = await formatRust(output);
  // console.log(formattedOutput)
  mkdirSync(dirname(fullOutputPath), { recursive: true });

  writeFileSync(fullOutputPath, output);
  if (logPrefix !== undefined) {
    console.log(`${logPrefix}: ${fullOutputPath}`);
  }
}

export async function formatAndWriteTypescript(
  output: string,
  fullOutputPath: string,
  logPrefix: string
): Promise<void> {
  const formattedOutput = await formatTypescript(output);

  mkdirSync(dirname(fullOutputPath), { recursive: true });

  writeFileSync(fullOutputPath, formattedOutput);
  console.log(`${logPrefix}: ${fullOutputPath}`);
}

export async function writeToml(
    output: string,
    fullOutputPath: string,
    logPrefix: string
): Promise<void> {
  mkdirSync(dirname(fullOutputPath), { recursive: true });

  writeFileSync(fullOutputPath, output);
  console.log(`${logPrefix}: ${fullOutputPath}`);
}
