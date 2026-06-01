import type { CliArgs } from "./args.js";
import {
  getSkill,
  listSkills,
  listCategories,
  searchSkills,
  installSkills,
  removeInstalledSkill,
  updateInstalledSkills,
  getInstalledSkills,
  exportSkillsToInstructionFormat,
  runSkillsDoctor,
  listGroups,
  getGroup,
  resolveGroupSkills,
  createNodeFileSystemAdapter,
  type InstructionFormat,
} from "@contextkit/core";
import { resolveRoot } from "../output/resolve.js";

const VALID_FORMATS: InstructionFormat[] = ["agents", "claude", "cursor", "copilot", "roo", "codex", "windsurf", "gemini", "markdown"];

export async function handleSkills(args: CliArgs): Promise<void> {
  const subcommand = args.positional[0] ?? "list";

  switch (subcommand) {
    case "list":
      await handleList(args);
      break;
    case "show":
      await handleShow(args);
      break;
    case "add":
      await handleAdd(args);
      break;
    case "remove":
      await handleRemove(args);
      break;
    case "installed":
      await handleInstalled(args);
      break;
    case "search":
      await handleSearch(args);
      break;
    case "categories":
      await handleCategories(args);
      break;
    case "groups":
      await handleGroups(args);
      break;
    case "export":
      await handleExport(args);
      break;
    case "doctor":
      await handleDoctor(args);
      break;
    case "update":
      await handleUpdate(args);
      break;
    default:
      process.stderr.write(`Error: Unknown skills subcommand "${subcommand}".\n`);
      process.stderr.write(`Usage: contextkit skills <list|show|add|remove|installed|search|categories|groups|export|doctor|update>\n`);
      process.exit(1);
  }
}

async function handleList(args: CliArgs): Promise<void> {
  const category = args.positional[1] as string | undefined;
  const skills = listSkills(category as never);

  if (args.json) {
    process.stdout.write(JSON.stringify(skills, null, 2) + "\n");
    return;
  }

  if (category) {
    process.stdout.write(`Skills in category "${category}":\n\n`);
    for (const s of skills) {
      process.stdout.write(`  ${s.name} — ${s.description}\n`);
    }
    return;
  }

  const cats = listCategories();
  for (const cat of cats) {
    if (cat.count === 0) continue;
    process.stdout.write(`[${cat.label}] (${cat.count} skills)\n`);
    const catSkills = listSkills(cat.id);
    for (const s of catSkills) {
      process.stdout.write(`  ${s.name} — ${s.description}\n`);
    }
    process.stdout.write("\n");
  }
}

async function handleShow(args: CliArgs): Promise<void> {
  const name = args.positional[1];
  if (!name) {
    process.stderr.write("Error: Skill name required. Usage: contextkit skills show <name>\n");
    process.exit(1);
  }

  const skill = getSkill(name);
  if (!skill) {
    process.stderr.write(`Error: Skill "${name}" not found.\n`);
    process.exit(1);
  }

  if (args.json) {
    process.stdout.write(JSON.stringify(skill, null, 2) + "\n");
    return;
  }

  if (args.flags["raw"] || args.flags.r) {
    process.stdout.write(skill.content + "\n");
    return;
  }

  process.stdout.write(`# ${skill.title} (${skill.name})\n\n`);
  process.stdout.write(`Category:  ${skill.category}\n`);
  process.stdout.write(`Version:   ${skill.version}\n`);
  process.stdout.write(`Tags:      ${skill.tags.join(", ")}\n`);
  process.stdout.write(`Globs:     ${skill.appliesTo.join(", ")}\n`);
  process.stdout.write(`\n${"-".repeat(60)}\n\n`);
  process.stdout.write(skill.content + "\n");
}

