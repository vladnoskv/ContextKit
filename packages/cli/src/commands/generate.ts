import type { CliArgs } from "./args.js";
import {
  generateInstructions,
  scanContext,
  createNodeFileSystemAdapter,
  ALL_INSTRUCTION_KINDS,
} from "@contextkit/core";
import type { InstructionFileKind } from "@contextkit/core";
import { resolveRoot, isPathWithin } from "../output/resolve.js";
import * as fs from "node:fs/promises";
import * as path from "node:path";

const VALID_KINDS: InstructionFileKind[] = ALL_INSTRUCTION_KINDS.filter(k => k !== "custom");

export async function handleGenerate(args: CliArgs): Promise<void> {
  const rootDir = resolveRoot(args);
  const fsAdapter = createNodeFileSystemAdapter();

  const targetKind = (args.positional[0] ?? "agents") as InstructionFileKind;
  if ((targetKind as string) === "all") {
    for (const kind of VALID_KINDS) {
      await generateOne(kind, rootDir, fsAdapter, args);
    }
    return;
  }

  if (!VALID_KINDS.includes(targetKind)) {
    process.stderr.write(
      `Error: Unknown target kind "${targetKind}". Valid: ${VALID_KINDS.join(", ")}, all\n`,
    );
    process.exit(1);
  }

  await generateOne(targetKind, rootDir, fsAdapter, args);
}

async function generateOne(
  kind: InstructionFileKind,
  rootDir: string,
  fsAdapter: ReturnType<typeof createNodeFileSystemAdapter>,
  args: CliArgs,
): Promise<void> {
  const result = await scanContext({ rootDir }, fsAdapter);
  const output = generateInstructions({
    rootDir,
    targetKind: kind,
    detectedProject: result.detectedProject,
    existingFiles: result.files,
  });

  if (args.dryRun) {
    process.stdout.write(`[DRY RUN] Would generate ${kind} instruction file to: ${output.targetPath}\n\n`);
    process.stdout.write(output.content.slice(0, 2000) + "\n...\n");
    return;
  }

  const outPath = args.out ? path.resolve(rootDir, args.out) : path.resolve(rootDir, output.targetPath);

  if (!isPathWithin(rootDir, outPath)) {
    process.stderr.write(`Error: Output path must be within the project root: ${args.out ?? output.targetPath}\n`);
    process.exit(1);
  }
  const outDir = path.dirname(outPath);

  if (await fsAdapter.fileExists(outPath)) {
    process.stdout.write(`File already exists: ${outPath}\n`);
    process.stdout.write("Use --out to specify a different path or --force to overwrite.\n");
    return;
  }

  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(outPath, output.content, "utf-8");

  if (!args.quiet) {
    process.stdout.write(`Generated ${kind} instruction file: ${outPath}\n`);
  }
}
