import type { CliArgs } from "./args.js";
import { scanContext, createNodeFileSystemAdapter } from "@contextkit/core";
import { resolveRoot } from "../output/resolve.js";

export async function handleTokens(args: CliArgs): Promise<void> {
  const rootDir = resolveRoot(args);
  const fsAdapter = createNodeFileSystemAdapter();
  const result = await scanContext({ rootDir }, fsAdapter);

  if (args.byFile) {
    for (const file of result.files) {
      process.stdout.write(`${file.path}: ${file.estimatedTokens.toLocaleString()} tokens\n`);
    }
  } else {
    process.stdout.write(`Total estimated tokens: ${result.totalEstimatedTokens.toLocaleString()}\n`);
    process.stdout.write(`Total files: ${result.files.length}\n`);
  }
}
