---
name: npm-package
title: NPM Package Structure
category: package-open-source
subcategory: package-open-source
version: 1.0.0
tags:
  - npm
  - package
  - publish
  - exports
appliesTo:
  - "packages/*/package.json"
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

# NPM Package Structure

## package.json Essentials
- `"name"`: scoped if in organization (`@scope/name`).
- `"version"`: follow semver strictly.
- `"type"`: `"module"` for ESM packages.
- `"main"`: CJS entry point.
- `"module"` or `"exports"`: ESM entry point.
- `"types"`: TypeScript declaration entry.
- `"files"`: explicit whitelist of published files.

## Exports Map
```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  }
}
```

## Bin
- CLI tools should use `"bin"` pointing to a built file.
- Use `#!/usr/bin/env node` as the first line.
- Build with tsup or similar bundler for a single-file executable.

## Publishing Hygiene
- Run `npm pack --dry-run` to preview what gets published.
- Never publish `src/`, tests, config files, or secrets.
- Use `.npmignore` for files that should be in git but not published.
- Include `LICENSE`, `README.md`, `CHANGELOG.md`.
