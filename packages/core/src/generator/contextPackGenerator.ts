import type {
  ContextPackInput,
  ContextPackOutput,
  ContextPackType,
} from "../types/index.js";
import { parseMarkdown } from "../parser/index.js";

export function createContextPack(input: ContextPackInput): ContextPackOutput {
  const content = generatePackContent(input);
  return { content, packType: input.packType };
}

function generatePackContent(input: ContextPackInput): string {
  switch (input.packType) {
    case "frontend": return generateFrontendPack(input);
    case "backend": return generateBackendPack(input);
    case "database": return generateDatabasePack(input);
    case "testing": return generateTestingPack(input);
    case "security": return generateSecurityPack(input);
    case "deployment": return generateDeploymentPack(input);
    case "full": return generateFullPack(input);
  }
}

function generateFrontendPack(input: ContextPackInput): string {
  const proj = input.detectedProject;
  const lines: string[] = [];

  lines.push("# Frontend Context Pack");
  lines.push("");
  lines.push("## Relevant Project Overview");
  lines.push("");
  if (proj.frameworks.length > 0) {
    lines.push(`- Frontend framework: ${proj.frameworks.filter((f) => frontendFrameworks.includes(f)).join(", ") || proj.frameworks[0]}`);
  }
  lines.push(`- Language: ${proj.languages.join(", ")}`);
  lines.push("");

  lines.push("## Frontend Stack");
  lines.push("");
  lines.push("Detected frontend tools:");
  if (proj.frameworks.some((f) => frontendFrameworks.includes(f))) {
    lines.push(`- Framework: ${proj.frameworks.filter((f) => frontendFrameworks.includes(f)).join(", ")}`);
  }
  if (proj.lintTools.length > 0) {
    lines.push(`- Linting: ${proj.lintTools.join(", ")}`);
  }
  if (proj.formatTools.length > 0) {
    lines.push(`- Formatting: ${proj.formatTools.join(", ")}`);
  }
  lines.push("");

  // Extract relevant sections
  const relevantFiles = input.files.filter(
    (f) =>
      f.kind === "agents" ||
      f.kind === "cursor" ||
      f.kind === "claude",
  );
  appendRelevantSections(lines, relevantFiles, ["frontend", "ui", "component", "style", "css"]);

  lines.push("## UI Standards");
  lines.push("");
  lines.push("- Follow established component patterns.");
  lines.push("- Use the project's styling approach consistently.");
  lines.push("");

  lines.push("## Testing Commands");
  lines.push("");
  if (proj.testCommands.length > 0) {
    for (const cmd of proj.testCommands) {
      lines.push(`- ${cmd}`);
    }
  } else {
    lines.push("- No test commands detected. Add tests for frontend components.");
  }

  return lines.join("\n");
}

function generateBackendPack(input: ContextPackInput): string {
  const proj = input.detectedProject;
  const lines: string[] = [];

  lines.push("# Backend Context Pack");
  lines.push("");
  lines.push("## Relevant Project Overview");
  lines.push("");
  if (proj.frameworks.length > 0) {
    lines.push(`- Backend framework: ${proj.frameworks.filter((f) => backendFrameworks.includes(f)).join(", ") || "Node.js/TypeScript"}`);
  }
  lines.push(`- Package manager: ${proj.packageManager ?? "npm"}`);
  lines.push("");

  const relevantFiles = input.files.filter(
    (f) => f.kind === "agents" || f.kind === "claude",
  );
  appendRelevantSections(lines, relevantFiles, ["backend", "server", "api", "architecture"]);

  lines.push("## API Conventions");
  lines.push("");
  lines.push("- Follow RESTful conventions unless GraphQL is specified.");
  lines.push("- Validate all inputs on the server side.");
  lines.push("- Handle errors gracefully with appropriate status codes.");
  lines.push("");

  lines.push("## Important Files");
  lines.push("");
  lines.push("- Entry point: `src/index.ts` or `src/server.ts`");
  lines.push("- Routes: `src/routes/`");
  lines.push("- Middleware: `src/middleware/`");
  lines.push("");

  return lines.join("\n");
}

function generateDatabasePack(input: ContextPackInput): string {
  const proj = input.detectedProject;
  const lines: string[] = [];

  lines.push("# Database Context Pack");
  lines.push("");

  if (proj.hasDatabaseMigrations) {
    lines.push("## Database Setup");
    lines.push("");
    lines.push("This project uses database migrations.");
    lines.push("");
    lines.push("## Migration Rules");
    lines.push("");
    lines.push("- Always create a new migration for schema changes.");
    lines.push("- Never modify existing migration files.");
    lines.push("- Test migrations both up and down where possible.");
    lines.push("");
  } else {
    lines.push("No database tools detected.");
    lines.push("");
  }

  const relevantFiles = input.files.filter((f) => f.kind === "agents" || f.kind === "claude");
  appendRelevantSections(lines, relevantFiles, ["database", "prisma", "drizzle", "migration", "schema"]);

  return lines.join("\n");
}

