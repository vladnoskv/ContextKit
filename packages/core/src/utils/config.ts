import type { ConfigFile, ConflictGroup } from "../types/index.js";
import type { FileSystemAdapter } from "../types/index.js";

export async function loadConfig(
  rootDir: string,
  fs: FileSystemAdapter,
): Promise<ConfigFile | null> {
  const candidates = [
    fs.joinPath(rootDir, "contextkit.config.json"),
    fs.joinPath(rootDir, ".contextkitrc"),
  ];

  for (const candidate of candidates) {
    try {
      const content = await fs.readFile(candidate);
      const parsed = JSON.parse(content);
      return {
        tokenWarningThreshold: parsed.tokenWarningThreshold ?? 4000,
        tokenErrorThreshold: parsed.tokenErrorThreshold ?? 8000,
        preferredInstructionFormat: parsed.preferredInstructionFormat ?? "agents",
        include: parsed.include ?? [],
        exclude: parsed.exclude ?? ["node_modules", ".git", "dist", "build", ".next", "coverage"],
        customInstructionFiles: parsed.customInstructionFiles ?? [],
        conflictRules: parsed.conflictRules ?? [],
      };
    } catch {
      // config file doesn't exist or is invalid
    }
  }

  return null;
}

export function mergeConfig(
  defaults: ConfigFile,
  overrides?: Partial<ConfigFile>,
): ConfigFile {
  return {
    ...defaults,
    ...overrides,
  };
}

export const DEFAULT_CONFIG: ConfigFile = {
  tokenWarningThreshold: 4000,
  tokenErrorThreshold: 8000,
  preferredInstructionFormat: "agents",
  include: [],
  exclude: ["node_modules", ".git", "dist", "build", ".next", "coverage"],
  customInstructionFiles: [],
  conflictRules: [],
};
