# CLI Usage

ContextKit provides a comprehensive CLI for managing AI instruction files.

## Installation

```bash
# npm
npm install -g contextkit

# Bun
bun add -g contextkit

# No install needed
npx contextkit scan
bunx contextkit scan
```

## Commands

### scan

Scan the workspace for AI instruction files.

```bash
contextkit scan
contextkit scan --root ./my-project
contextkit scan --json
contextkit scan --verbose
```

### tokens

Show estimated token counts.

```bash
contextkit tokens
contextkit tokens --by-file
```

### report

Generate a Markdown or JSON report.

```bash
contextkit report
contextkit report --format markdown --out report.md
contextkit report --format json --out report.json
```

### validate

Check for issues, duplicates, and conflicts.

```bash
contextkit validate
contextkit validate --strict   # Exit non-zero on errors
contextkit validate --json
```

### convert

Convert between instruction file formats.

```bash
contextkit convert --from AGENTS.md --to copilot --dry-run
contextkit convert --from AGENTS.md --to copilot --out .github/copilot-instructions.md
contextkit convert --from CLAUDE.md --to agents
contextkit convert --from .cursor/rules --to agents
```

### split

Split a large instruction file into modular docs.

```bash
contextkit split AGENTS.md --dry-run
contextkit split AGENTS.md --out .agents/docs
contextkit split CLAUDE.md --out .claude/docs
```

### generate

Generate project-specific instruction files.

```bash
contextkit generate agents --dry-run
contextkit generate claude
contextkit generate cursor
contextkit generate copilot
contextkit generate roo
contextkit generate all
```

### pack

Create focused context packs.

```bash
contextkit pack frontend --out context/frontend.md
contextkit pack backend
contextkit pack database
contextkit pack testing --dry-run
contextkit pack security --out rules/security.md
contextkit pack deployment
contextkit pack full --out context-pack.md
```

### init

Create a configuration file.

```bash
contextkit init
```

## Global Options

| Option | Description |
|---|---|
| `--root`, `-r` | Root directory (default: cwd) |
| `--json`, `-j` | Output JSON format |
| `--verbose`, `-v` | Verbose output |
| `--quiet`, `-q` | Suppress non-error output |
| `--strict` | Exit non-zero on validation errors |
| `--dry-run`, `-d` | Preview without writing files |
| `--format`, `-f` | Output format (`markdown` or `json`) |
| `--out`, `-o` | Output file path |
| `--from` | Source path (for convert) |
| `--to` | Target format (for convert) |
| `--by-file` | Show per-file data (for tokens) |
| `--help`, `-h` | Show help |
