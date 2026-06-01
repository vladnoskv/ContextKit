import type {
  ConvertInput,
  ConvertOutput,
  InstructionFileKind,
} from "../types/index.js";
import { parseMarkdown } from "../parser/index.js";
import { instructionKindToPath } from "../utils/instructionKinds.js";

export function convertInstructions(input: ConvertInput): ConvertOutput {
  const warnings: string[] = [];
  const parsed = parseMarkdown(input.sourceContent, input.sourcePath);

  let content = "";

  if (input.targetKind === "copilot") {
    content = convertToCopilot(input, parsed);
  } else if (input.targetKind === "cursor") {
    content = convertToCursor(input, parsed);
  } else if (input.targetKind === "claude") {
    content = convertToClaude(input, parsed);
  } else if (input.targetKind === "agents") {
    content = convertToAgents(input, parsed);
  } else if (input.targetKind === "roo") {
    content = convertToRoo(input, parsed);
  } else {
    // Generic conversion: wrap as appropriate
    content = wrapWithHeader(input.targetKind, input.sourceContent, input.sourceKind);
  }

  const targetPath = suggestTargetPath(input.sourcePath, input.targetKind);
  warnings.push(
    `Converted from ${input.sourceKind} to ${input.targetKind}. Review the output before using.`,
  );

  return { content, targetPath, warnings };
}

function convertToCopilot(input: ConvertInput, parsed: ReturnType<typeof parseMarkdown>): string {
  const sections = extractCommonSections(parsed);
  const lines: string[] = [];

  lines.push("# GitHub Copilot Instructions");
  lines.push("");
  lines.push("<!-- Converted from " + input.sourceKind + " by AgentContextKit -->");
  lines.push("");

  if (input.sourceKind === "agents") {
    lines.push("## Project Overview");
    lines.push("");
    lines.push(sections.overview ?? "See the original AGENTS.md for full project overview.");
    lines.push("");

    if (sections.commands) {
      lines.push("## Commands");
      lines.push("");
      lines.push(sections.commands);
      lines.push("");
    }

    if (sections.standards) {
      lines.push("## Coding Standards");
      lines.push("");
      lines.push(sections.standards);
      lines.push("");
    }

    if (sections.testing) {
      lines.push("## Testing");
      lines.push("");
      lines.push(sections.testing);
      lines.push("");
    }

    if (sections.security) {
      lines.push("## Security");
      lines.push("");
      lines.push(sections.security);
      lines.push("");
    }
  } else {
    lines.push(sections.overview ?? input.sourceContent);
  }

  if (sections.warnings) {
    lines.push("## Important Notes");
    lines.push("");
    lines.push(sections.warnings);
    lines.push("");
  }

  return lines.join("\n");
}

function convertToCursor(input: ConvertInput, parsed: ReturnType<typeof parseMarkdown>): string {
  const sections = extractCommonSections(parsed);
  const lines: string[] = [];

  lines.push("---");
  lines.push("description: Project rules converted from " + input.sourceKind);
  lines.push("globs:");
  lines.push('  - "**/*"');
  lines.push("alwaysApply: true");
  lines.push("---");
  lines.push("");

  lines.push("# Project Rules");
  lines.push("");

  if (sections.overview) {
    lines.push(sections.overview);
    lines.push("");
  }

  if (sections.standards) {
    lines.push("## Standards");
    lines.push("");
    lines.push(sections.standards);
    lines.push("");
  }

  if (sections.testing) {
    lines.push("## Testing Rules");
    lines.push("");
    lines.push(sections.testing);
    lines.push("");
  }

  if (sections.warnings) {
    lines.push("## Warnings");
    lines.push("");
    lines.push(sections.warnings);
    lines.push("");
  }

  return lines.join("\n");
}

function convertToClaude(input: ConvertInput, parsed: ReturnType<typeof parseMarkdown>): string {
  const sections = extractCommonSections(parsed);
  const lines: string[] = [];

  lines.push("# CLAUDE.md");
  lines.push("");
  lines.push("<!-- Converted from " + input.sourceKind + " by AgentContextKit -->");
  lines.push("");

  if (sections.overview) {
    lines.push(sections.overview);
    lines.push("");
  }

  if (sections.commands) {
    lines.push("## Commands");
    lines.push("");
    lines.push(sections.commands);
    lines.push("");
  }

  if (sections.standards) {
    lines.push("## Coding Standards");
    lines.push("");
    lines.push(sections.standards);
    lines.push("");
  }

  if (sections.testing) {
    lines.push("## Testing");
    lines.push("");
    lines.push(sections.testing);
    lines.push("");
  }

  if (sections.warnings) {
    lines.push("## Warnings");
    lines.push("");
    lines.push(sections.warnings);
    lines.push("");
  }

  return lines.join("\n");
}

