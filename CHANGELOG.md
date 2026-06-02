# Changelog

## 0.2.2 - VS Code WebView and Skills Fixes

### Added

- Add `AgentContextKit: Open WebView` as a VS Code command and Project Context sidebar menu action.
- Add a VS Code dashboard webview for workspace metrics, installed skills, and quick links to scan, reports, skills, and setup.

### Fixed

- Refresh and display installed skills in the VS Code Project Context tree after extension activation, scans, installs, and removals.
- Filter recommended skills to known built-in skills so the sidebar and install flows do not suggest unavailable skill names.

## 0.2.1 - VS Code Activation Fix

### Fixed

- Ensure the VS Code extension activates when AgentContextKit views or commands are opened, so the Project Context tree provider and Setup webview provider are registered.
- Add startup-finished activation as a fallback for hosts that render the contributed views before view-specific activation completes.
- Bundle the core package into the VS Code extension so packaged installs can load the extension entrypoint without workspace `node_modules`.

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
