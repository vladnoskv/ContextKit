import * as vscode from "vscode";

interface CodeActionDeps {
  isWorkspaceTrusted: () => boolean;
}

export function registerCodeActions(context: vscode.ExtensionContext, deps: CodeActionDeps): void {
  context.subscriptions.push(
    vscode.languages.registerCodeActionsProvider(
      { scheme: "file", language: "markdown" },
      new ContextKitCodeActionProvider(deps),
      {
        providedCodeActionKinds: [vscode.CodeActionKind.QuickFix, vscode.CodeActionKind.Refactor],
      },
    ),
  );
}

class ContextKitCodeActionProvider implements vscode.CodeActionProvider {
  constructor(private deps: CodeActionDeps) {}

  async provideCodeActions(
    document: vscode.TextDocument,
    range: vscode.Range,
    context: vscode.CodeActionContext,
  ): Promise<vscode.CodeAction[]> {
    const actions: vscode.CodeAction[] = [];

    for (const diagnostic of context.diagnostics) {
      if (diagnostic.source !== "AgentContextKit") continue;

      const code = diagnostic.code as string;
      const trusted = this.deps.isWorkspaceTrusted();

      switch (code) {
        case "duplicate_rule": {
          const action = new vscode.CodeAction(
            "Remove duplicate rule",
            vscode.CodeActionKind.QuickFix,
          );
          action.diagnostics = [diagnostic];
          action.command = {
            command: "contextkit.openReport",
            title: "Open AgentContextKit Report",
          };
          action.isPreferred = false;
          actions.push(action);
          break;
        }

        case "conflicting_rule": {
          const openAction = new vscode.CodeAction(
            "Review conflicting rules",
            vscode.CodeActionKind.QuickFix,
          );
          openAction.diagnostics = [diagnostic];
          openAction.command = {
            command: "contextkit.openReport",
            title: "Open AgentContextKit Report",
          };
          openAction.isPreferred = true;
          actions.push(openAction);
          break;
        }

        case "oversized_file": {
          if (trusted) {
            const splitAction = new vscode.CodeAction(
              "Split oversized file",
              vscode.CodeActionKind.Refactor,
            );
            splitAction.diagnostics = [diagnostic];
            splitAction.command = {
              command: "contextkit.splitInstructionFile",
              title: "Split Instruction File",
            };
            splitAction.isPreferred = true;
            actions.push(splitAction);
          }
          break;
        }

        case "missing_recommended_file": {
          if (trusted) {
            const generateAction = new vscode.CodeAction(
              "Generate missing instruction file",
              vscode.CodeActionKind.QuickFix,
            );
            generateAction.diagnostics = [diagnostic];
            generateAction.command = {
              command: "contextkit.generateInstructions",
              title: "Generate Instructions",
            };
            actions.push(generateAction);
          }
          break;
        }

        case "invalid_format": {
          const openAction = new vscode.CodeAction(
            "Open file to fix format",
            vscode.CodeActionKind.QuickFix,
          );
          openAction.diagnostics = [diagnostic];
          openAction.command = {
            command: "vscode.open",
            title: "Open File",
            arguments: [document.uri],
          };
          actions.push(openAction);
          break;
        }

        case "broken_link": {
          const openAction = new vscode.CodeAction(
            "Open file to fix broken link",
            vscode.CodeActionKind.QuickFix,
          );
          openAction.diagnostics = [diagnostic];
          openAction.command = {
            command: "vscode.open",
            title: "Open File",
            arguments: [document.uri],
          };
          actions.push(openAction);
          break;
        }
      }
    }

    return actions;
  }
}
