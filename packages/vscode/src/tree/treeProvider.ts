import * as vscode from "vscode";
import type { ContextScanResult, BuiltinSkill, InstalledSkill, SkillGroupDefinition } from "@contextkit/core";
import {
  getRecommendedSkills as coreGetRecommendedSkills,
  getSkill as coreGetSkill,
  getSkillsByCategory as coreGetSkillsByCategory,
  resolveGroupSkills as coreResolveGroupSkills,
} from "@contextkit/core";


type TreeNode = OverviewNode | SectionNode | FileNode | IssueNode | PackNode | ActionNode | TextNode | SkillNode | SkillGroupNode | SkillCategoryNode;

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

interface SkillNode {
  type: "skill";
  label: string;
  skillName: string;
  title: string;
  installed?: boolean;
}

interface SkillGroupNode {
  type: "skillGroup";
  label: string;
  groupId: string;
}

interface SkillCategoryNode {
  type: "skillCategory";
  label: string;
  categoryId: string;
}

export class ContextKitTreeProvider
  implements vscode.TreeDataProvider<TreeNode>
{
  private _onDidChangeTreeData = new vscode.EventEmitter<
    TreeNode | undefined | void
  >();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private result: ContextScanResult | undefined;
  private installedSkills: InstalledSkill[] = [];

  setResult(result: ContextScanResult): void {
    this.result = result;
    this.refresh();
  }

  setInstalledSkills(skills: InstalledSkill[]): void {
    this.installedSkills = skills;
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
      case "skill":
        return createSkillItem(element);
      case "skillGroup":
        return createSkillGroupItem(element);
      case "skillCategory":
        return createSkillCategoryItem(element);
    }
  }

  getChildren(element?: TreeNode): TreeNode[] {
    if (!this.result) {
      return [
        {
          type: "text",
          label: "No scan results yet.",
          tooltip: "Run AgentContextKit: Scan Workspace to populate this view.",
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

    if (element.type === "skillGroup") {
      return this.getSkillsGroupChildren(element.groupId);
    }

    if (element.type === "skillCategory") {
      return this.getSkillsCategoryChildren(element.categoryId);
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
      case "Skills":
        return [
          {
            type: "skillGroup",
            label: "Installed Skills",
            groupId: "__installed__",
          } as SkillGroupNode,
          {
            type: "skillGroup",
            label: "Recommended Skills",
            groupId: "__recommended__",
          } as SkillGroupNode,
          {
            type: "text",
            label: "",
          } as TextNode,
          {
            type: "skillGroup",
            label: "Browse Skills",
            groupId: "__browse__",
          } as SkillGroupNode,
          {
            type: "action",
            label: "Search Skills",
            command: "contextkit.skillsSearch",
            tooltip: "Search the skill library",
            icon: "$(search)",
          } as ActionNode,
        ];
      case "Actions":
        return buildActions();
      default:
        return [];
    }
  }

  private getSkillsGroupChildren(groupId: string): TreeNode[] {
    if (groupId === "__installed__") return this.getInstalledSkillNodes();
    if (groupId === "__recommended__") return this.getRecommendedSkillNodes();
    if (groupId === "__browse__") return this.getBrowseSkillNodes();
    return this.getGroupSkillNodes(groupId);
  }

  private getInstalledSkillNodes(): TreeNode[] {
    if (this.installedSkills.length > 0) {
      return [
        ...this.installedSkills.map(
          (skill): SkillNode => ({
            type: "skill",
            label: skill.name,
            skillName: skill.name,
            title: skill.title,
            installed: true,
          }),
        ),
        {
          type: "action",
          label: "Add Skills...",
          command: "contextkit.skillsSearch",
          tooltip: "Search and install more skills",
          icon: "$(add)",
        },
      ];
    }

    return [
      {
        type: "action",
        label: "Add Skills...",
        command: "contextkit.skillsSearch",
        tooltip: "Search and install skills",
        icon: "$(add)",
      },
    ];
  }

  private getRecommendedSkillNodes(): TreeNode[] {
    if (this.result) {
      const installedNames = new Set(this.installedSkills.map((skill) => skill.name));
      const recommended = coreGetRecommendedSkills(this.result.detectedProject)
        .filter((name) => !installedNames.has(name))
        .map((name) => coreGetSkill(name))
        .filter(Boolean) as BuiltinSkill[];

      if (recommended.length > 0) {
        return recommended.map(
          (skill): SkillNode => ({
            type: "skill",
            label: skill.name,
            skillName: skill.name,
            title: skill.title,
            installed: false,
          }),
        );
      }
    }

    return [
      {
        type: "action",
        label: "Open Skills Wizard...",
        command: "contextkit.skillsWizard",
        tooltip: "Install skills for this workspace",
        icon: "$(add)",
      },
    ];
  }

  private getBrowseSkillNodes(): TreeNode[] {
    return [
      { type: "skillCategory", label: "Core Engineering", categoryId: "core-engineering" } as SkillCategoryNode,
      { type: "skillCategory", label: "Frontend", categoryId: "frontend" } as SkillCategoryNode,
      { type: "skillCategory", label: "Backend & API", categoryId: "backend-api" } as SkillCategoryNode,
      { type: "skillCategory", label: "Database", categoryId: "database" } as SkillCategoryNode,
      { type: "skillCategory", label: "Security", categoryId: "security" } as SkillCategoryNode,
      { type: "skillCategory", label: "DevOps & CI/CD", categoryId: "devops" } as SkillCategoryNode,
      { type: "skillCategory", label: "Package & Open Source", categoryId: "package-open-source" } as SkillCategoryNode,
      { type: "skillCategory", label: "AI Coding Workflow", categoryId: "ai-coding-workflow" } as SkillCategoryNode,
      { type: "skillCategory", label: "Framework Specific", categoryId: "framework-specific" } as SkillCategoryNode,
      { type: "skillCategory", label: "Testing", categoryId: "testing" } as SkillCategoryNode,
    ];
  }

  private getSkillsCategoryChildren(categoryId: string): TreeNode[] {
    try {
      const skills = coreGetSkillsByCategory(categoryId as any) as BuiltinSkill[];
      return skills.map((s) => ({
        type: "skill" as const,
        label: s.name,
        skillName: s.name,
        title: s.title,
      }));
    } catch {
      return [];
    }
  }

  private getGroupSkillNodes(groupId: string): TreeNode[] {
    try {
      const names = coreResolveGroupSkills([groupId]) as string[];
      return names.map((name) => ({
        type: "skill" as const,
        label: name,
        skillName: name,
        title: name,
      }));
    } catch {
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
      label: "Skills",
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
      label: "Open WebView",
      command: "contextkit.openWebview",
      tooltip: "Open the AgentContextKit dashboard webview",
      icon: "$(window)",
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

function createSkillItem(node: SkillNode): vscode.TreeItem {
  return {
    label: node.title || node.skillName,
    description: node.skillName,
    tooltip: `Skill: ${node.skillName}\n${node.installed ? "Installed" : "Click to preview and install"}`,
    iconPath: new vscode.ThemeIcon(node.installed ? "check" : "book"),
    contextValue: "skill",
    command: {
      command: "contextkit.skillsPreview",
      title: "Preview Skill",
      arguments: [node.skillName],
    },
  };
}

function createSkillGroupItem(node: SkillGroupNode): vscode.TreeItem {
  const icon = node.groupId === "__installed__" ? "checklist"
    : node.groupId === "__recommended__" ? "lightbulb"
    : node.groupId === "__browse__" ? "library"
    : "folder";
  return {
    label: node.label,
    collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
    iconPath: new vscode.ThemeIcon(icon),
    contextValue: "skillGroup",
  };
}

function createSkillCategoryItem(node: SkillCategoryNode): vscode.TreeItem {
  return {
    label: node.label,
    collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
    iconPath: new vscode.ThemeIcon("folder-library"),
    contextValue: "skillCategory",
  };
}
