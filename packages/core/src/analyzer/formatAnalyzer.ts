import type { InstructionFile, ContextIssue } from "../types/index.js";

export function analyzeFormatIssues(files: InstructionFile[]): ContextIssue[] {
  const issues: ContextIssue[] = [];

  for (const file of files) {
    // Check Cursor MDC frontmatter
    if (file.path.endsWith(".mdc")) {
      const hasFrontmatter = file.content.trimStart().startsWith("---");
      if (!hasFrontmatter) {
        issues.push({
          id: `format-mdc-${file.path}`,
          severity: "warning",
          type: "invalid_format",
          message: `${file.path} is missing YAML frontmatter (---). Cursor MDC files should have frontmatter.`,
          filePath: file.path,
          suggestion:
            'Add frontmatter like: ---\ndescription: "...\nglobs: [...]\n---',
        });
      }
    }

    // Check for empty files
    if (file.content.trim().length === 0) {
      issues.push({
        id: `format-empty-${file.path}`,
        severity: "warning",
        type: "invalid_format",
        message: `${file.path} is empty.`,
        filePath: file.path,
        suggestion: "Add content or remove the file.",
      });
    }
  }

  return issues;
}
