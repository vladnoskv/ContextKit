import type { InstructionFile, ContextIssue } from "../types/index.js";

export function analyzeStaleInstructions(files: InstructionFile[]): ContextIssue[] {
  const issues: ContextIssue[] = [];
  const now = Date.now();
  const STALE_THRESHOLD_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

  // Find youngest file among non-instruction files to compare
  const instructionPaths = new Set(files.map((f) => f.path));

  for (const file of files) {
    if (file.lastModified && now - file.lastModified.getTime() > STALE_THRESHOLD_MS) {
      issues.push({
        id: `stale-${file.path}`,
        severity: "info",
        type: "stale_instruction",
        message: `${file.path} has not been modified since ${file.lastModified.toISOString().split("T")[0]} (over 90 days ago)`,
        filePath: file.path,
        suggestion:
          "Review this instruction file to ensure it is still relevant and up to date.",
      });
    }
  }

  return issues;
}
