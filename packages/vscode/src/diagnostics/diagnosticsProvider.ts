import * as vscode from "vscode";
import type { ContextScanResult, ContextIssue } from "@contextkit/core";

export class DiagnosticsProvider implements vscode.Disposable {
  private diagnosticCollection: vscode.DiagnosticCollection;

  constructor() {
    this.diagnosticCollection = vscode.languages.createDiagnosticCollection("contextkit");
  }

  updateDiagnostics(result?: ContextScanResult): void {
    this.diagnosticCollection.clear();

    if (!result) return;

    const issuesByFile = new Map<string, ContextIssue[]>();
    for (const issue of result.issues) {
      if (!issue.filePath) continue;
      const existing = issuesByFile.get(issue.filePath) ?? [];
      existing.push(issue);
      issuesByFile.set(issue.filePath, existing);
    }

    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) return;

    const rootPath = workspaceFolders[0]!.uri.fsPath;

    for (const [filePath, issues] of issuesByFile) {
      const fullPath = `${rootPath}/${filePath}`;
      const uri = vscode.Uri.file(fullPath);
      const diagnostics = issues.map((issue) => {
        const severity =
          issue.severity === "error"
            ? vscode.DiagnosticSeverity.Error
            : issue.severity === "warning"
              ? vscode.DiagnosticSeverity.Warning
              : vscode.DiagnosticSeverity.Information;

        const range = new vscode.Range(
          (issue.line ?? 1) - 1,
          0,
          issue.line ?? 1,
          200,
        );

        const diagnostic = new vscode.Diagnostic(
          range,
          issue.message,
          severity,
        );

        diagnostic.source = "ContextKit";
        diagnostic.code = issue.type;
        return diagnostic;
      });

      this.diagnosticCollection.set(uri, diagnostics);
    }
  }

  dispose(): void {
    this.diagnosticCollection.dispose();
  }
}
