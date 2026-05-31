import * as vscode from "vscode";
import type { ContextScanResult, ContextPackType } from "@contextkit/core";
import type { ContextKitVSCodeConfig } from "../config/settings.js";

interface CommandDeps {
  getLastScanResult: () => ContextScanResult | undefined;
  setLastScanResult: (r: ContextScanResult) => void;
  refreshTree: () => void;
  refreshDiagnostics: () => void;
  refreshStatusBar: () => void;
  scanWorkspace: () => Promise<ContextScanResult | undefined>;
  getConfig: () => ContextKitVSCodeConfig;
}

export function registerCommands(
  context: vscode.ExtensionContext,
  deps: CommandDeps,
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("contextkit.scanWorkspace", async () => {
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "ContextKit: Scanning workspace...",
          cancellable: false,
        },
        async () => {
          const result = await deps.scanWorkspace();
          if (result) {
            vscode.window.showInformationMessage(
              `ContextKit: Found ${result.files.length} instruction file(s). ${result.issues.length} issue(s). Health: ${result.healthScore}%`,
            );
          }
        },
      );
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("contextkit.refresh", async () => {
      await deps.scanWorkspace();
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("contextkit.openReport", async () => {
      const result = deps.getLastScanResult();
      if (!result) {
        const scanned = await deps.scanWorkspace();
        if (!scanned) return;
        openWebviewReport(scanned, context);
        return;
      }
      openWebviewReport(result, context);
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "contextkit.generateInstructions",
      async () => {
        const format = deps.getConfig().preferredInstructionFormat;
        const result = deps.getLastScanResult();
        if (!result) {
          vscode.window.showWarningMessage(
            "Run a scan first to detect the project.",
          );
          return;
        }

        const { generateInstructions } = await import("@contextkit/core");
        const output = generateInstructions({
          rootDir: result.rootDir,
          targetKind: format as any,
          detectedProject: result.detectedProject,
          existingFiles: result.files,
        });

        const doc = await vscode.workspace.openTextDocument({
          content: output.content,
          language: "markdown",
        });
        await vscode.window.showTextDocument(doc);

        const save = await vscode.window.showInformationMessage(
          `Save generated ${format} instructions?`,
          "Yes",
          "No",
        );
        if (save === "Yes") {
          const uri = vscode.Uri.file(output.targetPath);
          await vscode.workspace.fs.writeFile(
            uri,
            Buffer.from(output.content, "utf-8"),
          );
          vscode.window.showInformationMessage(
            `Saved: ${output.targetPath}`,
          );
        }
      },
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "contextkit.splitInstructionFile",
      async () => {
        const result = deps.getLastScanResult();
        const oversized = result?.files.filter(
          (f) => f.estimatedTokens > 4000,
        );
        const files = oversized?.map((f) => f.path) ?? ["AGENTS.md"];

        const picked = await vscode.window.showQuickPick(files, {
          placeHolder: "Select a file to split",
          title: "ContextKit: Split Instruction File",
        });

        if (!picked) return;

        const confirm = await vscode.window.showWarningMessage(
          `Split "${picked}" into modular files? A backup will be created.`,
          { modal: true },
          "Split",
          "Cancel",
        );

        if (confirm !== "Split") return;

        vscode.window.showInformationMessage("Splitting... (not yet implemented in VS Code)");
      },
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "contextkit.convertInstructions",
      async () => {
        const targetFormats = ["agents", "claude", "copilot", "cursor", "roo"];

        const result = deps.getLastScanResult();
        const files = result?.files.map((f) => f.path) ?? [];

        const picked = await vscode.window.showQuickPick(files, {
          placeHolder: "Select a file to convert",
          title: "ContextKit: Convert Instructions",
        });

        if (!picked) return;

        const target = await vscode.window.showQuickPick(targetFormats, {
          placeHolder: "Select target format",
          title: "ContextKit: Convert Instructions",
        });

        if (!target) return;

        const { convertInstructions, createNodeFileSystemAdapter, detectInstructionKind } = await import("@contextkit/core");
        const fs = createNodeFileSystemAdapter();
        const rootDir = result?.rootDir ?? "";
        const fullPath = `${rootDir}/${picked}`;
        const content = await fs.readFile(fullPath);

        const output = convertInstructions({
          sourcePath: picked,
          sourceContent: content,
          sourceKind: detectInstructionKind(picked),
          targetKind: target as any,
        });

        const doc = await vscode.workspace.openTextDocument({
          content: output.content,
          language: "markdown",
        });
        await vscode.window.showTextDocument(doc);

        const save = await vscode.window.showInformationMessage(
          `Save converted file as ${output.targetPath}?`,
          "Yes",
          "No",
        );
        if (save === "Yes") {
          const uri = vscode.Uri.file(`${rootDir}/${output.targetPath}`);
          await vscode.workspace.fs.writeFile(
            uri,
            Buffer.from(output.content, "utf-8"),
          );
          vscode.window.showInformationMessage(
            `Saved: ${output.targetPath}`,
          );
        }
      },
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "contextkit.createContextPack",
      async (packType?: string) => {
        const packs = packType
          ? [packType]
          : ["frontend", "backend", "database", "testing", "security", "deployment"];
        const picked =
          packs.length === 1
            ? packs[0]
            : await vscode.window.showQuickPick(packs, {
                placeHolder: "Select pack type",
                title: "ContextKit: Create Context Pack",
              });

        if (!picked) return;

        const result = deps.getLastScanResult();
        if (!result) {
          const scanned = await deps.scanWorkspace();
          if (!scanned) return;
          generateAndShowPack(picked as ContextPackType, scanned);
          return;
        }
        generateAndShowPack(picked as ContextPackType, result);
      },
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("contextkit.openSettings", () => {
      vscode.commands.executeCommand(
        "workbench.action.openSettings",
        "contextkit",
      );
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      "contextkit.openFile",
      async (filePath: string) => {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) return;

        const rootPath = workspaceFolders[0]!.uri.fsPath;
        const uri = vscode.Uri.file(`${rootPath}/${filePath}`);
        const doc = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(doc);
      },
    ),
  );
}

async function generateAndShowPack(
  packType: ContextPackType,
  result: ContextScanResult,
): Promise<void> {
  const { createContextPack } = await import("@contextkit/core");
  const pack = createContextPack({
    rootDir: result.rootDir,
    packType,
    files: result.files,
    detectedProject: result.detectedProject,
  });

  const doc = await vscode.workspace.openTextDocument({
    content: pack.content,
    language: "markdown",
  });
  await vscode.window.showTextDocument(doc);
}

function openWebviewReport(
  result: ContextScanResult,
  context: vscode.ExtensionContext,
): void {
  const panel = vscode.window.createWebviewPanel(
    "contextkit.report",
    "ContextKit Report",
    vscode.ViewColumn.One,
    {
      enableScripts: false,
      localResourceRoots: [],
    },
  );

  panel.webview.html = generateReportHtml(result);

  panel.webview.onDidReceiveMessage(() => {});
}

function generateReportHtml(result: ContextScanResult): string {
  const errorCount = result.issues.filter(
    (i) => i.severity === "error",
  ).length;
  const warningCount = result.issues.filter(
    (i) => i.severity === "warning",
  ).length;
  const infoCount = result.issues.filter(
    (i) => i.severity === "info",
  ).length;

  const healthColor =
    result.healthScore >= 80
      ? "#4caf50"
      : result.healthScore >= 50
        ? "#ff9800"
        : "#f44336";

  const issueRows = result.issues
    .map(
      (i) => `
    <tr>
      <td>${severityBadge(i.severity)}</td>
      <td>${escapeHtml(i.message)}</td>
      <td>${i.filePath ? `<code>${escapeHtml(i.filePath)}</code>` : "-"}</td>
    </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline';">
  <title>ContextKit Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: var(--vscode-editor-background, #1e1e1e);
      color: var(--vscode-editor-foreground, #cccccc);
      padding: 20px;
      line-height: 1.6;
    }
    h1 { font-size: 24px; margin-bottom: 20px; }
    h2 { font-size: 18px; margin: 20px 0 10px; border-bottom: 1px solid var(--vscode-panel-border, #444); padding-bottom: 5px; }
    .overview { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .card {
      background: var(--vscode-input-background, #2d2d2d);
      border: 1px solid var(--vscode-panel-border, #444);
      border-radius: 8px;
      padding: 16px;
      text-align: center;
    }
    .card .value { font-size: 32px; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    th, td { padding: 8px 12px; text-align: left; border-bottom: 1px solid var(--vscode-panel-border, #444); }
    th { background: var(--vscode-input-background, #2d2d2d); font-weight: 600; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; }
    .badge-error { background: rgba(244, 67, 54, 0.2); color: #f44336; }
    .badge-warning { background: rgba(255, 152, 0, 0.2); color: #ff9800; }
    .badge-info { background: rgba(33, 150, 243, 0.2); color: #2196f3; }
    code {
      background: var(--vscode-input-background, #2d2d2d);
      padding: 1px 6px;
      border-radius: 3px;
      font-family: 'Cascadia Code', 'Fira Code', monospace;
      font-size: 13px;
    }
    .files-table td:first-child { font-family: monospace; }
  </style>
</head>
<body>
  <h1>ContextKit Report</h1>
  <p>Generated: ${escapeHtml(result.scannedAt)}</p>
  <p>Root: <code>${escapeHtml(result.rootDir)}</code></p>

  <h2>Overview</h2>
  <div class="overview">
    <div class="card">
      <div class="value">${result.files.length}</div>
      <div>Instruction Files</div>
    </div>
    <div class="card">
      <div class="value">${result.totalEstimatedTokens.toLocaleString()}</div>
      <div>Estimated Tokens</div>
    </div>
    <div class="card">
      <div class="value" style="color: ${healthColor}">${result.healthScore}%</div>
      <div>Health Score</div>
    </div>
    <div class="card">
      <div class="value">${errorCount + warningCount}</div>
      <div>Issues</div>
    </div>
  </div>

  <h2>Detected Project</h2>
  <table>
    <tr><td>Package Manager</td><td>${result.detectedProject.packageManager ?? "Not detected"}</td></tr>
    <tr><td>Frameworks</td><td>${result.detectedProject.frameworks.join(", ") || "Not detected"}</td></tr>
    <tr><td>Languages</td><td>${result.detectedProject.languages.join(", ") || "Not detected"}</td></tr>
    <tr><td>Test Tools</td><td>${result.detectedProject.testTools.join(", ") || "Not detected"}</td></tr>
    <tr><td>CI/CD</td><td>${result.detectedProject.hasCi ? "Yes" : "No"}</td></tr>
    <tr><td>Docker</td><td>${result.detectedProject.hasDocker ? "Yes" : "No"}</td></tr>
    <tr><td>DB Migrations</td><td>${result.detectedProject.hasDatabaseMigrations ? "Yes" : "No"}</td></tr>
  </table>

  <h2>Instruction Files</h2>
  ${result.files.length > 0
    ? `<table class="files-table">
    <thead><tr><th>File</th><th>Kind</th><th>Tokens</th><th>Size</th></tr></thead>
    <tbody>${result.files
      .map(
        (f) => `<tr>
          <td><code>${escapeHtml(f.path)}</code></td>
          <td>${f.kind}</td>
          <td>${f.estimatedTokens.toLocaleString()}</td>
          <td>${formatBytes(f.sizeBytes)}</td>
        </tr>`,
      )
      .join("")}</tbody></table>`
    : "<p>No instruction files found.</p>"}

  ${result.issues.length > 0
    ? `<h2>Issues (${result.issues.length})</h2>
    <table>
      <thead><tr><th>Severity</th><th>Message</th><th>File</th></tr></thead>
      <tbody>${issueRows}</tbody></table>`
    : "<h2>Issues</h2><p>No issues found.</p>"}

  <h2>Suggested Actions</h2>
  <ul>
    ${result.issues
      .filter((i) => i.suggestion)
      .slice(0, 10)
      .map((i) => `<li>${escapeHtml(i.suggestion!)}</li>`)
      .join("")}
    ${result.issues.every((i) => !i.suggestion) ? "<li>No actions needed.</li>" : ""}
  </ul>

  <p style="margin-top: 20px; opacity: 0.6; font-size: 12px;">
    ContextKit - AI Coding Context Manager. Privacy-first. No data is sent externally.
  </p>
</body>
</html>`;
}

function severityBadge(severity: string): string {
  switch (severity) {
    case "error":
      return '<span class="badge badge-error">Error</span>';
    case "warning":
      return '<span class="badge badge-warning">Warning</span>';
    case "info":
      return '<span class="badge badge-info">Info</span>';
    default:
      return "";
  }
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
