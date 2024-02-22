import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import prompts from "prompts";

const cwd = process.cwd();
const renameFiles: Record<string, string | undefined> = {
  _gitignore: ".gitignore",
};
const defaultTargetDir = "temples-template-project";

const init = async () => {
  const response = await prompts([
    {
      type: "text",
      name: "projectName",
      message: "Input your projectName.",
      initial: defaultTargetDir,
    },
    {
      type: "select",
      name: "chain",
      message: "Pick your chain.",
      choices: [
        { title: "sui", description: "Sui", value: "sui" },
        { title: "aptos", description: "Aptos", value: "aptos" },
      ],
      initial: 0,
    },
    {
      type: "select",
      name: "platform",
      message: "Pick your platform.",
      choices: [
        { title: "101", description: "Quick start", value: "101" },
        { title: "Web", description: "Web template", value: "web" },
        { title: "Cocos", description: "Cocos Creator", value: "cocos" },
      ],
      initial: 0,
    },
    {
      type: "select",
      name: "framework",
      message: "Pick your framework.",
      choices: (platform) => {
        if (platform === "101") {
          return [{ title: "Nextjs", value: "nextjs" }];
        } else if (platform === "web") {
          return [{ title: "Nextjs", value: "nextjs" }];
        } else if (platform === "cocos") {
          return [{ title: "Typescript", value: "ts" }];
        }
        return null;
      },
      initial: 0,
    },
  ]);
  const { projectName, chain, platform, framework } = response;
  let target = "";

  if (platform === "101") {
    target = `template/101/${chain}-template`;
  } else if (platform === "web") {
    target = `template/nextjs/${chain}-template`;
  } else {
    target = `template/cocos/${chain}-template`;
  }

  let targetDir = projectName || defaultTargetDir;
  const root = path.join(cwd, targetDir);

  if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true });
  }

  const pkgInfo = pkgFromUserAgent(process.env.npm_config_user_agent);
  const pkgManager = pkgInfo ? pkgInfo.name : "npm";

  const templateDir = path.resolve(
    fileURLToPath(import.meta.url),
    "../..",
    target
  );

  const write = (file: string, content?: string) => {
    const targetPath = path.join(root, renameFiles[file] ?? file);
    if (content) {
      fs.writeFileSync(targetPath, content);
    } else {
      copy(path.join(templateDir, file), targetPath);
    }
  };

  const files = fs.readdirSync(templateDir);
  for (const file of files.filter((f) => f !== "package.json")) {
    write(file);
  }

  const pkg = JSON.parse(
    fs.readFileSync(path.join(templateDir, `package.json`), "utf-8")
  );

  pkg.name = projectName;

  write("package.json", JSON.stringify(pkg, null, 2) + "\n");

  const cdProjectName = path.relative(cwd, root);
  console.log(`\nDone. Now run:\n`);
  if (root !== cwd) {
    console.log(
      `  cd ${
        cdProjectName.includes(" ") ? `"${cdProjectName}"` : cdProjectName
      }`
    );
  }
  if (platform == "101") {
    console.log(`  ${pkgManager} install`);
    console.log(`  ${pkgManager} run dev`);
  } else if (platform == "web") {
    console.log(`  ${pkgManager} install`);
    console.log(`  ${pkgManager} run dev`);
  } else if (platform == "cocos") {
    console.log(`  import project by cocos create ide `);
    console.log(`  ${pkgManager} install`);
    console.log(`  ${pkgManager} run dev`);
    console.log(`  start you cocos project `);
  }
  // switch (pkgManager) {
  //   case 'yarn':
  //     console.log('  yarn')
  //     console.log('  yarn dev')
  //     break
  //   default:
  //     console.log(`  ${pkgManager} install`)
  //     console.log(`  ${pkgManager} run dev`)
  //     break
  // }
  console.log();
};

function copy(src: string, dest: string) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    copyDir(src, dest);
  } else {
    fs.copyFileSync(src, dest);
  }
}

function copyDir(srcDir: string, destDir: string) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file);
    const destFile = path.resolve(destDir, file);
    copy(srcFile, destFile);
  }
}

function pkgFromUserAgent(userAgent: string | undefined) {
  if (!userAgent) return undefined;
  const pkgSpec = userAgent.split(" ")[0];
  const pkgSpecArr = pkgSpec.split("/");
  return {
    name: pkgSpecArr[0],
    version: pkgSpecArr[1],
  };
}

init().catch((e) => {
  console.error(e);
});
