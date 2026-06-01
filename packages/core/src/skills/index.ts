import type {
  BuiltinSkill,
  SkillCategory,
  SkillMetadata,
  SkillInstallOptions,
  SkillInstallResult,
  InstalledSkill,
  SkillsManifest,
  SkillDoctorIssue,
  FileSystemAdapter,
  InstructionFormat,
  SkillGroupDefinition,
  SkillCatalog,
  SkillSelection,
  SkillSafeUpdateOptions,
  SkillSafeUpdateResult,
  SkillUpdateCandidate,
} from "../types/index.js";
import { SKILL_CATEGORY_LABELS, ALL_SKILLS } from "./data.js";
import { SKILL_GROUPS } from "./data-groups.js";

export { SKILL_CATEGORIES, SKILL_CATEGORY_LABELS, ALL_SKILLS } from "./data.js";
export { SKILL_GROUPS } from "./data-groups.js";

const skillsByName = new Map<string, BuiltinSkill>();
const groupsById = new Map<string, SkillGroupDefinition>();

for (const skill of ALL_SKILLS) {
  skillsByName.set(skill.name, skill);
}
for (const group of SKILL_GROUPS) {
  groupsById.set(group.id, group);
}

const SKILLS_DIR = ".contextkit/skills";
const MANIFEST_PATH = ".contextkit/skills.json";
const MANAGED_START = "<!-- AgentContextKit Skills Start -->";
const MANAGED_END = "<!-- AgentContextKit Skills End -->";

function hashContent(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const ch = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash |= 0;
  }
  return hash.toString(16);
}

function estimateSkillTokens(content: string): number {
  return Math.ceil(content.length / 4);
}

function findModelCompatibility(
  skill: BuiltinSkill,
  provider?: string,
  model?: string,
) {
  const agent = skill.agentCompatibility;
  const selectedProvider = provider ?? agent?.defaultProvider;
  const selectedModel = model ?? agent?.defaultModel;
  const providerInfo = agent?.providers.find((p) => p.provider === selectedProvider);
  const modelInfo = providerInfo?.models.find((m) => m.id === selectedModel);
  return {
    selectedProvider,
    selectedModel,
    providerInfo,
    modelInfo,
    fit: modelInfo?.fit ?? "unknown" as const,
  };
}

function renderSkillFile(
  skill: BuiltinSkill,
  options: Pick<SkillInstallOptions, "provider" | "model"> = {},
): string {
  const compatibility = findModelCompatibility(skill, options.provider, options.model);
  const modelFit = compatibility.fit;
  const setup = compatibility.modelInfo?.setup ?? skill.agentCompatibility?.setup ?? [];
  const optimization = compatibility.modelInfo?.optimization ?? skill.agentCompatibility?.optimization ?? [];
  const tokenEstimate = estimateSkillTokens(skill.content);
  return `---\nname: ${skill.name}\ntitle: ${skill.title}\ncategory: ${skill.category}\nsubcategory: ${skill.subcategory ?? skill.category}\nversion: ${skill.version}\nestimatedTokens: ${tokenEstimate}\nselectedProvider: ${compatibility.selectedProvider ?? "unspecified"}\nselectedModel: ${compatibility.selectedModel ?? "unspecified"}\nmodelFit: ${modelFit}\ntags:\n${skill.tags.map((t) => `  - ${t}`).join("\n")}\n---\n\n${skill.content}\n\n## AgentContextKit Import Profile\n\n- Provider: ${compatibility.selectedProvider ?? "unspecified"}\n- Model: ${compatibility.selectedModel ?? "unspecified"}\n- Model fit: ${modelFit}\n- Estimated skill tokens: ${tokenEstimate.toLocaleString()}\n\n### Provider/Model Setup\n${setup.map((item) => `- ${item}`).join("\n") || "- No provider-specific setup recorded."}\n\n### Context Optimization\n${optimization.map((item) => `- ${item}`).join("\n") || "- Keep this skill focused and avoid importing unrelated skills."}\n`;
}

