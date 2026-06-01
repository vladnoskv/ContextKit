---
name: code-review
title: Code Review Checklist
category: core-engineering
subcategory: core-engineering
version: 1.0.0
tags:
  - review
  - quality
  - checklist
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

# Code Review Checklist

## Architecture & Design
- Does the change fit the existing architecture?
- Are new abstractions justified and well-named?
- Is there unnecessary coupling between modules?
- Would this change be easy to revert or rollback?

## Correctness
- Are edge cases handled (null, empty, error, boundary)?
- Are race conditions possible in async code?
- Is error handling consistent with project patterns?
- Does it handle concurrent access correctly?

## Performance
- Are there N+1 queries or unnecessary loops?
- Is data fetched at the right granularity?
- Are large allocations avoided in hot paths?
- Is caching considered where appropriate?

## Maintainability
- Are names clear and consistent with project conventions?
- Is the intent obvious from the code, not just comments?
- Are tests included for the changed behavior?
- Is the change isolated or does it touch many files?

## Security
- Is user input validated and sanitized?
- Are secrets or sensitive data exposed?
- Are authorization checks in place?
