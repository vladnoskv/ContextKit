import type { DetectedProjectInfo, FileSystemAdapter } from "../types/index.js";

export async function detectProject(
  rootDir: string,
  fs: FileSystemAdapter,
): Promise<DetectedProjectInfo> {
  const files = await safeListFiles(fs, rootDir);
  const fileSet = new Set(files.map((f) => f.toLowerCase()));

  const pkgJson = await safeReadJson(fs, fs.joinPath(rootDir, "package.json"));
  const pkgDeps: Record<string, string> = { ...pkgJson?.dependencies, ...pkgJson?.devDependencies };

  return {
    packageManager: detectPackageManager(fileSet),
    frameworks: detectFrameworks(fileSet, pkgDeps),
    languages: detectLanguages(fileSet, pkgDeps),
    testTools: detectTestTools(fileSet, pkgDeps),
    lintTools: detectLintTools(fileSet, pkgDeps),
    formatTools: detectFormatTools(fileSet, pkgDeps),
    buildCommands: detectBuildCommands(pkgJson),
    testCommands: detectTestCommands(pkgJson),
    hasCi: detectCi(fileSet, rootDir, fs),
    hasDocker: detectDocker(fileSet),
    hasDatabaseMigrations: detectDatabaseMigrations(fileSet),
  };
}

function detectPackageManager(fileSet: Set<string>): DetectedProjectInfo["packageManager"] {
  if (fileSet.has("bun.lockb") || fileSet.has("bun.lock")) return "bun";
  if (fileSet.has("pnpm-lock.yaml")) return "pnpm";
  if (fileSet.has("yarn.lock")) return "yarn";
  if (fileSet.has("package-lock.json")) return "npm";
  return undefined;
}

function detectFrameworks(
  fileSet: Set<string>,
  deps: Record<string, string>,
): string[] {
  const frameworks: string[] = [];

  if (deps["next"]) frameworks.push("Next.js");
  if (deps["react"]) frameworks.push("React");
  if (deps["vue"]) frameworks.push("Vue");
  if (deps["svelte"] || deps["@sveltejs/kit"]) frameworks.push("Svelte");
  if (deps["astro"]) frameworks.push("Astro");
  if (deps["express"]) frameworks.push("Express");
  if (deps["fastify"]) frameworks.push("Fastify");
  if (deps["@nestjs/core"] || deps["@nestjs/common"]) frameworks.push("NestJS");
  if (deps["nuxt"]) frameworks.push("Nuxt");
  if (deps["remix"] || deps["@remix-run/react"]) frameworks.push("Remix");
  if (fileSet.has("svelte.config.js")) frameworks.push("Svelte");
  if (fileSet.has("next.config.js") || fileSet.has("next.config.mjs")) frameworks.push("Next.js");
  if (fileSet.has("astro.config.mjs")) frameworks.push("Astro");

  return [...new Set(frameworks)];
}

function detectLanguages(
  fileSet: Set<string>,
  deps: Record<string, string>,
): string[] {
  const languages: string[] = [];

  if (fileSet.has("tsconfig.json") || deps["typescript"]) {
    languages.push("TypeScript");
  }
  if (hasFiles(fileSet, ".js") || hasFiles(fileSet, ".jsx")) {
    languages.push("JavaScript");
  }
  if (hasFiles(fileSet, ".py")) languages.push("Python");
  if (hasFiles(fileSet, ".go")) languages.push("Go");
  if (hasFiles(fileSet, ".rs") || fileSet.has("cargo.toml")) languages.push("Rust");
  if (hasFiles(fileSet, ".rb")) languages.push("Ruby");
  if (hasFiles(fileSet, ".java")) languages.push("Java");

  return [...new Set(languages)];
}

function detectTestTools(
  fileSet: Set<string>,
  deps: Record<string, string>,
): string[] {
  const tools: string[] = [];

  if (deps["vitest"] || fileSet.has("vitest.config.ts") || fileSet.has("vitest.config.js")) {
    tools.push("Vitest");
  }
  if (deps["jest"] || fileSet.has("jest.config.ts") || fileSet.has("jest.config.js")) {
    tools.push("Jest");
  }
  if (deps["@playwright/test"] || fileSet.has("playwright.config.ts")) {
    tools.push("Playwright");
  }
  if (deps["cypress"] || fileSet.has("cypress.config.ts")) {
    tools.push("Cypress");
  }
  if (deps["mocha"]) tools.push("Mocha");
  if (deps["ava"]) tools.push("AVA");

  return [...new Set(tools)];
}