function convertToAgents(input: ConvertInput, parsed: ReturnType<typeof parseMarkdown>): string {
  const sections = extractCommonSections(parsed);
  const lines: string[] = [];

  lines.push("# AGENTS.md");
  lines.push("");
  lines.push("<!-- Converted from " + input.sourceKind + " by AgentContextKit -->");
  lines.push("");

  if (input.sourceKind === "cursor") {
    const mdcContent = input.sourceContent.replace(/^---[\s\S]*?---\n*/m, "").trim();
    lines.push("## Project Overview");
    lines.push("");
    lines.push(mdcContent || "See original Cursor rules.");
    lines.push("");
  } else if (input.sourceKind === "copilot") {
    lines.push("## Project Overview");
    lines.push("");
    lines.push(sections.overview ?? input.sourceContent);
    lines.push("");
  } else {
    if (sections.overview) {
      lines.push(sections.overview);
      lines.push("");
    }
  }

  if (sections.commands) {
    lines.push("## Commands");
    lines.push("");
    lines.push(sections.commands);
    lines.push("");
  }

  if (sections.standards) {
    lines.push("## Coding Standards");
    lines.push("");
    lines.push(sections.standards);
    lines.push("");
  }

  if (sections.testing) {
    lines.push("## Testing Rules");
    lines.push("");
    lines.push(sections.testing);
    lines.push("");
  }

  if (sections.security) {
    lines.push("## Security");
    lines.push("");
    lines.push(sections.security);
    lines.push("");
  }

  if (sections.warnings) {
    lines.push("## Important Warnings");
    lines.push("");
    lines.push(sections.warnings);
    lines.push("");
  }

  return lines.join("\n");
}

function convertToRoo(input: ConvertInput, parsed: ReturnType<typeof parseMarkdown>): string {
  const sections = extractCommonSections(parsed);
  const lines: string[] = [];

  lines.push("# Roo Rules");
  lines.push("");
  lines.push("<!-- Converted from " + input.sourceKind + " by AgentContextKit -->");
  lines.push("");

  if (sections.overview) {
    lines.push(sections.overview);
    lines.push("");
  }

  if (sections.standards) {
    lines.push("## Standards");
    lines.push("");
    lines.push(sections.standards);
    lines.push("");
  }

  return lines.join("\n");
}

function extractCommonSections(parsed: ReturnType<typeof parseMarkdown>) {
  let overview = "";
  let commands = "";
  let standards = "";
  let testing = "";
  let security = "";
  let warnings = "";

  for (const section of parsed.sections) {
    const lower = section.heading.toLowerCase();

    if (lower.includes("overview") || lower.includes("introduction") || lower.includes("about")) {
      overview += section.content + "\n\n";
    } else if (lower.includes("command") || lower.includes("script") || lower.includes("build") || lower.includes("run")) {
      commands += section.content + "\n\n";
    } else if (lower.includes("standard") || lower.includes("style") || lower.includes("convention") || lower.includes("coding")) {
      standards += section.content + "\n\n";
    } else if (lower.includes("test")) {
      testing += section.content + "\n\n";
    } else if (lower.includes("secur")) {
      security += section.content + "\n\n";
    } else if (lower.includes("warning") || lower.includes("caution") || lower.includes("note") || lower.includes("important")) {
      warnings += section.content + "\n\n";
    }
  }

  return {
    overview: overview.trim() || undefined,
    commands: commands.trim() || undefined,
    standards: standards.trim() || undefined,
    testing: testing.trim() || undefined,
    security: security.trim() || undefined,
    warnings: warnings.trim() || undefined,
  };
}

function wrapWithHeader(kind: InstructionFileKind, content: string, sourceKind: InstructionFileKind): string {
  const header = `# ${kind.toUpperCase()} Instructions
<!-- Converted from ${sourceKind} by AgentContextKit -->

`;
  return header + content;
}

function suggestTargetPath(sourcePath: string, targetKind: InstructionFileKind): string {
  return instructionKindToPath(targetKind, sourcePath);
}
