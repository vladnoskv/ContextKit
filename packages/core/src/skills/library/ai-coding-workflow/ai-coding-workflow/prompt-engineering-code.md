---
name: prompt-engineering-code
title: Prompt Engineering for Code
category: ai-coding-workflow
subcategory: ai-coding-workflow
version: 1.0.0
tags:
  - prompt
  - engineering
  - ai
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

# Prompt Engineering for Code

## Writing Effective Prompts
- Be specific about the desired outcome, not the implementation details.
- Provide context: project structure, relevant types, existing patterns.
- Specify constraints: "Do not use external libraries", "Must work in Node 18".
- Include examples of the expected output format.
- Break complex tasks into sequential, verifiable steps.

## Prompt Structure
1. **Goal**: One sentence describing what to accomplish.
2. **Context**: Relevant file paths, types, conventions.
3. **Constraints**: What NOT to do, limitations, compatibility requirements.
4. **Format**: Expected output format (code, explanation, both).
5. **Verification**: How to confirm the result is correct.

## Anti-patterns
- "Make it better" — too vague. Specify what "better" means.
- "Fix the bug" without the error message or steps to reproduce.
- Requesting the agent to read every file in the project.
- Mixing multiple unrelated tasks in one prompt.
- Not providing the test command to verify the result.
