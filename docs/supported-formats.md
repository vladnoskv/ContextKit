# Supported Formats

ContextKit detects and supports the following AI instruction file formats.

## Format Table

| Format | File/Location | Kind | Frontmatter | Notes |
|---|---|---|---|---|
| AGENTS.md | `AGENTS.md` | `agents` | None | General-purpose, widely used |
| CLAUDE.md | `CLAUDE.md` | `claude` | None | Claude-specific instructions |
| Cursor Rules | `.cursor/rules/*.mdc` | `cursor` | YAML (description, globs, alwaysApply) | Cursor IDE rule files |
| GitHub Copilot | `.github/copilot-instructions.md` | `copilot` | None | GitHub Copilot Chat/Workspace |
| Roo Rules | `.roo/rules/*.md` | `roo` | None | Roo Code extension |
| Codex | `.codex/instructions.md`, `.codex/*.md` | `codex` | None | Codex CLI/extension |
| Windsurf | `.windsurf/rules` | `windsurf` | None | Windsurf IDE |
| Gemini | `.gemini/GEMINI.md` | `gemini` | None | Google Gemini CLI |
| Custom | User-configured patterns | `custom` | Varies | Via `contextkit.config.json` |

## Cursor MDC Format

Cursor `.mdc` files use YAML frontmatter:

```markdown
---
description: Description of the rule
globs:
  - "src/**/*.tsx"
alwaysApply: false
---

# Rule Content Here
```

ContextKit parses and validates Cursor frontmatter.

## Custom Formats

Add custom instruction file patterns in `contextkit.config.json`:

```json
{
  "customInstructionFiles": [
    "docs/ai-guidelines.md",
    ".team/rules/*.md"
  ]
}
```
