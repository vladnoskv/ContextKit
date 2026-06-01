import type { CliArgs } from "./args.js";
import { scanContext, createNodeFileSystemAdapter } from "@contextkit/core";
import { resolveRoot } from "../output/resolve.js";

export async function handleScan(args: CliArgs): Promise<void> {
  const rootDir = resolveRoot(args);
  const fs = createNodeFileSystemAdapter();
  const result = await scanContext({ rootDir }, fs);

  if (args.json) {
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
    return;
  }

  const lines: string[] = [];
  lines.push("AgentContextKit Scan");
  lines.push("");
  lines.push(`Root: ${result.rootDir}`);
  lines.push(`Instruction files: ${result.files.length}`);
  lines.push(`Estimated tokens: ${result.totalEstimatedTokens.toLocaleString()}`);
  lines.push(`Issues: ${result.issues.length}`);
  lines.push(`Health score: ${result.healthScore}%`);
  lines.push("");

  if (args.verbose) {
    lines.push("Files:");
    for (const file of result.files) {
      lines.push(`  ${file.path} (${file.estimatedTokens.toLocaleString()} tokens, ${file.kind})`);
    }
    lines.push("");
  }

  const warnings = result.issues.filter(
    (i) => i.severity === "warning" || i.severity === "error",
  );
  if (warnings.length > 0) {
    lines.push("Warnings:");
    for (const w of warnings) {
      const icon = w.severity === "error" ? "Error" : "Warning";
      lines.push(`- [${icon}] ${w.message}`);
    }
    lines.push("");
  }

  process.stdout.write(lines.join("\n"));
}
