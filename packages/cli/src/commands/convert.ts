import type { CliArgs } from "./args.js";
import {
  convertInstructions,
  createNodeFileSystemAdapter,
  detectInstructionKind,
  ALL_INSTRUCTION_KINDS,
} from "@contextkit/core";
import type { InstructionFileKind } from "@contextkit/core";
import { resolveRoot, isPathWithin } from "../output/resolve.js";
import * as fs from "node:fs/promises";
import * as path from "node:path";

const VALID_KINDS: InstructionFileKind[] = ALL_INSTRUCTION_KINDS;

export async function handleConvert(args: CliArgs): Promise<void> {
  const root = resolveRoot(args);
  const fsAdapter = createNodeFileSystemAdapter();

  const fromPath = args.from ?? args.positional[0];
  const toKindRaw = args.to ?? args.positional[1] ?? "agents";

  if (!fromPath) {
    process.stderr.write("Error: --from <path> is required.\n");
    process.exit(1);
  }

  if (!VALID_KINDS.includes(toKindRaw as InstructionFileKind)) {
    process.stderr.write(
      `Error: Invalid target kind "${toKindRaw}". Valid: ${VALID_KINDS.join(", ")}\n`,
    );
    process.exit(1);
  }
  const toKind = toKindRaw as InstructionFileKind;

  const fullPath = path.resolve(root, fromPath);
  if (!isPathWithin(root, fullPath)) {
    process.stderr.write(`Error: Source path must be within the project root: ${fromPath}\n`);
    process.exit(1);
  }

  if (!(await fsAdapter.fileExists(fullPath))) {
    process.stderr.write(`Error: File not found: ${fullPath}\n`);
    process.exit(1);
  }

  const content = await fs.readFile(fullPath, "utf-8");
  const sourceKind = detectInstructionKind(fromPath);

  const output = convertInstructions({
    sourcePath: fromPath,
    sourceContent: content,
    sourceKind,
    targetKind: toKind,
  });

  if (args.dryRun) {
    process.stdout.write(
      `[DRY RUN] Would convert ${sourceKind} -> ${toKind} to: ${output.targetPath}\n\n`,
    );
    process.stdout.write(output.content.slice(0, 1000) + "\n...\n");
    for (const w of output.warnings) {
      process.stdout.write(`Warning: ${w}\n`);
    }
    return;
  }

  const outPath = args.out
    ? path.resolve(root, args.out)
    : path.resolve(root, output.targetPath);

  if (!isPathWithin(root, outPath)) {
    process.stderr.write(`Error: Output path must be within the project root: ${args.out ?? output.targetPath}\n`);
    process.exit(1);
  }

  if (!args.flags["force"] && (await fileExists(outPath))) {
    process.stdout.write(
      `Warning: Target file already exists: ${outPath}. Use --force to overwrite.\n`,
    );
    return;
  }

  const outDir = path.dirname(outPath);
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(outPath, output.content, "utf-8");

  if (!args.quiet) {
    process.stdout.write(`Converted to: ${outPath}\n`);
    for (const w of output.warnings) {
      process.stdout.write(`Warning: ${w}\n`);
    }
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