async function readManifest(rootDir: string, fs: FileSystemAdapter): Promise<SkillsManifest> {
  const path = fs.joinPath(rootDir, MANIFEST_PATH);
  const exists = await fs.fileExists(path);
  if (!exists) {
    return { version: 1, installedAt: new Date().toISOString(), skills: [], groups: [] };
  }
  try {
    const content = await fs.readFile(path);
    return JSON.parse(content) as SkillsManifest;
  } catch {
    return { version: 1, installedAt: new Date().toISOString(), skills: [], groups: [] };
  }
}

async function writeManifest(rootDir: string, manifest: SkillsManifest, fs: FileSystemAdapter): Promise<void> {
  const path = fs.joinPath(rootDir, MANIFEST_PATH);
  const dir = manifestDir(rootDir, path);
  const dirExists = await fs.directoryExists(dir);
  if (!dirExists) await fs.mkdir(dir);
  await fs.writeFile(path, JSON.stringify(manifest, null, 2) + "\n");
}

function manifestDir(rootDir: string, filePath: string): string {
  const sep = filePath.includes("\\") ? "\\" : "/";
  const parts = filePath.split(sep);
  parts.pop();
  return parts.length > 0 ? parts.join(sep) : rootDir;
}

// ── Query API ──

export function getSkill(name: string): BuiltinSkill | undefined {
  return skillsByName.get(name);
}

export function listSkills(category?: SkillCategory): SkillMetadata[] {
  const filtered = category
    ? ALL_SKILLS.filter((s) => s.category === category)
    : ALL_SKILLS;
  return filtered.map(({ content, ...meta }) => meta);
}

export function listCategories(): { id: SkillCategory; label: string; count: number }[] {
  const counts = new Map<SkillCategory, number>();
  for (const s of ALL_SKILLS) {
    counts.set(s.category, (counts.get(s.category) ?? 0) + 1);
  }
  return Object.entries(SKILL_CATEGORY_LABELS).map(([id, label]) => ({
    id: id as SkillCategory,
    label,
    count: counts.get(id as SkillCategory) ?? 0,
  }));
}

export function searchSkills(query: string): SkillMetadata[] {
  const lower = query.toLowerCase();
  return ALL_SKILLS.filter(
    (s) =>
      s.name.toLowerCase().includes(lower) ||
      s.title.toLowerCase().includes(lower) ||
      s.tags.some((t) => t.toLowerCase().includes(lower)) ||
      s.description.toLowerCase().includes(lower),
  ).map(({ content, ...meta }) => meta);
}

export function getSkillsByCategory(category: SkillCategory): SkillMetadata[] {
  return ALL_SKILLS.filter((s) => s.category === category).map(
    ({ content, ...meta }) => meta,
  );
}

export function getSkillCatalog(): SkillCatalog {
  const categoryCounts = listCategories();
  const subcategoryCounts = new Map<string, { label: string; count: number; category?: SkillCategory }>();

  for (const skill of ALL_SKILLS) {
    const id = skill.subcategory ?? skill.category;
    const existing = subcategoryCounts.get(id);
    subcategoryCounts.set(id, {
      label: existing?.label ?? toLabel(id),
      count: (existing?.count ?? 0) + 1,
      category: existing?.category ?? skill.category,
    });
  }

  for (const group of SKILL_GROUPS) {
    const resolved = resolveGroupSkills([group.id]).filter((name) => skillsByName.has(name));
    if (resolved.length === 0) continue;
    const existing = subcategoryCounts.get(group.id);
    subcategoryCounts.set(group.id, {
      label: group.label,
      count: resolved.length,
      category: existing?.category,
    });
  }

  return {
    all: { id: "all", label: "All Skills", count: ALL_SKILLS.length },
    categories: categoryCounts,
    subcategories: [...subcategoryCounts.entries()].map(([id, value]) => ({
      id,
      label: value.label,
      count: value.count,
      category: value.category,
    })),
    skills: listSkills(),
  };
}

export function resolveSkillSelection(selection: SkillSelection): string[] {
  const selected = new Set<string>();

  const add = (name: string): void => {
    if (skillsByName.has(name)) selected.add(name);
  };

  if (selection.all) {
    for (const skill of ALL_SKILLS) add(skill.name);
  }

  for (const category of selection.categories ?? []) {
    for (const skill of ALL_SKILLS) {
      if (skill.category === category) add(skill.name);
    }
  }

  for (const subcategory of selection.subcategories ?? []) {
    const group = groupsById.get(subcategory);
    if (group) {
      for (const name of resolveGroupSkills([subcategory])) add(name);
    }
    for (const skill of ALL_SKILLS) {
      if ((skill.subcategory ?? skill.category) === subcategory) add(skill.name);
    }
  }

  for (const skill of selection.skills ?? []) add(skill);

  return [...selected];
}

