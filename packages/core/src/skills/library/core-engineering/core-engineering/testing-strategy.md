---
name: testing-strategy
title: Testing Strategy
category: core-engineering
subcategory: core-engineering
version: 1.0.0
tags:
  - testing
  - vitest
  - jest
  - quality
appliesTo:
  - "**/*.test.*"
  - "**/*.spec.*"
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

# Testing Strategy

## Test Pyramid
- **Unit tests**: Fast, isolated, test pure logic and edge cases.
- **Integration tests**: Test module interaction, database, file I/O.
- **E2E tests**: Critical user flows only. Expensive and flaky.

## Writing Good Tests
- Arrange, Act, Assert: clear structure in every test.
- Test behavior, not implementation details.
- One assertion concept per test (though multiple `expect` calls are fine).
- Use descriptive test names: "should return empty array when input is null".
- Avoid test interdependence; each test sets up its own state.

## What to Test
- Happy path: expected input produces expected output.
- Edge cases: empty, null, undefined, negative, zero, max, overflow.
- Error paths: invalid input, network failure, timeout.
- Boundary conditions: just inside/outside valid ranges.
- State transitions: valid and invalid transitions.

## Coverage
- Aim for high branch coverage on critical business logic, not 100% everywhere.
- Focus on decision points: conditionals, loops, error handlers.
- Untested code is legacy code. Add tests before refactoring.

## Tools
- Use the project's test runner (Vitest, Jest, Node test, etc.).
- Mock external dependencies, not internal modules.
- Use test fixtures and factories for complex data setup.
