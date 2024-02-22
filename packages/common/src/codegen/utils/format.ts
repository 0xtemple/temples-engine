// import chalk from "chalk";
import * as prettier from "prettier";
import * as rustPlugin from "prettier-plugin-rust";

export async function formatRust(
  content: string,
  prettierConfigPath?: string
): Promise<string> {
  let config;
  if (prettierConfigPath) {
    config = await prettier.resolveConfig(prettierConfigPath);
  }
  try {
    return prettier.format(content, {
      plugins: [rustPlugin],
      // parser: "rustParse",

      ...config,
    });
  } catch (error) {
    let message;
    if (error instanceof Error) {
      message = error.message;
    } else {
      message = error;
    }
    console.log(`Error during output formatting: ${message}`);
    return content;
  }
}

export async function formatTypescript(content: string): Promise<string> {
  return prettier.format(content, {
    parser: "typescript",
  });
}
