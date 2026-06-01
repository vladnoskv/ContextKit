---
name: react-ui
title: React Component Architecture
category: frontend
subcategory: react
version: 1.0.0
tags:
  - react
  - components
  - hooks
  - state
appliesTo:
  - "**/*.tsx"
  - "**/*.jsx"
compatibility:
  targets:
    - react
  majorVersions:
    - version: "18"
      status: maintenance
      requirements:
        - Use concurrent-safe rendering patterns.
        - Keep effects idempotent under Strict Mode remount checks.
      features:
        - Concurrent rendering
        - Automatic batching
        - Transitions
    - version: "19"
      status: current
      requirements:
        - Prefer modern ref handling and action patterns where the app stack supports them.
        - Verify framework support before adopting React 19-only APIs.
      features:
        - Actions
        - Document metadata support
        - Improved hydration diagnostics
  expertise:
    - Component boundaries
    - Hooks
    - State management
    - Rendering performance
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

# React Component Architecture

## Component Design
- Keep components small and focused on one responsibility.
- Separate container (data/logic) from presentational (rendering) components.
- Use composition (`children`, render props) over inheritance or config objects.
- Extract reused patterns into hooks, not HOCs.

## Hooks
- Follow Rules of Hooks: top-level only, no conditionals.
- Custom hooks should start with `use` and return a clear API.
- `useEffect` for synchronization with external systems, not for derived state.
- `useMemo` and `useCallback` only when memoization actually pays off.
- Avoid `useEffect` chains: prefer event handlers and derived state.

## State Management
- Start with `useState` and lift state only as needed.
- Use `useReducer` for complex state with multiple transitions.
- Context for truly global data (theme, auth, locale). Not for frequent updates.
- External state libraries (Zustand, Jotai) for complex cross-component state.

## Performance
- Memoize expensive computations with `useMemo`.
- Stable references with `useCallback` for child component props.
- `React.memo` for pure components that receive the same props often.
- Virtualize long lists. Avoid rendering thousands of DOM nodes.

## Error Handling
- Use Error Boundaries for rendering failures.
- Graceful fallback UI, not blank screens.
- Log errors to observability, not just console.