function detectLintTools(
  fileSet: Set<string>,
  deps: Record<string, string>,
): string[] {
  const tools: string[] = [];

  if (deps["eslint"] || fileSet.has(".eslintrc.js") || fileSet.has(".eslintrc.cjs") || fileSet.has("eslint.config.js")) {
    tools.push("ESLint");
  }
  if (deps["@biomejs/biome"] || fileSet.has("biome.json")) {
    tools.push("Biome");
  }

  return [...new Set(tools)];
}

function detectFormatTools(
  fileSet: Set<string>,
  deps: Record<string, string>,
): string[] {
  const tools: string[] = [];

  if (deps["prettier"] || fileSet.has(".prettierrc") || fileSet.has(".prettierrc.json")) {
    tools.push("Prettier");
  }
  if (deps["@biomejs/biome"] || fileSet.has("biome.json")) {
    tools.push("Biome");
  }

  return [...new Set(tools)];
}

function detectBuildCommands(
  pkgJson: Record<string, any> | null,
): string[] {
  const commands: string[] = [];
  if (!pkgJson?.scripts) return commands;

  const scripts = pkgJson.scripts as Record<string, string>;
  if (scripts.build) commands.push(`npm run build`);
  if (scripts.dev || scripts.start) commands.push(`npm run dev`);
  if (scripts.lint) commands.push(`npm run lint`);
  if (scripts.typecheck) commands.push(`npm run typecheck`);

  return commands;
}

function detectTestCommands(
  pkgJson: Record<string, any> | null,
): string[] {
  const commands: string[] = [];
  if (!pkgJson?.scripts) return commands;

  const scripts = pkgJson.scripts as Record<string, string>;
  if (scripts.test) commands.push(`npm test`);
  if (scripts["test:e2e"]) commands.push(`npm run test:e2e`);
  if (scripts["test:unit"]) commands.push(`npm run test:unit`);

  return commands;
}

function detectCi(
  fileSet: Set<string>,
  rootDir: string,
  fs: FileSystemAdapter,
): boolean {
  if (fileSet.has(".github/workflows") || fileSet.has(".gitlab-ci.yml")) return true;
  return false;
}

function detectDocker(fileSet: Set<string>): boolean {
  return fileSet.has("dockerfile") || fileSet.has("docker-compose.yml") || fileSet.has("docker-compose.yaml");
}

function detectDatabaseMigrations(fileSet: Set<string>): boolean {
  const migrationsPatterns = [
    "prisma/migrations",
    "drizzle",
    "supabase/migrations",
    "migrations/",
    "alembic",
    "flyway",
  ];

  return fileSet.has("prisma/schema.prisma") ||
    migrationsPatterns.some((p) => [...fileSet].some((f) => f.includes(p)));
}

function hasFiles(fileSet: Set<string>, ext: string): boolean {
  return [...fileSet].some((f) => f.toLowerCase().endsWith(ext.toLowerCase()));
}

async function safeListFiles(fs: FileSystemAdapter, dir: string): Promise<string[]> {
  const SKIP_DIRS = new Set([
    "node_modules",
    ".git",
    "dist",
    "build",
    "out",
    ".next",
    ".turbo",
    "coverage",
    "__pycache__",
    ".cache",
    ".yarn",
  ]);

  try {
    const entries = await fs.listFiles(dir);
    const results: string[] = [];
    for (const entry of entries) {
      const fullPath = fs.joinPath(dir, entry);
      try {
        if (await fs.directoryExists(fullPath)) {
          if (SKIP_DIRS.has(entry)) continue;
          if (entry.startsWith(".") && entry !== ".github" && entry !== ".cursor" && entry !== ".roo" && entry !== ".codex" && entry !== ".windsurf" && entry !== ".gemini") {
            continue;
          }
          const sub = await safeListFiles(fs, fullPath);
          results.push(...sub);
        } else {
          results.push(fullPath);
        }
      } catch {
        // skip
      }
    }
    return results;
  } catch {
    return [];
  }
}

async function safeReadJson(
  fs: FileSystemAdapter,
  path: string,
): Promise<Record<string, any> | null> {
  try {
    const content = await fs.readFile(path);
    return JSON.parse(content);
  } catch {
    return null;
  }
}
