---
name: postgres-best-practices
title: PostgreSQL Best Practices
category: database
subcategory: postgres
version: 1.0.0
tags:
  - postgres
  - sql
  - database
  - performance
appliesTo:
  - "**/*.sql"
  - "**/migrations/**/*"
  - "**/*.db.*"
compatibility:
  targets:
    - postgresql
  majorVersions:
    - version: "14"
      status: maintenance
      requirements:
        - Use explicit transaction boundaries for migrations.
        - Confirm managed-host extension support before relying on extensions.
      features:
        - Query planner improvements
        - JSON and indexing improvements
    - version: "15"
      status: current
      requirements:
        - Review privileges after schema changes.
        - Validate generated SQL against the production target version.
      features:
        - MERGE
        - Improved sort performance
        - Logical replication enhancements
    - version: "16"
      status: current
      requirements:
        - Benchmark query plans after major upgrades.
        - Check extension and managed-host compatibility before upgrades.
      features:
        - Parallel query improvements
        - Logical replication from standbys
        - Monitoring enhancements
  expertise:
    - Indexes
    - Migrations
    - Query plans
    - Data integrity
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

# PostgreSQL Best Practices

## Schema Design
- Use `TEXT` over `VARCHAR(n)` unless you have a specific length constraint.
- Use `TIMESTAMPTZ` for all timestamps. Never use `TIMESTAMP` without timezone.
- Use `UUID` or `BIGINT` for primary keys. Avoid sequential integers for public APIs.
- Add `NOT NULL` by default. Nullable only when the field is truly optional.
- Use `CHECK` constraints for business rules that should never be violated.

## Indexes
- Index foreign key columns that are used in JOINs.
- Use partial indexes for queries that filter on a boolean flag.
- Use composite indexes for multi-column WHERE clauses (order matters).
- Use `EXPLAIN ANALYZE` to verify indexes are actually used.
- Don't over-index: each index slows writes.

## Queries
- Use parameterized queries to prevent SQL injection.
- Avoid `SELECT *`. List only the columns you need.
- Use `EXISTS` for existence checks, not `COUNT(*) > 0`.
- Batch INSERTs/UPDATEs to reduce round trips.
- Use `LIMIT` and cursor-based pagination for large result sets.

## Transactions
- Keep transactions short. No I/O or external API calls inside transactions.
- Use appropriate isolation levels. Default READ COMMITTED is fine for most cases.
- Handle serialization failures with retry logic.
- Use `BEGIN`, `COMMIT`, `ROLLBACK` explicitly, not auto-commit for multi-statement ops.
