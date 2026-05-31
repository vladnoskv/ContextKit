import type {
  ContextKitConfig,
  InstructionFile,
  InstructionFileKind,
  FileSystemAdapter,
} from "../types/index.js";

const KNOWN_INSTRUCTION_PATTERNS: Array<{
  glob: string;
  kind: InstructionFileKind;
}> = [
  { glob: "AGENTS.md", kind: "agents" },
  { glob: "CLAUDE.md", kind: "claude" },
  { glob: ".cursor/rules/*.mdc", kind: "cursor" },
  { glob: ".cursor/rules", kind: "cursor" },
  { glob: ".github/copilot-instructions.md", kind: "copilot" },
  { glob: ".roo/rules/*.md", kind: "roo" },
  { glob: ".roo/rules", kind: "roo" },
  { glob: ".codex/instructions.md", kind: "codex" },
  { glob: ".codex/*.md", kind: "codex" },
  { glob: ".windsurf/rules", kind: "windsurf" },
  { glob: ".gemini/GEMINI.md", kind: "gemini" },
];

export async function scanInstructions(
  config: ContextKitConfig,
  fs: FileSystemAdapter,
): Promise<InstructionFile[]> {
  const files: InstructionFile[] = [];
  const seen = new Set<string>();

  const globPatterns = [...KNOWN_INSTRUCTION_PATTERNS];

  if (config.customInstructionFiles) {
    for (const custom of config.customInstructionFiles) {
      const isGlob = custom.includes("*");
      globPatterns.push({
        glob: custom,
        kind: "custom",
      });
    }
  }

  for (const pattern of globPatterns) {
    const matches = await matchGlob(fs, config.rootDir, pattern.glob);
    for (const match of matches) {
      const relativePath = fs.relativePath(config.rootDir, match);
      if (seen.has(relativePath)) continue;

      const exclude = config.exclude ?? [];
      if (exclude.some((e) => match.includes(e))) continue;

      try {
        const content = await fs.readFile(match);
        const st = await fs.stat(match);
        const estimatedTokens = Math.ceil(content.length / 4);

        files.push({
          path: relativePath,
          kind: pattern.kind,
          content,
          sizeBytes: st.size,
          estimatedTokens,
          lastModified: new Date(st.mtimeMs),
        });
        seen.add(relativePath);
      } catch {
        // skip unreadable files
      }
    }
  }

  // Sort: main files first, then grouped by kind
  files.sort(sortInstructionFiles);

  return files;
}

function sortInstructionFiles(a: InstructionFile, b: InstructionFile): number {
  const order: Record<string, number> = {
    agents: 0,
    claude: 1,
    copilot: 2,
    cursor: 3,
    roo: 4,
    codex: 5,
    windsurf: 6,
    gemini: 7,
    custom: 8,
  };
  return (order[a.kind] ?? 9) - (order[b.kind] ?? 9) || a.path.localeCompare(b.path);
}

async function matchGlob(
  fs: FileSystemAdapter,
  rootDir: string,
  glob: string,
): Promise<string[]> {
  const results: string[] = [];

  if (!glob.includes("*")) {
    const fullPath = fs.joinPath(rootDir, glob);
    if (await fs.fileExists(fullPath)) {
      results.push(fullPath);
    }
    return results;
  }

  const parts = glob.split("/");
  const baseParts: string[] = [];
  let patternIndex = -1;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part === undefined) continue;
    if (part.includes("*")) {
      patternIndex = i;
      break;
    }
    baseParts.push(part);
  }

  const baseDir = fs.joinPath(rootDir, ...baseParts);
  if (!(await fs.directoryExists(baseDir))) return results;

  const postPattern = parts.slice(patternIndex + 1).join("/");
  const filePatternPart = parts[patternIndex] ?? "*";

  const regex = buildGlobRegex(filePatternPart);

  async function walk(dir: string, depth: number): Promise<void> {
    try {
      const entries = await fs.listFiles(dir);
      for (const name of entries) {
        const fullPath = fs.joinPath(dir, name);
        if (await fs.directoryExists(fullPath)) {
          await walk(fullPath, depth + 1);
          continue;
        }
        if (regex.test(name) && (postPattern === "" || name.endsWith(postPattern.replace("*", "")))) {
          results.push(fullPath);
        }
      }
    } catch {
      // skip inaccessible directories
    }
  }

  await walk(baseDir, 0);
  return results;
}

function buildGlobRegex(pattern: string): RegExp {
  let regexStr = "^";
  for (let i = 0; i < pattern.length; i++) {
    const ch = pattern[i];
    if (ch === "*") {
      if (pattern[i + 1] === "*") {
        regexStr += ".*";
        i++;
      } else {
        regexStr += "[^/]*";
      }
    } else if (ch === "?") {
      regexStr += ".";
    } else if (".+^$(){}[]|\\".includes(ch!)) {
      regexStr += "\\" + ch;
    } else {
      regexStr += ch;
    }
  }
  regexStr += "$";
  return new RegExp(regexStr);
}
