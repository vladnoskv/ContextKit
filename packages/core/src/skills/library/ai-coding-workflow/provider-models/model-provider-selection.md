---
name: model-provider-selection
title: Model & Provider Selection
category: ai-coding-workflow
subcategory: provider-models
version: 1.0.0
tags:
  - models
  - providers
  - openai
  - anthropic
  - gemini
  - planning
appliesTo:
  - "**/AGENTS.md"
  - "**/CLAUDE.md"
  - "**/.cursor/rules/**/*"
  - "**/.codex/**/*"
compatibility:
  targets:
    - openai
    - anthropic
    - google
  majorVersions:
    - version: "2026"
      status: current
      requirements:
        - Confirm the model available in the user's environment before writing model-specific instructions.
      features:
        - Provider-specific context windows
        - Coding-agent modes
        - Long-context review workflows
  expertise:
    - Model choice
    - Prompt placement
    - Context budgeting
    - Provider-specific setup
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

# Model & Provider Selection

## Selection Rules
- Match the model to the task: planning, editing, review, debugging, or large-context analysis.
- Prefer high-reasoning coding models for cross-file edits, security-sensitive changes, and architecture decisions.
- Prefer faster or smaller models for narrow formatting, search, summarization, and simple documentation tasks.
- Verify provider-specific instruction locations before installing skills.

## Provider Setup
- OpenAI/Codex: keep skills precise and colocated with repository instructions.
- Anthropic/Claude: use focused skill files and reference them from CLAUDE.md when active.
- Google/Gemini: keep model setup concise and make long-context assumptions explicit.

## Optimization
- Import exact skills for implementation tasks.
- Import category bundles only for onboarding, audits, or broad reviews.
- Keep provider/model choices visible in installed skill frontmatter.
- Review local skill edits before applying upstream improvements.
