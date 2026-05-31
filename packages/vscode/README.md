# ContextKit — VS Code Extension

![ContextKit logo](media/contextkit-logo.png)

**AI Coding Context Manager** for VS Code.

Manage, validate, split, convert, and measure AI coding instruction files directly from your editor.

## Features

### Sidebar View

Open the ContextKit activity bar to see:

- **Project Overview** — file count, token estimate, issue count, health score
- **Instruction Files** — clickable list of detected AI instruction files
- **Issues** — duplicates, conflicts, oversized files, and more
- **Context Packs** — one-click generation of focused context packs
- **Actions** — scan, report, split, convert, generate

### Status Bar

See token count and issue count at a glance. Click to open the detailed report.

### Diagnostics

ContextKit adds diagnostics to your instruction files:

- Duplicate rules across files
- Conflicting rules (e.g., "use npm" vs "use pnpm")
- Oversized files exceeding token thresholds
- Broken local links
- Missing recommended files

### Webview Report

A rich HTML report showing:

- Health score dashboard
- Token breakdown by file
- Issue list with severity badges
- Detected project info (frameworks, tools, languages)
- Suggested actions

### Commands

| Command | Description |
|---|---|
| `ContextKit: Scan Workspace` | Scan for AI instruction files |
| `ContextKit: Open Report` | Open the detailed webview report |
| `ContextKit: Refresh` | Re-run the scan |
| `ContextKit: Generate Instructions` | Generate project-specific instruction files |
| `ContextKit: Split Instruction File` | Split a large instruction file into modules |
| `ContextKit: Convert Instructions` | Convert between instruction formats |
| `ContextKit: Create Context Pack` | Create a focused context pack |
| `ContextKit: Open Settings` | Open ContextKit settings |

## Settings

| Setting | Default | Description |
|---|---|---|
| `contextkit.autoScanOnOpen` | `false` | Auto-scan when extension activates |
| `contextkit.autoScanOnSave` | `false` | Auto-scan when instruction files are saved |
| `contextkit.tokenWarningThreshold` | `4000` | Token count for warnings |
| `contextkit.tokenErrorThreshold` | `8000` | Token count for errors |
| `contextkit.enableDiagnostics` | `true` | Enable diagnostics in instruction files |
| `contextkit.enableStatusBar` | `true` | Show status bar item |
| `contextkit.include` | `[]` | Additional file patterns to include |
| `contextkit.exclude` | `["node_modules", ".git", ...]` | Patterns to exclude |
| `contextkit.preferredInstructionFormat` | `"agents"` | Default format for generation |

## Supported Files

| File | Tool |
|---|---|
| `AGENTS.md` | General |
| `CLAUDE.md` | Claude |
| `.cursor/rules/*.mdc` | Cursor |
| `.github/copilot-instructions.md` | GitHub Copilot |
| `.roo/rules/*.md` | Roo |
| `.codex/instructions.md` | Codex |
| `.windsurf/rules` | Windsurf |
| `.gemini/GEMINI.md` | Gemini |

## Privacy

ContextKit processes everything locally. No data is sent externally. No telemetry. No LLM API calls.

## Requirements

- VS Code >= 1.90.0

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
