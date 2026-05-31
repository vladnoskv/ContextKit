import type { InstructionFileKind } from "../types/index.js";

export function detectInstructionKind(filePath: string): InstructionFileKind {
  const lower = filePath.toLowerCase();
  if (lower.includes("agents.md")) return "agents";
  if (lower.includes("claude.md")) return "claude";
  if (lower.includes(".cursor")) return "cursor";
  if (lower.includes("copilot")) return "copilot";
  if (lower.includes(".roo")) return "roo";
  if (lower.includes(".codex")) return "codex";
  if (lower.includes("windsurf")) return "windsurf";
  if (lower.includes("gemini")) return "gemini";
  return "custom";
}

export function instructionKindToPath(kind: InstructionFileKind, sourcePath?: string): string {
  switch (kind) {
    case "agents": return "AGENTS.md";
    case "claude": return "CLAUDE.md";
    case "copilot": return ".github/copilot-instructions.md";
    case "cursor": return ".cursor/rules/project.mdc";
    case "roo": return ".roo/rules/project.md";
    case "codex": return ".codex/instructions.md";
    case "windsurf": return ".windsurf/rules/project.md";
    case "gemini": return ".gemini/GEMINI.md";
    case "custom": return sourcePath ? sourcePath.replace(/\.[^.]+$/, "-converted.md") : "AI-INSTRUCTIONS.md";
  }
}

export const ALL_INSTRUCTION_KINDS: InstructionFileKind[] = [
  "agents",
  "claude",
  "cursor",
  "copilot",
  "roo",
  "codex",
  "windsurf",
  "gemini",
  "custom",
];
