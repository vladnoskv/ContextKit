# AgentContextKit Skill Library

This directory is the source library for skills that need long-form review and version-specific knowledge.

## Structure

```text
library/
  <category>/
    <subcategory>/
      <skill-name>.md
```

Each skill document uses frontmatter for registry metadata and Markdown for the prompt content:

```markdown
---
name: react-ui
title: React Component Architecture
category: frontend
subcategory: react
version: 1.1.0
tags:
  - react
appliesTo:
  - "**/*.tsx"
compatibility:
  targets:
    - react
  majorVersions:
    - version: "18"
      status: maintenance
      requirements:
        - Keep effects idempotent under Strict Mode.
      features:
        - Automatic batching.
  expertise:
    - Hooks
---

# React Component Architecture
```

## Rules

- The Markdown body is the skill content imported into projects.
- Frontmatter must include `name`, `title`, `category`, `version`, `tags`, and `appliesTo`.
- Use `subcategory` for drilldown in MCP and UI clients.
- Add `compatibility.majorVersions` for skills tied to major framework, runtime, database, or tool versions.
- Do not overwrite user-edited imported skills during updates; improved documents become review candidates.
