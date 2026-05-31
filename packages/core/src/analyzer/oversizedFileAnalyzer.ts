import type { InstructionFile, ContextIssue } from "../types/index.js";

export interface OversizedFileConfig {
  warningThreshold: number;
  errorThreshold: number;
}

export function analyzeOversizedFiles(
  files: InstructionFile[],
  config: OversizedFileConfig,
): ContextIssue[] {
  const issues: ContextIssue[] = [];

  for (const file of files) {
    if (file.estimatedTokens > config.errorThreshold) {
      issues.push({
        id: `oversized-error-${file.path}`,
        severity: "error",
        type: "oversized_file",
        message: `${file.path} exceeds error token threshold: ${file.estimatedTokens} tokens (limit: ${config.errorThreshold})`,
        filePath: file.path,
        suggestion: `Consider splitting ${file.path} into modular files using "contextkit split ${file.path}"`,
      });
    } else if (file.estimatedTokens > config.warningThreshold) {
      issues.push({
        id: `oversized-warning-${file.path}`,
        severity: "warning",
        type: "oversized_file",
        message: `${file.path} exceeds warning token threshold: ${file.estimatedTokens} tokens (limit: ${config.warningThreshold})`,
        filePath: file.path,
        suggestion: `Consider splitting ${file.path} into modular files using "contextkit split ${file.path}"`,
      });
    }
  }

  return issues;
}
