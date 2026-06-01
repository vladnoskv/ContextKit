---
name: postgres-rls
title: PostgreSQL Row-Level Security
category: database
subcategory: database
version: 1.0.0
tags:
  - postgres
  - rls
  - security
  - supabase
appliesTo:
  - "**/*.sql"
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

# PostgreSQL Row-Level Security

## Setup
- Enable RLS per table: `ALTER TABLE items ENABLE ROW LEVEL SECURITY;`
- By default, RLS denies all access when enabled. Add policies to allow access.
- Use `auth.uid()` (Supabase) or `current_setting('app.current_user_id')` for user context.

## Policy Design
- **SELECT**: Users can see their own rows. Add shared/public policies as needed.
- **INSERT**: Users can create rows, with `user_id` set to their own ID.
- **UPDATE**: Users can only update their own rows. Check ownership in `USING`.
- **DELETE**: Users can only delete their own rows.

## Common Patterns
- Ownership: `USING (user_id = auth.uid())`
- Admin bypass: `USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()))`
- Team access: `USING (team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()))`
- Public read: `USING (true)` for truly public data only.

## Testing RLS
- Test policies with actual user roles: `SET LOCAL role authenticated;`
- Verify denied operations throw permission errors.
- Test edge cases: null user_id, deleted users, changed ownership.
- Use `EXPLAIN` to verify policies don't cause performance issues.

## Supabase Notes
- Always enable RLS on public schema tables.
- Use `SECURITY INVOKER` functions to respect RLS in server-side code.
- `service_role` bypasses RLS. Use only in trusted backend code.
