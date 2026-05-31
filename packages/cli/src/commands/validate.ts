import type { CliArgs } from "./args.js";
import { scanContext, createNodeFileSystemAdapter } from "@contextkit/core";
import { resolveRoot } from "../output/resolve.js";

export async function handleValidate(args: CliArgs): Promise<void> {
  const rootDir = resolveRoot(args);
  const fsAdapter = createNodeFileSystemAdapter();
  const result = await scanContext({ rootDir }, fsAdapter);

  const errors = result.issues.filter((i) => i.severity === "error");
  const warnings = result.issues.filter((i) => i.severity === "warning");

  if (args.json) {
    process.stdout.write(
      JSON.stringify(
        {
          valid: errors.length === 0,
          errors: errors.length,
          warnings: warnings.length,
          info: result.issues.filter((i) => i.severity === "info").length,
          issues: result.issues,
        },
        null,
        2,
      ) + "\n",
    );
    if (args.strict && errors.length > 0) {
      process.exit(1);
    }
    return;
  }

  if (errors.length > 0) {
    process.stderr.write(`Errors: ${errors.length}\n`);
    for (const e of errors) {
      process.stderr.write(`  [ERROR] ${e.message}\n`);
    }
  }

  if (warnings.length > 0) {
    process.stdout.write(`Warnings: ${warnings.length}\n`);
    for (const w of warnings) {
      process.stdout.write(`  [WARN] ${w.message}\n`);
    }
  }

  if (errors.length === 0 && warnings.length === 0) {
    process.stdout.write("All checks passed. No issues found.\n");
  }

  if (args.strict && errors.length > 0) {
    process.exit(1);
  }
}
