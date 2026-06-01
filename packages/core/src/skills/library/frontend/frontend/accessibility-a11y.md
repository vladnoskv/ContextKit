---
name: accessibility-a11y
title: Web Accessibility
category: frontend
subcategory: frontend
version: 1.0.0
tags:
  - a11y
  - accessibility
  - wcag
  - aria
appliesTo:
  - "**/*.tsx"
  - "**/*.jsx"
  - "**/*.html"
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

# Web Accessibility (A11y)

## Core Principles
- All interactive elements must be keyboard accessible.
- All non-text content must have text alternatives.
- Content must be navigable by screen readers.
- Color is never the sole means of conveying information.

## Keyboard Navigation
- Focus order matches visual order (check `tabindex` usage).
- Focus indicators are visible (do not `outline: none` without replacement).
- Custom components implement expected keyboard patterns (ARIA Authoring Practices).
- Skip links for navigation-heavy pages.

## Semantic HTML
- Use `<button>` for buttons, `<a>` for links, not `<div>` with click handlers.
- Use heading hierarchy correctly (`h1` > `h2` > `h3`).
- Use `<form>`, `<label>`, `<fieldset>` for forms.
- Landmark elements: `<header>`, `<main>`, `<nav>`, `<footer>`.

## ARIA
- No ARIA is better than bad ARIA. Prefer semantic HTML.
- `aria-label` for elements without visible text.
- `aria-describedby` for additional context.
- `aria-live` for dynamic content updates.
- `role` only when the native element role is insufficient.

## Visual
- Minimum contrast ratio: 4.5:1 for text, 3:1 for large text.
- Do not rely on color alone for status (add icons or text).
- Support `prefers-reduced-motion` for animations.
- Text can be resized to 200% without breaking layout.
