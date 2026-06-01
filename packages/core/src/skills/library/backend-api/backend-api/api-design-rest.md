---
name: api-design-rest
title: REST API Design
category: backend-api
subcategory: backend-api
version: 1.0.0
tags:
  - rest
  - api
  - design
  - http
appliesTo:
  - "**/api/**/*"
  - "**/routes/**/*"
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

# REST API Design

## URL Structure
- Use nouns for resources, not verbs: `/api/users`, not `/api/getUsers`.
- Use plural nouns: `/api/users`, `/api/orders`.
- Nested resources for relationships: `/api/users/:id/orders`.
- Avoid deep nesting (max 2 levels).

## HTTP Methods
- `GET` — retrieve. Idempotent. No side effects.
- `POST` — create. Not idempotent.
- `PUT` — full replacement. Idempotent.
- `PATCH` — partial update. Not necessarily idempotent.
- `DELETE` — remove. Idempotent.

## Status Codes
- `200` — success (GET, PUT, PATCH).
- `201` — created (POST). Include `Location` header.
- `204` — success with no content (DELETE).
- `400` — bad request (validation error).
- `401` — unauthenticated.
- `403` — unauthorized (insufficient permissions).
- `404` — not found.
- `409` — conflict (duplicate, version mismatch).
- `422` — unprocessable entity (semantic validation error).
- `429` — rate limited.
- `500` — internal server error.

## Pagination
- Cursor-based: `?cursor=xxx&limit=20`. Include `next_cursor` in response.
- Offset-based: `?offset=0&limit=20`. Include `total` count.
- Always set a default and maximum limit (max 100).
- Return pagination metadata: `{ data: [...], pagination: { ... } }`.
