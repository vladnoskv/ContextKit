---
name: i18n-basics
title: i18n Basics
category: i18n-localization
subcategory: i18n-localization
version: 1.0.0
tags:
  - i18n-localization
  - localization
  - translation
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

# i18n Basics

## Key Principles
- Never hardcode user-facing strings. Use translation keys.
- All user-visible text must go through the i18n system.
- Dates, numbers, and currencies must use locale-aware formatting.
- UI layouts must accommodate text expansion (German text is ~30% longer than English).

## Key Design
- Use structured, namespaced keys: `"auth.login.title"`, not `"loginTitle"`.
- Group by feature: `auth.*`, `dashboard.*`, `settings.*`.
- Include a `common.*` namespace for shared strings (cancel, save, delete).
- Avoid dynamic key construction: `t(`error.${code}`)` is fragile.

## Locale Files
- One file per locale: `en.json`, `de.json`, `ja.json`.
- Define a base locale (usually English) as the source of truth.
- Missing keys should fall back to the base locale, not crash.
- Validate all locale files have the same keys before deployment.

## Formatting
- Use `Intl.DateTimeFormat` for dates, `Intl.NumberFormat` for numbers.
- `Intl.ListFormat` for comma-separated lists in different languages.
- `Intl.RelativeTimeFormat` for "3 days ago" style text.
- Always pass the user's locale, not a hardcoded one.
