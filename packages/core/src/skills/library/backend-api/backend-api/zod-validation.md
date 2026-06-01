---
name: zod-validation
title: Zod Schema Validation
category: backend-api
subcategory: backend-api
version: 1.0.0
tags:
  - zod
  - validation
  - typescript
  - schema
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

# Zod Schema Validation

## Schema Design
- Define schemas close to where they're used (API handlers, form components).
- Use `z.object()` for structured data, `z.string()`, `z.number()` for primitives.
- Add `.min()`, `.max()`, `.email()`, `.url()` constraints where meaningful.
- Use `z.enum()` for fixed-value fields, not loose strings.
- Extract reusable field schemas for shared concepts (email, password, UUID).

## Parsing
- Prefer `.safeParse()` over `.parse()` in API handlers to return structured errors.
- Use `.parse()` only when invalid data is a programming error (should crash).
- Always parse external data at the boundary. Never trust unvalidated input.
- Infer types from schemas: `type Foo = z.infer<typeof fooSchema>`.

## Error Handling
- Format Zod errors into user-friendly messages: `.flatten()` or `.format()`.
- Map Zod error codes to translated messages for i18n.
- Log validation failures at warn level for debugging abuse patterns.

## Advanced Patterns
- `z.discriminatedUnion()` for type-safe union parsing.
- `z.lazy()` for recursive schemas.
- `.refine()` for custom validation logic.
- `.transform()` for data transformation during parsing.
- `.brand()` for nominal typing on primitives.
