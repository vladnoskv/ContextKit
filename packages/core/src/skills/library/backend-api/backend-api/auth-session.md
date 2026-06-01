---
name: auth-session
title: Auth & Session Management
category: backend-api
subcategory: backend-api
version: 1.0.0
tags:
  - auth
  - session
  - jwt
  - cookies
appliesTo:
  - "**/auth/**/*"
  - "**/session/**/*"
  - "**/*.auth.*"
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

# Auth & Session Management

## Tokens
- **Access token**: short-lived (15 min). Stored in memory, not localStorage.
- **Refresh token**: long-lived (7-30 days). HttpOnly, Secure, SameSite=Strict cookie.
- Rotate refresh tokens on use. Invalidate the old one.
- JWT payload: `sub` (user ID), `exp` (expiry), `iat` (issued at), `jti` (token ID).

## Cookies
- `HttpOnly: true` — prevents JavaScript access.
- `Secure: true` — HTTPS only.
- `SameSite: Strict` or `Lax` — CSRF protection.
- `Path` scoped to the auth endpoint.

## Session Flow
1. Login: validate credentials, issue access + refresh tokens.
2. Access tokens sent in `Authorization: Bearer <token>` header.
3. On 401, client uses refresh token cookie to get a new access token.
4. Logout: invalidate refresh token server-side, clear cookie.

## Security
- Hash passwords with bcrypt/argon2. Never store plaintext.
- Rate limit login attempts per IP and per account.
- Require email verification before full access.
- Implement MFA for sensitive operations.
- Session timeout after inactivity. Force re-login for sensitive ops.
