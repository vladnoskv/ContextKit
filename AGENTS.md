# ContextKit — Self-Hosted Instructions

This project is ContextKit itself. AI assistants working on this codebase should follow these guidelines.

## Project Overview

- **Project**: ContextKit — AI Coding Context Manager
- **Repo**: Monorepo with pnpm workspaces
- **Language**: TypeScript (strict mode)
- **Package manager**: pnpm
- **Test runner**: Vitest
- **Build tool**: tsup

## Commands

- Install: `pnpm install`
- Build all: `pnpm build`
- Test: `pnpm test`
- Typecheck: `pnpm typecheck`
- Lint: `pnpm lint`
- Format: `pnpm format`
- Pack CLI: `pnpm pack:cli`
- Pack VS Code: `pnpm pack:vscode`
- Bun smoke: `pnpm smoke:bun`

## Architecture

```
packages/core/     — Runtime-agnostic core engine (types, scanner, analyzer, converter, splitter, generator, reporter)
packages/cli/      — Node.js/Bun CLI (thin wrapper around core)
packages/vscode/   — VS Code extension (sidebar, diagnostics, status bar, webview)
examples/          — Sample projects for testing
docs/              — Documentation
```

## Coding Standards

- Use TypeScript with strict mode everywhere.
- The `core` package must be runtime-agnostic (no Node-only APIs without adapters).
- The `cli` package can use Node.js APIs freely.
- The `vscode` package uses the VS Code Extension API.
- No external API calls. No telemetry. Everything is local-first.
- Write operations require explicit user action or confirmation.
- Use `--dry-run` for preview. Create backups before destructive edits.

## Testing Rules

- Write unit tests for all core modules.
- Test duplicate detection, conflict detection, converter, splitter, generator, and pack generation.
- Use the example fixtures for integration testing.
- Run `pnpm test` before committing.

## Security Rules

- Never commit secrets or API keys.
- No remote API calls in the core package.
- VS Code webview uses strict CSP (no remote scripts).
- Respect VS Code workspace trust.

## File Map

| Path | Purpose |
|---|---|
| `packages/core/src/index.ts` | Main public API |
| `packages/core/src/types/index.ts` | All TypeScript interfaces |
| `packages/core/src/scanner/` | File detection engine |
| `packages/core/src/analyzer/` | All analyzers (duplicate, conflict, oversized, etc.) |
| `packages/core/src/converter/` | Format conversion logic |
| `packages/core/src/splitter/` | File splitting logic |
| `packages/core/src/generator/` | Instruction generation and context packs |
| `packages/core/src/reporter/` | Report generation (Markdown, JSON) |
| `packages/core/src/token/` | Token estimation |
| `packages/core/src/parser/` | Markdown parsing utilities |
| `packages/core/src/utils/` | Filesystem adapter, config, health score |
| `packages/cli/src/commands/` | CLI command handlers |
| `packages/vscode/src/` | VS Code extension modules |
| `docs/` | User-facing documentation |

## Do Not Edit Without Care

- `packages/core/src/types/index.ts` — All types defined here. Changes cascade everywhere.
- `packages/core/src/index.ts` — Public API surface. Breaking changes need version bumps.
- Configuration schema — Changes need documentation and VS Code settings updates.
