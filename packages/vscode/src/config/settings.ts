import * as vscode from "vscode";

export interface ContextKitVSCodeConfig {
  autoScanOnOpen: boolean;
  autoScanOnSave: boolean;
  tokenWarningThreshold: number;
  tokenErrorThreshold: number;
  include: string[];
  exclude: string[];
  preferredInstructionFormat: string;
  defaultContextPacks: string[];
  enableDiagnostics: boolean;
  enableStatusBar: boolean;
}

export function getConfig(): ContextKitVSCodeConfig {
  const cfg = vscode.workspace.getConfiguration("contextkit");
  return {
    autoScanOnOpen: cfg.get<boolean>("autoScanOnOpen", false),
    autoScanOnSave: cfg.get<boolean>("autoScanOnSave", false),
    tokenWarningThreshold: cfg.get<number>("tokenWarningThreshold", 4000),
    tokenErrorThreshold: cfg.get<number>("tokenErrorThreshold", 8000),
    include: cfg.get<string[]>("include", []),
    exclude: cfg.get<string[]>("exclude", [
      "node_modules",
      ".git",
      "dist",
      "build",
      ".next",
      "coverage",
    ]),
    preferredInstructionFormat: cfg.get<string>(
      "preferredInstructionFormat",
      "agents",
    ),
    defaultContextPacks: cfg.get<string[]>("defaultContextPacks", [
      "frontend",
      "backend",
      "database",
      "testing",
      "security",
      "deployment",
    ]),
    enableDiagnostics: cfg.get<boolean>("enableDiagnostics", true),
    enableStatusBar: cfg.get<boolean>("enableStatusBar", true),
  };
}
