---
name: github-actions-ci
title: GitHub Actions CI
category: devops
subcategory: devops
version: 1.0.0
tags:
  - github-actions
  - ci
  - workflow
appliesTo:
  - ".github/workflows/**/*.yml"
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

# GitHub Actions CI

## Essential Workflows
- **Lint & Typecheck**: Run on every PR. Fast feedback on style and type errors.
- **Test**: Run on every PR and push to main. Vary OS/node versions if needed.
- **Build**: Verify the project builds. Catch build errors before merge.
- **Publish**: Trigger on tag push. Build and publish to npm.

## Workflow Design
- Use `actions/checkout@v4` with `fetch-depth: 0` if you need git history.
- Use `pnpm/action-setup@v2` for pnpm. Cache with `actions/setup-node@v4`.
- Run steps in parallel where possible. Use matrix for OS/version testing.
- Set `continue-on-error` only for optional checks.

## Performance
- Cache `node_modules` across runs: `actions/cache@v4`.
- Use `restore-keys` for partial cache hits.
- Skip unnecessary steps with `if` conditions.
- Use `paths` filters to skip workflows for docs-only changes.

## Security
- Pin action versions to SHA for supply-chain security.
- Use `GITHUB_TOKEN` (auto-generated) for repo operations.
- Never expose secrets in logs: use `secrets.GITHUB_TOKEN` not `${{ secrets.TOKEN }}`.
- Review third-party actions before using them.
