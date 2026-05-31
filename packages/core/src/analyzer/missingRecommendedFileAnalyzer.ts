import type { InstructionFile, ContextIssue, DetectedProjectInfo } from "../types/index.js";

export function analyzeMissingRecommendedFiles(
  files: InstructionFile[],
  project: DetectedProjectInfo,
): ContextIssue[] {
  const issues: ContextIssue[] = [];
  const existingPaths = new Set(files.map((f) => f.path.toLowerCase()));

  const recommendations: Array<{ path: string; message: string }> = [];

  if (!existingPaths.has("agents.md")) {
    recommendations.push({
      path: "AGENTS.md",
      message: "No AGENTS.md found. This is the primary instruction file for AI coding assistants.",
    });
  }

  if (!existingPaths.has("claude.md")) {
    recommendations.push({
      path: "CLAUDE.md",
      message: "No CLAUDE.md found. Claude-specific instructions can improve results with Claude.",
    });
  }

  if (!existingPaths.has(".github/copilot-instructions.md")) {
    recommendations.push({
      path: ".github/copilot-instructions.md",
      message:
        "No GitHub Copilot instructions file found. Add one for Copilot Chat/Workspace support.",
    });
  }

  const hasCursorRules = files.some(
    (f) => f.path.startsWith(".cursor/rules") || f.path.endsWith(".mdc"),
  );
  if (!hasCursorRules) {
    recommendations.push({
      path: ".cursor/rules/project.mdc",
      message:
        "No Cursor rules found. Add .cursor/rules/project.mdc for Cursor IDE support.",
    });
  }

  if (project.hasCi) {
    const hasCiInstructions = files.some(
      (f) =>
        f.content.toLowerCase().includes("ci/cd") ||
        f.content.toLowerCase().includes("ci pipeline"),
    );
    if (!hasCiInstructions) {
      issues.push({
        id: "missing-ci-instructions",
        severity: "info",
        type: "missing_recommended_file",
        message:
          "CI/CD detected but no instruction files mention CI/CD workflows.",
        suggestion: "Add CI/CD context to your instruction files.",
      });
    }
  }

  if (project.hasDocker) {
    const hasDockerInstructions = files.some((f) =>
      f.content.toLowerCase().includes("docker"),
    );
    if (!hasDockerInstructions) {
      issues.push({
        id: "missing-docker-instructions",
        severity: "info",
        type: "missing_recommended_file",
        message:
          "Docker detected but no instruction files mention Docker/container rules.",
        suggestion: "Add Docker/container context to your instruction files.",
      });
    }
  }

  if (project.hasDatabaseMigrations) {
    const hasDbInstructions = files.some(
      (f) =>
        f.content.toLowerCase().includes("database") ||
        f.content.toLowerCase().includes("migration"),
    );
    if (!hasDbInstructions) {
      issues.push({
        id: "missing-db-instructions",
        severity: "info",
        type: "missing_recommended_file",
        message:
          "Database migrations detected but no instruction files mention database rules.",
        suggestion: "Add database context to your instruction files.",
      });
    }
  }

  for (const rec of recommendations) {
    issues.push({
      id: `missing-${rec.path.toLowerCase().replace(/[/.]/g, "-")}`,
      severity: "info",
      type: "missing_recommended_file",
      message: rec.message,
      suggestion: `Consider creating ${rec.path}. Run "contextkit generate agents" to generate one.`,
    });
  }

  return issues;
}