async function handleAdd(args: CliArgs): Promise<void> {
  const names: string[] = [];
  const groups: string[] = [];
  let i = 1;
  while (args.positional[i]) {
    const arg = args.positional[i]!;
    if (getGroup(arg)) {
      groups.push(arg);
    } else if (getSkill(arg)) {
      names.push(arg);
    } else {
      process.stderr.write(`Error: "${arg}" is not a known skill or group.\n`);
      process.exit(1);
    }
    i++;
  }

  if (names.length === 0 && groups.length === 0) {
    process.stderr.write("Error: Skill name or group required. Usage: contextkit skills add <name-or-group> [name-or-group...]\n");
    process.exit(1);
  }

  const rootDir = resolveRoot(args);
  const fs = createNodeFileSystemAdapter();
  const format = getFormat(args);
  const dryRun = !!args.dryRun;
  const provider = getStringFlag(args, "provider");
  const model = getStringFlag(args, "model");

  if (dryRun) {
    const allNames = new Set([...names, ...resolveGroupSkills(groups)]);
    process.stdout.write(`[DRY RUN] Would install ${allNames.size} skill(s):\n`);
    for (const name of allNames) {
      process.stdout.write(`  - ${name}\n`);
    }
    if (provider || model) {
      process.stdout.write(`Provider/model: ${provider ?? "default"}/${model ?? "default"}\n`);
    }
    return;
  }

  const result = await installSkills({
    rootDir,
    skills: names,
    groups,
    targetFormat: format,
    overwrite: !!args.flags["overwrite"] || !!args.flags["force"],
    updateInstructionFiles: !!args.flags["update-instructions"],
    provider,
    model,
    dryRun: false,
  }, fs);

  if (args.json) {
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
    return;
  }

  if (result.installed.length > 0) {
    process.stdout.write(`Installed ${result.installed.length} skill(s):\n`);
    for (const s of result.installed) {
      const tokenText = typeof s.estimatedTokens === "number" ? `, ~${s.estimatedTokens.toLocaleString()} tokens` : "";
      const modelText = s.selectedProvider || s.selectedModel ? ` [${s.selectedProvider ?? "provider"}:${s.selectedModel ?? "model"}, ${s.modelFit ?? "unknown"} fit${tokenText}]` : "";
      process.stdout.write(`  - ${s.name} → ${s.path}${modelText}\n`);
    }
  }
  if (result.skipped.length > 0) {
    process.stdout.write(`Skipped: ${result.skipped.join(", ")}\n`);
  }
  if (result.warnings.length > 0) {
    for (const w of result.warnings) {
      process.stderr.write(`Warning: ${w}\n`);
    }
  }
}

async function handleRemove(args: CliArgs): Promise<void> {
  const name = args.positional[1];
  if (!name) {
    process.stderr.write("Error: Skill name required. Usage: contextkit skills remove <name>\n");
    process.exit(1);
  }

  const rootDir = resolveRoot(args);
  const fs = createNodeFileSystemAdapter();

  if (args.dryRun) {
    process.stdout.write(`[DRY RUN] Would remove skill: ${name}\n`);
    return;
  }

  const result = await removeInstalledSkill(rootDir, name, fs, !!args.flags["force"]);

  if (args.json) {
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
    return;
  }

  process.stdout.write(`Removed: ${name}\n`);
  for (const w of result.warnings) {
    process.stderr.write(`Warning: ${w}\n`);
  }
}

async function handleInstalled(args: CliArgs): Promise<void> {
  const rootDir = resolveRoot(args);
  const fs = createNodeFileSystemAdapter();
  const installed = await getInstalledSkills(rootDir, fs);

  if (args.json) {
    process.stdout.write(JSON.stringify(installed, null, 2) + "\n");
    return;
  }

  if (installed.length === 0) {
    process.stdout.write("No skills installed.\n");
    return;
  }

  process.stdout.write("Installed skills:\n");
  for (const s of installed) {
    const modified = s.modified ? " [modified]" : "";
    const outdated = s.upstreamHash && s.localHash !== s.upstreamHash ? " [outdated]" : "";
    const modelText = s.selectedProvider || s.selectedModel ? ` [${s.selectedProvider ?? "provider"}:${s.selectedModel ?? "model"}, ${s.modelFit ?? "unknown"} fit]` : "";
    const tokenText = typeof s.estimatedTokens === "number" ? ` (~${s.estimatedTokens.toLocaleString()} tokens)` : "";
    process.stdout.write(`  ${s.name} — ${s.title}${modelText}${tokenText}${modified}${outdated}\n`);
  }
}

async function handleSearch(args: CliArgs): Promise<void> {
  const query = args.positional[1];
  if (!query) {
    process.stderr.write("Error: Search query required.\n");
    process.exit(1);
  }

  const results = searchSkills(query);

  if (args.json) {
    process.stdout.write(JSON.stringify(results, null, 2) + "\n");
    return;
  }

  if (results.length === 0) {
    process.stdout.write(`No skills found matching "${query}".\n`);
    return;
  }

  process.stdout.write(`Skills matching "${query}" (${results.length}):\n\n`);
  for (const s of results) {
    process.stdout.write(`  ${s.name} [${s.category}] — ${s.description}\n`);
  }
}

async function handleCategories(args: CliArgs): Promise<void> {
  const cats = listCategories();

  if (args.json) {
    process.stdout.write(JSON.stringify(cats, null, 2) + "\n");
    return;
  }

  for (const cat of cats) {
    process.stdout.write(`  ${cat.id} (${cat.count} skills) — ${cat.label}\n`);
  }
}

