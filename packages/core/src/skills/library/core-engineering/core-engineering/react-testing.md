---
name: react-testing
title: React Testing Patterns
category: core-engineering
subcategory: core-engineering
version: 1.0.0
tags:
  - testing
  - react
  - testing-library
  - vitest
appliesTo:
  - "**/*.test.tsx"
  - "**/*.spec.tsx"
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

# React Testing Patterns

## Query Priority
1. `getByRole` — most accessible, mirrors screen readers.
2. `getByLabelText` — for form fields.
3. `getByPlaceholderText` — fallback for inputs.
4. `getByText` — for non-interactive text content.
5. `getByTestId` — last resort, when no other query works.

## Test Structure
- Render the component with the minimum props needed.
- Interact using `fireEvent` or `userEvent` (prefer `userEvent` for realistic interaction).
- Assert on the rendered output, not on implementation details.
- Test behavior from the user's perspective.

## Patterns
- **State changes**: click a button, assert on visible text change.
- **Async operations**: use `findBy*` queries or `waitFor` for async results.
- **Form submission**: fill inputs, click submit, assert on callback or error message.
- **Error states**: mock the failing API, assert error message is displayed.
- **Accessibility**: assert that interactive elements have accessible roles and labels.

## Mocking
- Mock API calls at the network boundary (`msw` preferred over `jest.mock`).
- Mock context providers minimally. Provide real values when practical.
- Avoid mocking component internals. Test the component as a unit.
- Reset mocks between tests: `afterEach(() => vi.clearAllMocks())`.
