---
name: repo-health-check
title: Repository Health Check
category: devops
subcategory: devops
version: 1.0.0
tags:
  - repo
  - health
  - checklist
  - maintenance
appliesTo:
  - "**/*"
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

# Repository Health Check

## Essential Files
- [ ] README.md with project description, setup, and usage.
- [ ] LICENSE file (MIT, Apache 2.0, etc.).
- [ ] CHANGELOG.md with version history.
- [ ] AGENTS.md or CLAUDE.md for AI coding assistants.
- [ ] .gitignore with node_modules, dist, .env, and OS files.
- [ ] .npmignore or "files" in package.json for npm packages.

## Code Quality
- [ ] TypeScript strict mode enabled.
- [ ] Linter configured and passing (ESLint, Biome).
- [ ] Formatter configured and applied (Prettier, Biome).
- [ ] Test suite exists and passes.
- [ ] No dead code (unused imports, unreachable paths).
- [ ] No console.log left in production code.

## Dependencies
- [ ] Dependencies are up to date. No known vulnerabilities.
- [ ] Lockfile committed (pnpm-lock.yaml, package-lock.json).
- [ ] No unused dependencies.
- [ ] Dependencies pinned to exact versions or trusted ranges.

## CI/CD
- [ ] CI runs lint, typecheck, and test on every PR.
- [ ] Build step verifies the project compiles.
- [ ] Automated publish from CI (npm, Docker, etc.).
- [ ] Branch protection rules on main branch.

## Documentation
- [ ] API documentation for public interfaces.
- [ ] Setup guide (one command to get running).
- [ ] Architecture overview for contributors.
- [ ] Environment variables documented in .env.example.
