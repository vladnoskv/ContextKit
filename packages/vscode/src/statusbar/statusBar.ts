import * as vscode from "vscode";
import type { ContextScanResult } from "@contextkit/core";

export class StatusBarManager implements vscode.Disposable {
  private item: vscode.StatusBarItem;

  constructor() {
    this.item = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100,
    );
    this.item.name = "ContextKit";
    this.item.command = "contextkit.openReport";
  }

  update(result?: ContextScanResult): void {
    if (!result) {
      this.item.text = "$(checklist) ContextKit: idle";
      this.item.tooltip = "Click to scan workspace";
      return;
    }

    const errorCount = result.issues.filter(
      (i) => i.severity === "error",
    ).length;
    const warningCount = result.issues.filter(
      (i) => i.severity === "warning",
    ).length;
    const tokens = formatTokens(result.totalEstimatedTokens);

    const parts: string[] = [];
    parts.push(`$(checklist) ContextKit: ${tokens} tokens`);
    if (errorCount > 0) {
      parts.push(`$(error) ${errorCount}`);
    }
    if (warningCount > 0) {
      parts.push(`$(warning) ${warningCount}`);
    }

    this.item.text = parts.join(" · ");
    this.item.tooltip = createTooltip(result);

    this.item.show();
  }

  show(): void {
    this.item.show();
  }

  hide(): void {
    this.item.hide();
  }

  dispose(): void {
    this.item.dispose();
  }
}

function formatTokens(tokens: number): string {
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}k`;
  }
  return tokens.toString();
}

function createTooltip(result: ContextScanResult): string {
  const lines: string[] = [];
  lines.push(`Files: ${result.files.length}`);
  lines.push(`Tokens: ${result.totalEstimatedTokens.toLocaleString()}`);
  lines.push(`Health: ${result.healthScore}%`);
  lines.push("");
  const errors = result.issues.filter((i) => i.severity === "error").length;
  const warnings = result.issues.filter((i) => i.severity === "warning").length;
  lines.push(`Issues: ${errors} errors, ${warnings} warnings`);
  lines.push("");
  lines.push("Click to open report");
  return lines.join("\n");
}
