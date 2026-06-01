---
name: frontend-performance
title: Frontend Performance
category: frontend
subcategory: frontend
version: 1.0.0
tags:
  - performance
  - frontend
  - rendering
  - bundle
appliesTo:
  - "**/*.tsx"
  - "**/*.jsx"
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

# Frontend Performance

## Rendering
- Avoid unnecessary re-renders. Profile with React DevTools.
- `useMemo` for expensive computations, not for trivial values.
- `useCallback` only when passed to memoized child components.
- Lift state up only as needed. Colocate state with the component that uses it.
- Use `React.memo` for pure components that receive the same props often.

## Bundle Size
- Code split at route boundaries with `React.lazy` and `Suspense`.
- Tree-shake: use named imports, avoid barrel imports for large libraries.
- Analyze bundle with `@next/bundle-analyzer` or `vite-bundle-visualizer`.
- Lazy load heavy libraries (date-fns, chart libraries, rich text editors).
- Keep third-party dependencies minimal. Prefer platform APIs over polyfills.

## Core Web Vitals
- **LCP** (Largest Contentful Paint): optimize hero images, preload fonts.
- **INP** (Interaction to Next Paint): avoid long tasks, use web workers for heavy work.
- **CLS** (Cumulative Layout Shift): set explicit dimensions on images, embeds, and dynamic content.

## Images
- Use modern formats: WebP or AVIF.
- `<img loading="lazy"` for below-fold images.
- Serve responsive sizes with `srcset` or framework image components.
- Compress images. Never serve full-resolution camera photos on the web.
