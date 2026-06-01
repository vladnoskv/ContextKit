---
name: bugfix-systematic
title: Systematic Bug Fixing
category: core-engineering
subcategory: core-engineering
version: 1.0.0
tags:
  - debugging
  - bugs
  - fix
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

# Systematic Bug Fixing

## Process
1. **Reproduce** — Write a minimal reproduction case.
2. **Isolate** — Find the exact line or condition causing the bug.
3. **Understand** — Determine the root cause, not just the symptom.
4. **Patch** — Write the minimal fix. Avoid scope creep.
5. **Test** — Add a regression test that fails before the fix and passes after.
6. **Verify** — Run the full test suite to ensure no regressions.
7. **Document** — Link the fix to the issue tracker.

## Guidelines
- Fix the root cause, not the side effect.
- One bug per commit. Do not bundle unrelated changes.
- Write a test that proves the bug exists before fixing it.
- Check if the same bug pattern exists elsewhere in the codebase.
- Consider whether the bug reveals a design flaw that needs broader refactoring.
- Update documentation if the bug was caused by misleading API behavior.

## Anti-patterns
- Silent catch blocks that swallow errors.
- Fixing symptoms without understanding the cause.
- Adding flags or workarounds instead of fixing the underlying issue.
- Changing behavior for other use cases while fixing one bug.
