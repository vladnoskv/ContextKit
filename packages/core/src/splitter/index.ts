import type { SplitInput, SplitOutput, InstructionFileKind } from "../types/index.js";
import { parseMarkdown } from "../parser/index.js";

const TOPIC_MAP: Record<string, string> = {
  overview: "project-overview",
  introduction: "project-overview",
  about: "project-overview",
  architecture: "architecture",
  design: "architecture",
  structure: "architecture",
  frontend: "frontend",
  ui: "frontend",
  component: "frontend",
  style: "frontend",
  client: "frontend",
  backend: "backend",
  server: "backend",
  api: "backend",
  database: "database",
  data: "database",
  prisma: "database",
  migration: "database",
  test: "testing",
  spec: "testing",
  quality: "testing",
  secur: "security",
  auth: "security",
  deploy: "deployment",
  release: "deployment",
  ci: "deployment",
  cd: "deployment",
  operation: "operations",
  monitor: "operations",
  logging: "operations",
  issue: "known-issues",
  trouble: "known-issues",
  bug: "known-issues",
  known: "known-issues",
};

export function splitInstructionFile(input: SplitInput): SplitOutput {
  const parsed = parseMarkdown(input.content, input.filePath);
  const backupPath = `${input.filePath}.contextkit-backup`;

  const topicGroups = groupSections(parsed);
  const modules: SplitOutput["modules"] = [];
  const processedTopics = new Set<string>();

  const docDir = input.outputDir.replace(/\/$/, "");

  for (const [topic, sections] of Object.entries(topicGroups)) {
    const fileName = `${topic}.md`;
    const path = `${docDir}/${fileName}`;
    const heading = sections[0]?.heading ?? topic;

    let content = `# ${capitalizeWords(topic.replace(/-/g, " "))}\n\n`;
    for (const section of sections) {
      // If section heading is the same as file title, don't duplicate H1
      if (section.headingLevel === 1) {
        content += section.content.replace(/^#\s+.+\n/, "") + "\n";
      } else {
        content += section.content + "\n";
      }
    }

    modules.push({ path, content: content.trim(), heading });
    processedTopics.add(topic);
  }

  // Handle uncategorized sections
  const uncategorized = getUncategorizedSections(parsed, processedTopics);
  if (uncategorized.length > 0) {
    let content = "# Additional Context\n\n";
    for (const section of uncategorized) {
      content += section.content + "\n";
    }
    modules.push({
      path: `${docDir}/additional.md`,
      content: content.trim(),
      heading: "Additional Context",
    });
  }

  // Build router file
  const rootContent = buildRouterContent(input, modules, docDir);

  return { rootContent, modules, backupPath };
}

function groupSections(
  parsed: ReturnType<typeof parseMarkdown>,
): Record<string, Array<{ heading: string; headingLevel: number; content: string }>> {
  const groups: Record<string, Array<{ heading: string; headingLevel: number; content: string }>> = {};

  for (const section of parsed.sections) {
    const lower = section.heading.toLowerCase();
    let topic = "additional";

    for (const [keyword, mappedTopic] of Object.entries(TOPIC_MAP)) {
      if (lower.includes(keyword)) {
        topic = mappedTopic;
        break;
      }
    }

    if (!groups[topic]) groups[topic] = [];
    groups[topic]!.push({
      heading: section.heading,
      headingLevel: section.headingLevel,
      content: section.content,
    });
  }

  return groups;
}

function getUncategorizedSections(
  parsed: ReturnType<typeof parseMarkdown>,
  processedTopics: Set<string>,
) {
  const result: Array<{ heading: string; headingLevel: number; content: string }> = [];

  for (const section of parsed.sections) {
    const lower = section.heading.toLowerCase();
    let matched = false;
    for (const keyword of Object.keys(TOPIC_MAP)) {
      if (lower.includes(keyword)) {
        matched = true;
        break;
      }
    }
    if (!matched) {
      result.push({
        heading: section.heading,
        headingLevel: section.headingLevel,
        content: section.content,
      });
    }
  }

  return result;
}

function buildRouterContent(
  input: SplitInput,
  modules: SplitOutput["modules"],
  docDir: string,
): string {
  const lines: string[] = [];
  const headerMatch = input.content.match(/^#\s+(.+)/);

  lines.push(`# ${headerMatch?.[1] ?? "AGENTS.md"}`);
  lines.push("");
  lines.push("This file is a compact router for AI coding agents.");
  lines.push("");

  lines.push("## Read First");
  lines.push("");

  for (const mod of modules) {
    const name = mod.path.split("/").pop()?.replace(".md", "") ?? mod.heading;
    const relativePath = mod.path.startsWith("./") ? mod.path : `./${mod.path}`;
    lines.push(`- ${capitalizeWords(name.replace(/-/g, " "))}: [${relativePath}](${relativePath})`);
  }

  lines.push("");
  lines.push("## Core Rules");
  lines.push("");
  lines.push("- Follow the nearest instruction file when multiple apply.");
  lines.push("- Do not edit generated files unless requested.");
  lines.push("- Run relevant validation before finalizing changes.");

  return lines.join("\n");
}

function capitalizeWords(s: string): string {
  return s
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
