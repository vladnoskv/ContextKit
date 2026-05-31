import type { ContextIssue } from "../types/index.js";

export function calculateHealthScore(
  issues: ContextIssue[],
  totalTokens: number,
  hasMainInstructionFile: boolean,
): number {
  let score = 100;

  for (const issue of issues) {
    switch (issue.severity) {
      case "error":
        score -= 10;
        break;
      case "warning":
        score -= 4;
        break;
      case "info":
        score -= 1;
        break;
    }
  }

  if (totalTokens > 20000) {
    score -= 10;
  }

  if (!hasMainInstructionFile) {
    score -= 10;
  }

  return Math.max(0, Math.min(100, score));
}
