---
name: cli-tooling
title: CLI Tooling Best Practices
category: devops
subcategory: devops
version: 1.0.0
tags:
  - cli
  - tooling
  - ux
  - args
appliesTo:
  - "packages/cli/**/*"
  - "src/cli/**/*"
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

# CLI Tooling Best Practices

## UX Design
- Default command should show help or do the most common operation.
- Every command should have `--help` showing usage and examples.
- Exit codes: 0 for success, 1 for errors, 2 for usage errors.
- Use `stderr` for errors and diagnostics, `stdout` for data output.

## Argument Conventions
- Long flags: `--output`, `--format`. Short aliases: `-o`, `-f`.
- Boolean flags: `--verbose`, `--quiet`, `--dry-run`.
- Positional args for required, order-dependent inputs.
- `--` to separate flags from positional args.

## Output Formats
- Default: human-readable text to stdout.
- `--json` / `-j`: machine-readable JSON.
- `--quiet` / `-q`: minimal output (errors only).
- `--verbose` / `-v`: detailed output for debugging.

## Safety
- `--dry-run` / `-d` for preview of destructive operations.
- Confirm before overwriting files.
- Validate all paths are within the project root.
- Create backups before modifying files.
- Never run without explicit user confirmation for destructive operations.
