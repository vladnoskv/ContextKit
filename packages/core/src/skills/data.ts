import type { BuiltinSkill, SkillCategory } from "../types/index.js";

export type { SkillCategory };

export const SKILL_CATEGORIES: { id: SkillCategory; label: string }[] = [
  { id: "core-engineering", label: "Core Engineering" },
  { id: "frontend", label: "Frontend" },
  { id: "backend-api", label: "Backend & API" },
  { id: "database", label: "Database" },
  { id: "security", label: "Security" },
  { id: "devops", label: "DevOps & CI/CD" },
  { id: "package-open-source", label: "Package & Open Source" },
  { id: "ai-coding-workflow", label: "AI Coding Workflow" },
  { id: "framework-specific", label: "Framework Specific" },
  { id: "testing", label: "Testing" },
  { id: "product-ux", label: "Product & UX" },
  { id: "i18n-localization", label: "i18n & Localization" },
  { id: "prediction-market", label: "Prediction Market" },
  { id: "repository-maintenance", label: "Repository Maintenance" },
  { id: "advanced", label: "Advanced" },
];

export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = Object.fromEntries(
  SKILL_CATEGORIES.map((c) => [c.id, c.label]),
) as Record<SkillCategory, string>;

export const ALL_SKILLS: BuiltinSkill[] = [
  // ── Core Engineering (6) ──
  {
    name: "typescript-strict",
    title: "TypeScript Strict Mode",
    category: "core-engineering",
    description: "Rules for writing safe, maintainable TypeScript in strict mode.",
    version: "1.0.0",
    tags: ["typescript", "strict", "safety"],
    appliesTo: ["**/*.ts", "**/*.tsx"],
    content: `# TypeScript Strict Mode

## Rules
- Do not introduce \`any\` unless there is no practical alternative.
- Prefer \`unknown\` over \`any\` for untrusted values.
- Validate external input at type boundaries with schemas.
- Keep exported types explicit and narrow.
- Avoid unsafe non-null assertions (\`!\`). Use proper narrowing instead.
- Use discriminated unions for state machines instead of boolean flags.
- Prefer typed utility functions over repeated inline type casts.
- Enable \`noUncheckedIndexedAccess\` for array/record access safety.

## Before Editing
- Check the project's \`tsconfig.json\` for strict settings.
- Identify relevant types in \`src/types/\` before modifying logic.
- Look for existing type guards and utility types before creating new ones.

## Common Fixes
- Replace \`as\` casts with type guard functions.
- Add Zod/valibot validation for API boundaries.
- Convert \`boolean\` state clusters into discriminated unions.
- Use \`satisfies\` for config objects instead of type annotations.

## Validation
Run \`pnpm typecheck\` or \`tsc --noEmit\` after changes.
`,
  },
  {
    name: "code-review",
    title: "Code Review Checklist",
    category: "core-engineering",
    description: "Senior code review checklist and review heuristics.",
    version: "1.0.0",
    tags: ["review", "quality", "checklist"],
    appliesTo: ["**/*"],
    content: `# Code Review Checklist

## Architecture & Design
- Does the change fit the existing architecture?
- Are new abstractions justified and well-named?
- Is there unnecessary coupling between modules?
- Would this change be easy to revert or rollback?

## Correctness
- Are edge cases handled (null, empty, error, boundary)?
- Are race conditions possible in async code?
- Is error handling consistent with project patterns?
- Does it handle concurrent access correctly?

## Performance
- Are there N+1 queries or unnecessary loops?
- Is data fetched at the right granularity?
- Are large allocations avoided in hot paths?
- Is caching considered where appropriate?

## Maintainability
- Are names clear and consistent with project conventions?
- Is the intent obvious from the code, not just comments?
- Are tests included for the changed behavior?
- Is the change isolated or does it touch many files?

## Security
- Is user input validated and sanitized?
- Are secrets or sensitive data exposed?
- Are authorization checks in place?
`,
  },
  {
    name: "refactor-safe",
    title: "Safe Refactoring Rules",
    category: "core-engineering",
    description: "Safe refactoring rules with tests and behavior preservation.",
    version: "1.0.0",
    tags: ["refactor", "safety", "tests"],
    appliesTo: ["**/*"],
    content: `# Safe Refactoring Rules

## Principles
- Preserve external behavior. Refactoring changes structure, not functionality.
- Work in small, atomic steps that each pass tests.
- Commit each step separately so reverts are granular.
- Run the full test suite between each step.

## Before Starting
- Ensure all existing tests pass on the current HEAD.
- Read the code thoroughly to understand its contract.
- Identify all callers and public API consumers.
- Write characterization tests if coverage is missing.

## During Refactoring
- Rename: use IDE refactor tools (F2), not find-and-replace.
- Extract: verify the extracted function is pure or clearly scoped.
- Move: update all imports, re-export from old location if needed.
- Delete: confirm no remaining references with grep/IDE search.
- Change signatures: update all callers, check overloads.

## After Refactoring
- Run the full test suite, including integration tests.
- Run linter and typechecker.
- Check for dead code (unused imports, unreachable paths).
- Update documentation if public signatures changed.
`,
  },
  {
    name: "bugfix-systematic",
    title: "Systematic Bug Fixing",
    category: "core-engineering",
    description: "Reproduce, isolate, patch, test, and document bug fixes.",
    version: "1.0.0",
    tags: ["debugging", "bugs", "fix"],
    appliesTo: ["**/*"],
    content: `# Systematic Bug Fixing

## Process
1. **Reproduce** — Write a minimal reproduction case.
2. **Isolate** — Find the exact line or condition causing the bug.
3. **Understand** — Determine the root cause, not just the symptom.
4. **Patch** — Write the minimal fix. Avoid scope creep.
5. **Test** — Add a regression test that fails before the fix and passes after.
6. **Verify** — Run the full test suite to ensure no regressions.
7. **Document** — Link the fix to the issue tracker.

## Guidelines
- Fix the root cause, not the side effect.
- One bug per commit. Do not bundle unrelated changes.
- Write a test that proves the bug exists before fixing it.
- Check if the same bug pattern exists elsewhere in the codebase.
- Consider whether the bug reveals a design flaw that needs broader refactoring.
- Update documentation if the bug was caused by misleading API behavior.

## Anti-patterns
- Silent catch blocks that swallow errors.
- Fixing symptoms without understanding the cause.
- Adding flags or workarounds instead of fixing the underlying issue.
- Changing behavior for other use cases while fixing one bug.
`,
  },
  {
    name: "testing-strategy",
    title: "Testing Strategy",
    category: "core-engineering",
    description: "Unit, integration, and E2E test guidance.",
    version: "1.0.0",
    tags: ["testing", "vitest", "jest", "quality"],
    appliesTo: ["**/*.test.*", "**/*.spec.*"],
    content: `# Testing Strategy

## Test Pyramid
- **Unit tests**: Fast, isolated, test pure logic and edge cases.
- **Integration tests**: Test module interaction, database, file I/O.
- **E2E tests**: Critical user flows only. Expensive and flaky.

## Writing Good Tests
- Arrange, Act, Assert: clear structure in every test.
- Test behavior, not implementation details.
- One assertion concept per test (though multiple \`expect\` calls are fine).
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
`,
  },
  {
    name: "security-review",
    title: "Security Review",
    category: "core-engineering",
    description: "General security audit checklist for code changes.",
    version: "1.0.0",
    tags: ["security", "audit", "checklist"],
    appliesTo: ["**/*"],
    content: `# Security Review Checklist

## Input Validation
- All user input is validated at the boundary (API, CLI, form).
- File uploads have size limits, MIME type checks, and path sanitization.
- SQL/NoSQL injection vectors are blocked (use parameterized queries).
- Command injection vectors are blocked (no shell exec with user input).

## Authentication & Authorization
- Auth checks happen on every protected endpoint.
- Session tokens are secure (HttpOnly, Secure, SameSite).
- Password resets require email verification and expire.
- Rate limiting exists on login, signup, and sensitive endpoints.

## Data Protection
- Secrets are not in source code, config files, or logs.
- PII is encrypted at rest and masked in logs.
- Error messages do not leak stack traces or internal state.
- Database queries enforce row-level security where applicable.

## Dependencies
- Review new dependencies for maintenance status and known vulns.
- Pin exact versions. Use lockfiles.
- Minimize dependency count. Prefer well-maintained libraries.

## CSRF & XSS
- State-changing requests require CSRF tokens or SameSite cookies.
- HTML output uses proper escaping. Avoid dangerouslySetInnerHTML.
- CSP headers are configured appropriately.
`,
  },

  // ── Frontend (3) ──
  {
    name: "nextjs-app-router",
    title: "Next.js App Router",
    category: "frontend",
    description: "Next.js App Router patterns, server/client components, and route handlers.",
    version: "1.0.0",
    tags: ["nextjs", "react", "app-router", "ssr"],
    appliesTo: ["**/app/**/*.tsx", "**/app/**/*.ts"],
    content: `# Next.js App Router Best Practices

## Component Architecture
- Default to Server Components. Add \`"use client"\` only when needed.
- Keep client components at the leaf nodes of the tree.
- Pass data from server to client via props, not context or fetch.
- Use \`Suspense\` boundaries for async server components.

## Data Fetching
- Fetch data in Server Components, not effects.
- Use \`fetch\` with \`{ next: { revalidate } }\` for ISR.
- Deduplicate requests with React's \`cache()\` for per-request memoization.
- Avoid waterfalls: fetch data in parallel where possible.

## Route Handlers
- Use \`route.ts\` for API endpoints, not \`pages/api\`.
- Validate input with Zod at the handler boundary.
- Return proper HTTP status codes and typed responses.
- Handle CORS explicitly for external API consumers.

## Performance
- Use \`next/image\` for all images.
- Lazy load below-fold components with \`next/dynamic\`.
- Prefetch links with \`<Link prefetch>\` for navigation speed.
- Monitor bundle size with \`@next/bundle-analyzer\`.

## Server Actions
- Use for form mutations, not data fetching.
- Validate on the server, not just the client.
- Handle errors gracefully and return user-friendly messages.
- Use \`revalidatePath\` or \`revalidateTag\` after mutations.
`,
  },
  {
    name: "react-ui",
    title: "React Component Architecture",
    category: "frontend",
    description: "React component architecture, hooks, and state management.",
    version: "1.0.0",
    tags: ["react", "components", "hooks", "state"],
    appliesTo: ["**/*.tsx", "**/*.jsx"],
    content: `# React Component Architecture

## Component Design
- Keep components small and focused on one responsibility.
- Separate container (data/logic) from presentational (rendering) components.
- Use composition (\`children\`, render props) over inheritance or config objects.
- Extract reused patterns into hooks, not HOCs.

## Hooks
- Follow Rules of Hooks: top-level only, no conditionals.
- Custom hooks should start with \`use\` and return a clear API.
- \`useEffect\` for synchronization with external systems, not for derived state.
- \`useMemo\` and \`useCallback\` only when memoization actually pays off.
- Avoid \`useEffect\` chains: prefer event handlers and derived state.

## State Management
- Start with \`useState\` and lift state only as needed.
- Use \`useReducer\` for complex state with multiple transitions.
- Context for truly global data (theme, auth, locale). Not for frequent updates.
- External state libraries (Zustand, Jotai) for complex cross-component state.

## Performance
- Memoize expensive computations with \`useMemo\`.
- Stable references with \`useCallback\` for child component props.
- \`React.memo\` for pure components that receive the same props often.
- Virtualize long lists. Avoid rendering thousands of DOM nodes.

## Error Handling
- Use Error Boundaries for rendering failures.
- Graceful fallback UI, not blank screens.
- Log errors to observability, not just console.
`,
  },
  {
    name: "accessibility-a11y",
    title: "Web Accessibility",
    category: "frontend",
    description: "WCAG checks, keyboard navigation, labels, contrast, and screen readers.",
    version: "1.0.0",
    tags: ["a11y", "accessibility", "wcag", "aria"],
    appliesTo: ["**/*.tsx", "**/*.jsx", "**/*.html"],
    content: `# Web Accessibility (A11y)

## Core Principles
- All interactive elements must be keyboard accessible.
- All non-text content must have text alternatives.
- Content must be navigable by screen readers.
- Color is never the sole means of conveying information.

## Keyboard Navigation
- Focus order matches visual order (check \`tabindex\` usage).
- Focus indicators are visible (do not \`outline: none\` without replacement).
- Custom components implement expected keyboard patterns (ARIA Authoring Practices).
- Skip links for navigation-heavy pages.

## Semantic HTML
- Use \`<button>\` for buttons, \`<a>\` for links, not \`<div>\` with click handlers.
- Use heading hierarchy correctly (\`h1\` > \`h2\` > \`h3\`).
- Use \`<form>\`, \`<label>\`, \`<fieldset>\` for forms.
- Landmark elements: \`<header>\`, \`<main>\`, \`<nav>\`, \`<footer>\`.

## ARIA
- No ARIA is better than bad ARIA. Prefer semantic HTML.
- \`aria-label\` for elements without visible text.
- \`aria-describedby\` for additional context.
- \`aria-live\` for dynamic content updates.
- \`role\` only when the native element role is insufficient.

## Visual
- Minimum contrast ratio: 4.5:1 for text, 3:1 for large text.
- Do not rely on color alone for status (add icons or text).
- Support \`prefers-reduced-motion\` for animations.
- Text can be resized to 200% without breaking layout.
`,
  },

  // ── Backend & API (2) ──
  {
    name: "api-security",
    title: "API Security",
    category: "backend-api",
    description: "Auth checks, CSRF, rate limits, and input validation for APIs.",
    version: "1.0.0",
    tags: ["api", "security", "auth", "rest"],
    appliesTo: ["**/api/**/*", "**/routes/**/*", "**/handlers/**/*"],
    content: `# API Security

## Authentication
- Every protected endpoint verifies authentication before any business logic.
- Use short-lived access tokens with refresh token rotation.
- JWTs should have expiration, audience, and issuer claims validated.
- API keys should be transmitted via headers, not query strings.

## Authorization
- Check resource ownership on every request (not just at login).
- Use role-based access control (RBAC) with principle of least privilege.
- Validate that the authenticated user can access the requested resource ID.
- Admin endpoints require explicit admin role checks.

## Input Validation
- Validate all inputs at the API boundary (query, body, params, headers).
- Use schema validation (Zod, valibot) with strict types.
- Reject unknown fields. Define explicit allowlists.
- Sanitize string inputs against injection attacks.

## Rate Limiting
- Apply rate limits per endpoint, per user/IP.
- Stricter limits on auth endpoints (login, signup, password reset).
- Return \`429 Too Many Requests\` with \`Retry-After\` header.
- Consider token bucket or sliding window algorithms.

## Response Safety
- Strip internal fields (passwords, tokens, internal IDs) from responses.
- Use consistent error format: \`{ error: string, details?: unknown }\`.
- Never expose stack traces or internal errors in production.
- Set security headers: \`X-Content-Type-Options\`, \`X-Frame-Options\`, CSP.
`,
  },
  {
    name: "zod-validation",
    title: "Zod Schema Validation",
    category: "backend-api",
    description: "Zod schemas, safe parsing, and typed responses.",
    version: "1.0.0",
    tags: ["zod", "validation", "typescript", "schema"],
    appliesTo: ["**/*.ts", "**/*.tsx"],
    content: `# Zod Schema Validation

## Schema Design
- Define schemas close to where they're used (API handlers, form components).
- Use \`z.object()\` for structured data, \`z.string()\`, \`z.number()\` for primitives.
- Add \`.min()\`, \`.max()\`, \`.email()\`, \`.url()\` constraints where meaningful.
- Use \`z.enum()\` for fixed-value fields, not loose strings.
- Extract reusable field schemas for shared concepts (email, password, UUID).

## Parsing
- Prefer \`.safeParse()\` over \`.parse()\` in API handlers to return structured errors.
- Use \`.parse()\` only when invalid data is a programming error (should crash).
- Always parse external data at the boundary. Never trust unvalidated input.
- Infer types from schemas: \`type Foo = z.infer<typeof fooSchema>\`.

## Error Handling
- Format Zod errors into user-friendly messages: \`.flatten()\` or \`.format()\`.
- Map Zod error codes to translated messages for i18n.
- Log validation failures at warn level for debugging abuse patterns.

## Advanced Patterns
- \`z.discriminatedUnion()\` for type-safe union parsing.
- \`z.lazy()\` for recursive schemas.
- \`.refine()\` for custom validation logic.
- \`.transform()\` for data transformation during parsing.
- \`.brand()\` for nominal typing on primitives.
`,
  },

  // ── Database (3) ──
  {
    name: "postgres-best-practices",
    title: "PostgreSQL Best Practices",
    category: "database",
    description: "Queries, constraints, transactions, and indexing for PostgreSQL.",
    version: "1.0.0",
    tags: ["postgres", "sql", "database", "performance"],
    appliesTo: ["**/*.sql", "**/migrations/**/*", "**/*.db.*"],
    content: `# PostgreSQL Best Practices

## Schema Design
- Use \`TEXT\` over \`VARCHAR(n)\` unless you have a specific length constraint.
- Use \`TIMESTAMPTZ\` for all timestamps. Never use \`TIMESTAMP\` without timezone.
- Use \`UUID\` or \`BIGINT\` for primary keys. Avoid sequential integers for public APIs.
- Add \`NOT NULL\` by default. Nullable only when the field is truly optional.
- Use \`CHECK\` constraints for business rules that should never be violated.

## Indexes
- Index foreign key columns that are used in JOINs.
- Use partial indexes for queries that filter on a boolean flag.
- Use composite indexes for multi-column WHERE clauses (order matters).
- Use \`EXPLAIN ANALYZE\` to verify indexes are actually used.
- Don't over-index: each index slows writes.

## Queries
- Use parameterized queries to prevent SQL injection.
- Avoid \`SELECT *\`. List only the columns you need.
- Use \`EXISTS\` for existence checks, not \`COUNT(*) > 0\`.
- Batch INSERTs/UPDATEs to reduce round trips.
- Use \`LIMIT\` and cursor-based pagination for large result sets.

## Transactions
- Keep transactions short. No I/O or external API calls inside transactions.
- Use appropriate isolation levels. Default READ COMMITTED is fine for most cases.
- Handle serialization failures with retry logic.
- Use \`BEGIN\`, \`COMMIT\`, \`ROLLBACK\` explicitly, not auto-commit for multi-statement ops.
`,
  },
  {
    name: "postgres-rls",
    title: "PostgreSQL Row-Level Security",
    category: "database",
    description: "Row-level security policies and ownership checks.",
    version: "1.0.0",
    tags: ["postgres", "rls", "security", "supabase"],
    appliesTo: ["**/*.sql", "**/migrations/**/*"],
    content: `# PostgreSQL Row-Level Security

## Setup
- Enable RLS per table: \`ALTER TABLE items ENABLE ROW LEVEL SECURITY;\`
- By default, RLS denies all access when enabled. Add policies to allow access.
- Use \`auth.uid()\` (Supabase) or \`current_setting('app.current_user_id')\` for user context.

## Policy Design
- **SELECT**: Users can see their own rows. Add shared/public policies as needed.
- **INSERT**: Users can create rows, with \`user_id\` set to their own ID.
- **UPDATE**: Users can only update their own rows. Check ownership in \`USING\`.
- **DELETE**: Users can only delete their own rows.

## Common Patterns
- Ownership: \`USING (user_id = auth.uid())\`
- Admin bypass: \`USING (EXISTS (SELECT 1 FROM admins WHERE user_id = auth.uid()))\`
- Team access: \`USING (team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()))\`
- Public read: \`USING (true)\` for truly public data only.

## Testing RLS
- Test policies with actual user roles: \`SET LOCAL role authenticated;\`
- Verify denied operations throw permission errors.
- Test edge cases: null user_id, deleted users, changed ownership.
- Use \`EXPLAIN\` to verify policies don't cause performance issues.

## Supabase Notes
- Always enable RLS on public schema tables.
- Use \`SECURITY INVOKER\` functions to respect RLS in server-side code.
- \`service_role\` bypasses RLS. Use only in trusted backend code.
`,
  },
  {
    name: "sql-performance",
    title: "SQL Performance",
    category: "database",
    description: "Query plans, indexes, pagination, joins, and N+1 prevention.",
    version: "1.0.0",
    tags: ["sql", "performance", "postgres", "optimization"],
    appliesTo: ["**/*.sql", "**/*.ts", "**/queries/**/*"],
    content: `# SQL Performance

## Query Optimization
- Always check \`EXPLAIN ANALYZE\` before deploying queries to production.
- Watch for Seq Scans on large tables. Add targeted indexes.
- Avoid \`LIKE '%pattern%'\` with leading wildcard. Use full-text search instead.
- Use \`WHERE IN\` with subqueries carefully. \`EXISTS\` is often faster.
- Avoid functions on indexed columns in WHERE: \`WHERE LOWER(name) = 'foo'\` defeats index.

## N+1 Prevention
- Load related data in batches, not one-by-one in loops.
- Use JOINs or subqueries to fetch related data in a single query.
- In ORMs, use \`include\`, \`eager\`, or \`with\` to preload associations.
- Watch for lazy loading that triggers queries in render loops.

## Pagination
- Use keyset/cursor pagination for large datasets, not \`OFFSET\`.
- Keyset: \`WHERE id > :last_id ORDER BY id LIMIT :size\`
- Avoid \`COUNT(*)\` on every page load. Cache total counts or use estimate.
- For search results, consider infinite scroll over numbered pages.

## Index Strategy
- Covering indexes include all columns needed by a query (avoid heap lookups).
- Use \`INCLUDE\` for non-key columns in indexes.
- Partial indexes: \`CREATE INDEX ... WHERE active = true\`.
- BRIN indexes for very large append-only tables (time-series).
- Monitor index usage with \`pg_stat_user_indexes\`.
`,
  },

  // ── Security (0 — security-review is in core-engineering) ──

  // ── AI Coding Workflow (7) ──
  {
    name: "agents-md",
    title: "AGENTS.md Best Practices",
    category: "ai-coding-workflow",
    description: "Best practices for writing AGENTS.md project instruction files.",
    version: "1.0.0",
    tags: ["agents.md", "instructions", "context"],
    appliesTo: ["AGENTS.md"],
    content: `# AGENTS.md Best Practices

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
`,
  },
  {
    name: "claude-md",
    title: "CLAUDE.md Best Practices",
    category: "ai-coding-workflow",
    description: "Best practices for CLAUDE.md instruction files for Claude Code.",
    version: "1.0.0",
    tags: ["claude.md", "claude", "instructions"],
    appliesTo: ["CLAUDE.md"],
    content: `# CLAUDE.md Best Practices

## Purpose
CLAUDE.md is the instruction file for Claude Code, providing project context and coding conventions.

## Structure
- Project description and one-line purpose.
- Directory structure with key files.
- Build/test/lint commands.
- Coding style and conventions.
- Security constraints.

## Claude-Specific Tips
- Claude reads CLAUDE.md on every new conversation. Keep it current.
- Put build commands at the top so Claude can verify its work.
- Specify TypeScript strictness and any project-wide patterns.
- List tools and libraries Claude should use, not alternatives.
- Mention which files should NOT be edited without care.

## Validation
Run \`contextkit validate\` to check for stale instructions, oversized files, and conflicts with other instruction files.
`,
  },
  {
    name: "cursor-rules",
    title: "Cursor Rules",
    category: "ai-coding-workflow",
    description: "Cursor .mdc rules and glob patterns for Cursor IDE.",
    version: "1.0.0",
    tags: ["cursor", ".mdc", "rules"],
    appliesTo: [".cursor/rules/**/*.mdc", ".cursorrules"],
    content: `# Cursor Rules Best Practices

## File Format
- Use \`.mdc\` files in \`.cursor/rules/\` for organized, glob-scoped rules.
- Each rule file has a YAML frontmatter with \`globs\` defining when to apply.
- A single \`.cursorrules\` file in the project root applies to all files.

## Rule Design
- Keep rules focused. One file per domain (e.g., \`typescript.mdc\`, \`react.mdc\`).
- Use specific globs to load rules only for relevant files.
- Avoid contradictory rules across files.
- Prefer positive instructions ("Do X") over negative ("Don't do Y") for clarity.

## Frontmatter
\`\`\`yaml
---
globs: "**/*.ts,**/*.tsx"
alwaysApply: false
---
\`\`\`

## Content
- Start with the most important conventions.
- Include examples of correct vs. incorrect patterns.
- Reference the project's official style guide if one exists.
- Keep rules under 200 lines per file for fast loading.
`,
  },
  {
    name: "copilot-instructions",
    title: "GitHub Copilot Instructions",
    category: "ai-coding-workflow",
    description: "GitHub Copilot instruction file configuration and best practices.",
    version: "1.0.0",
    tags: ["copilot", "github", ".github/copilot-instructions.md"],
    appliesTo: [".github/copilot-instructions.md", ".github/instructions/*.md"],
    content: `# GitHub Copilot Instructions

## Setup
- Create \`.github/copilot-instructions.md\` for org/repo-wide Copilot guidance.
- Copilot reads this file when generating completions and chat responses.
- Supported in VS Code, JetBrains, and GitHub.com.

## Content Guidelines
- Define coding conventions: naming, formatting, patterns.
- Specify the tech stack and preferred libraries.
- Include security rules: never generate secrets, validate inputs.
- Mention test frameworks and expectations for generated code.
- Be explicit about what NOT to generate (e.g., "Never use any type").

## Organization
- One file per repository. Keep it under 500 lines.
- Group by topic: TypeScript, React, Testing, API, Security.
- Update when the tech stack or conventions change.
- Review periodically: remove outdated rules.

## Limitations
- Copilot may not follow every instruction precisely.
- Instructions compete with context from open files and prompts.
- Overly long instructions may be truncated (context window limits).
`,
  },
  {
    name: "roo-rules",
    title: "Roo Code Rules",
    category: "ai-coding-workflow",
    description: "Roo Code instruction files for context and conventions.",
    version: "1.0.0",
    tags: ["roo", "roo-code", ".roo"],
    appliesTo: [".roo/**/*"],
    content: `# Roo Code Rules Best Practices

## File Locations
- \`.roo/rules/\` — project-level rules loaded by Roo Code.
- Rules can be scoped by file globs in frontmatter.
- Rules apply to AI interactions within Roo Code.

## Structure
\`\`\`markdown
---
description: Rules for TypeScript
globs: ["**/*.ts", "**/*.tsx"]
---
# TypeScript
- Use strict mode
- Prefer interfaces over type aliases
\`\`\`

## Best Practices
- Keep rules focused and scoped to relevant file types.
- Use descriptive titles so users know which rules are active.
- Include examples of expected patterns.
- Avoid contradicting rules from other instruction files (AGENTS.md, CLAUDE.md, etc.).
- Regularly review and prune unused or outdated rules.
`,
  },
  {
    name: "context-budgeting",
    title: "Context Budgeting",
    category: "ai-coding-workflow",
    description: "Keep AI prompts compact and relevant by managing token budgets.",
    version: "1.0.0",
    tags: ["context", "tokens", "budget", "optimization"],
    appliesTo: ["**/*.md"],
    content: `# Context Budgeting

## Principles
- Every token in an instruction file costs attention. Be concise.
- Prioritize high-signal information: commands, conventions, constraints.
- Remove low-signal content: long explanations, redundant examples, outdated notes.

## Token Targets
- AGENTS.md / CLAUDE.md: aim for 2000-4000 tokens.
- Single skill/rule file: aim for 500-1500 tokens.
- Context packs: aim for 3000-6000 tokens per domain pack.

## Optimization
- Use tables for file maps instead of bullet lists (fewer tokens).
- Use shorthand: "pnpm t" is understood; write it once with explanation.
- Remove boilerplate explanations. Agents know what "npm install" means.
- Collapse multiple similar examples into one clear example.
- Reference other files rather than duplicating content.

## Measurement
- Run \`contextkit tokens\` to see token estimates for instruction files.
- Set \`tokenWarningThreshold\` and \`tokenErrorThreshold\` in \`contextkit.config.json\`.
- ContextKit will flag oversized files during scans.
- Split large files with \`contextkit split\` if they exceed thresholds.
`,
  },
  {
    name: "prompt-engineering-code",
    title: "Prompt Engineering for Code",
    category: "ai-coding-workflow",
    description: "High-quality coding prompts for AI assistants.",
    version: "1.0.0",
    tags: ["prompt", "engineering", "ai"],
    appliesTo: ["**/*"],
    content: `# Prompt Engineering for Code

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
`,
  },

  // ── i18n (2) ──
  {
    name: "i18n-basics",
    title: "i18n Basics",
    category: "i18n-localization",
    description: "General internationalization project rules and conventions.",
    version: "1.0.0",
    tags: ["i18n-localization", "localization", "translation"],
    appliesTo: ["**/*"],
    content: `# i18n Basics

## Key Principles
- Never hardcode user-facing strings. Use translation keys.
- All user-visible text must go through the i18n system.
- Dates, numbers, and currencies must use locale-aware formatting.
- UI layouts must accommodate text expansion (German text is ~30% longer than English).

## Key Design
- Use structured, namespaced keys: \`"auth.login.title"\`, not \`"loginTitle"\`.
- Group by feature: \`auth.*\`, \`dashboard.*\`, \`settings.*\`.
- Include a \`common.*\` namespace for shared strings (cancel, save, delete).
- Avoid dynamic key construction: \`t(\`error.\${code}\`)\` is fragile.

## Locale Files
- One file per locale: \`en.json\`, \`de.json\`, \`ja.json\`.
- Define a base locale (usually English) as the source of truth.
- Missing keys should fall back to the base locale, not crash.
- Validate all locale files have the same keys before deployment.

## Formatting
- Use \`Intl.DateTimeFormat\` for dates, \`Intl.NumberFormat\` for numbers.
- \`Intl.ListFormat\` for comma-separated lists in different languages.
- \`Intl.RelativeTimeFormat\` for "3 days ago" style text.
- Always pass the user's locale, not a hardcoded one.
`,
  },
  {
    name: "i18ntk",
    title: "i18ntk Usage",
    category: "i18n-localization",
    description: "Use i18ntk correctly in projects for translation management.",
    version: "1.0.0",
    tags: ["i18ntk", "translation", "toolkit"],
    appliesTo: ["**/*.ts", "**/*.tsx", "**/*.json"],
    content: `# i18ntk Usage

## Setup
- Install i18ntk as a dev dependency.
- Configure locale directories and source language in \`i18ntk.config.json\`.
- Add i18ntk commands to the project's CI pipeline.

## Translation Workflow
1. Developers add keys in the base locale (e.g., \`en.json\`).
2. i18ntk extracts new keys and marks them for translation.
3. Translators fill in other locale files.
4. i18ntk validates all locales match the base locale structure.
5. Run validation in CI to catch missing translations before merge.

## Validation
- \`i18ntk validate\` — check for missing keys across locales.
- \`i18ntk check placeholders\` — verify \`{count}\`, \`{name}\` placeholders match.
- \`i18ntk scan hardcoded\` — find user-facing strings not in locale files.
- \`i18ntk duplicates\` — detect duplicate translation values (possible copy-paste errors).

## Best Practices
- Run validation on every PR. Block merges on validation failures.
- Use the i18ntk VS Code extension for inline key preview and editing.
- Keep locale files sorted alphabetically for consistent diffs.
- Version-control all locale files, even machine-translated drafts.
`,
  },

  // ── VS Code Extension (1) ──
  {
    name: "vscode-extension",
    title: "VS Code Extension Architecture",
    category: "package-open-source",
    description: "VS Code extension architecture, activation, and publishing guidance.",
    version: "1.0.0",
    tags: ["vscode", "extension", "publishing"],
    appliesTo: ["packages/vscode/**/*"],
    content: `# VS Code Extension Architecture

## Project Structure
- \`src/extension.ts\` — activation entry point.
- \`src/commands/\` — command registration and handlers.
- \`src/views/\` — tree views, webviews, status bar.
- \`src/config/\` — configuration schema and settings.
- \`package.json\` — contributes, activation events, commands.

## Activation
- Use specific activation events, not \`"activationEvents": ["*"]\`.
- Common events: \`onCommand\`, \`onView\`, \`onLanguage\`, \`workspaceContains\`.
- Call \`context.subscriptions.push()\` for all disposables.
- Heavy initialization should be deferred or lazy-loaded.

## Webviews
- Strict CSP: no inline scripts, no remote script sources.
- Use \`postMessage\` for extension-webview communication.
- Always validate messages from webviews (they can be spoofed).
- Set \`enableScripts: false\` unless absolutely needed at trusted workspace trust.

## Security
- Use \`SecretStorage\` API for secrets, never \`Memento\`.
- Respect workspace trust: disable unsafe features in untrusted workspaces.
- Extension context is shared across workspaces. Store data per-workspace-key.
- Never execute code from the workspace without user confirmation.

## Publishing
- Version in \`package.json\`. Follow semver.
- Run \`vsce package\` to verify packaging before publish.
- Include \`README.md\`, \`CHANGELOG.md\`, \`LICENSE\`.
- Test on all supported VS Code versions before publishing.
`,
  },

  // ── Package & NPM (2) ──
  {
    name: "npm-package",
    title: "NPM Package Structure",
    category: "package-open-source",
    description: "Package structure, exports, bin, types, and files whitelist.",
    version: "1.0.0",
    tags: ["npm", "package", "publish", "exports"],
    appliesTo: ["packages/*/package.json"],
    content: `# NPM Package Structure

## package.json Essentials
- \`"name"\`: scoped if in organization (\`@scope/name\`).
- \`"version"\`: follow semver strictly.
- \`"type"\`: \`"module"\` for ESM packages.
- \`"main"\`: CJS entry point.
- \`"module"\` or \`"exports"\`: ESM entry point.
- \`"types"\`: TypeScript declaration entry.
- \`"files"\`: explicit whitelist of published files.

## Exports Map
\`\`\`json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  }
}
\`\`\`

## Bin
- CLI tools should use \`"bin"\` pointing to a built file.
- Use \`#!/usr/bin/env node\` as the first line.
- Build with tsup or similar bundler for a single-file executable.

## Publishing Hygiene
- Run \`npm pack --dry-run\` to preview what gets published.
- Never publish \`src/\`, tests, config files, or secrets.
- Use \`.npmignore\` for files that should be in git but not published.
- Include \`LICENSE\`, \`README.md\`, \`CHANGELOG.md\`.
`,
  },
  {
    name: "npm-publish-safety",
    title: "NPM Publish Safety",
    category: "package-open-source",
    description: "Dry-run checks, package contents review, provenance, and ignore files.",
    version: "1.0.0",
    tags: ["npm", "publish", "security", "safety"],
    appliesTo: ["packages/*/package.json"],
    content: `# NPM Publish Safety

## Pre-Publish Checklist
1. All tests pass: \`pnpm test\`
2. Typecheck passes: \`pnpm typecheck\`
3. Lint passes: \`pnpm lint\`
4. Build succeeds: \`pnpm build\`
5. Version bumped in \`package.json\` and \`CHANGELOG.md\` updated.
6. Git working tree is clean. All changes committed.

## Preview
- \`npm pack --dry-run\` to see which files will be included.
- Check for accidental inclusion of \`.env\`, \`src/\`, test files.
- Verify \`"files"\` in \`package.json\` is correct.
- Check that \`dist/\` contains the expected output.

## Provenance & Integrity
- Use \`npm publish --provenance\` for supply-chain transparency.
- Sign packages with \`npm audit signatures\`.
- Verify \`package-lock.json\` or \`pnpm-lock.yaml\` is committed.

## Post-Publish
- Verify the package is installable: \`npm install <package>@<version>\`
- Check the package page on npmjs.com.
- Tag the release in Git: \`git tag v1.2.3 && git push --tags\`
- Create a GitHub release with changelog notes.

## Never
- Publish with \`--force\` unless recovering from a failed publish.
- Overwrite a published version. Unpublish only within 72 hours.
- Publish with secrets, credentials, or internal URLs in the package.
`,
  },

  // ── DevOps & CI/CD (3) ──
  {
    name: "github-actions-ci",
    title: "GitHub Actions CI",
    category: "devops",
    description: "CI workflows for lint, typecheck, test, and build in GitHub Actions.",
    version: "1.0.0",
    tags: ["github-actions", "ci", "workflow"],
    appliesTo: [".github/workflows/**/*.yml"],
    content: `# GitHub Actions CI

## Essential Workflows
- **Lint & Typecheck**: Run on every PR. Fast feedback on style and type errors.
- **Test**: Run on every PR and push to main. Vary OS/node versions if needed.
- **Build**: Verify the project builds. Catch build errors before merge.
- **Publish**: Trigger on tag push. Build and publish to npm.

## Workflow Design
- Use \`actions/checkout@v4\` with \`fetch-depth: 0\` if you need git history.
- Use \`pnpm/action-setup@v2\` for pnpm. Cache with \`actions/setup-node@v4\`.
- Run steps in parallel where possible. Use matrix for OS/version testing.
- Set \`continue-on-error\` only for optional checks.

## Performance
- Cache \`node_modules\` across runs: \`actions/cache@v4\`.
- Use \`restore-keys\` for partial cache hits.
- Skip unnecessary steps with \`if\` conditions.
- Use \`paths\` filters to skip workflows for docs-only changes.

## Security
- Pin action versions to SHA for supply-chain security.
- Use \`GITHUB_TOKEN\` (auto-generated) for repo operations.
- Never expose secrets in logs: use \`secrets.GITHUB_TOKEN\` not \`\${{ secrets.TOKEN }}\`.
- Review third-party actions before using them.
`,
  },
  {
    name: "environment-variables",
    title: "Environment Variables",
    category: "devops",
    description: "Managing .env files, runtime validation, and secret separation.",
    version: "1.0.0",
    tags: ["env", "secrets", "config", "dotenv"],
    appliesTo: [".env*", "**/config/**/*"],
    content: `# Environment Variables

## File Structure
- \`.env.example\` — template with dummy values. Committed to git. Documents all required vars.
- \`.env\` — actual values. In \`.gitignore\`. Never committed.
- \`.env.local\` — local overrides. In \`.gitignore\`.
- \`.env.production\` — production values. Managed by deployment, not committed.

## Validation
- Validate all required env vars at application startup. Fail fast with a clear error.
- Use Zod schemas to define and validate env var types.
- Provide defaults in code for optional vars, not in the deployment config.
- Use \`process.env\` only in a central config module, not scattered across files.

## Secrets
- Never log env var values. Log which vars are set, not their values.
- Use a secrets manager for production (Vercel env, GitHub Secrets, Doppler).
- Rotate secrets on a schedule. Have a rotation procedure documented.
- API keys go in env vars, not in config files or source code.

## Naming Conventions
- Prefix with app name for globals: \`MYAPP_DATABASE_URL\`.
- Use \`PUBLIC_\` prefix for client-exposed vars (Next.js, Vite).
- Use \`NEXT_PUBLIC_\`, \`VITE_\`, etc. per framework conventions.
- Document each variable in \`.env.example\` with a comment.
`,
  },
  {
    name: "cli-tooling",
    title: "CLI Tooling Best Practices",
    category: "devops",
    description: "CLI UX design, argument parsing, help output, and exit codes.",
    version: "1.0.0",
    tags: ["cli", "tooling", "ux", "args"],
    appliesTo: ["packages/cli/**/*", "src/cli/**/*"],
    content: `# CLI Tooling Best Practices

## UX Design
- Default command should show help or do the most common operation.
- Every command should have \`--help\` showing usage and examples.
- Exit codes: 0 for success, 1 for errors, 2 for usage errors.
- Use \`stderr\` for errors and diagnostics, \`stdout\` for data output.

## Argument Conventions
- Long flags: \`--output\`, \`--format\`. Short aliases: \`-o\`, \`-f\`.
- Boolean flags: \`--verbose\`, \`--quiet\`, \`--dry-run\`.
- Positional args for required, order-dependent inputs.
- \`--\` to separate flags from positional args.

## Output Formats
- Default: human-readable text to stdout.
- \`--json\` / \`-j\`: machine-readable JSON.
- \`--quiet\` / \`-q\`: minimal output (errors only).
- \`--verbose\` / \`-v\`: detailed output for debugging.

## Safety
- \`--dry-run\` / \`-d\` for preview of destructive operations.
- Confirm before overwriting files.
- Validate all paths are within the project root.
- Create backups before modifying files.
- Never run without explicit user confirmation for destructive operations.
`,
  },
  {
    name: "repo-health-check",
    title: "Repository Health Check",
    category: "devops",
    description: "Overall project quality and hygiene checklist.",
    version: "1.0.0",
    tags: ["repo", "health", "checklist", "maintenance"],
    appliesTo: ["**/*"],
    content: `# Repository Health Check

## Essential Files
- [ ] README.md with project description, setup, and usage.
- [ ] LICENSE file (MIT, Apache 2.0, etc.).
- [ ] CHANGELOG.md with version history.
- [ ] AGENTS.md or CLAUDE.md for AI coding assistants.
- [ ] .gitignore with node_modules, dist, .env, and OS files.
- [ ] .npmignore or "files" in package.json for npm packages.

## Code Quality
- [ ] TypeScript strict mode enabled.
- [ ] Linter configured and passing (ESLint, Biome).
- [ ] Formatter configured and applied (Prettier, Biome).
- [ ] Test suite exists and passes.
- [ ] No dead code (unused imports, unreachable paths).
- [ ] No console.log left in production code.

## Dependencies
- [ ] Dependencies are up to date. No known vulnerabilities.
- [ ] Lockfile committed (pnpm-lock.yaml, package-lock.json).
- [ ] No unused dependencies.
- [ ] Dependencies pinned to exact versions or trusted ranges.

## CI/CD
- [ ] CI runs lint, typecheck, and test on every PR.
- [ ] Build step verifies the project compiles.
- [ ] Automated publish from CI (npm, Docker, etc.).
- [ ] Branch protection rules on main branch.

## Documentation
- [ ] API documentation for public interfaces.
- [ ] Setup guide (one command to get running).
- [ ] Architecture overview for contributors.
- [ ] Environment variables documented in .env.example.
`,
  },

  // ── Additional Skills ──
  {
    name: "error-handling",
    title: "Error Handling Patterns",
    category: "core-engineering",
    description: "Safe error boundaries, typed errors, and user-safe messages.",
    version: "1.0.0",
    tags: ["error-handling", "typescript", "safety"],
    appliesTo: ["**/*.ts", "**/*.tsx"],
    content: `# Error Handling Patterns

## Principles
- Never silently swallow errors. Always log or propagate.
- Distinguish between expected errors (user input) and unexpected errors (bugs).
- Expected errors should return typed error objects, not throw exceptions.
- Unexpected errors should bubble up to a global error boundary.

## Typed Errors
- Use discriminated unions for error types: \`{ ok: false, error: NotFoundError }\`.
- Define error types for each failure mode: \`NotFoundError\`, \`ValidationError\`, \`AuthError\`.
- Function return types should be \`Result<T, E>\` or \`T | Error\`.
- Avoid throwing exceptions for control flow. Use return values.

## Error Boundaries
- API layer: catch all exceptions, return consistent error JSON.
- UI layer: Error Boundary components catch rendering errors.
- Background jobs: retry with backoff, dead-letter queue for persistent failures.
- Startup: fail fast with a clear message if required config is missing.

## User-Safe Messages
- Never expose internal details in user-facing errors.
- Map internal error codes to user-friendly messages.
- Log the full error with stack trace internally for debugging.
- Include a correlation ID so users can reference specific errors.
`,
  },
  {
    name: "documentation",
    title: "Documentation Standards",
    category: "core-engineering",
    description: "README, changelog, API docs, examples, and architecture notes.",
    version: "1.0.0",
    tags: ["docs", "readme", "documentation", "api"],
    appliesTo: ["**/*.md", "docs/**/*"],
    content: `# Documentation Standards

## README
- One-sentence project description at the top.
- Quick start: one command to install and run.
- Key features listed concisely.
- Link to full documentation and contributing guide.

## API Documentation
- Every public function/class should have a clear description.
- Document parameters, return types, and thrown errors.
- Include a minimal usage example for each public API.
- Note any side effects or performance implications.

## Changelog
- Follow Keep a Changelog format.
- Group by: Added, Changed, Deprecated, Removed, Fixed, Security.
- Link to relevant issues and PRs.
- One version per section with release date.

## Architecture Notes
- High-level system diagram or description.
- Data flow: how data moves through the system.
- Key design decisions and their rationale.
- Directory structure with file purposes.
- Technologies used and why they were chosen.

## Examples
- Provide copy-pasteable examples for common tasks.
- Show both simple and advanced usage patterns.
- Keep examples up to date with the current API.
`,
  },
  {
    name: "api-design-rest",
    title: "REST API Design",
    category: "backend-api",
    description: "REST API structure, validation, status codes, and pagination.",
    version: "1.0.0",
    tags: ["rest", "api", "design", "http"],
    appliesTo: ["**/api/**/*", "**/routes/**/*"],
    content: `# REST API Design

## URL Structure
- Use nouns for resources, not verbs: \`/api/users\`, not \`/api/getUsers\`.
- Use plural nouns: \`/api/users\`, \`/api/orders\`.
- Nested resources for relationships: \`/api/users/:id/orders\`.
- Avoid deep nesting (max 2 levels).

## HTTP Methods
- \`GET\` — retrieve. Idempotent. No side effects.
- \`POST\` — create. Not idempotent.
- \`PUT\` — full replacement. Idempotent.
- \`PATCH\` — partial update. Not necessarily idempotent.
- \`DELETE\` — remove. Idempotent.

## Status Codes
- \`200\` — success (GET, PUT, PATCH).
- \`201\` — created (POST). Include \`Location\` header.
- \`204\` — success with no content (DELETE).
- \`400\` — bad request (validation error).
- \`401\` — unauthenticated.
- \`403\` — unauthorized (insufficient permissions).
- \`404\` — not found.
- \`409\` — conflict (duplicate, version mismatch).
- \`422\` — unprocessable entity (semantic validation error).
- \`429\` — rate limited.
- \`500\` — internal server error.

## Pagination
- Cursor-based: \`?cursor=xxx&limit=20\`. Include \`next_cursor\` in response.
- Offset-based: \`?offset=0&limit=20\`. Include \`total\` count.
- Always set a default and maximum limit (max 100).
- Return pagination metadata: \`{ data: [...], pagination: { ... } }\`.
`,
  },
  {
    name: "auth-session",
    title: "Auth & Session Management",
    category: "backend-api",
    description: "Sessions, JWTs, cookies, refresh tokens, and logout flows.",
    version: "1.0.0",
    tags: ["auth", "session", "jwt", "cookies"],
    appliesTo: ["**/auth/**/*", "**/session/**/*", "**/*.auth.*"],
    content: `# Auth & Session Management

## Tokens
- **Access token**: short-lived (15 min). Stored in memory, not localStorage.
- **Refresh token**: long-lived (7-30 days). HttpOnly, Secure, SameSite=Strict cookie.
- Rotate refresh tokens on use. Invalidate the old one.
- JWT payload: \`sub\` (user ID), \`exp\` (expiry), \`iat\` (issued at), \`jti\` (token ID).

## Cookies
- \`HttpOnly: true\` — prevents JavaScript access.
- \`Secure: true\` — HTTPS only.
- \`SameSite: Strict\` or \`Lax\` — CSRF protection.
- \`Path\` scoped to the auth endpoint.

## Session Flow
1. Login: validate credentials, issue access + refresh tokens.
2. Access tokens sent in \`Authorization: Bearer <token>\` header.
3. On 401, client uses refresh token cookie to get a new access token.
4. Logout: invalidate refresh token server-side, clear cookie.

## Security
- Hash passwords with bcrypt/argon2. Never store plaintext.
- Rate limit login attempts per IP and per account.
- Require email verification before full access.
- Implement MFA for sensitive operations.
- Session timeout after inactivity. Force re-login for sensitive ops.
`,
  },
  {
    name: "database-migrations",
    title: "Database Migrations",
    category: "database",
    description: "Safe migrations, rollbacks, idempotency, and migration review.",
    version: "1.0.0",
    tags: ["database", "migrations", "postgres", "safety"],
    appliesTo: ["**/migrations/**/*"],
    content: `# Database Migrations

## Safety Rules
- Never modify an existing migration. Create a new one to fix issues.
- Test migrations on a staging database before production.
- Back up the database before running migrations in production.
- Use transactions for DDL where the database supports it (PostgreSQL does).

## Idempotency
- Use \`IF NOT EXISTS\` / \`IF EXISTS\` to make migrations rerunnable.
- Check for column existence before adding: \`ALTER TABLE ... ADD COLUMN IF NOT EXISTS\`.
- Check for index existence before creating.

## Design
- One logical change per migration. Don't bundle schema changes.
- Migrations should be reversible. Write \`up\` and \`down\` scripts.
- Avoid data migrations in schema migrations. Handle data separately.
- Add comments explaining the WHY, not just the WHAT.

## Review Checklist
- [ ] Migrations are in the correct order (timestamp/sequential naming).
- [ ] No destructive changes (\`DROP TABLE\`, \`DROP COLUMN\`) without review.
- [ ] \`NOT NULL\` columns have a default value or backfill plan.
- [ ] Foreign keys have appropriate \`ON DELETE\` behavior.
- [ ] Indexes are added for new foreign keys and frequently queried columns.
- [ ] Migrations pass on a fresh database (test down-then-up cycle).
`,
  },
  {
    name: "frontend-performance",
    title: "Frontend Performance",
    category: "frontend",
    description: "Render optimization, memoization, bundle splitting, and Core Web Vitals.",
    version: "1.0.0",
    tags: ["performance", "frontend", "rendering", "bundle"],
    appliesTo: ["**/*.tsx", "**/*.jsx"],
    content: `# Frontend Performance

## Rendering
- Avoid unnecessary re-renders. Profile with React DevTools.
- \`useMemo\` for expensive computations, not for trivial values.
- \`useCallback\` only when passed to memoized child components.
- Lift state up only as needed. Colocate state with the component that uses it.
- Use \`React.memo\` for pure components that receive the same props often.

## Bundle Size
- Code split at route boundaries with \`React.lazy\` and \`Suspense\`.
- Tree-shake: use named imports, avoid barrel imports for large libraries.
- Analyze bundle with \`@next/bundle-analyzer\` or \`vite-bundle-visualizer\`.
- Lazy load heavy libraries (date-fns, chart libraries, rich text editors).
- Keep third-party dependencies minimal. Prefer platform APIs over polyfills.

## Core Web Vitals
- **LCP** (Largest Contentful Paint): optimize hero images, preload fonts.
- **INP** (Interaction to Next Paint): avoid long tasks, use web workers for heavy work.
- **CLS** (Cumulative Layout Shift): set explicit dimensions on images, embeds, and dynamic content.

## Images
- Use modern formats: WebP or AVIF.
- \`<img loading="lazy"\` for below-fold images.
- Serve responsive sizes with \`srcset\` or framework image components.
- Compress images. Never serve full-resolution camera photos on the web.
`,
  },
  {
    name: "react-testing",
    title: "React Testing Patterns",
    category: "core-engineering",
    description: "React Testing Library patterns, queries, and test isolation.",
    version: "1.0.0",
    tags: ["testing", "react", "testing-library", "vitest"],
    appliesTo: ["**/*.test.tsx", "**/*.spec.tsx"],
    content: `# React Testing Patterns

## Query Priority
1. \`getByRole\` — most accessible, mirrors screen readers.
2. \`getByLabelText\` — for form fields.
3. \`getByPlaceholderText\` — fallback for inputs.
4. \`getByText\` — for non-interactive text content.
5. \`getByTestId\` — last resort, when no other query works.

## Test Structure
- Render the component with the minimum props needed.
- Interact using \`fireEvent\` or \`userEvent\` (prefer \`userEvent\` for realistic interaction).
- Assert on the rendered output, not on implementation details.
- Test behavior from the user's perspective.

## Patterns
- **State changes**: click a button, assert on visible text change.
- **Async operations**: use \`findBy*\` queries or \`waitFor\` for async results.
- **Form submission**: fill inputs, click submit, assert on callback or error message.
- **Error states**: mock the failing API, assert error message is displayed.
- **Accessibility**: assert that interactive elements have accessible roles and labels.

## Mocking
- Mock API calls at the network boundary (\`msw\` preferred over \`jest.mock\`).
- Mock context providers minimally. Provide real values when practical.
- Avoid mocking component internals. Test the component as a unit.
- Reset mocks between tests: \`afterEach(() => vi.clearAllMocks())\`.
`,
  },
];
