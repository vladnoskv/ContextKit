---
name: documentation
title: Documentation Standards
category: core-engineering
subcategory: core-engineering
version: 1.0.0
tags:
  - docs
  - readme
  - documentation
  - api
appliesTo:
  - "**/*.md"
  - "docs/**/*"
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

# Documentation Standards

## README
- One-sentence project description at the top.
- Quick start: one command to install and run.
- Key features listed concisely.
- Link to full documentation and contributing guide.

## API Documentation
- Every public function/class should have a clear description.
- Document parameters, return types, and thrown errors.
- Include a minimal usage example for each public API.
- Note any side effects or performance implications.

## Changelog
- Follow Keep a Changelog format.
- Group by: Added, Changed, Deprecated, Removed, Fixed, Security.
- Link to relevant issues and PRs.
- One version per section with release date.

## Architecture Notes
- High-level system diagram or description.
- Data flow: how data moves through the system.
- Key design decisions and their rationale.
- Directory structure with file purposes.
- Technologies used and why they were chosen.

## Examples
- Provide copy-pasteable examples for common tasks.
- Show both simple and advanced usage patterns.
- Keep examples up to date with the current API.
