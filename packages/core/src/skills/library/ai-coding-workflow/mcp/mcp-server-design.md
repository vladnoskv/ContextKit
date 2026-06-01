---
name: mcp-server-design
title: MCP Server Design
category: ai-coding-workflow
subcategory: mcp
version: 1.0.0
tags:
  - mcp
  - tools
  - schemas
  - agents
  - integration
appliesTo:
  - "**/mcp/**/*"
  - "**/server.ts"
  - "**/tools/**/*"
compatibility:
  targets:
    - model-context-protocol
  majorVersions:
    - version: "2025"
      status: current
      requirements:
        - Expose narrow tools with explicit JSON schemas.
        - Keep mutating tools opt-in and reviewable.
      features:
        - Tool discovery
        - Structured content
        - Stdio server integration
  expertise:
    - Tool schemas
    - Mutation safety
    - Stdio lifecycle
    - Client compatibility
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

# MCP Server Design

## Tool Design
- Give each tool one clear job and a small input schema.
- Return structured content and a readable text summary.
- Keep discovery tools separate from mutating tools.
- Use stable names and avoid changing tool contracts without a version note.

## Safety
- Treat filesystem, shell, network, credential, and workspace writes as explicit user actions.
- Never overwrite user-modified content without returning a review candidate.
- Validate paths relative to the target workspace.
- Return warnings when a requested provider, model, or target capability is unknown.

## Client Experience
- Make "list", "preview", "apply", and "check" flows easy to chain.
- Include token cost estimates for prompt or skill content.
- Include provider/model fit when tool output affects AI-agent behavior.
