import * as vscode from "vscode";
import type { ContextScanResult } from "@contextkit/core";

type TreeNode = OverviewNode | SectionNode | FileNode | IssueNode | PackNode | ActionNode | TextNode;

interface OverviewNode {
  type: "overview";
  label: string;
  children: TextNode[];
}

interface SectionNode {
  type: "section";
  label: string;
  children: (FileNode | IssueNode | PackNode | ActionNode | TextNode)[];
}

interface TextNode {
  type: "text";
  label: string;
  tooltip?: string;
}

interface FileNode {
  type: "file";
  label: string;
  path: string;
  tokens: number;
  kind: string;
  tooltip?: string;
}

interface IssueNode {
  type: "issue";
  label: string;
  severity: string;
  tooltip?: string;
  issueId: string;
}

interface PackNode {
  type: "pack";
  label: string;
  packType: string;
}

interface ActionNode {
  type: "action";
  label: string;
  command: string;
  tooltip?: string;
  icon?: string;
}

export class ContextKitTreeProvider
  implements vscode.TreeDataProvider<TreeNode>
{
  private _onDidChangeTreeData = new vscode.EventEmitter<
    TreeNode | undefined | void
  >();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private result: ContextScanResult | undefined;

  setResult(result: ContextScanResult): void {
    this.result = result;
    this.refresh();
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: TreeNode): vscode.TreeItem {
    switch (element.type) {
      case "overview":
        return createSectionItem(element.label);
      case "section":
        return createSectionItem(element.label, vscode.TreeItemCollapsibleState.Expanded);
      case "text":
        return createTextItem(element.label, element.tooltip);
      case "file":
        return createFileItem(element);
      case "issue":
        return createIssueItem(element);
      case "pack":
        return createPackItem(element);
      case "action":
        return createActionItem(element);
    }
  }

  getChildren(element?: TreeNode): TreeNode[] {
    if (!this.result) {
      return [
        {
          type: "text",
          label: "No scan results yet.",
          tooltip: "Run ContextKit: Scan Workspace to populate this view.",
        },
        {
          type: "action",
          label: "Scan Workspace",
          command: "contextkit.scanWorkspace",
          tooltip: "Scan workspace for AI instruction files",
          icon: "$(search)",
        },
      ];
    }

    if (!element) {
      return buildRootTree(this.result);
    }

    if (element.type === "overview") {
      return buildOverviewChildren(this.result);
    }

    if (element.type === "section") {
      return this.getSectionChildren(element.label);
    }

    return [];
  }

  private getSectionChildren(label: string): TreeNode[] {
    if (!this.result) return [];

    switch (label) {
      case "Instruction Files":
        return this.result.files.map(
          (f): FileNode => ({
            type: "file",
            label: f.path,
            path: f.path,
            tokens: f.estimatedTokens,
            kind: f.kind,
            tooltip: `${f.estimatedTokens.toLocaleString()} tokens | ${f.kind}`,
          }),
        );
      case "Issues":
        return this.result.issues.map(
          (i): IssueNode => ({
            type: "issue",
            label: i.message,
            severity: i.severity,
            tooltip: i.suggestion ?? i.message,
            issueId: i.id,
          }),
        );
      case "Context Packs":
        return [
          "frontend",
          "backend",
          "database",
          "testing",
          "security",
          "deployment",
        ].map(
          (pack): PackNode => ({
            type: "pack",
            label: capitalize(pack),
            packType: pack,
          }),
        );
      case "Actions":
        return buildActions();
      default:
        return [];
    }
  }
}

function buildRootTree(result: ContextScanResult): TreeNode[] {
  return [
    {
      type: "overview",
      label: "Project Overview",
      children: [],
    },
    {
      type: "section",
      label: "Instruction Files",
      children: [],
    },
    {
      type: "section",
      label: "Issues",
      children: [],
    },
    {
      type: "section",
      label: "Context Packs",
      children: [],
    },
    {
      type: "section",
      label: "Actions",
      children: [],
    },
  ];
}

