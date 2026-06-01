---
name: roo-rules
title: Roo Code Rules
category: ai-coding-workflow
subcategory: ai-coding-workflow
version: 1.0.0
tags:
  - roo
  - roo-code
  - .roo
appliesTo:
  - ".roo/**/*"
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

# Roo Code Rules Best Practices

## File Locations
- `.roo/rules/` — project-level rules loaded by Roo Code.
- Rules can be scoped by file globs in frontmatter.
- Rules apply to AI interactions within Roo Code.

## Structure
```markdown
---
description: Rules for TypeScript
globs: ["**/*.ts", "**/*.tsx"]
---
# TypeScript
- Use strict mode
- Prefer interfaces over type aliases
```

## Best Practices
- Keep rules focused and scoped to relevant file types.
- Use descriptive titles so users know which rules are active.
- Include examples of expected patterns.
- Avoid contradicting rules from other instruction files (AGENTS.md, CLAUDE.md, etc.).
- Regularly review and prune unused or outdated rules.
