---
name: security-review
title: Security Review
category: core-engineering
subcategory: core-engineering
version: 1.0.0
tags:
  - security
  - audit
  - checklist
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

# Security Review Checklist

## Input Validation
- All user input is validated at the boundary (API, CLI, form).
- File uploads have size limits, MIME type checks, and path sanitization.
- SQL/NoSQL injection vectors are blocked (use parameterized queries).
- Command injection vectors are blocked (no shell exec with user input).

## Authentication & Authorization
- Auth checks happen on every protected endpoint.
- Session tokens are secure (HttpOnly, Secure, SameSite).
- Password resets require email verification and expire.
- Rate limiting exists on login, signup, and sensitive endpoints.

## Data Protection
- Secrets are not in source code, config files, or logs.
- PII is encrypted at rest and masked in logs.
- Error messages do not leak stack traces or internal state.
- Database queries enforce row-level security where applicable.

## Dependencies
- Review new dependencies for maintenance status and known vulns.
- Pin exact versions. Use lockfiles.
- Minimize dependency count. Prefer well-maintained libraries.

## CSRF & XSS
- State-changing requests require CSRF tokens or SameSite cookies.
- HTML output uses proper escaping. Avoid dangerouslySetInnerHTML.
- CSP headers are configured appropriately.
