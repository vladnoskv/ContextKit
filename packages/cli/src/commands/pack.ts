import type { CliArgs } from "./args.js";
import {
  scanContext,
  createContextPack,
  createNodeFileSystemAdapter,
} from "@contextkit/core";
import type { ContextPackType } from "@contextkit/core";
import { resolveRoot, isPathWithin } from "../output/resolve.js";
import * as fs from "node:fs/promises";
import * as path from "node:path";

const VALID_PACKS: ContextPackType[] = [
  "frontend",
  "backend",
  "database",
  "testing",
  "security",
  "deployment",
  "full",
];

export async function handlePack(args: CliArgs): Promise<void> {
  const rootDir = resolveRoot(args);
  const fsAdapter = createNodeFileSystemAdapter();
  const result = await scanContext({ rootDir }, fsAdapter);

  const packType = (args.positional[0] ?? "full") as ContextPackType;

  if (!VALID_PACKS.includes(packType)) {
    process.stderr.write(
      `Error: Unknown pack type "${packType}". Valid: ${VALID_PACKS.join(", ")}\n`,
    );
    process.exit(1);
  }

  const output = createContextPack({
    rootDir,
    packType,
    files: result.files,
    detectedProject: result.detectedProject,
  });

  if (args.dryRun) {
    process.stdout.write(`[DRY RUN] Would create ${packType} context pack.\n\n`);
    process.stdout.write(output.content.slice(0, 2000) + "\n...\n");
    return;
  }

  if (args.out) {
    const outPath = path.resolve(rootDir, args.out);
    if (!isPathWithin(rootDir, outPath)) {
      process.stderr.write(`Error: Output path must be within the project root: ${args.out}\n`);
      process.exit(1);
    }
    if (!args.flags["force"] && (await fileExists(outPath))) {
      process.stdout.write(`Warning: File already exists: ${outPath}. Use --force to overwrite.\n`);
      return;
    }
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, output.content, "utf-8");
    if (!args.quiet) {
      process.stdout.write(`Pack written to: ${outPath}\n`);
    }
  } else {
    process.stdout.write(output.content + "\n");
  }
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await fs.stat(p);
    return true;
  } catch {
    return false;
  }
}
