import * as vscode from "vscode";
import { scanContext, createNodeFileSystemAdapter, type ContextScanResult } from "@contextkit/core";
import { ContextKitTreeProvider } from "./tree/treeProvider.js";
import { DiagnosticsProvider } from "./diagnostics/diagnosticsProvider.js";
import { StatusBarManager } from "./statusbar/statusBar.js";
import { registerCommands } from "./commands/index.js";
import { registerCodeActions } from "./diagnostics/codeActions.js";
import { getConfig } from "./config/settings.js";
import { isInstructionFileName } from "./utils/index.js";
import { ContextKitSetupViewProvider, SETUP_VIEW_ID } from "./webview/setupView.js";

let treeProvider: ContextKitTreeProvider;
let setupViewProvider: ContextKitSetupViewProvider;
let diagnosticsProvider: DiagnosticsProvider;
let statusBar: StatusBarManager;
let lastScanResult: ContextScanResult | undefined;

export function activate(context: vscode.ExtensionContext): void {
  const config = getConfig();

  treeProvider = new ContextKitTreeProvider();
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider("contextkit.sidebar", treeProvider),
  );

  setupViewProvider = new ContextKitSetupViewProvider({
    getConfig,
    getLastScanResult: () => lastScanResult,
    scanWorkspace,
    isWorkspaceTrusted: () => vscode.workspace.isTrusted,
  });
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(SETUP_VIEW_ID, setupViewProvider),
  );

  diagnosticsProvider = new DiagnosticsProvider();
  context.subscriptions.push(diagnosticsProvider);

  statusBar = new StatusBarManager();
  context.subscriptions.push(statusBar);

  if (config.enableStatusBar) {
    statusBar.show();
  }

  registerCommands(context, {
    getLastScanResult: () => lastScanResult,
    setLastScanResult: (r) => {
      lastScanResult = r;
    },
    refreshTree: () => treeProvider.refresh(),
    refreshSetupView: () => setupViewProvider.refresh(),
    refreshDiagnostics: () => diagnosticsProvider.updateDiagnostics(lastScanResult),
    refreshStatusBar: () => statusBar.update(lastScanResult),
    scanWorkspace,
    getConfig,
    isWorkspaceTrusted: () => vscode.workspace.isTrusted,
  });

  registerCodeActions(context, {
    isWorkspaceTrusted: () => vscode.workspace.isTrusted,
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
        setupViewProvider.refresh();
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
    vscode.window.showWarningMessage("AgentContextKit: No workspace folder open.");
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
    setupViewProvider.refresh();
    diagnosticsProvider.updateDiagnostics(result);
    statusBar.update(result);

    return result;
  } catch (err: any) {
    vscode.window.showErrorMessage(`AgentContextKit scan failed: ${err.message}`);
    return undefined;
  }
}
