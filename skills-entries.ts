[
    // ── package-open-source ──
    {
        name: "bun-package",
        title: "Bun Package Compatibility",
        category: "package-open-source",
        description: "Make npm packages work seamlessly with Bun runtime, bunx, and bun install",
        version: "1.0.0",
        tags: ["bun", "node", "npm", "bundling"],
        appliesTo: ["**/*"],
        content: `# Bun Package Compatibility

## Package Exports Field
Bun respects the \`exports\` map strictly. Ensure your \`package.json\` defines explicit entry points for ESM, CJS, and types:
\`\`\`json
{
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    },
    "./package.json": "./package.json"
  }
}
\`\`\`
Do not rely on \`main\` or \`module\` alone—Bun resolves \`exports\` first. Missing \`./package.json\` in \`exports\` breaks tools that read package metadata at runtime.

## ESM/CJS Dual Build
Bun supports both, but mixed environments cause hard-to-diagnose failures. Build dual output with tsup or unbuild. Mark CJS files with \`.cjs\` extension so Bun's ESM-first resolver doesn't mistake them. Mark ESM files with \`.mjs\` if you also ship a \`type: "module"\` package. Add \`"sideEffects": false\` in \`package.json\` unless you have CSS or global-registering modules—Bun's bundler uses this for tree-shaking.

## bunx Invocation
\`bunx your-package\` runs the package's bin entry. Define \`"bin"\` in \`package.json\` with a shebang line \`#!/usr/bin/env bun\` or \`#!/usr/bin/env node\`. If your bin script imports TypeScript directly, Bun handles \`.ts\` natively—no build step needed for CLI tools. Add \`"bun": ">=1.0.0"\` to \`engines\` if you use Bun-specific APIs.

## Bun-Specific APIs
If you use \`Bun.file()\`, \`Bun.write()\`, or \`Bun.spawn()\`, add a runtime guard:
\`\`\`ts
const isBun = typeof Bun !== "undefined";
if (!isBun) { /* fallback to node:fs, node:child_process */ }
\`\`\`
Ship a Node.js fallback path so the package works in both runtimes. Use \`import { … } from "node:fs"\` instead of \`"fs"\` for clarity—Bun supports the \`node:\` prefix.

## Testing with Bun
Create a smoke test at \`smoke/bun.test.ts\` that imports your package and calls its public API. Run with \`bun test\` in CI using the \`oven-sh/setup-bun\` GitHub Action. Assert that both \`import\` and \`require()\` work. Test \`bunx your-package --help\` in CI scripts. If your package has native addons, verify they compile under Bun's \`node-gyp\` shim.`
    },
    {
        name: "marketplace-readme",
        title: "VS Code Marketplace README",
        category: "package-open-source",
        description: "Craft effective VS Code Marketplace descriptions with screenshots and badges",
        version: "1.0.0",
        tags: ["vscode", "marketplace", "readme", "extension"],
        appliesTo: ["**/*"],
        content: `# VS Code Marketplace README

## Structure
VS Code Marketplace pages render Markdown inside a 780px container. Start with a short hero paragraph (2-3 lines) stating what your extension does and who it's for. Follow with a static or animated screenshot at least 780px wide. VS Code trims images to the README container width, so keep important content visible in the center 700px.

## Feature List
List every command, setting, and UI element your extension adds. Use the format:
\`\`\`md
### Commands
| Command ID | Title | Keybinding |
|---|---|---|
| \`myext.doSomething\` | Do Something | \`Ctrl+Shift+P\` |
\`\`\`
VS Code's \`Contributes\` tab auto-generates this from \`package.json\`—but many users never click that tab. Duplicate the info in your README.

## Badges
Place badges below the title. Use shields.io for visual consistency:
- Version: \`![Version](https://img.shields.io/visual-studio-marketplace/v/publisher.extension)\`
- Installs: \`![Installs](https://img.shields.io/visual-studio-marketplace/i/publisher.extension)\`
- Rating: \`![Rating](https://img.shields.io/visual-studio-marketplace/r/publisher.extension)\`
- License: \`![License](https://img.shields.io/github/license/user/repo)\`
Put badges on a single line, space-separated, so they wrap cleanly at narrow widths.

## Screenshots
Use VS Code's built-in themes for screenshots (Dark+ or Light+) so images match user expectations. Capture at 1x resolution—VS Code scales them. Use a GIF for demonstrating live features but cap at 800px height. macOS screenshots should use [Window > Zoom] to hide the OS chrome, or crop tightly to the editor. Annotate screenshots with arrows or numbered callouts if the feature has multiple steps.

## Installation and Usage
Show install command: \`ext install publisher.extension\`. List required settings in JSON block format. Show a minimal configuration that gets a new user working in under one minute. Add a Troubleshooting section at the bottom covering the top 3 issues from GitHub issues.

## Links
Link your repository, issue tracker, changelog. Use the \`repository\` field in \`package.json\` so VS Code shows the repo link automatically. Add a \`## Release Notes\` section that mirrors your CHANGELOG.md, or embed the latest version's notes inline. VS Code uses this to show the update notification.`
    },
    {
        name: "open-source-readme",
        title: "Open Source README",
        category: "package-open-source",
        description: "Structure a professional README for open-source packages",
        version: "1.0.0",
        tags: ["readme", "documentation", "open-source"],
        appliesTo: ["**/*"],
        content: `# Open Source README Template

## Title and Tagline
Title is the package name, bold. Tagline is one sentence. Example: \`**Clipanion** — Type-safe CLI argument parsing for Node.js.\` Badges go directly below on one line: npm version, downloads, bundle size, license, Node version.

## Table of Contents
Every README longer than 3 screens needs a ToC. Link to h2 sections only. Use GitHub's auto-generated ToC anchor format: lowercase, spaces become hyphens, punctuation stripped.

## Installation Section
Show the exact copy-paste command:
\`\`\`bash
npm install your-package
# or
pnpm add your-package
\`\`\`
List peer dependencies explicitly if any. State minimum Node version. Mention if a runtime-specific install (Bun, Deno) is supported.

## Quick Start
Provide a working example under 10 lines. Users will copy this, type it into an empty file, and run it. Include imports, instantiation, one method call, and the expected output. Use \`// => expected output\` comments.

## API Reference
Group exports by category (core, utilities, types). For each exported function, show: signature in TypeScript, one-sentence description, parameter table (name, type, default, description), return type, and a minimal code example. Sort alphabetically within each group. Mark unstable APIs with a \`⚠️ Experimental\` badge.

## Configuration
If your package reads config files, show the supported file names, formats (JSON, YAML, TOML), and the search order. Provide a full config file with all keys and their defaults. Comment every key with allowed values.

## Contributing Section
Link to CONTRIBUTING.md. Show the dev setup commands:
\`\`\`bash
git clone https://github.com/user/repo
cd repo
pnpm install
pnpm build
pnpm test
\`\`\`
List the test runner, linter, and formatter. Mention the license and that contributions are welcome.

## Comparison Section (Optional)
If there are similar packages, add a table comparing features honestly. List your package first column, then 2-3 alternatives. Checkmarks for features you have that competitors don't. Disclose what competitors do better—trust builds better adoption than omission.`
    },
    {
        name: "changelog",
        title: "Changelog Management",
        category: "package-open-source",
        description: "Maintain a clean changelog following keepachangelog.com and semver conventions",
        version: "1.0.0",
        tags: ["changelog", "semver", "versioning", "release"],
        appliesTo: ["**/*"],
        content: `# Changelog Management

## Format
Follow [keepachangelog.com](https://keepachangelog.com) v1.1.0. Structure every release entry as:
\`\`\`md
## [1.2.0] - 2026-05-31
### Added
- \`newFeature()\` function for frobnicating widgets
- Support for JSON5 config format

### Changed
- \`parseConfig()\` now returns \`Result<T, Error>\` instead of throwing
- Minimum Node.js version increased from 16 to 18

### Deprecated
- \`oldMethod()\` — use \`newMethod()\` instead, removed in 2.0.0

### Removed
- \`legacyParser\` export (deprecated since 1.0.0)

### Fixed
- Handle empty config files without crashing (#234)
- Correct ESM export mapping for TypeScript 5.5

### Security
- Sanitize file paths before writing to prevent path traversal (#256)
\`\`\`
Use exactly these six section headers: Added, Changed, Deprecated, Removed, Fixed, Security. Omit empty sections. Never use "Updated," "Improved," "Refactored," or custom headings.

## Semver Rules
- **MAJOR** (X.0.0): Any backwards-incompatible change to public API, including removed exports, changed function signatures, or TypeScript type narrowing.
- **MINOR** (0.Y.0): New backwards-compatible functionality, new optional parameters with defaults, new public exports, deprecations (never remove in minor).
- **PATCH** (0.0.Z): Backwards-compatible bug fixes, documentation fixes, internal refactors, performance improvements that don't change API contracts.

## Linking
Link version headers to GitHub compare URLs:
\`\`\`md
[1.2.0]: https://github.com/user/repo/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/user/repo/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/user/repo/releases/tag/v1.0.0
\`\`\`
Place links at the bottom. The top of the file has a single \`[Unreleased]\` section for work-in-progress changes.

## Automation
Use \`standard-version\` or \`changesets\` for automated changelog generation. Configure a GitHub Action that blocks PRs if they touch public API without a changelog entry. Add a \`.github/changelog.yml\` check that enforces the Added/Changed/Deprecated/Removed/Fixed/Security format on all \`CHANGELOG.md\` edits.

## Breaking Change Migration
For every Removed entry, provide a migration example in a collapsible details block. Show the old code, the new code, and the version where the removal takes effect. Pin migration guides with exact version numbers so users can search.`
    },
    {
        name: "license-compliance",
        title: "License Compliance",
        category: "package-open-source",
        description: "Ensure license compliance in package metadata and dependency license auditing",
        version: "1.0.0",
        tags: ["license", "compliance", "spdx", "legal"],
        appliesTo: ["**/*"],
        content: `# License Compliance

## License File
Place a \`LICENSE\` file at the repository root. Use the full license text, not just a SPDX identifier comment. For MIT, use [opensource.org](https://opensource.org/licenses/MIT) verbatim text. Fill in the copyright line: \`Copyright (c) [YEAR] [OWNER]\`. If multiple contributors hold copyright, use \`Copyright (c) [YEAR] [PROJECT] contributors\`. Never use a \`LICENSE.md\` file alone—GitHub recognizes \`LICENSE\` or \`LICENSE.txt\` for the license badge.

## Package Metadata
Set the \`"license"\` field in \`package.json\` to an SPDX identifier: \`"MIT"\`, \`"Apache-2.0"\`, \`"GPL-3.0-only"\`, \`"BSD-3-Clause"\`. For dual licensing, use the SPDX \`OR\` operator: \`"MIT OR Apache-2.0"\`. If you use \`"SEE LICENSE IN <file>"\`, GitHub won't show a license badge—prefer the SPDX identifier. The \`"license"\` field must match the actual LICENSE file content.

## Dependency License Audit
Run \`npx licensee\` to audit dependency licenses. Add a \`licensee --init\` step during project setup. Configure \`.licensee.json\`:
\`\`\`json
{
  "licenses": {
    "spdx": ["MIT", "Apache-2.0", "BSD-2-Clause", "BSD-3-Clause", "ISC", "CC0-1.0", "Unlicense", "BlueOak-1.0.0", "PostgreSQL"]
  },
  "corrections": true,
  "packages": {}
}
\`\`\`
Lock down allowed licenses to permissive-only or your organization's approved list. Add \`"CC-BY-4.0"\` with caution—it requires attribution that many projects overlook.

## CI Enforcement
Add a GitHub Action that runs \`npx licensee --errors-only\` on every PR. Reject PRs that introduce a newly restricted license. Cache the licensee results so it only checks changed dependencies. Use \`licensee --production-only\` to skip devDependencies unless you bundle dev tools.

## Dual Licensing
If offering a commercial license alongside an open-source one, clearly state terms in LICENSE file header comments. Use a \`LICENSE.COMMERCIAL\` file and reference it in README. Ensure the \`package.json\` \`"license"\` field uses SPDX, and mention commercial options in the README pricing section—not in the SPDX field.

## Copyleft Awareness
If your package depends on GPL-licensed code, your package must also be GPL-compatible. Check \`npx licensee\` output for \`GPL-*\`, \`AGPL-*\`, \`LGPL-*\`. LGPL allows dynamic linking; GPL/AGPL generally do not for proprietary consuming code. Flag copyleft dependencies in a \`## Legal\` section of CONTRIBUTING.md.`
    },
    {
        name: "contributor-guidelines",
        title: "Contributor Guidelines",
        category: "package-open-source",
        description: "Set up CONTRIBUTING.md, issue templates, and PR templates for open-source projects",
        version: "1.0.0",
        tags: ["contributing", "community", "templates", "github"],
        appliesTo: ["**/*"],
        content: `# Contributor Guidelines

## CONTRIBUTING.md Structure
Write a \`CONTRIBUTING.md\` at the repo root. Sections in order: Code of Conduct (link to CODE_OF_CONDUCT.md), Development Setup, Finding Issues, Making Changes, Testing, Code Style, Commit Messages, Pull Request Process, Getting Help.

## Development Setup
Provide exact copy-paste commands for the dev environment. Include all prerequisites (Node 18+, pnpm 8+). Use a code block showing clone → install → build → test sequence. Note platform-specific caveats (e.g., Windows needs Git Bash for certain scripts).

## Commit Messages
Enforce [Conventional Commits](https://www.conventionalcommits.org) format:
\`\`\`
type(scope): short description

Optional body with details.

Optional footer with BREAKING CHANGE or issue refs.
\`\`\`
Allowed types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert. Scopes correspond to package directories (core, cli, vscode). Use \`commitlint\` in CI to reject non-conforming messages.

## Issue Templates
Create \`.github/ISSUE_TEMPLATE/\` with YAML frontmatter. Three templates:
1. **bug_report.yml** — Requires: version, environment (OS, Node, package manager), reproduction steps, expected behavior, actual behavior, minimal reproduction repo link.
2. **feature_request.yml** — Requires: problem statement, proposed solution, alternatives considered, additional context.
3. **question.yml** — Directs to GitHub Discussions. Use \`blank_issues_enabled: false\` in \`.github/ISSUE_TEMPLATE/config.yml\` and redirect support questions to Discussions.

## PR Template
Create \`.github/pull_request_template.md\`:
\`\`\`md
## Summary
<!-- Brief description of changes -->

## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Changelog entry added (if user-facing)
- [ ] TypeScript strict mode passes (\`pnpm typecheck\`)

## Breaking Changes
<!-- List any breaking changes and migration steps, or write "None" -->

## Related Issues
Closes #
\`\`\`
The checklist forces contributors to think about tests, docs, and types before reviewers spend time.

## Review Expectations
State SLA: "Maintainers aim to respond within 5 business days." Ask contributors to ping after 7 days of silence. Require all CI checks to pass before review. State that PRs without tests for new functionality will be declined. Explain labeling system: \`good first issue\`, \`help wanted\`, \`needs reproduction\`. Add a section on how maintainers squash-merge or rebase-merge based on repo convention.`
    },

    // ── ai-coding-workflow ──
    {
        name: "codex-instructions",
        title: "Codex Instruction Files",
        category: "ai-coding-workflow",
        description: "Write Codex-compatible instruction files that guide AI coding behavior",
        version: "1.0.0",
        tags: ["codex", "instructions", "openai", "ai-config"],
        appliesTo: ["**/*"],
        content: `# Codex Instruction Files

## File Location and Naming
Create \`CODEX.md\` in the repository root. OpenAI Codex reads this file automatically when generating code in the repo. If using Codex CLI, place \`CODEX.md\` in the workspace root so the CLI picks it up without path configuration. For monorepos, put a \`CODEX.md\` in each package directory with package-specific rules.

## Section Structure
Use these standard sections in order:
1. **Project Context**: One paragraph describing the project's purpose, target audience, and tech stack.
2. **Code Style Rules**: Bullet list of non-negotiable rules (e.g., "Use tabs for indentation", "Prefix all CSS classes with \`ctx-\`").
3. **Component Patterns**: Show a skeleton for a standard component/function/file showing the expected structure.
4. **Testing Rules**: Which test framework to use, where tests live, naming conventions, coverage expectations.
5. **Build Commands**: Exact commands for \`npm run build\`, \`npm test\`, \`npm run lint\`.
6. **Forbidden Patterns**: Things the AI must never do (e.g., "Never call \`console.log\` in production code", "Never import from \`@internal/\` packages").

## Writing Rules
Every rule must be actionable. Bad: "Write good code." Good: "Prefer \`const\` over \`let\` unless reassignment is required within 3 lines." Bad: "Be careful with errors." Good: "Wrap all async function calls in try/catch; rethrow with a \`ContextError\` subclass that includes the operation name." Provide a before-and-after code example for each style rule. Use triple-backtick code blocks with language identifiers.

## File Size
Limit \`CODEX.md\` to 300 lines. Codex has a context window—longer files reduce available code context. If you need more rules, split into \`CODEX-STYLE.md\`, \`CODEX-TESTING.md\`, and reference them from the main \`CODEX.md\` via a "See also" section at the bottom.

## Diff Mode Instructions
Add a section that only applies when Codex generates diffs: "When suggesting changes, never modify imports unless the change requires a new import. Preserve existing comments. Never reformat lines you are not changing. Show the surrounding 3 lines of context in diff output."

## Updating
Version your \`CODEX.md\` at the top with a date and semver. When the build toolchain changes, update the Build Commands section first. Review instruction files monthly—stale instructions train the AI on outdated patterns. Add a "Last verified" date in a comment.`
    },
    {
        name: "agent-task-planning",
        title: "Agent Task Planning",
        category: "ai-coding-workflow",
        description: "Break coding tasks into safe implementation phases for AI agents",
        version: "1.0.0",
        tags: ["planning", "task-breakdown", "ai-agents", "workflow"],
        appliesTo: ["**/*"],
        content: `# Agent Task Planning

## Phase Model
Break every coding task into 6 sequential phases. Do not skip phases—shifting order causes rework.

**Phase 1: Understand** — Read all files the task touches. Search for similar patterns in the codebase. Identify the exact module boundaries (which file owns the change). Run \`git log --follow\` on the target files to see who last modified them and why. Document findings before writing code.

**Phase 2: Plan** — Write an implementation plan in bullet points, one bullet per file. Each bullet states: which file, what change, why that file. Include rollback instructions: "To revert, delete line X and restore previous import." Tag each bullet with risk level (low/medium/high). High-risk bullets must include a test plan.

**Phase 3: Scaffold** — Create only the structural skeleton: new files, empty function stubs with typed signatures, test file stubs with \`describe\`/\`it\` blocks. Run typecheck to confirm the skeleton compiles. Commit this as a standalone checkpoint so reverting doesn't lose all work.

**Phase 4: Implement** — Fill in the implementation, one function at a time. After each function, run unit tests for that function only. If a function grows beyond 40 lines, split it. Do not refactor existing code during implementation—log refactors as follow-up issues.

**Phase 5: Integrate** — Wire the new code into callers. Update exports in barrel files. Adjust types if callers reveal missing type constraints. Run the full test suite. Run lint and typecheck. Verify no new warnings appear in compiler output.

**Phase 6: Polish** — Remove debug logs and commented-out code. Verify error messages are user-facing, not internal. Check naming consistency (does every function use the same term for the same concept?). Run \`git diff --stat\` and review every changed file. Squash fixup commits.

## Phase Gating
Define gates between phases. Phase 1 ends when you can explain the change to a colleague in 3 sentences. Phase 2 ends when a reviewer approves the plan. Phase 4 ends when every function has passing tests. Never enter Integration if any unit test fails. Never mark a task complete without Polish phase.
`
    },
    {
        name: "agent-review-mode",
        title: "Agent Review Mode",
        category: "ai-coding-workflow",
        description: "Configure AI agents to review code without modifying any files",
        version: "1.0.0",
        tags: ["review", "code-review", "ai-agents", "quality"],
        appliesTo: ["**/*"],
        content: `# Agent Review Mode

## Core Constraint
When in review mode, the agent must NEVER write, edit, or delete files. The output is a review report only. If the agent identifies a fix, it describes it in prose—not by generating a diff or editing code. Enforce this by prefixing the prompt: "You are in REVIEW-ONLY mode. Do not output any code changes. Do not use the edit tool. Output a structured review report."

## Review Checklist
Work through this ordered checklist. Address every item, even if the answer is "N/A, no PII in scope."

1. **Types**: Check that function signatures match actual usage. Look for \`any\` used when a concrete type exists. Verify type exports in barrel files match the actual module exports.
2. **Error Handling**: Every \`try/catch\` must handle the specific error type, not swallow with \`catch (e)\`. Async functions without a caller's \`await\` must have an explicit \`.catch()\` handler. Promise rejections must produce user-actionable messages.
3. **Naming**: Check that the same concept uses the same name across files. Flag abbreviations used without prior definition. Verify exported names start with the module prefix (e.g., \`createConfig\` lives in \`config/\`, not \`utils/\`).
4. **Imports**: Check for unused imports, circular imports, deep imports from internal paths. Each import should come from package entry point or an explicit subpath export.
5. **State & Side Effects**: Identify mutation of shared state without explicit ownership. Flag module-level \`let\` variables that are modified across function boundaries.
6. **Security**: Check for unsanitized user input used in file paths, shell commands, or SQL. Flag hardcoded secrets. Verify CSP, CORS, and authentication middleware are applied consistently.
7. **Tests**: Confirm new public API has a test. Check edge cases: empty input, null input, concurrent calls, very large input.
8. **Documentation**: Verify JSDoc on all public exports. Check README and CHANGELOG for user-facing changes.

## Report Format
Output the review as a table:

| Category | File | Line | Severity | Issue |
|---|---|---|---|---|
| Types | src/config.ts | 42 | High | \`any\` cast loses type safety |
| Security | src/routes.ts | 128 | Critical | Unsanitized \`req.query\` in file path |

Severity levels: Critical (blocks merge), High (must fix before next release), Medium (should fix this sprint), Low (style/nit), Info (educational).

## What to Ignore
Do not flag: formatting (let formatters handle it), import ordering (let linters handle it), naming preferences that match existing codebase conventions, test coverage percentages below a threshold (flag missing tests, not metrics). Do not suggest stylistic rewrites—only flag bugs, type errors, security issues, and broken contracts.
`
    },
    {
        name: "agent-debug-mode",
        title: "Agent Debug Mode",
        category: "ai-coding-workflow",
        description: "Guide AI agents through systematic bug reproduction, isolation, and fixing",
        version: "1.0.0",
        tags: ["debugging", "bug-fix", "ai-agents", "troubleshooting"],
        appliesTo: ["**/*"],
        content: `# Agent Debug Mode

## The REPRODUCE–ISOLATE–UNDERSTAND–PATCH–TEST–VERIFY–DOCUMENT Cycle
Follow this strict 7-step cycle. Do not skip steps. Do not theorize without reproduction. Do not fix without understanding.

### Step 1: Reproduce
Write a minimal reproduction script in a scratch file (e.g., \`debug-repro.ts\`). The script must: import only the failing module, call only the failing function, use the exact input from the bug report. Run it and confirm it produces the reported error. If it doesn't reproduce, request more information—never guess. Add the reproduction script to the bug tracking comment for others to verify.

### Step 2: Isolate
Bisect the reproduction script. Remove arguments one at a time to find the minimal trigger. Comment out half the function body to find the exact line. Add \`console.trace()\` at the error point to identify the call stack. Narrow down to a single function and a single input. The goal is a one-function, single-input reproducer under 15 lines.

### Step 3: Understand
Before touching code, answer: What is this function supposed to do? What assumption does the failing input violate? Read the function's tests to understand expected behavior. Read the type signature—is there a type mismatch? Check git blame: was this code recently changed? If yes, read the commit message and the PR discussion. Write a one-sentence root cause statement: "X fails because Y assumes Z but receives W."

### Step 4: Patch
Implement the minimal fix. Change the fewest lines possible—no refactoring, no style changes, no pulling in new dependencies. If the fix requires changing a type, ask whether the type was wrong or the caller was wrong before widening it. Add an inline comment linking to the issue number.

### Step 5: Test
Write a regression test that fails before the patch and passes after. Test the exact input that failed. Test adjacent edge cases: empty, null, extremely large, concurrent. Run the full test suite to ensure no other tests broke. Run typecheck.

### Step 6: Verify
Run the original reproduction script against the patched code. Verify the error is gone. If the bug had a user-facing symptom, manually reproduce the symptom and confirm it's resolved. Ask the bug reporter to verify if possible before merging.

### Step 7: Document
Add a section to the bug report or PR: "Root Cause", "Fix", "How Verified". Update CHANGELOG.md with a Fixed entry. If the bug revealed a design flaw, file a follow-up issue for refactoring—do not expand the scope of the current fix.
`
    },
    {
        name: "agent-security-mode",
        title: "Agent Security Mode",
        category: "ai-coding-workflow",
        description: "Audit code for security vulnerabilities before implementing changes",
        version: "1.0.0",
        tags: ["security", "audit", "vulnerability", "ai-agents"],
        appliesTo: ["**/*"],
        content: `# Agent Security Mode

## Before-Implementation Audit
Before writing any code, audit the existing codebase around the change area. Run through this checklist in order. Document findings as comments in the planning phase.

## Audit Checklist

### 1. Input Boundaries
Identify every place user input enters the changed module: API parameters, CLI arguments, config files, environment variables, URL query strings, form bodies, WebSocket messages. For each input boundary, verify: is the input validated before use? Is there a maximum length check? Is the type coerced or parsed safely? Flag any input that flows directly into \`fs.\`, \`child_process.\`, \`eval()\`, \`new Function()\`, template engines, SQL strings, or regex constructors without sanitization.

### 2. Injection Vectors
Check for SQL injection: any concatenated query strings instead of parameterized queries. Check for command injection: any \`exec()\` or \`spawn()\` with user-controlled arguments not escaped via \`--\` or \`shell: false\`. Check for XSS: any \`innerHTML\`, \`dangerouslySetInnerHTML\`, or direct DOM injection from user data. Check for path traversal: any \`path.join(userInput, base)\` without \`path.resolve\` normalization and prefix check.

### 3. Auth and Access Control
Identify every privileged operation in scope. Does it check authentication before running? If role-based, does it enforce the minimum role? Are auth checks applied middleware-level or inline? Prefer middleware—inline checks are easily forgotten.

### 4. Secrets Management
Scan the changed files for hardcoded strings that look like tokens, keys, or passwords (regex: \`/(?:secret|token|password|key|api_key)\\s*[:=]\\s*['"][^'"]{8,}/gi\`). Verify all secrets come from \`process.env\`, config files in \`.gitignore\`, or a secrets manager. Flag any \`console.log(secret)\` or error messages that leak credentials.

### 5. Dependency Risks
Check \`npm audit\` or \`pnpm audit\` for known vulnerabilities in dependencies touched by the change. If a new dependency is needed, verify: is it actively maintained (last commit within 6 months)? Does it have a security policy or SECURITY.md? Is its license compatible? Run \`npx lockfile-lint\` to verify lockfile integrity.

### 6. Cryptographic Primitives
If the change uses crypto: never use MD5 or SHA-1 for security purposes. Never implement custom encryption—use \`node:crypto\` or well-audited libraries like \`libsodium-wrappers\`. For random values, use \`crypto.randomBytes()\`, never \`Math.random()\`. Verify key lengths: RSA ≥ 2048, AES ≥ 128, HMAC ≥ 256.

## Post-Audit Report
Output findings as a Severity table identical to the review mode format. Critical findings block implementation until resolved. High findings must have a mitigation plan filed as a tracking issue. Medium findings are noted in code comments. Low findings go to a running security debt document.
`
    }
]
