---
name: cursor-rules
title: Cursor Rules
category: ai-coding-workflow
subcategory: ai-coding-workflow
version: 1.0.0
tags:
  - cursor
  - .mdc
  - rules
appliesTo:
  - ".cursor/rules/**/*.mdc"
  - ".cursorrules"
agentCompatibility:
  defaultProvider: openai
  defaultModel: gpt-5
  providers:
    - provider: openai
      models:
        - id: gpt-5
          fit: excellent
          contextWindow: large
          recommendedModes:
            - code-editing
            - review
            - planning
          setup:
            - Use the skill as focused task context rather than loading the full skill library.
          optimization:
            - Import only matching category or subcategory skills to keep prompt context precise.
        - id: gpt-4.1
          fit: good
          contextWindow: large
          recommendedModes:
            - code-editing
            - review
          setup:
            - Keep the selected skill near the task-specific repository context.
          optimization:
            - Prefer concise skill bundles and avoid importing unrelated categories.
      notes:
        - Best default for AgentContextKit's coding, review, and planning skills.
    - provider: anthropic
      models:
        - id: claude-sonnet-4
          fit: excellent
          contextWindow: large
          recommendedModes:
            - code-editing
            - architecture
            - review
          setup:
            - Use the imported skill as project guidance in CLAUDE.md or a dedicated skill file.
          optimization:
            - Keep constraints explicit and avoid mixing conflicting provider-specific instructions.

    - provider: google
      models:
        - id: gemini-2.5-pro
          fit: good
          contextWindow: large
          recommendedModes:
            - analysis
            - code-editing
            - review
          setup:
            - Place the skill in GEMINI.md or reference the imported skill file directly.
          optimization:
            - Use category-level imports for broad reviews and exact skills for implementation work.

  setup:
    - Select the provider and model used by the target AI coding agent before importing.
    - Install only the skills that match the current workflow, repository stack, and agent provider.
  optimization:
    - Prefer exact skill imports for implementation tasks and category imports for audits or onboarding.
    - Review modified local skills before applying upstream improvements.
---

# Cursor Rules Best Practices

## File Format
- Use `.mdc` files in `.cursor/rules/` for organized, glob-scoped rules.
- Each rule file has a YAML frontmatter with `globs` defining when to apply.
- A single `.cursorrules` file in the project root applies to all files.

## Rule Design
- Keep rules focused. One file per domain (e.g., `typescript.mdc`, `react.mdc`).
- Use specific globs to load rules only for relevant files.
- Avoid contradictory rules across files.
- Prefer positive instructions ("Do X") over negative ("Don't do Y") for clarity.

## Frontmatter
```yaml
---
globs: "**/*.ts,**/*.tsx"
alwaysApply: false
---
```

## Content
- Start with the most important conventions.
- Include examples of correct vs. incorrect patterns.
- Reference the project's official style guide if one exists.
- Keep rules under 200 lines per file for fast loading.
