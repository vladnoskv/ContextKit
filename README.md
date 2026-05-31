# ContextKit

**AI Coding Context Manager** — manage, validate, split, convert, and measure AI coding instruction/context files across modern AI coding assistants.

ContextKit is a local-first, privacy-first developer tool for maintaining clean, consistent, and efficient AI instruction files.

## Why ContextKit?

AI coding assistants (Claude, Cursor, Copilot, etc.) read instruction files like `AGENTS.md`, `CLAUDE.md`, and `.cursor/rules/*.mdc` to understand your project. Over time, these files can become:

- **Outdated** — rules from a previous version of the project
- **Duplicated** — the same rule in multiple files
- **Conflicting** — one file says "use npm", another says "use pnpm"
- **Oversized** — too many tokens eating into the AI's context window
- **Missing** — no instructions for tools you actually use

ContextKit solves these problems.

## Quick Start

```bash
# Install
npm install -g contextkit

# Scan your project
contextkit scan

# Check health
contextkit validate

# Generate a report
contextkit report --format markdown --out report.md
```

## Supported Instruction Files

| File / Pattern | Tool |
|---|---|
| `AGENTS.md` | General AI assistants |
| `CLAUDE.md` | Claude |
| `.cursor/rules/*.mdc` | Cursor IDE |
| `.github/copilot-instructions.md` | GitHub Copilot |
| `.roo/rules/*.md` | Roo |
| `.codex/instructions.md` | Codex |
| `.windsurf/rules` | Windsurf |
| `.gemini/GEMINI.md` | Gemini |

## VS Code Extension

ContextKit includes a VS Code extension with:

- Activity bar sidebar
- Status bar with token/issue counts
- Diagnostics in instruction files
- Webview report
- One-click split, convert, and generate commands

## Privacy

ContextKit processes everything locally. No data is sent anywhere. No telemetry. No LLM API calls.

## Packages

| Package | Description | npm |
|---|---|---|
| `contextkit` | CLI tool | `npm install -g contextkit` |
| `@contextkit/core` | Core engine | `npm install @contextkit/core` |
| `contextkit-vscode` | VS Code extension | VS Code Marketplace |

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Type check
pnpm typecheck

# Lint
pnpm lint

# Smoke test with Bun
pnpm smoke:bun
```

## Related Tools

| Tool | Purpose |
|---|---|
| **i18ntk** | Zero-dependency i18n toolkit for scanning, validation, translation, reports, and runtime loading. |
| **i18ntk Workbench** | Full VS Code localization health dashboard powered by i18ntk. |
| **i18ntk Lens** | Lightweight inline translation hovers, diagnostics, and key navigation. |
| **PublishGuard** | Pre-publish safety scanner for npm packages and VS Code extensions. |
| **ContextKit** | AI coding context manager for AGENTS.md, Claude, Cursor, Copilot, Roo, and Codex files. |

## License

MIT