async function handleGroups(args: CliArgs): Promise<void> {
  const groupId = args.positional[1];
  if (groupId) {
    const group = getGroup(groupId);
    if (!group) {
      process.stderr.write(`Error: Group "${groupId}" not found.\n`);
      process.exit(1);
    }

    if (args.json) {
      const resolved = resolveGroupSkills([groupId]);
      process.stdout.write(JSON.stringify({ id: group.id, label: group.label, skills: resolved }, null, 2) + "\n");
      return;
    }

    process.stdout.write(`[${group.label}] (${group.id})\n\n`);
    const resolved = resolveGroupSkills([groupId]);
    for (const name of resolved) {
      const skill = getSkill(name);
      if (skill) {
        process.stdout.write(`  ${name} — ${skill.title}\n`);
      }
    }
    return;
  }

  const groups = listGroups();
  if (args.json) {
    process.stdout.write(JSON.stringify(groups, null, 2) + "\n");
    return;
  }

  for (const g of groups) {
    process.stdout.write(`[${g.label}] (${g.id}) — ${g.skills.length} skills\n`);
  }
}

async function handleExport(args: CliArgs): Promise<void> {
  const formatArg = args.positional[1] as string | undefined;
  if (!formatArg || !VALID_FORMATS.includes(formatArg as InstructionFormat)) {
    process.stderr.write(`Error: Valid formats: ${VALID_FORMATS.join(", ")}\n`);
    process.exit(1);
  }

  const format = formatArg as InstructionFormat;
  const rootDir = resolveRoot(args);
  const fs = createNodeFileSystemAdapter();
  const outFile = (args.out || args.flags["o"]) as string | undefined;

  if (args.dryRun) {
    const content = await exportSkillsToInstructionFormat(rootDir, format, fs);
    process.stdout.write("[DRY RUN] Would generate:\n\n");
    process.stdout.write(content.slice(0, 2000) + "\n");
    return;
  }

  const content = await exportSkillsToInstructionFormat(rootDir, format, fs, outFile);
  process.stdout.write(content + "\n");
}

async function handleDoctor(args: CliArgs): Promise<void> {
  const rootDir = resolveRoot(args);
  const fs = createNodeFileSystemAdapter();
  const issues = await runSkillsDoctor(rootDir, fs);

  if (args.json) {
    process.stdout.write(JSON.stringify(issues, null, 2) + "\n");
    return;
  }

  if (issues.length === 0) {
    process.stdout.write("Skills doctor: All installed skills are healthy.\n");
    return;
  }

  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");
  const infos = issues.filter((i) => i.severity === "info");

  process.stdout.write(`Skills doctor found ${errors.length} error(s), ${warnings.length} warning(s), ${infos.length} info(s):\n\n`);

  for (const issue of issues) {
    const prefix = issue.severity === "error" ? "✗" : issue.severity === "warning" ? "⚠" : "ℹ";
    process.stdout.write(`  ${prefix} ${issue.message}\n`);
    if (issue.suggestion) {
      process.stdout.write(`    → ${issue.suggestion}\n`);
    }
  }
}

async function handleUpdate(args: CliArgs): Promise<void> {
  const rootDir = resolveRoot(args);
  const fs = createNodeFileSystemAdapter();

  if (args.dryRun) {
    const installed = await getInstalledSkills(rootDir, fs);
    const outdated = installed.filter((s) => {
      const builtin = getSkill(s.name);
      return builtin && builtin.version !== s.version;
    });
    process.stdout.write(`[DRY RUN] Would update ${outdated.length} skill(s).\n`);
    for (const s of outdated) {
      process.stdout.write(`  - ${s.name} (${s.version} → ${getSkill(s.name)?.version})\n`);
    }
    return;
  }

  const result = await updateInstalledSkills(rootDir, fs, !!args.flags["overwrite"] || !!args.flags["force"]);

  if (args.json) {
    process.stdout.write(JSON.stringify(result, null, 2) + "\n");
    return;
  }

  process.stdout.write("Skills updated.\n");
  for (const w of result.warnings) {
    process.stderr.write(`Warning: ${w}\n`);
  }
}

function getFormat(args: CliArgs): InstructionFormat {
  const fmt = (args.flags["format"] || args.flags["f"] || args.format || "agents") as string;
  if (VALID_FORMATS.includes(fmt as InstructionFormat)) return fmt as InstructionFormat;
  return "agents";
}

function getStringFlag(args: CliArgs, name: string): string | undefined {
  const value = args.flags[name];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}
