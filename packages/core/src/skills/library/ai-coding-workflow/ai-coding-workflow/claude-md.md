---
name: claude-md
title: CLAUDE.md Best Practices
category: ai-coding-workflow
subcategory: ai-coding-workflow
version: 1.0.0
tags:
  - claude.md
  - claude
  - instructions
appliesTo:
  - "CLAUDE.md"
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

# CLAUDE.md Best Practices

## Purpose
CLAUDE.md is the instruction file for Claude Code, providing project context and coding conventions.

## Structure
- Project description and one-line purpose.
- Directory structure with key files.
- Build/test/lint commands.
- Coding style and conventions.
- Security constraints.

## Claude-Specific Tips
- Claude reads CLAUDE.md on every new conversation. Keep it current.
- Put build commands at the top so Claude can verify its work.
- Specify TypeScript strictness and any project-wide patterns.
- List tools and libraries Claude should use, not alternatives.
- Mention which files should NOT be edited without care.

## Validation
Run `contextkit validate` to check for stale instructions, oversized files, and conflicts with other instruction files.
