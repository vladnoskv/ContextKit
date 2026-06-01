---
name: agents-md
title: AGENTS.md Best Practices
category: ai-coding-workflow
subcategory: ai-coding-workflow
version: 1.0.0
tags:
  - agents.md
  - instructions
  - context
appliesTo:
  - "AGENTS.md"
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

# AGENTS.md Best Practices

## Purpose
AGENTS.md provides project-specific instructions to AI coding assistants. It should be the first file an agent reads when working on your project.

## Structure
- **Project Overview**: What the project does, one paragraph.
- **Repo Layout**: Directory structure and what lives where.
- **Commands**: Build, test, lint, typecheck, and any special commands.
- **Architecture**: Key design patterns, data flow, tech stack.
- **Coding Standards**: Conventions the agent must follow.
- **Testing Rules**: How to run tests, coverage expectations.
- **Security Rules**: What the agent must never do.

## Writing Tips
- Be concise. Agents read this before every task.
- Be specific. "Use TypeScript strict mode" is better than "Write good code".
- Include file paths for key modules so agents can find them.
- Keep it updated. Stale instructions cause agent errors.
- Use a "File Map" table mapping paths to purposes.

## Anti-patterns
- Novels. Agents have context limits. Keep it under 500 lines.
- Vagueness. "Follow best practices" is not actionable.
- Outdated info. Remove instructions for deleted files/modules.
- Contradictions. Multiple instruction files with conflicting rules.
