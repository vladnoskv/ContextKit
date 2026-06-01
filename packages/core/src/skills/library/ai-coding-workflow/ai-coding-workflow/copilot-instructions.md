---
name: copilot-instructions
title: GitHub Copilot Instructions
category: ai-coding-workflow
subcategory: ai-coding-workflow
version: 1.0.0
tags:
  - copilot
  - github
  - .github/copilot-instructions.md
appliesTo:
  - ".github/copilot-instructions.md"
  - ".github/instructions/*.md"
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

# GitHub Copilot Instructions

## Setup
- Create `.github/copilot-instructions.md` for org/repo-wide Copilot guidance.
- Copilot reads this file when generating completions and chat responses.
- Supported in VS Code, JetBrains, and GitHub.com.

## Content Guidelines
- Define coding conventions: naming, formatting, patterns.
- Specify the tech stack and preferred libraries.
- Include security rules: never generate secrets, validate inputs.
- Mention test frameworks and expectations for generated code.
- Be explicit about what NOT to generate (e.g., "Never use any type").

## Organization
- One file per repository. Keep it under 500 lines.
- Group by topic: TypeScript, React, Testing, API, Security.
- Update when the tech stack or conventions change.
- Review periodically: remove outdated rules.

## Limitations
- Copilot may not follow every instruction precisely.
- Instructions compete with context from open files and prompts.
- Overly long instructions may be truncated (context window limits).
