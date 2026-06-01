import * as vscode from "vscode";
import type { ContextScanResult } from "@contextkit/core";
import type { ContextKitVSCodeConfig } from "../config/settings.js";

export const SETUP_VIEW_ID = "contextkit.setup";

interface SetupViewDeps {
  getConfig: () => ContextKitVSCodeConfig;
  getLastScanResult: () => ContextScanResult | undefined;
  scanWorkspace: () => Promise<ContextScanResult | undefined>;
  isWorkspaceTrusted: () => boolean;
}

type SetupMessage =
  | { command: "scan" }
  | { command: "generateInstructions" }
  | { command: "openWorkbenchSettings" }
  | {
      command: "updateSetting";
      key: keyof ContextKitVSCodeConfig;
      value: boolean | number | string | string[];
    };

const editableSettings = new Set<keyof ContextKitVSCodeConfig>([
  "autoScanOnOpen",
  "autoScanOnSave",
  "enableDiagnostics",
  "enableStatusBar",
  "tokenWarningThreshold",
  "tokenErrorThreshold",
  "preferredInstructionFormat",
]);

export class ContextKitSetupViewProvider implements vscode.WebviewViewProvider {
  private view: vscode.WebviewView | undefined;

  constructor(private readonly deps: SetupViewDeps) {}

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    this.view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [],
    };

    this.refresh();

    webviewView.webview.onDidReceiveMessage((message: SetupMessage) => {
      void this.handleMessage(message);
    });
  }

  refresh(): void {
    if (!this.view) return;

    const nonce = getNonce();
    this.view.webview.html = renderSetupHtml({
      cspSource: this.view.webview.cspSource,
      nonce,
      config: this.deps.getConfig(),
      result: this.deps.getLastScanResult(),
      isTrusted: this.deps.isWorkspaceTrusted(),
      hasWorkspace: Boolean(vscode.workspace.workspaceFolders?.length),
    });
  }

  private async handleMessage(message: SetupMessage): Promise<void> {
    switch (message.command) {
      case "scan":
        await this.deps.scanWorkspace();
        this.refresh();
        return;
      case "generateInstructions":
        await vscode.commands.executeCommand("contextkit.generateInstructions");
        return;
      case "openWorkbenchSettings":
        await vscode.commands.executeCommand("workbench.action.openSettings", "contextkit");
        return;
      case "updateSetting":
        await this.updateSetting(message.key, message.value);
        return;
    }
  }

  private async updateSetting(
    key: keyof ContextKitVSCodeConfig,
    value: boolean | number | string | string[],
  ): Promise<void> {
    if (!editableSettings.has(key)) {
      vscode.window.showErrorMessage(`AgentContextKit: Setting "${key}" cannot be changed here.`);
      return;
    }

    const config = vscode.workspace.getConfiguration("contextkit");
    if (
      (key === "tokenWarningThreshold" || key === "tokenErrorThreshold") &&
      (typeof value !== "number" || !Number.isFinite(value) || value < 1)
    ) {
      vscode.window.showErrorMessage("AgentContextKit: Token thresholds must be positive numbers.");
      this.refresh();
      return;
    }

    await config.update(key, value, vscode.ConfigurationTarget.Workspace);
    this.refresh();
  }
}

interface RenderSetupHtmlOptions {
  cspSource: string;
  nonce: string;
  config: ContextKitVSCodeConfig;
  result: ContextScanResult | undefined;
  isTrusted: boolean;
  hasWorkspace: boolean;
}

