---
name: nextjs-app-router
title: Next.js App Router
category: frontend
subcategory: nextjs
version: 1.0.0
tags:
  - nextjs
  - react
  - app-router
  - ssr
appliesTo:
  - "**/app/**/*.tsx"
  - "**/app/**/*.ts"
compatibility:
  targets:
    - nextjs
    - react
  majorVersions:
    - version: "14"
      status: maintenance
      requirements:
        - Use the App Router for new routes.
        - Keep Server Components as the default rendering boundary.
      features:
        - Stable Server Actions
        - Partial Prerendering preview
        - Route handlers
    - version: "15"
      status: current
      requirements:
        - Review async request APIs during upgrades.
        - Keep caching behavior explicit per route.
      features:
        - Updated caching defaults
        - React 19 alignment
        - Improved App Router ergonomics
  expertise:
    - Server Components
    - Route handlers
    - Caching and revalidation
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

# Next.js App Router Best Practices

## Component Architecture
- Default to Server Components. Add `"use client"` only when needed.
- Keep client components at the leaf nodes of the tree.
- Pass data from server to client via props, not context or fetch.
- Use `Suspense` boundaries for async server components.

## Data Fetching
- Fetch data in Server Components, not effects.
- Use `fetch` with `{ next: { revalidate } }` for ISR.
- Deduplicate requests with React's `cache()` for per-request memoization.
- Avoid waterfalls: fetch data in parallel where possible.

## Route Handlers
- Use `route.ts` for API endpoints, not `pages/api`.
- Validate input with Zod at the handler boundary.
- Return proper HTTP status codes and typed responses.
- Handle CORS explicitly for external API consumers.

## Performance
- Use `next/image` for all images.
- Lazy load below-fold components with `next/dynamic`.
- Prefetch links with `<Link prefetch>` for navigation speed.
- Monitor bundle size with `@next/bundle-analyzer`.

## Server Actions
- Use for form mutations, not data fetching.
- Validate on the server, not just the client.
- Handle errors gracefully and return user-friendly messages.
- Use `revalidatePath` or `revalidateTag` after mutations.
