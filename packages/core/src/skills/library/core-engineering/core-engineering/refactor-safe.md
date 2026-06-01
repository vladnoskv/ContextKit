---
name: refactor-safe
title: Safe Refactoring Rules
category: core-engineering
subcategory: core-engineering
version: 1.0.0
tags:
  - refactor
  - safety
  - tests
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

# Safe Refactoring Rules

## Principles
- Preserve external behavior. Refactoring changes structure, not functionality.
- Work in small, atomic steps that each pass tests.
- Commit each step separately so reverts are granular.
- Run the full test suite between each step.

## Before Starting
- Ensure all existing tests pass on the current HEAD.
- Read the code thoroughly to understand its contract.
- Identify all callers and public API consumers.
- Write characterization tests if coverage is missing.

## During Refactoring
- Rename: use IDE refactor tools (F2), not find-and-replace.
- Extract: verify the extracted function is pure or clearly scoped.
- Move: update all imports, re-export from old location if needed.
- Delete: confirm no remaining references with grep/IDE search.
- Change signatures: update all callers, check overloads.

## After Refactoring
- Run the full test suite, including integration tests.
- Run linter and typechecker.
- Check for dead code (unused imports, unreachable paths).
- Update documentation if public signatures changed.