export function renderSetupHtml(options: RenderSetupHtmlOptions): string {
  const { cspSource, nonce, config, result, isTrusted, hasWorkspace } = options;
  const issues = result?.issues.length ?? 0;
  const files = result?.files.length ?? 0;
  const health = result?.healthScore;
  const statusLabel = !hasWorkspace
    ? "Open a workspace folder"
    : !isTrusted
      ? "Trust workspace to enable writes"
      : result
        ? "Ready"
        : "Scan needed";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${cspSource}; style-src ${cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';">
  <title>AgentContextKit Setup</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 16px;
      color: var(--vscode-foreground);
      background: var(--vscode-sideBar-background);
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      line-height: 1.45;
    }
    h1, h2, h3, p { margin: 0; }
    h1 { font-size: 18px; font-weight: 650; }
    h2 { margin-top: 20px; font-size: 13px; text-transform: uppercase; letter-spacing: 0; color: var(--vscode-descriptionForeground); }
    h3 { font-size: 13px; font-weight: 650; }
    p { color: var(--vscode-descriptionForeground); }
    button, select, input {
      font: inherit;
    }
    button {
      min-height: 30px;
      border: 1px solid var(--vscode-button-border, transparent);
      border-radius: 4px;
      padding: 5px 10px;
      color: var(--vscode-button-foreground);
      background: var(--vscode-button-background);
      cursor: pointer;
    }
    button:hover { background: var(--vscode-button-hoverBackground); }
    button.secondary {
      color: var(--vscode-button-secondaryForeground);
      background: var(--vscode-button-secondaryBackground);
    }
    button.secondary:hover { background: var(--vscode-button-secondaryHoverBackground); }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      padding-bottom: 14px;
      border-bottom: 1px solid var(--vscode-sideBarSectionHeader-border, var(--vscode-panel-border));
    }
    .badge {
      flex: 0 0 auto;
      border-radius: 999px;
      padding: 2px 8px;
      color: var(--vscode-badge-foreground);
      background: var(--vscode-badge-background);
      font-size: 11px;
      white-space: nowrap;
    }
    .actions {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
      margin-top: 14px;
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
      margin-top: 12px;
    }
    .metric {
      min-width: 0;
      padding: 10px;
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
      background: var(--vscode-editor-background);
    }
    .metric strong {
      display: block;
      font-size: 18px;
      line-height: 1.1;
      overflow-wrap: anywhere;
    }
    .metric span {
      display: block;
      margin-top: 4px;
      color: var(--vscode-descriptionForeground);
      font-size: 11px;
    }
    .setting {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 10px;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid var(--vscode-panel-border);
    }
    .setting:last-child { border-bottom: 0; }
    .setting .control {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .setting input[type="number"], .setting select {
      width: 112px;
      min-height: 28px;
      border: 1px solid var(--vscode-input-border, transparent);
      border-radius: 3px;
      color: var(--vscode-input-foreground);
      background: var(--vscode-input-background);
      padding: 3px 6px;
    }
    .setting input[type="checkbox"] {
      width: 16px;
      height: 16px;
      accent-color: var(--vscode-button-background);
    }
    .note {
      margin-top: 12px;
      padding: 10px;
      border-left: 3px solid var(--vscode-textLink-foreground);
      background: var(--vscode-editor-background);
    }
  </style>
</head>
<body>
  <header class="header">
    <div>
      <h1>AgentContextKit Setup</h1>
      <p>Manage scanning, diagnostics, status, and generation defaults.</p>
    </div>
    <span class="badge">${escapeHtml(statusLabel)}</span>
  </header>

  <section class="actions" aria-label="Setup actions">
    <button data-command="scan" ${hasWorkspace ? "" : "disabled"}>Scan Workspace</button>
    <button data-command="generateInstructions" ${hasWorkspace && isTrusted ? "" : "disabled"}>Generate Instructions</button>
    <button class="secondary" data-command="openWorkbenchSettings">Open VS Code Settings</button>
  </section>

  <section aria-labelledby="workspace-heading">
    <h2 id="workspace-heading">Workspace</h2>
    <div class="metrics">
      <div class="metric"><strong>${files}</strong><span>Files</span></div>
      <div class="metric"><strong>${issues}</strong><span>Issues</span></div>
      <div class="metric"><strong>${health === undefined ? "-" : `${health}%`}</strong><span>Health</span></div>
    </div>
    ${
      isTrusted
        ? ""
        : '<p class="note">Workspace trust is required before AgentContextKit can create instruction files or context packs.</p>'
    }
  </section>

  <section aria-labelledby="automation-heading">
    <h2 id="automation-heading">Automation</h2>
    ${checkboxSetting("autoScanOnOpen", "Scan on activation", "Run a workspace scan when AgentContextKit activates.", config.autoScanOnOpen)}
    ${checkboxSetting("autoScanOnSave", "Scan on instruction save", "Refresh results after supported instruction files are saved.", config.autoScanOnSave)}
  </section>

  <section aria-labelledby="quality-heading">
    <h2 id="quality-heading">Quality Gates</h2>
    ${numberSetting("tokenWarningThreshold", "Warning threshold", "Flag files that are getting large.", config.tokenWarningThreshold)}
    ${numberSetting("tokenErrorThreshold", "Error threshold", "Mark files as oversized when they exceed this estimate.", config.tokenErrorThreshold)}
    ${checkboxSetting("enableDiagnostics", "Editor diagnostics", "Show AgentContextKit issues directly in instruction files.", config.enableDiagnostics)}
    ${checkboxSetting("enableStatusBar", "Status bar", "Show scan status and issue count in the VS Code status bar.", config.enableStatusBar)}
  </section>

  <section aria-labelledby="generation-heading">
    <h2 id="generation-heading">Generation</h2>
    <div class="setting">
      <div>
        <h3>Preferred format</h3>
        <p>Default target for generated instruction files.</p>
      </div>
      <div class="control">
        <select data-setting="preferredInstructionFormat">
          ${["agents", "claude", "cursor", "copilot", "roo"]
            .map(
              (format) =>
                `<option value="${format}" ${config.preferredInstructionFormat === format ? "selected" : ""}>${format}</option>`,
            )
            .join("")}
        </select>
      </div>
    </div>
  </section>

  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();

    document.querySelectorAll("[data-command]").forEach((button) => {
      button.addEventListener("click", () => {
        vscode.postMessage({ command: button.dataset.command });
      });
    });

    document.querySelectorAll("[data-setting]").forEach((control) => {
      const send = () => {
        let value = control.type === "checkbox" ? control.checked : control.value;
        if (control.type === "number") {
          value = Number(control.value);
        }
        vscode.postMessage({
          command: "updateSetting",
          key: control.dataset.setting,
          value
        });
      };
      control.addEventListener(control.type === "number" ? "change" : "input", send);
    });
  </script>
</body>
</html>`;
}

function checkboxSetting(
  key: keyof ContextKitVSCodeConfig,
  label: string,
  description: string,
  checked: boolean,
): string {
  return `<div class="setting">
    <div>
      <h3>${escapeHtml(label)}</h3>
      <p>${escapeHtml(description)}</p>
    </div>
    <div class="control">
      <input type="checkbox" aria-label="${escapeHtml(label)}" data-setting="${key}" ${checked ? "checked" : ""}>
    </div>
  </div>`;
}

function numberSetting(
  key: keyof ContextKitVSCodeConfig,
  label: string,
  description: string,
  value: number,
): string {
  return `<div class="setting">
    <div>
      <h3>${escapeHtml(label)}</h3>
      <p>${escapeHtml(description)}</p>
    </div>
    <div class="control">
      <input type="number" min="1" step="100" aria-label="${escapeHtml(label)}" data-setting="${key}" value="${value}">
    </div>
  </div>`;
}

function getNonce(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let nonce = "";
  for (let i = 0; i < 32; i++) {
    nonce += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return nonce;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
