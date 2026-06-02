import * as vscode from "vscode";
import * as path from "node:path";
import type { ContextScanResult, ContextPackType, InstructionFileKind, InstalledSkill } from "@contextkit/core";
import type { ContextKitVSCodeConfig } from "../config/settings.js";

interface CommandDeps {
  getLastScanResult: () => ContextScanResult | undefined;
  getInstalledSkills: () => InstalledSkill[];
  setLastScanResult: (r: ContextScanResult) => void;
  refreshInstalledSkills: () => Promise<void>;
  refreshTree: () => void;
  refreshSetupView: () => void;
  refreshDiagnostics: () => void;
  refreshStatusBar: () => void;
  scanWorkspace: () => Promise<ContextScanResult | undefined>;
  getConfig: () => ContextKitVSCodeConfig;
  isWorkspaceTrusted: () => boolean;
}

export function registerCommands(context: vscode.ExtensionContext, deps: CommandDeps): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("contextkit.scanWorkspace", async () => {
      vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "AgentContextKit: Scanning workspace...",
          cancellable: false,
        },
        async () => {
          const result = await deps.scanWorkspace();
          if (result) {
            vscode.window.showInformationMessage(
              `AgentContextKit: Found ${result.files.length} instruction file(s). ${result.issues.length} issue(s). Health: ${result.healthScore}%`,
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
    vscode.commands.registerCommand("contextkit.openWebview", async () => {
      const result = deps.getLastScanResult() ?? await deps.scanWorkspace();
      await deps.refreshInstalledSkills();
      openDashboardWebview({
        result,
        installedSkills: deps.getInstalledSkills(),
        isTrusted: deps.isWorkspaceTrusted(),
        hasWorkspace: Boolean(vscode.workspace.workspaceFolders?.length),
      });
    }),
  );

  // Generate instruction file
  context.subscriptions.push(
    vscode.commands.registerCommand("contextkit.generateInstructions", async () => {
      if (!deps.isWorkspaceTrusted()) {
        vscode.window.showErrorMessage(
          "AgentContextKit: Write operations are disabled in untrusted workspaces.",
        );
        return;
      }

      const configuredFormat = deps.getConfig().preferredInstructionFormat;
      const format = isInstructionFileKind(configuredFormat) ? configuredFormat : "agents";
      const result = deps.getLastScanResult();
      if (!result) {
        vscode.window.showWarningMessage("Run a scan first to detect the project.");
        return;
      }

      const { generateInstructions } = await import("@contextkit/core");
      const output = generateInstructions({
        rootDir: result.rootDir,
        targetKind: format,
        detectedProject: result.detectedProject,
        existingFiles: result.files,
      });

      const doc = await vscode.workspace.openTextDocument({
        content: output.content,
        language: "markdown",
      });
      await vscode.window.showTextDocument(doc);

      const save = await vscode.window.showInformationMessage(
        `Save generated ${format} instructions to ${output.suggestedPath}?`,
        "Yes",
        "No",
      );
      if (save === "Yes") {
        await saveWorkspaceFile(output.suggestedPath, output.content, {
          successMessage: `Created: ${output.suggestedPath}`,
          openAfterSave: true,
        });
      }
    }),
  );

  // Split instruction file
  context.subscriptions.push(
    vscode.commands.registerCommand("contextkit.splitInstructionFile", async () => {
      if (!deps.isWorkspaceTrusted()) {
        vscode.window.showErrorMessage(
          "AgentContextKit: Write operations are disabled in untrusted workspaces.",
        );
        return;
      }

      const result = deps.getLastScanResult();
      const oversized = result?.files.filter((f) => f.estimatedTokens > 4000);
      const files =
        (oversized?.length ?? 0) > 0
          ? oversized!.map((f) => f.path)
          : (result?.files.map((f) => f.path) ?? ["AGENTS.md"]);

      const picked = await vscode.window.showQuickPick(files, {
        placeHolder: "Select a file to split",
        title: "AgentContextKit: Split Instruction File",
      });

      if (!picked) return;

      const confirm = await vscode.window.showWarningMessage(
        `Split "${picked}" into modular files? A backup will be created first.`,
        { modal: true },
        "Split",
        "Cancel",
      );

      if (confirm !== "Split") return;

      const { splitInstructionFile, createNodeFileSystemAdapter, detectInstructionKind } =
        await import("@contextkit/core");

      const fs = createNodeFileSystemAdapter();
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders || workspaceFolders.length === 0) return;
      const rootUri = workspaceFolders[0]!.uri;
      const rootDir = result?.rootDir ?? rootUri.fsPath;
      const fullPath = resolvePathWithin(rootDir, picked);
      if (!fullPath) {
        vscode.window.showErrorMessage(`Cannot read outside workspace: ${picked}`);
        return;
      }

      let content: string;
      try {
        content = await fs.readFile(fullPath);
      } catch {
        vscode.window.showErrorMessage(`Cannot read: ${picked}`);
        return;
      }

      const dotDir = picked.startsWith(".")
        ? picked.split("/").slice(0, -1).join("/") || picked.replace(/\.md$/i, "")
        : `.${picked.replace(/\.md$/i, "")}`;
      const outputDir = `${dotDir}/docs`;

      const kind = detectInstructionKind(picked);
      const splitResult = splitInstructionFile({
        filePath: picked,
        content,
        outputDir,
        kind,
      });

      const edit = new vscode.WorkspaceEdit();
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

      // Create backup
      const backupUri = getWorkspaceFileUri(rootUri, `${splitResult.backupPath}.${timestamp}`);
      if (!backupUri) {
        vscode.window.showErrorMessage(
          `Cannot write outside workspace: ${splitResult.backupPath}.${timestamp}`,
        );
        return;
      }
      edit.createFile(backupUri, { overwrite: false });
      edit.insert(backupUri, new vscode.Position(0, 0), content);

      // Write modules
      for (const mod of splitResult.modules) {
        const modUri = getWorkspaceFileUri(rootUri, mod.path);
        if (!modUri) {
          vscode.window.showErrorMessage(`Cannot write outside workspace: ${mod.path}`);
          return;
        }
        edit.createFile(modUri, { overwrite: false });
        edit.insert(modUri, new vscode.Position(0, 0), mod.content);
      }

      // Update root file
      const rootFileUri = getWorkspaceFileUri(rootUri, picked);
      if (!rootFileUri) {
        vscode.window.showErrorMessage(`Cannot write outside workspace: ${picked}`);
        return;
      }
      const existingDoc = vscode.workspace.textDocuments.find(
        (d) => d.uri.fsPath === rootFileUri.fsPath,
      );
      if (existingDoc) {
        const fullRange = new vscode.Range(0, 0, existingDoc.lineCount, 0);
        edit.replace(rootFileUri, fullRange, splitResult.rootContent);
      } else {
        edit.createFile(rootFileUri, { overwrite: true });
        edit.insert(rootFileUri, new vscode.Position(0, 0), splitResult.rootContent);
      }

      const applied = await vscode.workspace.applyEdit(edit);
      if (applied) {
        if (result) {
          const updated = updateScanResultAfterSplit(
            result,
            picked,
            splitResult,
            detectInstructionKind,
          );
          deps.setLastScanResult(updated);
          deps.refreshTree();
          deps.refreshSetupView();
          deps.refreshDiagnostics();
          deps.refreshStatusBar();
        } else {
          await deps.scanWorkspace();
        }
        vscode.window.showInformationMessage(
          `Split "${picked}" into ${splitResult.modules.length} modules. Backup at ${splitResult.backupPath}.${timestamp}`,
        );
        // Open the router file
        const doc = await vscode.workspace.openTextDocument(rootFileUri);
        await vscode.window.showTextDocument(doc);
      } else {
        vscode.window.showErrorMessage(
          "Failed to apply split edits. One or more target files may already exist.",
        );
      }
    }),
  );

  // Convert instructions
  context.subscriptions.push(
    vscode.commands.registerCommand("contextkit.convertInstructions", async () => {
      const targetFormats: InstructionFileKind[] = ["agents", "claude", "copilot", "cursor", "roo"];

      const result = deps.getLastScanResult();
      const files = result?.files.map((f) => f.path) ?? [];

      const picked = await vscode.window.showQuickPick(files, {
        placeHolder: "Select a file to convert",
        title: "AgentContextKit: Convert Instructions",
      });

      if (!picked) return;

      const target = await vscode.window.showQuickPick(targetFormats, {
        placeHolder: "Select target format",
        title: "AgentContextKit: Convert Instructions",
      });

      if (!target || !isInstructionFileKind(target)) return;

      const { convertInstructions, createNodeFileSystemAdapter, detectInstructionKind } =
        await import("@contextkit/core");
      const fs = createNodeFileSystemAdapter();
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders || workspaceFolders.length === 0) return;
      const rootDir = result?.rootDir ?? workspaceFolders[0]!.uri.fsPath;
      const fullPath = resolvePathWithin(rootDir, picked);
      if (!fullPath) {
        vscode.window.showErrorMessage(`Cannot read outside workspace: ${picked}`);
        return;
      }

      let content: string;
      try {
        content = await fs.readFile(fullPath);
      } catch {
        vscode.window.showErrorMessage(`Cannot read: ${picked}`);
        return;
      }

      const output = convertInstructions({
        sourcePath: picked,
        sourceContent: content,
        sourceKind: detectInstructionKind(picked),
        targetKind: target,
      });

      const doc = await vscode.workspace.openTextDocument({
        content: output.content,
        language: "markdown",
      });
      await vscode.window.showTextDocument(doc);

      if (!deps.isWorkspaceTrusted()) {
        vscode.window.showWarningMessage(
          "Workspace is not trusted. Preview only — save is disabled.",
        );
        return;
      }

      const save = await vscode.window.showInformationMessage(
        `Save converted file as ${output.targetPath}?`,
        "Yes",
        "No",
      );
      if (save === "Yes") {
        await saveWorkspaceFile(output.targetPath, output.content, {
          successMessage: `Saved: ${output.targetPath}`,
        });
      }
    }),
  );

  // Create context pack
  context.subscriptions.push(
    vscode.commands.registerCommand("contextkit.createContextPack", async (packType?: string) => {
      const packs: ContextPackType[] = isContextPackType(packType)
        ? [packType]
        : ["frontend", "backend", "database", "testing", "security", "deployment"];
      const picked =
        packs.length === 1
          ? packs[0]
          : await vscode.window.showQuickPick(packs, {
              placeHolder: "Select pack type",
              title: "AgentContextKit: Create Context Pack",
            });

      if (!picked || !isContextPackType(picked)) return;

      const result = deps.getLastScanResult();
      if (!result) {
        const scanned = await deps.scanWorkspace();
        if (!scanned) return;
        generateAndShowPack(picked, scanned, deps);
        return;
      }
      generateAndShowPack(picked, result, deps);
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("contextkit.openSettings", async () => {
      await vscode.commands.executeCommand("contextkit.setup.focus");
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("contextkit.openFile", async (filePath?: string) => {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders || workspaceFolders.length === 0) return;
      if (!filePath) return;

      const rootPath = workspaceFolders[0]!.uri.fsPath;
      const uri = resolveWorkspaceUri(rootPath, filePath);
      if (!uri) {
        vscode.window.showErrorMessage(
          `AgentContextKit: Refusing to open a file outside the workspace: ${filePath}`,
        );
        return;
      }

      try {
        const doc = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(doc);
      } catch {
        // file might not exist yet
      }
    }),
  );

  // ── Skills Commands ──

  context.subscriptions.push(
    vscode.commands.registerCommand("contextkit.skillsSearch", async () => {
      const { listSkills } = await import("@contextkit/core");
      const allSkills = listSkills();
      const items = allSkills.map((s) => ({
        label: `${s.name}`,
        description: s.title,
        detail: s.description,
      }));
      const picked = await vscode.window.showQuickPick(items, {
        placeHolder: "Search skills...",
        title: "AgentContextKit: Skills",
        matchOnDescription: true,
        matchOnDetail: true,
      });
      if (picked) {
        await vscode.commands.executeCommand("contextkit.skillsPreview", picked.label);
      }
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("contextkit.skillsWizard", async (initialSkillName?: string) => {
      if (!deps.isWorkspaceTrusted()) {
        vscode.window.showErrorMessage("AgentContextKit: Write operations disabled in untrusted workspaces.");
        return;
      }
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showWarningMessage("AgentContextKit: Open a workspace folder before installing skills.");
        return;
      }

      const {
        getSkill,
        getSkillCatalog,
        installSkills,
        createNodeFileSystemAdapter,
        resolveSkillSelection,
      } = await import("@contextkit/core");
      const catalog = getSkillCatalog();
      const panel = vscode.window.createWebviewPanel(
        "contextkit.skillsWizard",
        "AgentContextKit Skill Install Wizard",
        vscode.ViewColumn.One,
        { enableScripts: true, localResourceRoots: [] },
      );

      panel.webview.html = generateSkillsWizardHtml({
        catalog,
        initialSkillName,
        selectedSkill: initialSkillName ? getSkill(initialSkillName) : undefined,
      });

      panel.webview.onDidReceiveMessage(async (msg) => {
        if (msg.command === "previewSkill") {
          panel.webview.postMessage({
            command: "skillPreview",
            skill: typeof msg.name === "string" ? getSkill(msg.name) : undefined,
          });
          return;
        }

        if (msg.command === "install") {
          const selection = normalizeSkillWizardSelection(msg.selection);
          const selected = resolveSkillSelection(selection);
          if (selected.length === 0) {
            vscode.window.showWarningMessage("AgentContextKit: Select at least one skill to install.");
            return;
          }

          const fs = createNodeFileSystemAdapter();
          const providerModel = parseProviderModel(typeof msg.providerModel === "string" ? msg.providerModel : undefined);
          const result = await installSkills({
            rootDir: workspaceFolders[0]!.uri.fsPath,
            skills: selected,
            dryRun: false,
            provider: providerModel.provider,
            model: providerModel.model,
            updateInstructionFiles: Boolean(msg.updateInstructionFiles),
            targetFormat: typeof msg.targetFormat === "string" ? msg.targetFormat as any : undefined,
          }, fs);
          panel.webview.postMessage({ command: "installed", result });
          await deps.refreshInstalledSkills();
          deps.refreshTree();
          deps.refreshSetupView();
        }
      });
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("contextkit.skillsPreview", async (skillName?: string) => {
      if (!skillName) return;
      const { getSkill } = await import("@contextkit/core");
      const skill = getSkill(skillName);
      if (!skill) {
        vscode.window.showErrorMessage(`Skill "${skillName}" not found.`);
        return;
      }

      const workspaceFolders = vscode.workspace.workspaceFolders;
      let installed = false;
      if (workspaceFolders && workspaceFolders.length > 0) {
        try {
          const { getInstalledSkills, createNodeFileSystemAdapter } = await import("@contextkit/core");
          const fs = createNodeFileSystemAdapter();
          const skills = await getInstalledSkills(workspaceFolders[0]!.uri.fsPath, fs);
          installed = skills.some((s) => s.name === skillName);
        } catch {}
      }

      const panel = vscode.window.createWebviewPanel(
        "contextkit.skillPreview",
        `Skill: ${skill.title}`,
        vscode.ViewColumn.One,
        { enableScripts: true, localResourceRoots: [] },
      );

      panel.webview.html = generateSkillPreviewHtml(skill, installed);

      panel.webview.onDidReceiveMessage(async (msg) => {
        if (msg.command === "wizard") {
          await vscode.commands.executeCommand("contextkit.skillsWizard", skillName);
        } else if (msg.command === "add" && workspaceFolders && deps.isWorkspaceTrusted()) {
          const { installSkills, createNodeFileSystemAdapter } = await import("@contextkit/core");
          const fs = createNodeFileSystemAdapter();
          const result = await installSkills({
            rootDir: workspaceFolders[0]!.uri.fsPath,
            skills: [skillName],
            dryRun: false,
          }, fs);
          if (result.installed.length > 0) {
            vscode.window.showInformationMessage(`Skill "${skillName}" installed.`);
            await deps.refreshInstalledSkills();
            deps.refreshTree();
            deps.refreshSetupView();
          }
        } else if (msg.command === "remove" && workspaceFolders && deps.isWorkspaceTrusted()) {
          const { removeInstalledSkill, createNodeFileSystemAdapter } = await import("@contextkit/core");
          const fs = createNodeFileSystemAdapter();
          await removeInstalledSkill(workspaceFolders[0]!.uri.fsPath, skillName, fs);
          vscode.window.showInformationMessage(`Skill "${skillName}" removed.`);
          await deps.refreshInstalledSkills();
          deps.refreshTree();
          deps.refreshSetupView();
        }
      });
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("contextkit.skillsAdd", async (skillName?: string) => {
      if (!deps.isWorkspaceTrusted()) {
        vscode.window.showErrorMessage("AgentContextKit: Write operations disabled in untrusted workspaces.");
        return;
      }
      const name = skillName || await vscode.window.showInputBox({ prompt: "Enter skill name to install" });
      if (!name) return;
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders) return;
      const { installSkills, createNodeFileSystemAdapter } = await import("@contextkit/core");
      const fs = createNodeFileSystemAdapter();
      const result = await installSkills({
        rootDir: workspaceFolders[0]!.uri.fsPath,
        skills: [name],
      }, fs);
      if (result.installed.length > 0) {
        vscode.window.showInformationMessage(`Installed: ${name}`);
        await deps.refreshInstalledSkills();
        deps.refreshTree();
        deps.refreshSetupView();
      } else {
        vscode.window.showWarningMessage(`Could not install "${name}". ${result.warnings.join(" ")}`);
      }
    }),
  );
}

async function generateAndShowPack(
  packType: ContextPackType,
  result: ContextScanResult,
  deps: CommandDeps,
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

  const save = await vscode.window.showInformationMessage(
    `Save ${packType} context pack?`,
    "Yes",
    "No",
  );
  if (save === "Yes") {
    if (!deps.isWorkspaceTrusted()) {
      vscode.window.showWarningMessage("Workspace is not trusted. Save is disabled.");
      return;
    }

    await saveWorkspaceFile(`context/${packType}.md`, pack.content, {
      successMessage: `Saved context/${packType}.md`,
    });
  }
}

async function saveWorkspaceFile(
  relativePath: string,
  content: string,
  options: { successMessage: string; openAfterSave?: boolean },
): Promise<boolean> {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) return false;

  const rootUri = workspaceFolders[0]!.uri;
  const targetUri = getWorkspaceFileUri(rootUri, relativePath);
  if (!targetUri) {
    vscode.window.showErrorMessage(
      `AgentContextKit: Refusing to save outside the workspace: ${relativePath}`,
    );
    return false;
  }

  const edit = new vscode.WorkspaceEdit();
  edit.createFile(targetUri, { overwrite: false });
  edit.insert(targetUri, new vscode.Position(0, 0), content);

  const applied = await vscode.workspace.applyEdit(edit);
  if (!applied) {
    vscode.window.showErrorMessage(
      `AgentContextKit: File already exists or could not be created: ${relativePath}`,
    );
    return false;
  }

  if (options.openAfterSave) {
    await vscode.workspace.openTextDocument(targetUri);
  }
  vscode.window.showInformationMessage(options.successMessage);
  return true;
}

function getWorkspaceFileUri(rootUri: vscode.Uri, filePath: string): vscode.Uri | undefined {
  return resolveWorkspaceUri(rootUri.fsPath, filePath);
}

function resolveWorkspaceUri(rootPath: string, filePath: string): vscode.Uri | undefined {
  const resolved = resolvePathWithin(rootPath, filePath);
  return resolved ? vscode.Uri.file(resolved) : undefined;
}

function resolvePathWithin(rootPath: string, filePath: string): string | undefined {
  const resolvedRoot = path.resolve(rootPath);
  const resolvedTarget = path.isAbsolute(filePath)
    ? path.resolve(filePath)
    : path.resolve(resolvedRoot, filePath);
  const relative = path.relative(resolvedRoot, resolvedTarget);
  if (relative === "" || (relative && !relative.startsWith("..") && !path.isAbsolute(relative))) {
    return resolvedTarget;
  }
  return undefined;
}

type SplitResultForRefresh = {
  rootContent: string;
  modules: Array<{ path: string; content: string }>;
};

function updateScanResultAfterSplit(
  result: ContextScanResult,
  pickedPath: string,
  splitResult: SplitResultForRefresh,
  detectKind: (filePath: string) => InstructionFileKind,
): ContextScanResult {
  const rootFile = createInstructionFile(
    pickedPath,
    detectKind(pickedPath),
    splitResult.rootContent,
  );
  const moduleFiles = splitResult.modules.map((mod) =>
    createInstructionFile(mod.path, detectKind(mod.path), mod.content),
  );
  const modulePaths = new Set(moduleFiles.map((file) => file.path));
  const files = [
    ...result.files.filter((file) => file.path !== pickedPath && !modulePaths.has(file.path)),
    rootFile,
    ...moduleFiles,
  ];

  return {
    ...result,
    files,
    issues: result.issues.filter(
      (issue) => issue.filePath !== pickedPath || issue.type !== "oversized_file",
    ),
    totalEstimatedTokens: files.reduce((sum, file) => sum + file.estimatedTokens, 0),
  };
}

function createInstructionFile(
  filePath: string,
  kind: InstructionFileKind,
  content: string,
): ContextScanResult["files"][number] {
  return {
    path: filePath,
    kind,
    content,
    sizeBytes: Buffer.byteLength(content, "utf8"),
    estimatedTokens: Math.ceil(content.length / 4),
    lastModified: new Date(),
  };
}

function isInstructionFileKind(value: string): value is InstructionFileKind {
  return [
    "agents",
    "claude",
    "cursor",
    "copilot",
    "roo",
    "codex",
    "windsurf",
    "gemini",
    "custom",
  ].includes(value);
}

function isContextPackType(value: string | undefined): value is ContextPackType {
  return (
    value !== undefined &&
    ["frontend", "backend", "database", "testing", "security", "deployment", "full"].includes(value)
  );
}

function openDashboardWebview(options: {
  result: ContextScanResult | undefined;
  installedSkills: InstalledSkill[];
  isTrusted: boolean;
  hasWorkspace: boolean;
}): void {
  const panel = vscode.window.createWebviewPanel(
    "contextkit.dashboard",
    "AgentContextKit",
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      localResourceRoots: [],
    },
  );

  const nonce = getNonce();
  panel.webview.html = generateDashboardHtml({ ...options, nonce });
  panel.webview.onDidReceiveMessage(async (message: { command?: string }) => {
    switch (message.command) {
      case "scan":
        await vscode.commands.executeCommand("contextkit.scanWorkspace");
        break;
      case "report":
        await vscode.commands.executeCommand("contextkit.openReport");
        break;
      case "skills":
        await vscode.commands.executeCommand("contextkit.skillsWizard");
        break;
      case "settings":
        await vscode.commands.executeCommand("contextkit.openSettings");
        break;
    }
  });
}

function generateDashboardHtml(options: {
  nonce: string;
  result: ContextScanResult | undefined;
  installedSkills: InstalledSkill[];
  isTrusted: boolean;
  hasWorkspace: boolean;
}): string {
  const { nonce, result, installedSkills, isTrusted, hasWorkspace } = options;
  const issueCount = result?.issues.length ?? 0;
  const fileCount = result?.files.length ?? 0;
  const tokenCount = result?.totalEstimatedTokens ?? 0;
  const health = result?.healthScore;
  const installedRows = installedSkills.length > 0
    ? installedSkills
        .map(
          (skill) => `<tr>
            <td><code>${escapeHtml(skill.name)}</code></td>
            <td>${escapeHtml(skill.title)}</td>
            <td>${skill.modified ? "Modified" : "Current"}</td>
          </tr>`,
        )
        .join("")
    : '<tr><td colspan="3">No skills installed yet.</td></tr>';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
  <title>AgentContextKit</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      color: var(--vscode-foreground);
      background: var(--vscode-editor-background);
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      line-height: 1.5;
    }
    header, main { padding: 22px 26px; }
    header {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      border-bottom: 1px solid var(--vscode-panel-border);
    }
    h1, h2, p { margin: 0; }
    h1 { font-size: 24px; font-weight: 650; }
    h2 { margin: 24px 0 10px; font-size: 16px; }
    p { color: var(--vscode-descriptionForeground); }
    .badge {
      align-self: flex-start;
      border-radius: 999px;
      padding: 3px 10px;
      color: var(--vscode-badge-foreground);
      background: var(--vscode-badge-background);
      white-space: nowrap;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 16px;
    }
    button {
      min-height: 32px;
      border: 1px solid var(--vscode-button-border, transparent);
      border-radius: 4px;
      padding: 6px 12px;
      color: var(--vscode-button-foreground);
      background: var(--vscode-button-background);
      cursor: pointer;
      font: inherit;
    }
    button.secondary {
      color: var(--vscode-button-secondaryForeground);
      background: var(--vscode-button-secondaryBackground);
    }
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 12px;
    }
    .metric {
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
      padding: 14px;
      background: var(--vscode-sideBar-background);
    }
    .metric strong {
      display: block;
      font-size: 24px;
      line-height: 1.1;
    }
    .metric span {
      display: block;
      margin-top: 5px;
      color: var(--vscode-descriptionForeground);
    }
    table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid var(--vscode-panel-border);
    }
    th, td {
      padding: 8px 10px;
      border-bottom: 1px solid var(--vscode-panel-border);
      text-align: left;
    }
    th { background: var(--vscode-sideBar-background); }
    code {
      background: var(--vscode-textCodeBlock-background);
      border-radius: 3px;
      padding: 1px 4px;
    }
  </style>
</head>
<body>
  <header>
    <div>
      <h1>AgentContextKit</h1>
      <p>Workspace context, instruction health, context packs, and local skills.</p>
      <div class="actions">
        <button data-command="scan" ${hasWorkspace ? "" : "disabled"}>Scan Workspace</button>
        <button class="secondary" data-command="report" ${result ? "" : "disabled"}>Open Report</button>
        <button class="secondary" data-command="skills" ${hasWorkspace && isTrusted ? "" : "disabled"}>Install Skills</button>
        <button class="secondary" data-command="settings">Open Setup</button>
      </div>
    </div>
    <span class="badge">${!hasWorkspace ? "No workspace" : !isTrusted ? "Read-only" : result ? "Ready" : "Scan needed"}</span>
  </header>
  <main>
    <section aria-labelledby="workspace-heading">
      <h2 id="workspace-heading">Workspace</h2>
      <div class="metrics">
        <div class="metric"><strong>${fileCount}</strong><span>Instruction files</span></div>
        <div class="metric"><strong>${tokenCount.toLocaleString()}</strong><span>Estimated tokens</span></div>
        <div class="metric"><strong>${issueCount}</strong><span>Issues</span></div>
        <div class="metric"><strong>${health === undefined ? "-" : `${health}%`}</strong><span>Health</span></div>
      </div>
    </section>
    <section aria-labelledby="skills-heading">
      <h2 id="skills-heading">Installed Skills</h2>
      <table>
        <thead><tr><th>Name</th><th>Title</th><th>Status</th></tr></thead>
        <tbody>${installedRows}</tbody>
      </table>
    </section>
  </main>
  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    document.querySelectorAll("[data-command]").forEach((button) => {
      button.addEventListener("click", () => {
        vscode.postMessage({ command: button.dataset.command });
      });
    });
  </script>
</body>
</html>`;
}

function openWebviewReport(result: ContextScanResult, context: vscode.ExtensionContext): void {
  const panel = vscode.window.createWebviewPanel(
    "contextkit.report",
    "AgentContextKit Report",
    vscode.ViewColumn.One,
    {
      enableScripts: false,
      localResourceRoots: [],
    },
  );

  panel.webview.html = generateReportHtml(result);
}

function generateReportHtml(result: ContextScanResult): string {
  const errorCount = result.issues.filter((i) => i.severity === "error").length;
  const warningCount = result.issues.filter((i) => i.severity === "warning").length;

  const healthColor =
    result.healthScore >= 80 ? "#4caf50" : result.healthScore >= 50 ? "#ff9800" : "#f44336";

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
  <title>AgentContextKit Report</title>
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
  </style>
</head>
<body>
  <h1>AgentContextKit Report</h1>
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
  ${
    result.files.length > 0
      ? `<table>
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
      : "<p>No instruction files found.</p>"
  }

  ${
    result.issues.length > 0
      ? `<h2>Issues (${result.issues.length})</h2>
    <table>
      <thead><tr><th>Severity</th><th>Message</th><th>File</th></tr></thead>
      <tbody>${issueRows}</tbody></table>`
      : "<h2>Issues</h2><p>No issues found.</p>"
  }

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
    AgentContextKit - AI Coding Agent Context Manager. Privacy-first. No data is sent externally.
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

function normalizeSkillWizardSelection(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { skills: [] };
  }
  const input = value as Record<string, unknown>;
  return {
    all: input.all === true,
    categories: Array.isArray(input.categories) ? input.categories.filter((v) => typeof v === "string") : [],
    subcategories: Array.isArray(input.subcategories) ? input.subcategories.filter((v) => typeof v === "string") : [],
    skills: Array.isArray(input.skills) ? input.skills.filter((v) => typeof v === "string") : [],
  };
}

function parseProviderModel(value: string | undefined): { provider?: string; model?: string } {
  if (!value) return {};
  const separator = value.indexOf(":");
  if (separator < 1 || separator === value.length - 1) return {};
  return {
    provider: value.slice(0, separator),
    model: value.slice(separator + 1),
  };
}

function generateSkillsWizardHtml(options: {
  catalog: {
    all: { count: number };
    categories: Array<{ id: string; label: string; count: number }>;
    subcategories: Array<{ id: string; label: string; count: number; category?: string }>;
    skills: Array<{
      name: string;
      title: string;
      category: string;
      subcategory?: string;
      description: string;
      version: string;
      tags: string[];
      estimatedTokens?: number;
      agentCompatibility?: any;
      compatibility?: any;
    }>;
  };
  initialSkillName?: string;
  selectedSkill?: any;
}): string {
  const { catalog, initialSkillName } = options;
  const providerOptions = collectProviderOptions(catalog.skills);
  const skillOptions = catalog.skills
    .map((skill) => `<option value="${escapeHtml(skill.name)}" ${skill.name === initialSkillName ? "selected" : ""}>${escapeHtml(skill.title)} (${escapeHtml(skill.name)})</option>`)
    .join("");
  const categoryRows = catalog.categories
    .filter((category) => category.count > 0)
    .map((category) => `<label><input type="checkbox" data-category="${escapeHtml(category.id)}"> ${escapeHtml(category.label)} <span>${category.count}</span></label>`)
    .join("");
  const subcategoryRows = catalog.subcategories
    .filter((subcategory) => subcategory.count > 0)
    .map((subcategory) => `<label><input type="checkbox" data-subcategory="${escapeHtml(subcategory.id)}"> ${escapeHtml(subcategory.label)} <span>${subcategory.count}</span></label>`)
    .join("");
  const providerRows = providerOptions
    .map((option, index) => `<label><input type="radio" name="providerModel" value="${escapeHtml(option.value)}" ${index === 0 ? "checked" : ""}> <strong>${escapeHtml(option.provider)}</strong> ${escapeHtml(option.model)} <span>${escapeHtml(option.fit)}</span></label>`)
    .join("");
  const skillData = JSON.stringify(catalog.skills).replace(/</g, "\\u003c");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
  <title>AgentContextKit Skill Install Wizard</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      color: var(--vscode-foreground);
      background: var(--vscode-editor-background);
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      line-height: 1.45;
    }
    header, main, footer { padding: 18px 22px; }
    header { border-bottom: 1px solid var(--vscode-panel-border); }
    h1, h2, h3, p { margin: 0; }
    h1 { font-size: 22px; }
    h2 { font-size: 15px; margin-bottom: 10px; }
    h3 { font-size: 13px; margin-top: 12px; }
    p { color: var(--vscode-descriptionForeground); }
    .steps { display: grid; gap: 16px; }
    section {
      padding: 14px 0;
      border-bottom: 1px solid var(--vscode-panel-border);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 12px;
    }
    label {
      display: flex;
      align-items: center;
      gap: 8px;
      min-height: 30px;
      padding: 6px 0;
    }
    label span { margin-left: auto; color: var(--vscode-descriptionForeground); font-size: 12px; }
    select {
      width: 100%;
      min-height: 32px;
      color: var(--vscode-input-foreground);
      background: var(--vscode-input-background);
      border: 1px solid var(--vscode-input-border, transparent);
      padding: 4px 8px;
    }
    button {
      min-height: 32px;
      border: 1px solid var(--vscode-button-border, transparent);
      border-radius: 4px;
      padding: 6px 12px;
      color: var(--vscode-button-foreground);
      background: var(--vscode-button-background);
      cursor: pointer;
    }
    button.secondary {
      color: var(--vscode-button-secondaryForeground);
      background: var(--vscode-button-secondaryBackground);
    }
    .preview {
      margin-top: 10px;
      padding: 12px;
      border: 1px solid var(--vscode-panel-border);
      border-radius: 6px;
      background: var(--vscode-sideBar-background);
    }
    .summary {
      display: grid;
      gap: 6px;
      color: var(--vscode-descriptionForeground);
    }
    code {
      background: var(--vscode-textCodeBlock-background);
      padding: 1px 4px;
      border-radius: 3px;
    }
    footer {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      border-top: 1px solid var(--vscode-panel-border);
    }
  </style>
</head>
<body>
  <header>
    <h1>Install Skills</h1>
    <p>Select only the skills you need, tune them for the target provider and model, then import them into this workspace.</p>
  </header>
  <main class="steps">
    <section aria-labelledby="scope-heading">
      <h2 id="scope-heading">1. Choose Import Scope</h2>
      <label><input type="checkbox" id="allSkills"> All skills <span>${catalog.all.count}</span></label>
      <div class="grid">
        <div>
          <h3>Categories</h3>
          ${categoryRows}
        </div>
        <div>
          <h3>Subcategories</h3>
          ${subcategoryRows}
        </div>
      </div>
    </section>
    <section aria-labelledby="skill-heading">
      <h2 id="skill-heading">2. Pick Exact Skills</h2>
      <select id="skillSelect" aria-label="Skill">
        <option value="">Select a skill to add or preview</option>
        ${skillOptions}
      </select>
      <div class="preview" id="preview">Select a skill to inspect its version knowledge and model setup.</div>
    </section>
    <section aria-labelledby="model-heading">
      <h2 id="model-heading">3. Provider and Model Setup</h2>
      <div class="grid">${providerRows}</div>
    </section>
    <section aria-labelledby="install-heading">
      <h2 id="install-heading">4. Install Options</h2>
      <label><input type="checkbox" id="updateInstructions"> Add managed skill references to the instruction file</label>
      <div class="summary" id="summary"></div>
    </section>
  </main>
  <footer>
    <button class="secondary" id="refreshSummary">Refresh Summary</button>
    <button id="install">Install Selected Skills</button>
  </footer>
  <script>
    const vscode = acquireVsCodeApi();
    const skills = ${skillData};
    const skillSelect = document.getElementById("skillSelect");
    const preview = document.getElementById("preview");
    const summary = document.getElementById("summary");

    function selectedSkillNames() {
      const names = new Set();
      if (skillSelect.value) names.add(skillSelect.value);
      return [...names];
    }

    function selection() {
      return {
        all: document.getElementById("allSkills").checked,
        categories: [...document.querySelectorAll("[data-category]:checked")].map((input) => input.dataset.category),
        subcategories: [...document.querySelectorAll("[data-subcategory]:checked")].map((input) => input.dataset.subcategory),
        skills: selectedSkillNames()
      };
    }

    function providerModel() {
      const checked = document.querySelector("input[name='providerModel']:checked");
      return checked ? checked.value : "";
    }

    function renderPreview() {
      const skill = skills.find((item) => item.name === skillSelect.value);
      if (!skill) {
        preview.textContent = "Select a skill to inspect its version knowledge and model setup.";
        renderSummary();
        return;
      }
      const versions = (skill.compatibility?.majorVersions || []).map((version) => "<li><strong>" + version.version + "</strong> " + version.status + ": " + version.features.join(", ") + "</li>").join("");
      const selectedModel = providerModel();
      const parts = selectedModel.split(":");
      const provider = (skill.agentCompatibility?.providers || []).find((item) => item.provider === parts[0]);
      const model = (provider?.models || []).find((item) => item.id === parts.slice(1).join(":"));
      const setupItems = model?.setup || skill.agentCompatibility?.setup || [];
      const setup = setupItems.map((item) => "<li>" + item + "</li>").join("");
      const optimizationItems = model?.optimization || skill.agentCompatibility?.optimization || [];
      const optimization = optimizationItems.map((item) => "<li>" + item + "</li>").join("");
      const tokens = typeof skill.estimatedTokens === "number" ? skill.estimatedTokens.toLocaleString() : "unknown";
      const fit = model?.fit || "unknown";
      preview.innerHTML = "<h3>" + skill.title + "</h3><p>" + skill.description + "</p><p><code>" + skill.name + "</code> version " + skill.version + " · ~" + tokens + " tokens · " + fit + " fit for " + selectedModel + "</p><h3>Version Compatibility</h3><ul>" + (versions || "<li>General guidance across supported versions.</li>") + "</ul><h3>Provider Setup</h3><ul>" + (setup || "<li>Use the selected provider/model defaults.</li>") + "</ul><h3>Context Optimization</h3><ul>" + (optimization || "<li>Keep imported skills focused on the active task.</li>") + "</ul>";
      renderSummary();
    }

    function renderSummary() {
      const s = selection();
      const count = (s.all ? ${catalog.all.count} : 0) + s.categories.length + s.subcategories.length + s.skills.length;
      const selected = skills.find((item) => item.name === skillSelect.value);
      const tokens = selected && typeof selected.estimatedTokens === "number" ? selected.estimatedTokens.toLocaleString() : "varies by selection";
      summary.innerHTML = "<div>Selected scope entries: <strong>" + count + "</strong></div><div>Provider/model: <strong>" + providerModel() + "</strong></div><div>Approx token usage: <strong>~" + tokens + "</strong></div>";
    }

    skillSelect.addEventListener("change", renderPreview);
    document.querySelectorAll("input").forEach((input) => input.addEventListener("change", () => { renderSummary(); if (input.name === "providerModel") renderPreview(); }));
    document.getElementById("refreshSummary").addEventListener("click", renderSummary);
    document.getElementById("install").addEventListener("click", () => {
      vscode.postMessage({
        command: "install",
        selection: selection(),
        providerModel: providerModel(),
        updateInstructionFiles: document.getElementById("updateInstructions").checked,
        targetFormat: "agents"
      });
    });
    window.addEventListener("message", (event) => {
      if (event.data.command === "installed") {
        const result = event.data.result;
        summary.innerHTML = "<div>Installed: <strong>" + result.installed.length + "</strong></div><div>Skipped: " + result.skipped.join(", ") + "</div>";
      }
    });
    renderPreview();
  </script>
</body>
</html>`;
}

function collectProviderOptions(skills: Array<{ agentCompatibility?: any }>): Array<{ value: string; provider: string; model: string; fit: string }> {
  const seen = new Set<string>();
  const options: Array<{ value: string; provider: string; model: string; fit: string }> = [];
  for (const skill of skills) {
    for (const provider of skill.agentCompatibility?.providers ?? []) {
      for (const model of provider.models ?? []) {
        const value = `${provider.provider}:${model.id}`;
        if (seen.has(value)) continue;
        seen.add(value);
        options.push({ value, provider: provider.provider, model: model.id, fit: model.fit });
      }
    }
  }
  return options.length > 0 ? options : [{ value: "openai:gpt-5", provider: "openai", model: "gpt-5", fit: "excellent" }];
}

function generateSkillPreviewHtml(skill: { name: string; title: string; category: string; description: string; version: string; tags: string[]; content: string }, installed: boolean): string {
  const tagsHtml = skill.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join(" ");
  const contentHtml = skill.content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^```[\s\S]*?```/gm, (match) => `<pre><code>${escapeHtml(match.slice(3, -3))}</code></pre>`)
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: var(--vscode-font-family, -apple-system, sans-serif);
      font-size: var(--vscode-font-size, 13px);
      background: var(--vscode-editor-background, #1e1e1e);
      color: var(--vscode-foreground, #ccc);
      padding: 20px;
      line-height: 1.6;
    }
    .header { margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid var(--vscode-panel-border, #444); }
    h1 { font-size: 22px; margin-bottom: 4px; }
    .name { color: var(--vscode-descriptionForeground, #888); font-size: 14px; margin-bottom: 8px; }
    .meta { display: flex; gap: 16px; flex-wrap: wrap; margin: 12px 0; font-size: 12px; }
    .meta-item { color: var(--vscode-descriptionForeground, #888); }
    .meta-item strong { color: var(--vscode-foreground, #ccc); }
    .tags { margin: 8px 0; }
    .tag {
      display: inline-block;
      background: var(--vscode-badge-background, #444);
      color: var(--vscode-badge-foreground, #fff);
      padding: 2px 8px;
      border-radius: 4px;
      margin-right: 4px;
      font-size: 11px;
    }
    .actions { margin: 16px 0; display: flex; gap: 8px; }
    button {
      padding: 6px 16px;
      border: 1px solid var(--vscode-button-border, #555);
      background: var(--vscode-button-background, #0e639c);
      color: var(--vscode-button-foreground, #fff);
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
    }
    button:hover { background: var(--vscode-button-hoverBackground, #1177bb); }
    button.secondary { background: var(--vscode-button-secondaryBackground, #3a3d41); }
    .content { margin-top: 24px; }
    .content h2 { font-size: 18px; margin: 24px 0 8px; color: var(--vscode-textLink-foreground, #3794ff); }
    .content h3 { font-size: 15px; margin: 16px 0 6px; }
    .content li { margin: 4px 0 4px 20px; }
    .content code {
      background: var(--vscode-textCodeBlock-background, #2d2d2d);
      padding: 1px 4px;
      border-radius: 3px;
      font-family: var(--vscode-editor-font-family, monospace);
      font-size: 12px;
    }
    .content pre {
      background: var(--vscode-textCodeBlock-background, #2d2d2d);
      padding: 12px;
      border-radius: 6px;
      overflow-x: auto;
      margin: 12px 0;
    }
    .content pre code { background: none; padding: 0; }
    p { margin: 8px 0; }
    .installed-badge {
      display: inline-block;
      background: #388a34;
      color: #fff;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 11px;
      margin-left: 8px;
      vertical-align: middle;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${escapeHtml(skill.title)} ${installed ? '<span class="installed-badge">Installed</span>' : ''}</h1>
    <div class="name"><code>${escapeHtml(skill.name)}</code></div>
    <div class="meta">
      <span class="meta-item">Category: <strong>${escapeHtml(skill.category)}</strong></span>
      <span class="meta-item">Version: <strong>${escapeHtml(skill.version)}</strong></span>
    </div>
    <p>${escapeHtml(skill.description)}</p>
    <div class="tags">${tagsHtml}</div>
    <div class="actions">
      ${installed
        ? '<button class="secondary" onclick="remove()">Remove</button>'
        : '<button onclick="wizard()">Install With Wizard</button><button class="secondary" onclick="add()">Quick Add</button>'}
    </div>
  </div>
  <div class="content">
    <p>${contentHtml}</p>
  </div>
  <script>
    const vscode = acquireVsCodeApi();
    function add() { vscode.postMessage({ command: "add" }); }
    function wizard() { vscode.postMessage({ command: "wizard" }); }
    function remove() { vscode.postMessage({ command: "remove" }); }
  </script>
</body>
</html>`;
}
