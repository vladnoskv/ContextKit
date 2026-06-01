---
name: error-handling
title: Error Handling Patterns
category: core-engineering
subcategory: core-engineering
version: 1.0.0
tags:
  - error-handling
  - typescript
  - safety
appliesTo:
  - "**/*.ts"
  - "**/*.tsx"
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

# Error Handling Patterns

## Principles
- Never silently swallow errors. Always log or propagate.
- Distinguish between expected errors (user input) and unexpected errors (bugs).
- Expected errors should return typed error objects, not throw exceptions.
- Unexpected errors should bubble up to a global error boundary.

## Typed Errors
- Use discriminated unions for error types: `{ ok: false, error: NotFoundError }`.
- Define error types for each failure mode: `NotFoundError`, `ValidationError`, `AuthError`.
- Function return types should be `Result<T, E>` or `T | Error`.
- Avoid throwing exceptions for control flow. Use return values.

## Error Boundaries
- API layer: catch all exceptions, return consistent error JSON.
- UI layer: Error Boundary components catch rendering errors.
- Background jobs: retry with backoff, dead-letter queue for persistent failures.
- Startup: fail fast with a clear message if required config is missing.

## User-Safe Messages
- Never expose internal details in user-facing errors.
- Map internal error codes to user-friendly messages.
- Log the full error with stack trace internally for debugging.
- Include a correlation ID so users can reference specific errors.