function toLabel(id: string): string {
  return id
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

// ── Groups API ──

export function listGroups(): SkillGroupDefinition[] {
  return SKILL_GROUPS;
}

export function getGroup(id: string): SkillGroupDefinition | undefined {
  return groupsById.get(id);
}

export function resolveGroupSkills(groupIds: string[]): string[] {
  const seen = new Set<string>();
  const resolved: string[] = [];

  for (const gid of groupIds) {
    const group = groupsById.get(gid);
    if (!group) continue;
    for (const name of group.skills) {
      if (name === "*") {
        for (const s of ALL_SKILLS) {
          if (!seen.has(s.name)) {
            seen.add(s.name);
            resolved.push(s.name);
          }
        }
      } else if (!seen.has(name)) {
        seen.add(name);
        resolved.push(name);
      }
    }
  }
  return resolved;
}

// ── Install / Remove / Update ──

export async function getInstalledSkills(rootDir: string, fs: FileSystemAdapter): Promise<InstalledSkill[]> {
  const manifest = await readManifest(rootDir, fs);
  return Promise.all(
    manifest.skills.map(async (entry) => {
      const builtin = skillsByName.get(entry.name);
      const fullPath = fs.joinPath(rootDir, entry.path);
      let localHash: string | undefined;
      let estimatedTokens = builtin?.estimatedTokens;
      let modified = false;
      try {
        const content = await fs.readFile(fullPath);
        localHash = hashContent(content);
        estimatedTokens = estimateSkillTokens(content);
        modified = entry.localHash !== localHash;
      } catch {
        // file may have been deleted
      }
      return {
        name: entry.name,
        title: builtin?.title ?? entry.name,
        category: builtin?.category ?? "advanced" as SkillCategory,
        description: builtin?.description ?? "",
        version: entry.version,
        tags: builtin?.tags ?? [],
        appliesTo: builtin?.appliesTo ?? [],
        estimatedTokens,
        source: entry.source,
        installedAt: entry.installedAt,
        path: entry.path,
        localHash,
        upstreamHash: builtin ? hashContent(renderSkillFile(builtin, {
          provider: entry.selectedProvider,
          model: entry.selectedModel,
        })) : undefined,
        modified,
        selectedProvider: entry.selectedProvider,
        selectedModel: entry.selectedModel,
        modelFit: entry.modelFit,
      };
    }),
  );
}

export async function installSkills(
  options: SkillInstallOptions,
  fs: FileSystemAdapter,
): Promise<SkillInstallResult> {
  const { rootDir, skills: skillNames, groups, overwrite } = options;
  const result: SkillInstallResult = {
    installed: [],
    skipped: [],
    updatedFiles: [],
    warnings: [],
  };

  // Resolve groups to skill names
  const resolvedNames = new Set(skillNames);
  if (groups && groups.length > 0) {
    for (const name of resolveGroupSkills(groups)) {
      resolvedNames.add(name);
    }
  }

  const manifest = await readManifest(rootDir, fs);

  for (const name of resolvedNames) {
    const builtin = skillsByName.get(name);
    if (!builtin) {
      result.skipped.push(name);
      result.warnings.push(`Skill "${name}" not found in built-in registry.`);
      continue;
    }

    const alreadyInstalled = manifest.skills.find((s) => s.name === name);
    if (alreadyInstalled && !overwrite) {
      result.skipped.push(name);
      continue;
    }

    const skillFileName = `${name}.md`;
    const skillPath = fs.joinPath(SKILLS_DIR, skillFileName);
    const fullPath = fs.joinPath(rootDir, skillPath);
    const compatibility = findModelCompatibility(builtin, options.provider, options.model);
    const skillContent = renderSkillFile(builtin, {
      provider: compatibility.selectedProvider,
      model: compatibility.selectedModel,
    });
    const contentHash = hashContent(skillContent);
    if (options.provider || options.model) {
      if (!compatibility.providerInfo) {
        result.warnings.push(`Skill "${name}" has no compatibility entry for provider "${options.provider}".`);
      } else if (!compatibility.modelInfo) {
        result.warnings.push(`Skill "${name}" has no compatibility entry for model "${options.model}" on provider "${compatibility.selectedProvider}".`);
      } else if (compatibility.modelInfo.fit === "limited") {
        result.warnings.push(`Skill "${name}" has limited fit for ${compatibility.selectedProvider}/${compatibility.selectedModel}.`);
      }
    }

    // Ensure directory exists
    const skillsDir = fs.joinPath(rootDir, SKILLS_DIR);
    const dirExists = await fs.directoryExists(skillsDir);
    if (!dirExists) await fs.mkdir(skillsDir);

    // Write skill file
    await fs.writeFile(fullPath, skillContent);

    // Update manifest
    if (alreadyInstalled) {
      alreadyInstalled.version = builtin.version;
      alreadyInstalled.localHash = contentHash;
      alreadyInstalled.upstreamHash = contentHash;
      alreadyInstalled.selectedProvider = compatibility.selectedProvider;
      alreadyInstalled.selectedModel = compatibility.selectedModel;
      alreadyInstalled.modelFit = compatibility.fit;
    } else {
      manifest.skills.push({
        name,
        version: builtin.version,
        source: "builtin",
        installedAt: new Date().toISOString(),
        path: skillPath,
        localHash: contentHash,
        upstreamHash: contentHash,
        selectedProvider: compatibility.selectedProvider,
        selectedModel: compatibility.selectedModel,
        modelFit: compatibility.fit,
      });
    }

    result.installed.push({
      name: builtin.name,
      title: builtin.title,
      category: builtin.category,
      description: builtin.description,
      version: builtin.version,
      tags: builtin.tags,
      appliesTo: builtin.appliesTo,
      estimatedTokens: estimateSkillTokens(skillContent),
      source: "builtin",
      installedAt: new Date().toISOString(),
      path: skillPath,
      localHash: contentHash,
      upstreamHash: contentHash,
      selectedProvider: compatibility.selectedProvider,
      selectedModel: compatibility.selectedModel,
      modelFit: compatibility.fit,
    });
  }

  // Update instruction files if requested
  if (options.updateInstructionFiles && result.installed.length > 0) {
    const format = options.targetFormat ?? "agents";
    const updatedFile = await updateManagedSection(
      rootDir,
      format,
      result.installed.map((s) => s.name),
      fs,
    );
    if (updatedFile) result.updatedFiles.push(updatedFile);
  }

  // Write manifest
  manifest.groups = [...new Set([...manifest.groups, ...(groups ?? [])])];
  manifest.installedAt = new Date().toISOString();
  await writeManifest(rootDir, manifest, fs);

  return result;
}

export async function removeInstalledSkill(
  rootDir: string,
  name: string,
  fs: FileSystemAdapter,
  force?: boolean,
): Promise<SkillInstallResult> {
  const manifest = await readManifest(rootDir, fs);
  const entry = manifest.skills.find((s) => s.name === name);
  if (!entry) {
    return { installed: [], skipped: [name], updatedFiles: [], warnings: [`Skill "${name}" is not installed.`] };
  }

  if (entry.source === "custom" && !force) {
    return { installed: [], skipped: [name], updatedFiles: [], warnings: [`"${name}" is a custom skill. Use --force to remove.`] };
  }

  // Remove skill file
  const fullPath = fs.joinPath(rootDir, entry.path);
  const warnings: string[] = [];
  try {
      const exists = await fs.fileExists(fullPath);
      if (exists) {
        if (fs.removeFile) {
          await fs.removeFile(fullPath);
        } else {
          await fs.writeFile(fullPath, "");
        }
      }
  } catch {
    warnings.push(`Could not remove skill file: ${entry.path}`);
  }

  // Update manifest
  manifest.skills = manifest.skills.filter((s) => s.name !== name);
  await writeManifest(rootDir, manifest, fs);

  return {
    installed: [],
    skipped: [],
    updatedFiles: [],
    warnings,
  };
}

export async function updateInstalledSkills(
  rootDir: string,
  fs: FileSystemAdapter,
  overwrite?: boolean,
): Promise<SkillInstallResult> {
  const manifest = await readManifest(rootDir, fs);
  const result: SkillInstallResult = { installed: [], skipped: [], updatedFiles: [], warnings: [] };

  for (const entry of manifest.skills) {
    if (entry.source !== "builtin") continue;
    const builtin = skillsByName.get(entry.name);
    if (!builtin) {
      result.warnings.push(`Built-in skill "${entry.name}" no longer exists.`);
      continue;
    }
    if (builtin.version === entry.version) continue;

    const fullPath = fs.joinPath(rootDir, entry.path);
    const upstreamContent = renderSkillFile(builtin, {
      provider: entry.selectedProvider,
      model: entry.selectedModel,
    });
    const upstreamHash = hashContent(upstreamContent);
    let localModified = false;
    try {
      const existing = await fs.readFile(fullPath);
      const localHash = hashContent(existing);
      localModified = entry.localHash !== localHash && localHash !== upstreamHash;
    } catch {
      // file doesn't exist, just reinstall
    }

    if (localModified && !overwrite) {
      result.warnings.push(`"${entry.name}" has local modifications. Use --overwrite to replace, or review backups.`);
      continue;
    }

    await fs.writeFile(fullPath, upstreamContent);

    entry.version = builtin.version;
    entry.localHash = upstreamHash;
    entry.upstreamHash = upstreamHash;
  }

  await writeManifest(rootDir, manifest, fs);
  return result;
}

export async function readInstalledSkill(
  rootDir: string,
  name: string,
  fs: FileSystemAdapter,
): Promise<string> {
  const manifest = await readManifest(rootDir, fs);
  const entry = manifest.skills.find((s) => s.name === name);
  if (!entry) {
    throw new Error(`Skill "${name}" is not installed.`);
  }
  return fs.readFile(fs.joinPath(rootDir, entry.path));
}

export async function writeInstalledSkill(
  rootDir: string,
  name: string,
  content: string,
  fs: FileSystemAdapter,
): Promise<void> {
  const manifest = await readManifest(rootDir, fs);
  const entry = manifest.skills.find((s) => s.name === name);
  if (!entry) {
    throw new Error(`Skill "${name}" is not installed.`);
  }

  await fs.writeFile(fs.joinPath(rootDir, entry.path), content);
  const localHash = hashContent(content);
  entry.localHash = localHash;
  await writeManifest(rootDir, manifest, fs);
}

export async function updateInstalledSkillsSafe(
  rootDir: string,
  fs: FileSystemAdapter,
  options: SkillSafeUpdateOptions = {},
): Promise<SkillSafeUpdateResult> {
  const manifest = await readManifest(rootDir, fs);
  const result: SkillSafeUpdateResult = {
    updated: [],
    skipped: [],
    reviewRequired: [],
    warnings: [],
  };
  const only = options.skills ? new Set(options.skills) : undefined;

  for (const entry of manifest.skills) {
    if (only && !only.has(entry.name)) continue;
    if (entry.source !== "builtin") {
      result.skipped.push(entry.name);
      continue;
    }

    const builtin = skillsByName.get(entry.name);
    if (!builtin) {
      result.warnings.push(`Built-in skill "${entry.name}" no longer exists.`);
      continue;
    }
    if (builtin.version === entry.version) {
      result.skipped.push(entry.name);
      continue;
    }

    const fullPath = fs.joinPath(rootDir, entry.path);
    const candidateContent = renderSkillFile(builtin, {
      provider: entry.selectedProvider,
      model: entry.selectedModel,
    });
    const candidateHash = hashContent(candidateContent);
    let currentContent = "";
    let currentHash: string | undefined;

    try {
      currentContent = await fs.readFile(fullPath);
      currentHash = hashContent(currentContent);
    } catch {
      currentHash = undefined;
    }

    const modified = Boolean(currentHash && entry.localHash && currentHash !== entry.localHash);
    const candidate: SkillUpdateCandidate = {
      name: entry.name,
      path: entry.path,
      installedVersion: entry.version,
      availableVersion: builtin.version,
      modified,
      critical: isCriticalSkillUpdate(builtin),
      reason: modified
        ? "Local content differs from the recorded installed baseline. Review the improved prompt before applying."
        : "A newer built-in skill version is available.",
      currentContent: currentContent || undefined,
      candidateContent,
    };

    if (modified || candidate.critical || !options.apply) {
      result.reviewRequired.push(candidate);
      continue;
    }

    await fs.writeFile(fullPath, candidateContent);
    entry.version = builtin.version;
    entry.localHash = candidateHash;
    entry.upstreamHash = candidateHash;
    result.updated.push(entry.name);
  }

  await writeManifest(rootDir, manifest, fs);
  return result;
}

function isCriticalSkillUpdate(skill: BuiltinSkill): boolean {
  return skill.category === "security" || skill.tags.some((tag) => ["security", "auth", "secrets"].includes(tag));
}

// ── Export ──

export async function exportSkillsToInstructionFormat(
  rootDir: string,
  format: InstructionFormat,
  fs: FileSystemAdapter,
  outFile?: string,
): Promise<string> {
  const installed = await getInstalledSkills(rootDir, fs);
  const lines: string[] = [];

  lines.push(MANAGED_START);
  lines.push("");
  lines.push("# AgentContextKit Skills");
  lines.push("");
  lines.push("The following reusable skills are installed in `.contextkit/skills/`.");
  lines.push("");
  lines.push("## Installed Skills");
  lines.push("");

  for (const skill of installed) {
    lines.push(`- \`${skill.name}\` — ${skill.title}`);
  }

  lines.push("");
  lines.push("## Usage Guidance");
  lines.push("");
  lines.push("When working on a task, load the relevant skill file from `.contextkit/skills/`.");
  lines.push("");
  lines.push(MANAGED_END);
  lines.push("");

  const content = lines.join("\n");

  if (outFile) {
    const targetPath = resolveFormatPath(rootDir, format);
    await updateManagedSection(rootDir, format, installed.map((s) => s.name), fs);
  }

  return content;
}

async function updateManagedSection(
  rootDir: string,
  format: InstructionFormat,
  installedNames: string[],
  fs: FileSystemAdapter,
): Promise<string | null> {
  const targetPath = resolveFormatPath(rootDir, format);
  const fullPath = fs.joinPath(rootDir, targetPath);

  const installed = installedNames
    .map((n) => skillsByName.get(n))
    .filter(Boolean) as BuiltinSkill[];

  const lines: string[] = [];
  lines.push(MANAGED_START);
  lines.push("");
  lines.push("# AgentContextKit Skills");
  lines.push("");
  lines.push("The following reusable skills are installed in `.contextkit/skills/`.");
  lines.push("");
  lines.push("## Installed Skills");
  lines.push("");
  for (const skill of installed) {
    lines.push(`- \`${skill.name}\` — ${skill.title}`);
  }
  lines.push("");
  lines.push("## Usage Guidance");
  lines.push("");
  lines.push("When working on a task, load the relevant skill file from `.contextkit/skills/`.");
  lines.push("");
  lines.push(MANAGED_END);

  const managedContent = lines.join("\n") + "\n";

  const exists = await fs.fileExists(fullPath);
  let existingContent = "";
  if (exists) {
    existingContent = await fs.readFile(fullPath);
  }

  const startIdx = existingContent.indexOf(MANAGED_START);
  const endIdx = existingContent.indexOf(MANAGED_END);

  let newContent: string;
  if (startIdx >= 0 && endIdx > startIdx) {
    newContent = existingContent.slice(0, startIdx) + managedContent + existingContent.slice(endIdx + MANAGED_END.length);
  } else {
    newContent = existingContent + "\n" + managedContent;
  }

  const dir = manifestDir(rootDir, fullPath);
  const dirExists = await fs.directoryExists(dir);
  if (!dirExists) await fs.mkdir(dir);

  await fs.writeFile(fullPath, newContent);
  return targetPath;
}

// ── Doctor ──

export async function runSkillsDoctor(rootDir: string, fs: FileSystemAdapter): Promise<SkillDoctorIssue[]> {
  const issues: SkillDoctorIssue[] = [];
  const manifest = await readManifest(rootDir, fs);

  for (const entry of manifest.skills) {
    const fullPath = fs.joinPath(rootDir, entry.path);
    const fileExists = await fs.fileExists(fullPath);

    if (!fileExists) {
      issues.push({
        id: `doctor-missing-${entry.name}`,
        severity: "error",
        message: `Skill file not found: ${entry.path}`,
        filePath: entry.path,
        suggestion: `Reinstall the skill with: contextkit skills add ${entry.name}`,
      });
      continue;
    }

    if (entry.source === "builtin") {
      const builtin = skillsByName.get(entry.name);
      if (!builtin) {
        issues.push({
          id: `doctor-unknown-${entry.name}`,
          severity: "warning",
          message: `Skill "${entry.name}" is not a known built-in skill.`,
          filePath: entry.path,
          suggestion: "Remove it with: contextkit skills remove <name>",
        });
        continue;
      }

      if (builtin.version !== entry.version) {
        issues.push({
          id: `doctor-outdated-${entry.name}`,
          severity: "info",
          message: `Skill "${entry.name}" is outdated (installed: ${entry.version}, available: ${builtin.version}).`,
          filePath: entry.path,
          suggestion: `Update with: contextkit skills update`,
        });
      }

      try {
        const content = await fs.readFile(fullPath);
        const localHash = hashContent(content);
        if (entry.localHash && localHash !== entry.localHash) {
          issues.push({
            id: `doctor-modified-${entry.name}`,
            severity: "warning",
            message: `Skill "${entry.name}" has been modified locally.`,
            filePath: entry.path,
            suggestion: "Review changes or reinstall with --overwrite to reset.",
          });
        }
      } catch {
        // already handled by fileExists check above
      }
    }
  }

  return issues;
}

// ── Recommended Skills ──

export function getRecommendedSkills(
  detectedProject: { frameworks: string[]; languages: string[]; testTools: string[]; hasDocker: boolean; hasDatabaseMigrations: boolean; hasCi: boolean },
): string[] {
  const recommendations: string[] = [];
  const frameworkSet = new Set(detectedProject.frameworks.map((f) => f.toLowerCase()));

  if (frameworkSet.has("next.js")) {
    recommendations.push("nextjs", "nextjs-app-router", "react-ui", "api-security", "environment-variables");
  }
  if (frameworkSet.has("react")) {
    recommendations.push("react", "react-ui", "frontend-performance");
  }
  if (frameworkSet.has("vue")) {
    recommendations.push("vue", "frontend-performance");
  }
  if (frameworkSet.has("express")) {
    recommendations.push("express", "api-design-rest", "api-security");
  }
  if (frameworkSet.has("fastify")) {
    recommendations.push("fastify");
  }
  if (frameworkSet.has("nestjs")) {
    recommendations.push("nestjs", "api-security");
  }
  if (frameworkSet.has("svelte")) {
    recommendations.push("sveltekit");
  }
  if (frameworkSet.has("astro")) {
    recommendations.push("astro");
  }

  if (detectedProject.languages.includes("TypeScript")) {
    recommendations.push("typescript-strict");
  }

  if (detectedProject.testTools.length > 0) {
    for (const tool of detectedProject.testTools) {
      const lower = tool.toLowerCase();
      if (lower === "vitest") recommendations.push("vitest");
      if (lower === "jest") recommendations.push("jest");
      if (lower === "playwright") recommendations.push("playwright");
      if (lower === "cypress") recommendations.push("cypress");
    }
    recommendations.push("testing-strategy", "mocking-strategy");
  }

  if (detectedProject.hasDocker) {
    recommendations.push("docker", "deployment-checklist");
  }
  if (detectedProject.hasDatabaseMigrations) {
    recommendations.push("database-migrations", "postgres-best-practices");
  }
  if (detectedProject.hasCi) {
    recommendations.push("github-actions-ci");
  }

  recommendations.push("security-review", "code-review", "context-budgeting");

  return [...new Set(recommendations)];
}

// ── Resolve format path ──

function resolveFormatPath(rootDir: string, format: InstructionFormat): string {
  const kindToPath: Record<InstructionFormat, string> = {
    agents: "AGENTS.md",
    claude: "CLAUDE.md",
    cursor: ".cursor/rules/contextkit-skills.mdc",
    copilot: ".github/copilot-instructions.md",
    roo: ".roo/rules/contextkit-skills.md",
    codex: ".codex/instructions.md",
    windsurf: ".windsurfrules",
    gemini: "GEMINI.md",
    markdown: "CONTEXTKIT_SKILLS.md",
  };
  return kindToPath[format] ?? "AGENTS.md";
}
