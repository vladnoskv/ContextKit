import * as vscode from "vscode";

export function getWorkspaceRoot(): string | undefined {
  const folders = vscode.workspace.workspaceFolders;
  if (!folders || folders.length === 0) return undefined;
  return folders[0]!.uri.fsPath;
}

export function isInstructionFileName(fileName: string): boolean {
  const lower = fileName.toLowerCase();
  return (
    lower.endsWith("agents.md") ||
    lower.endsWith("claude.md") ||
    lower.includes(".cursor/rules") ||
    lower.endsWith("copilot-instructions.md") ||
    lower.includes(".roo/rules") ||
    lower.includes(".codex/") ||
    lower.includes(".windsurf/rules") ||
    lower.includes(".gemini/")
  );
}