function buildOverviewChildren(result: ContextScanResult): TextNode[] {
  const errorCount = result.issues.filter((i) => i.severity === "error").length;
  const warningCount = result.issues.filter((i) => i.severity === "warning").length;

  return [
    {
      type: "text",
      label: `Instruction Files: ${result.files.length}`,
    },
    {
      type: "text",
      label: `Estimated Tokens: ${result.totalEstimatedTokens.toLocaleString()}`,
    },
    {
      type: "text",
      label: `Issues: ${errorCount + warningCount} (${errorCount} errors, ${warningCount} warnings)`,
    },
    {
      type: "text",
      label: `Context Health: ${result.healthScore}%`,
    },
  ];
}

function buildActions(): ActionNode[] {
  return [
    {
      type: "action",
      label: "Scan Workspace",
      command: "contextkit.scanWorkspace",
      tooltip: "Scan workspace for AI instruction files",
      icon: "$(search)",
    },
    {
      type: "action",
      label: "Generate Report",
      command: "contextkit.openReport",
      tooltip: "Open a detailed report in a webview",
      icon: "$(preview)",
    },
    {
      type: "action",
      label: "Split Large File",
      command: "contextkit.splitInstructionFile",
      tooltip: "Split a large instruction file into modules",
      icon: "$(split-horizontal)",
    },
    {
      type: "action",
      label: "Convert Format",
      command: "contextkit.convertInstructions",
      tooltip: "Convert between instruction file formats",
      icon: "$(arrow-swap)",
    },
    {
      type: "action",
      label: "Generate Instructions",
      command: "contextkit.generateInstructions",
      tooltip: "Generate project-specific instruction files",
      icon: "$(add)",
    },
  ];
}

function createSectionItem(
  label: string,
  collapsibleState?: vscode.TreeItemCollapsibleState,
): vscode.TreeItem {
  return {
    label,
    collapsibleState: collapsibleState ?? vscode.TreeItemCollapsibleState.Collapsed,
    contextValue: "section",
  };
}

function createTextItem(label: string, tooltip?: string): vscode.TreeItem {
  return {
    label,
    tooltip: tooltip ?? label,
    contextValue: "text",
  };
}

function createFileItem(node: FileNode): vscode.TreeItem {
  const icon = node.tokens > 8000 ? "error" : node.tokens > 4000 ? "warning" : "info";
  return {
    label: node.label,
    tooltip: node.tooltip,
    description: `${node.tokens.toLocaleString()} tokens`,
    iconPath: new vscode.ThemeIcon(icon),
    contextValue: "file",
    command: {
      command: "contextkit.openFile",
      title: "Open File",
      arguments: [node.path],
    },
  };
}

function createIssueItem(node: IssueNode): vscode.TreeItem {
  const icon = node.severity === "error" ? "error" : node.severity === "warning" ? "warning" : "info";
  return {
    label: node.label,
    tooltip: node.tooltip,
    iconPath: new vscode.ThemeIcon(icon),
    contextValue: "issue",
  };
}

function createPackItem(node: PackNode): vscode.TreeItem {
  return {
    label: node.label,
    tooltip: `Create ${node.packType} context pack`,
    iconPath: new vscode.ThemeIcon("package"),
    contextValue: "pack",
    command: {
      command: "contextkit.createContextPack",
      title: "Create Context Pack",
      arguments: [node.packType],
    },
  };
}

function createActionItem(node: ActionNode): vscode.TreeItem {
  return {
    label: node.label,
    tooltip: node.tooltip,
    iconPath: node.icon ? new vscode.ThemeIcon(node.icon.replace(/[$(]/g, "").replace(/[)]/g, "")) : undefined,
    contextValue: "action",
    command: {
      command: node.command,
      title: node.label,
    },
  };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
