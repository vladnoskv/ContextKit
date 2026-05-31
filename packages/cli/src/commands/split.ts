import type { CliArgs } from "./args.js";
import { splitInstructionFile, createNodeFileSystemAdapter, detectInstructionKind } from "@contextkit/core";
import type { InstructionFileKind } from "@contextkit/core";
import { resolveRoot, isPathWithin } from "../output/resolve.js";
import * as fs from "node:fs/promises";
import * as path from "node:path";

export async function handleSplit(args: CliArgs): Promise<void> {
  const root = resolveRoot(args);
  const fsAdapter = createNodeFileSystemAdapter();

  const filePath = args.positional[0] ?? "AGENTS.md";
  const fullPath = path.resolve(root, filePath);

  if (!isPathWithin(root, fullPath)) {
    process.stderr.write(`Error: File path must be within the project root: ${filePath}\n`);
    process.exit(1);
  }

  if (!(await fsAdapter.fileExists(fullPath))) {
    process.stderr.write(`Error: File not found: ${fullPath}\n`);
    process.exit(1);
  }

  const content = await fs.readFile(fullPath, "utf-8");

  const dotDir = filePath.startsWith(".")
    ? path.dirname(filePath)
    : `.${path.basename(filePath, ".md")}`;
  const outputDir = args.out ?? `${dotDir}/docs`;

  const kind = detectInstructionKind(filePath);
  const result = splitInstructionFile({
    filePath,
    content,
    outputDir,
    kind,
  });

  if (args.dryRun) {
    process.stdout.write(`[DRY RUN] Would split ${filePath} into ${result.modules.length} modules.\n`);
    process.stdout.write(`Backup: ${result.backupPath}\n`);
    process.stdout.write(`Root content:\n`);
    process.stdout.write(result.rootContent.slice(0, 1000) + "\n...\n\n");
    process.stdout.write("Modules:\n");
    for (const mod of result.modules) {
      process.stdout.write(`  ${mod.path}: ${mod.heading} (${mod.content.length} chars)\n`);
    }
    return;
  }

  // Validate output directory is within root
  const resolvedOutputDir = path.resolve(root, outputDir);
  if (!isPathWithin(root, resolvedOutputDir)) {
    process.stderr.write(`Error: Output directory must be within the project root: ${outputDir}\n`);
    process.exit(1);
  }

  // Create backup - timestamped to avoid overwriting previous backups
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = `${result.backupPath}.${timestamp}`;
  const backupFullPath = path.resolve(root, backupPath);

  if (await fileExists(backupFullPath)) {
    process.stdout.write(`Warning: Backup already exists at ${backupFullPath}, skipping.\n`);
  } else {
    await fs.writeFile(backupFullPath, content, "utf-8");
  }

  // Write modules - skip existing unless --force
  const force = args.flags["force"] === true;
  for (const mod of result.modules) {
    const modFullPath = path.resolve(root, mod.path);
    if (!isPathWithin(root, modFullPath)) {
      process.stderr.write(`Error: Module path outside root: ${mod.path}\n`);
      process.exit(1);
    }
    if (!force && (await fileExists(modFullPath))) {
      process.stdout.write(`Warning: Module already exists, skipping: ${mod.path}\n`);
      continue;
    }
    await fs.mkdir(path.dirname(modFullPath), { recursive: true });
    await fs.writeFile(modFullPath, mod.content, "utf-8");
  }

  // Write root
  await fs.writeFile(fullPath, result.rootContent, "utf-8");

  if (!args.quiet) {
    process.stdout.write(`Split ${filePath} into ${result.modules.length} modules.\n`);
    process.stdout.write(`Backup saved to: ${backupPath}\n`);
    process.stdout.write(`Modules written to: ${outputDir}/\n`);
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
