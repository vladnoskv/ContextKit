import type {
  ContextScanResult,
  ContextIssue,
  ReportOptions,
} from "../types/index.js";

export function generateReport(
  result: ContextScanResult,
  options: ReportOptions,
): string {
  if (options.format === "json") {
    return JSON.stringify(result, null, 2);
  }

  return generateMarkdownReport(result);
}

function generateMarkdownReport(result: ContextScanResult): string {
  const lines: string[] = [];

  lines.push("# ContextKit Report");
  lines.push("");
  lines.push(`Generated: ${result.scannedAt}`);
  lines.push(`Root: \`${result.rootDir}\``);
  lines.push("");

  // Summary
  lines.push("## Summary");
  lines.push("");
  lines.push(`- Instruction files: ${result.files.length}`);
  lines.push(`- Estimated tokens: ${result.totalEstimatedTokens.toLocaleString()}`);
  lines.push(`- Health score: ${result.healthScore}%`);
  lines.push(`- Issues: ${result.issues.length}`);
  lines.push("");

  // Token breakdown
  if (result.files.length > 0) {
    lines.push("## Token Breakdown");
    lines.push("");
    lines.push("| File | Tokens | Kind | Status |");
    lines.push("|---|---|---|---|");
    for (const file of result.files) {
      const status =
        file.estimatedTokens > 8000
          ? "⚠️ Oversized"
          : file.estimatedTokens > 4000
            ? "⚡ Large"
            : "✅ OK";
      lines.push(
        `| \`${file.path}\` | ${file.estimatedTokens.toLocaleString()} | ${file.kind} | ${status} |`,
      );
    }
    lines.push("");
  }

  // Detected project
  const proj = result.detectedProject;
  lines.push("## Project Detection");
  lines.push("");
  if (proj.packageManager) {
    lines.push(`- Package manager: ${proj.packageManager}`);
  }
  if (proj.frameworks.length > 0) {
    lines.push(`- Frameworks: ${proj.frameworks.join(", ")}`);
  }
  if (proj.languages.length > 0) {
    lines.push(`- Languages: ${proj.languages.join(", ")}`);
  }
  if (proj.testTools.length > 0) {
    lines.push(`- Test tools: ${proj.testTools.join(", ")}`);
  }
  if (proj.lintTools.length > 0) {
    lines.push(`- Lint tools: ${proj.lintTools.join(", ")}`);
  }
  if (proj.buildCommands.length > 0) {
    lines.push(`- Build commands: ${proj.buildCommands.join(", ")}`);
  }
  if (proj.hasCi) lines.push("- CI/CD: Yes");
  if (proj.hasDocker) lines.push("- Docker: Yes");
  if (proj.hasDatabaseMigrations) lines.push("- Database migrations: Yes");
  lines.push("");

  // Issues
  if (result.issues.length > 0) {
    lines.push("## Issues");
    lines.push("");

    const grouped = groupIssuesByType(result.issues);
    for (const [type, issues] of Object.entries(grouped)) {
      const severityCounts = countSeverities(issues);
      const label = typeLabels[type] ?? type;
      const counts = Object.entries(severityCounts)
        .filter(([, c]) => c > 0)
        .map(([s, c]) => `${c} ${s}`)
        .join(", ");
      lines.push(`### ${label} (${counts})`);
      lines.push("");

      for (const issue of issues) {
        const icon = severityIcon[issue.severity] ?? "ℹ️";
        lines.push(`- ${icon} **${issue.message}**`);
        if (issue.filePath) lines.push(`  - File: \`${issue.filePath}\``);
        if (issue.line) lines.push(`  - Line: ${issue.line}`);
        if (issue.relatedFiles && issue.relatedFiles.length > 0) {
          lines.push(`  - Related: ${issue.relatedFiles.map((f) => `\`${f}\``).join(", ")}`);
        }
        if (issue.suggestion) lines.push(`  - Suggestion: ${issue.suggestion}`);
        lines.push("");
      }
    }
  }

  // Suggested actions
  lines.push("## Suggested Actions");
  lines.push("");
  const actions = generateSuggestedActions(result);
  for (let i = 0; i < actions.length; i++) {
    lines.push(`${i + 1}. ${actions[i]}`);
  }
  lines.push("");

  return lines.join("\n");
}

function groupIssuesByType(
  issues: ContextIssue[],
): Record<string, ContextIssue[]> {
  const groups: Record<string, ContextIssue[]> = {};
  for (const issue of issues) {
    if (!groups[issue.type]) groups[issue.type] = [];
    groups[issue.type]!.push(issue);
  }
  return groups;
}

function countSeverities(
  issues: ContextIssue[],
): Record<string, number> {
  const counts: Record<string, number> = { error: 0, warning: 0, info: 0 };
  for (const issue of issues) {
    counts[issue.severity] = (counts[issue.severity] ?? 0) + 1;
  }
  return counts;
}

const typeLabels: Record<string, string> = {
  duplicate_rule: "Duplicate Rules",
  conflicting_rule: "Conflicting Rules",
  oversized_file: "Oversized Files",
  stale_instruction: "Stale Instructions",
  missing_recommended_file: "Missing Recommended Files",
  invalid_format: "Format Issues",
  broken_link: "Broken Links",
  unknown: "Other Issues",
};

const severityIcon: Record<string, string> = {
  error: "🔴",
  warning: "🟡",
  info: "ℹ️",
};

function generateSuggestedActions(result: ContextScanResult): string[] {
  const actions: string[] = [];

  const oversized = result.issues.filter((i) => i.type === "oversized_file");
  if (oversized.length > 0) {
    actions.push(`Split ${oversized.length} oversized file(s) into modular docs.`);
  }

  const duplicates = result.issues.filter((i) => i.type === "duplicate_rule");
  if (duplicates.length > 0) {
    actions.push(`Remove ${duplicates.length} duplicated rule(s) to reduce noise.`);
  }

  const conflicts = result.issues.filter((i) => i.type === "conflicting_rule");
  if (conflicts.length > 0) {
    actions.push(
      `Resolve ${conflicts.length} conflicting rule(s) - choose a consistent approach.`,
    );
  }

  const missing = result.issues.filter(
    (i) => i.type === "missing_recommended_file",
  );
  if (missing.length > 0) {
    actions.push(
      `Create ${missing.length} recommended instruction file(s) for better AI coverage.`,
    );
  }

  if (result.totalEstimatedTokens > 20000) {
    actions.push("Consider reducing total instruction token count for better AI context efficiency.");
  }

  if (result.files.length === 0) {
    actions.push("Add at least an AGENTS.md file to provide project context to AI assistants.");
  }

  if (actions.length === 0) {
    actions.push("Looks good! Your AI instruction context is well-maintained.");
  }

  return actions;
}
