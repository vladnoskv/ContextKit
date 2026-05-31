# ContextKit

**AI Coding Context Manager** — manage, validate, split, convert, and measure AI coding instruction files.

ContextKit is a local-first, privacy-first tool that helps developers maintain clean, consistent, and efficient context files for AI coding assistants like Claude, Cursor, GitHub Copilot, and more.

## Installation

### npm

```bash
npm install -g contextkit
contextkit scan
```

### Bun

```bash
bun add -g contextkit
contextkit scan
```

### npx / bunx

```bash
npx contextkit scan
bunx contextkit scan
```

## Quick Start

```bash
# Scan your project
contextkit scan

# Generate a report
contextkit report --format markdown --out contextkit-report.md

# Check token usage
contextkit tokens

# Validate for issues
contextkit validate

# Generate project-specific instructions
contextkit generate agents --dry-run

# Split a large instruction file
contextkit split AGENTS.md --dry-run

# Convert between formats
contextkit convert --from AGENTS.md --to copilot --dry-run

# Create focused context packs
contextkit pack frontend --out context/frontend.md
```

## Supported Instruction Files

ContextKit detects and manages:

| File / Pattern | Tool | Kind |
|---|---|---|
| `AGENTS.md` | General | `agents` |
| `CLAUDE.md` | Claude | `claude` |
| `.cursor/rules/*.mdc` | Cursor | `cursor` |
| `.github/copilot-instructions.md` | GitHub Copilot | `copilot` |
| `.roo/rules/*.md` | Roo | `roo` |
| `.codex/instructions.md` | Codex | `codex` |
| `.windsurf/rules` | Windsurf | `windsurf` |
| `.gemini/GEMINI.md` | Gemini | `gemini` |

## Features

- **Scan** — Detect AI instruction files across your project
- **Token estimation** — Locally estimate token count (no API calls)
- **Duplicate detection** — Find near-duplicate rules across files
- **Conflict detection** — Flag conflicting instructions
- **Oversized detection** — Warn on files exceeding token thresholds
- **Health score** — Get a numeric score for context hygiene
- **Split** — Break large files into modular docs with a router
- **Convert** — Convert between instruction file formats
- **Generate** — Auto-generate instruction files from project detection
- **Pack** — Create focused context packs for specific domains (frontend, backend, testing, etc.)

## CLI Commands

| Command | Description |
|---|---|
| `contextkit scan` | Scan for AI instruction files |
| `contextkit tokens` | Show estimated token counts |
| `contextkit report` | Generate Markdown or JSON report |
| `contextkit validate` | Check for issues, duplicates, conflicts |
| `contextkit convert` | Convert between instruction formats |
| `contextkit split` | Split large instruction files |
| `contextkit generate` | Generate project-specific instruction files |
| `contextkit pack` | Create focused context packs |
| `contextkit init` | Create a contextkit.config.json |

All write commands support `--dry-run`.

## API Usage

```ts
import { scanContext, generateReport } from "@contextkit/core";

const result = await scanContext({
  rootDir: process.cwd(),
  tokenWarningThreshold: 4000,
  tokenErrorThreshold: 8000,
});

const markdown = await generateReport(result, {
  format: "markdown",
});

console.log(markdown);
```

## Configuration

Create a `contextkit.config.json` or `.contextkitrc`:

```json
{
  "tokenWarningThreshold": 4000,
  "tokenErrorThreshold": 8000,
  "preferredInstructionFormat": "agents",
  "include": [],
  "exclude": ["node_modules", ".git", "dist", "build", ".next", "coverage"],
  "customInstructionFiles": [],
  "conflictRules": []
}
```

## VS Code Extension

ContextKit also ships as a VS Code extension (`contextkit-vscode`) with:

- Activity bar sidebar with project overview, file list, and issue list
- Status bar showing token and issue counts
- Diagnostics in instruction files (duplicates, conflicts, oversized files)
- Webview report with health score, token breakdown, and suggested actions
- Commands for scanning, generating, converting, and splitting

## Privacy

ContextKit is **privacy-first**:

- All processing is local — no data is sent anywhere
- No LLM API calls
- No telemetry
- No automatic file modifications without user action
- Write operations require explicit confirmation

## Requirements

- Node.js >= 18
- Bun >= 1.0 (optional)
- VS Code >= 1.90.0 (for extension)

## Packages

| Package | Description |
|---|---|
| `contextkit` | CLI tool |
| `@contextkit/core` | Core engine (runtime-agnostic) |
| `contextkit-vscode` | VS Code extension |

## Roadmap

- [x] Instruction file detection
- [x] Token estimation
- [x] Duplicate and conflict detection
- [x] File splitting and format conversion
- [x] Instruction generation
- [x] Context packs
- [x] VS Code integration
- [ ] Custom tokenizers (tiktoken, etc.)
- [ ] More conflict rule patterns
- [ ] Intelligent section matching for better conversion
- [ ] Configurable severity thresholds per rule type

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
