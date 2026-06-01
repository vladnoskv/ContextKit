import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { ALL_SKILLS } from "../dist/index.js";

const root = path.resolve(import.meta.dirname, "../src/skills/library");

for (const skill of ALL_SKILLS) {
  const subcategory = skill.subcategory ?? skill.category;
  const dir = path.join(root, skill.category, subcategory);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, `${skill.name}.md`), renderSkill(skill), "utf8");
}

function renderSkill(skill) {
  return `---
name: ${skill.name}
title: ${skill.title}
category: ${skill.category}
subcategory: ${skill.subcategory ?? skill.category}
version: ${skill.version}
tags:
${skill.tags.map((tag) => `  - ${tag}`).join("\n")}
appliesTo:
${skill.appliesTo.map((glob) => `  - "${glob}"`).join("\n")}
${renderCompatibility(skill.compatibility)}${renderAgentCompatibility(skill.agentCompatibility)}---

${skill.content.trim()}
`;
}

function renderCompatibility(compatibility) {
  if (!compatibility) return "";
  return `compatibility:
  targets:
${compatibility.targets.map((target) => `    - ${target}`).join("\n")}
  majorVersions:
${compatibility.majorVersions.map((version) => `    - version: "${version.version}"
      status: ${version.status}
      requirements:
${version.requirements.map((item) => `        - ${item}`).join("\n")}
      features:
${version.features.map((item) => `        - ${item}`).join("\n")}`).join("\n")}
  expertise:
${compatibility.expertise.map((item) => `    - ${item}`).join("\n")}
`;
}

function renderAgentCompatibility(agentCompatibility) {
  if (!agentCompatibility) return "";
  return `agentCompatibility:
  defaultProvider: ${agentCompatibility.defaultProvider ?? ""}
  defaultModel: ${agentCompatibility.defaultModel ?? ""}
  providers:
${agentCompatibility.providers.map((provider) => `    - provider: ${provider.provider}
      models:
${provider.models.map((model) => `        - id: ${model.id}
          fit: ${model.fit}
          contextWindow: ${model.contextWindow ?? ""}
          recommendedModes:
${model.recommendedModes.map((mode) => `            - ${mode}`).join("\n")}
          setup:
${model.setup.map((item) => `            - ${item}`).join("\n")}
          optimization:
${model.optimization.map((item) => `            - ${item}`).join("\n")}`).join("\n")}
${provider.notes ? `      notes:
${provider.notes.map((note) => `        - ${note}`).join("\n")}` : ""}`).join("\n")}
  setup:
${agentCompatibility.setup.map((item) => `    - ${item}`).join("\n")}
  optimization:
${agentCompatibility.optimization.map((item) => `    - ${item}`).join("\n")}
`;
}