function generateTestingPack(input: ContextPackInput): string {
  const proj = input.detectedProject;
  const lines: string[] = [];

  lines.push("# Testing Context Pack");
  lines.push("");
  lines.push("## Testing Stack");
  lines.push("");
  if (proj.testTools.length > 0) {
    lines.push(`- Tools: ${proj.testTools.join(", ")}`);
  } else {
    lines.push("- No test tools detected. Consider adding Vitest, Jest, or Playwright.");
  }
  lines.push("");

  lines.push("## Test Commands");
  lines.push("");
  if (proj.testCommands.length > 0) {
    for (const cmd of proj.testCommands) {
      lines.push(`- ${cmd}`);
    }
  }
  lines.push("");

  const relevantFiles = input.files.filter((f) => f.kind === "agents" || f.kind === "claude");
  appendRelevantSections(lines, relevantFiles, ["test", "spec", "quality"]);

  lines.push("## Testing Standards");
  lines.push("");
  lines.push("- Write tests for all new features and bug fixes.");
  lines.push("- Maintain meaningful test coverage.");
  lines.push("- Run tests before committing changes.");
  lines.push("");

  return lines.join("\n");
}

function generateSecurityPack(input: ContextPackInput): string {
  const proj = input.detectedProject;
  const lines: string[] = [];

  lines.push("# Security Context Pack");
  lines.push("");
  lines.push("## Security Rules");
  lines.push("");
  lines.push("- Never commit secrets, API keys, or credentials to the repository.");
  lines.push("- Use environment variables for all sensitive configuration.");
  lines.push("- Keep dependencies updated to patch security vulnerabilities.");
  lines.push("- Validate all user inputs on the server side.");
  lines.push("");

  const relevantFiles = input.files.filter((f) => f.kind === "agents" || f.kind === "claude");
  appendRelevantSections(lines, relevantFiles, ["secur", "auth", "environment", "env"]);

  if (proj.hasDocker) {
    lines.push("## Container Security");
    lines.push("");
    lines.push("- Use specific base image tags, not `latest`.");
    lines.push("- Run containers as non-root users.");
  }

  return lines.join("\n");
}

function generateDeploymentPack(input: ContextPackInput): string {
  const proj = input.detectedProject;
  const lines: string[] = [];

  lines.push("# Deployment Context Pack");
  lines.push("");

  if (proj.hasDocker) {
    lines.push("## Docker");
    lines.push("");
    lines.push("This project uses Docker for containerization.");
    lines.push("- Build: `docker build -t app .`");
    lines.push("- Run: `docker compose up`");
    lines.push("");
  }

  if (proj.hasCi) {
    lines.push("## CI/CD");
    lines.push("");
    lines.push("CI/CD pipelines are configured.");
    lines.push("- Check `.github/workflows/` for pipeline definitions.");
    lines.push("");
  }

  const relevantFiles = input.files.filter((f) => f.kind === "agents" || f.kind === "claude");
  appendRelevantSections(lines, relevantFiles, ["deploy", "release", "ci", "cd", "docker", "production"]);

  lines.push("## Build Commands");
  lines.push("");
  lines.push("Ensure a successful build before deploying:");
  if (proj.buildCommands.length > 0) {
    for (const cmd of proj.buildCommands) {
      lines.push(`- ${cmd}`);
    }
  }

  return lines.join("\n");
}

function generateFullPack(input: ContextPackInput): string {
  const proj = input.detectedProject;
  const lines: string[] = [];

  lines.push("# Full Context Pack");
  lines.push("");
  lines.push("## Project Overview");
  lines.push("");

  if (proj.frameworks.length > 0) {
    lines.push(`- Framework: ${proj.frameworks.join(", ")}`);
  }
  if (proj.languages.length > 0) {
    lines.push(`- Language: ${proj.languages.join(", ")}`);
  }
  if (proj.packageManager) {
    lines.push(`- Package manager: ${proj.packageManager}`);
  }
  if (proj.testTools.length > 0) {
    lines.push(`- Tests: ${proj.testTools.join(", ")}`);
  }
  if (proj.lintTools.length > 0) {
    lines.push(`- Linting: ${proj.lintTools.join(", ")}`);
  }
  if (proj.hasDocker) lines.push("- Docker: Yes");
  if (proj.hasCi) lines.push("- CI/CD: Yes");
  if (proj.hasDatabaseMigrations) lines.push("- Database migrations: Yes");
  lines.push("");

  // Include all instruction file content
  for (const file of input.files) {
    lines.push(`## ${file.path}`);
    lines.push("");
    lines.push(file.content);
    lines.push("");
  }

  lines.push("## Key Rules Summary");
  lines.push("");
  lines.push("- Follow the coding standards defined in the project.");
  lines.push("- Write tests for new code.");
  lines.push("- Never commit secrets.");
  lines.push("- Keep instruction files lean and up to date.");
  lines.push("");

  lines.push("## Do Not Edit Without Care");
  lines.push("");
  lines.push("This is a generated context pack. Review and customize before using with AI assistants.");
  lines.push("");

  return lines.join("\n");
}

function appendRelevantSections(
  lines: string[],
  files: Array<{ content: string; path: string }>,
  keywords: string[],
): void {
  for (const file of files) {
    const parsed = parseMarkdown(file.content, file.path);
    for (const section of parsed.sections) {
      const lower = section.heading.toLowerCase();
      if (keywords.some((kw) => lower.includes(kw))) {
        const shortContent =
          section.content.length > 500
            ? section.content.slice(0, 500) + "\n\n... (truncated)"
            : section.content;
        lines.push(`### From ${file.path}: ${section.heading}`);
        lines.push("");
        lines.push(shortContent);
        lines.push("");
      }
    }
  }
}

const frontendFrameworks = ["Next.js", "React", "Vue", "Svelte", "Astro", "Nuxt", "Remix"];
const backendFrameworks = ["Express", "Fastify", "NestJS"];
