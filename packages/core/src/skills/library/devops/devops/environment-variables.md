---
name: environment-variables
title: Environment Variables
category: devops
subcategory: devops
version: 1.0.0
tags:
  - env
  - secrets
  - config
  - dotenv
appliesTo:
  - ".env*"
  - "**/config/**/*"
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

# Environment Variables

## File Structure
- `.env.example` — template with dummy values. Committed to git. Documents all required vars.
- `.env` — actual values. In `.gitignore`. Never committed.
- `.env.local` — local overrides. In `.gitignore`.
- `.env.production` — production values. Managed by deployment, not committed.

## Validation
- Validate all required env vars at application startup. Fail fast with a clear error.
- Use Zod schemas to define and validate env var types.
- Provide defaults in code for optional vars, not in the deployment config.
- Use `process.env` only in a central config module, not scattered across files.

## Secrets
- Never log env var values. Log which vars are set, not their values.
- Use a secrets manager for production (Vercel env, GitHub Secrets, Doppler).
- Rotate secrets on a schedule. Have a rotation procedure documented.
- API keys go in env vars, not in config files or source code.

## Naming Conventions
- Prefix with app name for globals: `MYAPP_DATABASE_URL`.
- Use `PUBLIC_` prefix for client-exposed vars (Next.js, Vite).
- Use `NEXT_PUBLIC_`, `VITE_`, etc. per framework conventions.
- Document each variable in `.env.example` with a comment.
