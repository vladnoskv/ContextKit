---
name: database-migrations
title: Database Migrations
category: database
subcategory: database
version: 1.0.0
tags:
  - database
  - migrations
  - postgres
  - safety
appliesTo:
  - "**/migrations/**/*"
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

# Database Migrations

## Safety Rules
- Never modify an existing migration. Create a new one to fix issues.
- Test migrations on a staging database before production.
- Back up the database before running migrations in production.
- Use transactions for DDL where the database supports it (PostgreSQL does).

## Idempotency
- Use `IF NOT EXISTS` / `IF EXISTS` to make migrations rerunnable.
- Check for column existence before adding: `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`.
- Check for index existence before creating.

## Design
- One logical change per migration. Don't bundle schema changes.
- Migrations should be reversible. Write `up` and `down` scripts.
- Avoid data migrations in schema migrations. Handle data separately.
- Add comments explaining the WHY, not just the WHAT.

## Review Checklist
- [ ] Migrations are in the correct order (timestamp/sequential naming).
- [ ] No destructive changes (`DROP TABLE`, `DROP COLUMN`) without review.
- [ ] `NOT NULL` columns have a default value or backfill plan.
- [ ] Foreign keys have appropriate `ON DELETE` behavior.
- [ ] Indexes are added for new foreign keys and frequently queried columns.
- [ ] Migrations pass on a fresh database (test down-then-up cycle).
