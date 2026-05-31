import type { CliArgs } from "./args.js";
import { scanContext, generateReport, createNodeFileSystemAdapter } from "@contextkit/core";
import { resolveRoot, isPathWithin } from "../output/resolve.js";
import * as fs from "node:fs/promises";
import * as path from "node:path";

export async function handleReport(args: CliArgs): Promise<void> {
  const rootDir = resolveRoot(args);
  const fsAdapter = createNodeFileSystemAdapter();
  const result = await scanContext({ rootDir }, fsAdapter);

  const format = (args.format as "markdown" | "json") ?? "markdown";
  const report = generateReport(result, { format });

  if (args.out) {
    if (args.dryRun) {
      process.stdout.write(`[DRY RUN] Would write report to: ${args.out}\n`);
      process.stdout.write(report.slice(0, 500) + "\n...\n");
      return;
    }
    const outPath = path.resolve(rootDir, args.out);
    if (!isPathWithin(rootDir, outPath)) {
      process.stderr.write(`Error: Output path must be within the project root: ${args.out}\n`);
      process.exit(1);
    }
    if (!args.flags["force"] && (await fileExists(outPath))) {
      process.stdout.write(`Warning: File already exists: ${outPath}. Use --force to overwrite.\n`);
      return;
    }
    await fs.writeFile(outPath, report, "utf-8");
    if (!args.quiet) {
      process.stdout.write(`Report written to: ${outPath}\n`);
    }
  } else {
    process.stdout.write(report + "\n");
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
