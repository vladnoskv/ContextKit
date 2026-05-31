import type { CliArgs } from "./args.js";
import { scanContext, createNodeFileSystemAdapter } from "@contextkit/core";
import { isPathWithin, resolveRoot } from "../output/resolve.js";
import * as path from "node:path";

export async function handleTokens(args: CliArgs): Promise<void> {
  const rootDir = resolveRoot(args);
  const fsAdapter = createNodeFileSystemAdapter();
  const result = await scanContext({ rootDir }, fsAdapter);

  // Show tokens for a specific file if provided as positional argument
  const targetFile = args.positional[0];
  if (targetFile) {
    const matched = result.files.find((f) => f.path === targetFile || f.path.endsWith(targetFile));
    if (matched) {
      process.stdout.write(
        `${matched.path}: ${matched.estimatedTokens.toLocaleString()} tokens (${matched.sizeBytes.toLocaleString()} bytes)\n`,
      );
    } else {
      // Manual token estimation for any file
      try {
        const fullPath = path.resolve(rootDir, targetFile);
        if (!isPathWithin(rootDir, fullPath)) {
          throw new Error("File is outside the project root.");
        }

        const stat = await fsAdapter.stat(fullPath);
        const tokens = Math.ceil(stat.size / 4);
        process.stdout.write(
          `${targetFile}: ${tokens.toLocaleString()} tokens (${stat.size.toLocaleString()} bytes)\n`,
        );
      } catch {
        process.stderr.write(`Error: Cannot read file: ${targetFile}\n`);
        process.exit(1);
      }
    }
    return;
  }

  if (args.byFile) {
    for (const file of result.files) {
      process.stdout.write(`${file.path}: ${file.estimatedTokens.toLocaleString()} tokens\n`);
    }
  } else {
    process.stdout.write(
      `Total estimated tokens: ${result.totalEstimatedTokens.toLocaleString()}\n`,
    );
    process.stdout.write(`Total files: ${result.files.length}\n`);
  }
}
