---
name: api-security
title: API Security
category: backend-api
subcategory: backend-api
version: 1.0.0
tags:
  - api
  - security
  - auth
  - rest
appliesTo:
  - "**/api/**/*"
  - "**/routes/**/*"
  - "**/handlers/**/*"
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

# API Security

## Authentication
- Every protected endpoint verifies authentication before any business logic.
- Use short-lived access tokens with refresh token rotation.
- JWTs should have expiration, audience, and issuer claims validated.
- API keys should be transmitted via headers, not query strings.

## Authorization
- Check resource ownership on every request (not just at login).
- Use role-based access control (RBAC) with principle of least privilege.
- Validate that the authenticated user can access the requested resource ID.
- Admin endpoints require explicit admin role checks.

## Input Validation
- Validate all inputs at the API boundary (query, body, params, headers).
- Use schema validation (Zod, valibot) with strict types.
- Reject unknown fields. Define explicit allowlists.
- Sanitize string inputs against injection attacks.

## Rate Limiting
- Apply rate limits per endpoint, per user/IP.
- Stricter limits on auth endpoints (login, signup, password reset).
- Return `429 Too Many Requests` with `Retry-After` header.
- Consider token bucket or sliding window algorithms.

## Response Safety
- Strip internal fields (passwords, tokens, internal IDs) from responses.
- Use consistent error format: `{ error: string, details?: unknown }`.
- Never expose stack traces or internal errors in production.
- Set security headers: `X-Content-Type-Options`, `X-Frame-Options`, CSP.
