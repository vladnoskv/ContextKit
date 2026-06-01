---
name: i18ntk
title: i18ntk Usage
category: i18n-localization
subcategory: i18n-localization
version: 1.0.0
tags:
  - i18ntk
  - translation
  - toolkit
appliesTo:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.json"
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

# i18ntk Usage

## Setup
- Install i18ntk as a dev dependency.
- Configure locale directories and source language in `i18ntk.config.json`.
- Add i18ntk commands to the project's CI pipeline.

## Translation Workflow
1. Developers add keys in the base locale (e.g., `en.json`).
2. i18ntk extracts new keys and marks them for translation.
3. Translators fill in other locale files.
4. i18ntk validates all locales match the base locale structure.
5. Run validation in CI to catch missing translations before merge.

## Validation
- `i18ntk validate` — check for missing keys across locales.
- `i18ntk check placeholders` — verify `{count}`, `{name}` placeholders match.
- `i18ntk scan hardcoded` — find user-facing strings not in locale files.
- `i18ntk duplicates` — detect duplicate translation values (possible copy-paste errors).

## Best Practices
- Run validation on every PR. Block merges on validation failures.
- Use the i18ntk VS Code extension for inline key preview and editing.
- Keep locale files sorted alphabetically for consistent diffs.
- Version-control all locale files, even machine-translated drafts.
