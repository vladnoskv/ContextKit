---
name: sql-performance
title: SQL Performance
category: database
subcategory: database
version: 1.0.0
tags:
  - sql
  - performance
  - postgres
  - optimization
appliesTo:
  - "**/*.sql"
  - "**/*.ts"
  - "**/queries/**/*"
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

# SQL Performance

## Query Optimization
- Always check `EXPLAIN ANALYZE` before deploying queries to production.
- Watch for Seq Scans on large tables. Add targeted indexes.
- Avoid `LIKE '%pattern%'` with leading wildcard. Use full-text search instead.
- Use `WHERE IN` with subqueries carefully. `EXISTS` is often faster.
- Avoid functions on indexed columns in WHERE: `WHERE LOWER(name) = 'foo'` defeats index.

## N+1 Prevention
- Load related data in batches, not one-by-one in loops.
- Use JOINs or subqueries to fetch related data in a single query.
- In ORMs, use `include`, `eager`, or `with` to preload associations.
- Watch for lazy loading that triggers queries in render loops.

## Pagination
- Use keyset/cursor pagination for large datasets, not `OFFSET`.
- Keyset: `WHERE id > :last_id ORDER BY id LIMIT :size`
- Avoid `COUNT(*)` on every page load. Cache total counts or use estimate.
- For search results, consider infinite scroll over numbered pages.

## Index Strategy
- Covering indexes include all columns needed by a query (avoid heap lookups).
- Use `INCLUDE` for non-key columns in indexes.
- Partial indexes: `CREATE INDEX ... WHERE active = true`.
- BRIN indexes for very large append-only tables (time-series).
- Monitor index usage with `pg_stat_user_indexes`.
