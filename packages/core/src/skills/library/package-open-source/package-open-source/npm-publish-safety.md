---
name: npm-publish-safety
title: NPM Publish Safety
category: package-open-source
subcategory: package-open-source
version: 1.0.0
tags:
  - npm
  - publish
  - security
  - safety
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

# NPM Publish Safety

## Pre-Publish Checklist
1. All tests pass: `pnpm test`
2. Typecheck passes: `pnpm typecheck`
3. Lint passes: `pnpm lint`
4. Build succeeds: `pnpm build`
5. Version bumped in `package.json` and `CHANGELOG.md` updated.
6. Git working tree is clean. All changes committed.

## Preview
- `npm pack --dry-run` to see which files will be included.
- Check for accidental inclusion of `.env`, `src/`, test files.
- Verify `"files"` in `package.json` is correct.
- Check that `dist/` contains the expected output.

## Provenance & Integrity
- Use `npm publish --provenance` for supply-chain transparency.
- Sign packages with `npm audit signatures`.
- Verify `package-lock.json` or `pnpm-lock.yaml` is committed.

## Post-Publish
- Verify the package is installable: `npm install <package>@<version>`
- Check the package page on npmjs.com.
- Tag the release in Git: `git tag v1.2.3 && git push --tags`
- Create a GitHub release with changelog notes.

## Never
- Publish with `--force` unless recovering from a failed publish.
- Overwrite a published version. Unpublish only within 72 hours.
- Publish with secrets, credentials, or internal URLs in the package.
