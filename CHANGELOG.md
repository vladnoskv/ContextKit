# Changelog

## 0.1.0 — Initial Release

### Added

- Core scanning engine for AI instruction file detection
- Token estimation (local, no API)
- Duplicate rule detection with Jaccard similarity
- Conflict detection for package managers, semicolons, styling, testing, etc.
- Oversized file detection with configurable thresholds
- Stale instruction detection (90-day threshold)
- Broken local link detection
- Missing recommended file detection
- Project detection (package manager, frameworks, languages, tools)
- Report generation (Markdown and JSON)
- Format conversion (AGENTS.md → Copilot, Cursor, Claude, Roo)
- File splitting with modular router output
- Instruction file generation from project detection
- Context pack generation (frontend, backend, database, testing, security, deployment, full)
- Health score calculation
- CLI with scan, report, tokens, validate, convert, split, generate, pack, init commands
- VS Code extension with sidebar, diagnostics, status bar, webview report
- Bun runtime support
- Dry-run mode for all write operations
- Configuration file support (contextkit.config.json, .contextkitrc)
- Test suite with Vitest
- Monorepo structure with pnpm workspaces
