---
name: context-budgeting
title: Context Budgeting
category: ai-coding-workflow
subcategory: ai-coding-workflow
version: 1.0.0
tags:
  - context
  - tokens
  - budget
  - optimization
appliesTo:
  - "**/*.md"
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

# Context Budgeting

## Principles
- Every token in an instruction file costs attention. Be concise.
- Prioritize high-signal information: commands, conventions, constraints.
- Remove low-signal content: long explanations, redundant examples, outdated notes.

## Token Targets
- AGENTS.md / CLAUDE.md: aim for 2000-4000 tokens.
- Single skill/rule file: aim for 500-1500 tokens.
- Context packs: aim for 3000-6000 tokens per domain pack.

## Optimization
- Use tables for file maps instead of bullet lists (fewer tokens).
- Use shorthand: "pnpm t" is understood; write it once with explanation.
- Remove boilerplate explanations. Agents know what "npm install" means.
- Collapse multiple similar examples into one clear example.
- Reference other files rather than duplicating content.

## Measurement
- Run `contextkit tokens` to see token estimates for instruction files.
- Set `tokenWarningThreshold` and `tokenErrorThreshold` in `contextkit.config.json`.
- AgentContextKit will flag oversized files during scans.
- Split large files with `contextkit split` if they exceed thresholds.
