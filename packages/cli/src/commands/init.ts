import type { CliArgs } from "./args.js";
import { resolveRoot } from "../output/resolve.js";
import * as fs from "node:fs/promises";
import * as path from "node:path";

const DEFAULT_CONFIG = {
  tokenWarningThreshold: 4000,
  tokenErrorThreshold: 8000,
  preferredInstructionFormat: "agents",
  include: [],
  exclude: ["node_modules", ".git", "dist", "build", ".next", "coverage"],
  customInstructionFiles: [],
  conflictRules: [],
};

export async function handleInit(args: CliArgs): Promise<void> {
  const rootDir = resolveRoot(args);
  const configPath = path.resolve(rootDir, "contextkit.config.json");

  if (await fileExists(configPath)) {
    process.stdout.write("contextkit.config.json already exists.\n");
    return;
  }

  const config = JSON.stringify(DEFAULT_CONFIG, null, 2) + "\n";

  if (args.dryRun) {
    process.stdout.write(`[DRY RUN] Would create: ${configPath}\n`);
    process.stdout.write(config);
    return;
  }

  await fs.writeFile(configPath, config, "utf-8");
  process.stdout.write(`Created: ${configPath}\n`);
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.stat(p);
    return true;
  } catch {
    return false;
  }
}
