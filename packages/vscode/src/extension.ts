import * as vscode from "vscode";
import { scanContext, createNodeFileSystemAdapter, type ContextScanResult } from "@contextkit/core";
import { ContextKitTreeProvider } from "./tree/treeProvider.js";
import { DiagnosticsProvider } from "./diagnostics/diagnosticsProvider.js";
import { StatusBarManager } from "./statusbar/statusBar.js";
import { registerCommands } from "./commands/index.js";
import { getConfig } from "./config/settings.js";
import { isInstructionFileName } from "./utils/index.js";

let treeProvider: ContextKitTreeProvider;
let diagnosticsProvider: DiagnosticsProvider;
let statusBar: StatusBarManager;
let lastScanResult: ContextScanResult | undefined;

export function activate(context: vscode.ExtensionContext): void {
  const config = getConfig();

  treeProvider = new ContextKitTreeProvider();
  vscode.window.registerTreeDataProvider("contextkit.sidebar", treeProvider);

  diagnosticsProvider = new DiagnosticsProvider();
  context.subscriptions.push(diagnosticsProvider);

  statusBar = new StatusBarManager();
  context.subscriptions.push(statusBar);

  if (config.enableStatusBar) {
    statusBar.show();
  }

  registerCommands(context, {
    getLastScanResult: () => lastScanResult,
    setLastScanResult: (r) => { lastScanResult = r; },
    refreshTree: () => treeProvider.refresh(),
    refreshDiagnostics: () => diagnosticsProvider.updateDiagnostics(lastScanResult),
    refreshStatusBar: () => statusBar.update(lastScanResult),
    scanWorkspace,
    getConfig,
  });

  // Auto-scan if enabled
  if (config.autoScanOnOpen) {
    triggerScan();
  }

  // Watch for saved instruction files
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument((doc) => {
      if (isInstructionFileName(doc.fileName)) {
        if (config.autoScanOnSave) {
          triggerScan();
        }
      }
    }),
  );

  // Configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("contextkit")) {
        const newConfig = getConfig();
        if (newConfig.enableStatusBar) {
          statusBar.show();
        } else {
          statusBar.hide();
        }
      }
    }),
  );
}

export function deactivate(): void {
  if (statusBar) {
    statusBar.dispose();
  }
}

async function triggerScan(): Promise<ContextScanResult | undefined> {
  return scanWorkspace();
}

async function scanWorkspace(): Promise<ContextScanResult | undefined> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showWarningMessage("ContextKit: No workspace folder open.");
    return undefined;
  }

  const config = getConfig();
  const rootDir = workspaceFolders[0]!.uri.fsPath;
  const fs = createNodeFileSystemAdapter();

  try {
    const result = await scanContext(
      {
        rootDir,
        tokenWarningThreshold: config.tokenWarningThreshold,
        tokenErrorThreshold: config.tokenErrorThreshold,
        include: config.include,
        exclude: config.exclude,
      },
      fs,
    );

    lastScanResult = result;
    treeProvider.setResult(result);
    diagnosticsProvider.updateDiagnostics(result);
    statusBar.update(result);

    return result;
  } catch (err: any) {
    vscode.window.showErrorMessage(`ContextKit scan failed: ${err.message}`);
    return undefined;
  }
}

function isInstructionFile(fileName: string): boolean {
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
