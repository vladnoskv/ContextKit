---
name: typescript-strict
title: TypeScript Strict Mode
category: core-engineering
subcategory: typescript
version: 1.0.0
tags:
  - typescript
  - strict
  - safety
appliesTo:
  - "**/*.ts"
  - "**/*.tsx"
compatibility:
  targets:
    - typescript
  majorVersions:
    - version: "4"
      status: maintenance
      requirements:
        - Use strict mode where possible.
        - Prefer `unknown` over `any` at untrusted boundaries.
      features:
        - Template literal types
        - Control-flow type analysis
        - `satisfies` in TypeScript 4.9
    - version: "5"
      status: current
      requirements:
        - Keep `strict` enabled.
        - Use explicit module settings that match the runtime and bundler.
      features:
        - Const type parameters
        - Decorators updates
        - Improved module resolution and narrowing
  expertise:
    - Strict typing
    - Type narrowing
    - Runtime boundary validation
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

# TypeScript Strict Mode

## Rules
- Do not introduce `any` unless there is no practical alternative.
- Prefer `unknown` over `any` for untrusted values.
- Validate external input at type boundaries with schemas.
- Keep exported types explicit and narrow.
- Avoid unsafe non-null assertions (`!`). Use proper narrowing instead.
- Use discriminated unions for state machines instead of boolean flags.
- Prefer typed utility functions over repeated inline type casts.
- Enable `noUncheckedIndexedAccess` for array/record access safety.

## Before Editing
- Check the project's `tsconfig.json` for strict settings.
- Identify relevant types in `src/types/` before modifying logic.
- Look for existing type guards and utility types before creating new ones.

## Common Fixes
- Replace `as` casts with type guard functions.
- Add Zod/valibot validation for API boundaries.
- Convert `boolean` state clusters into discriminated unions.
- Use `satisfies` for config objects instead of type annotations.

## Validation
Run `pnpm typecheck` or `tsc --noEmit` after changes.
