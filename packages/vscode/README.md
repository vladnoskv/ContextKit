# AgentContextKit for VS Code

**A local-first AI coding agent context manager for VS Code.**

AgentContextKit helps you keep `AGENTS.md`, Claude, Cursor, GitHub Copilot, Codex, Roo, Windsurf, and Gemini instruction files clear, current, and useful.

## What You Can Do

- Scan your workspace for AI instruction files.
- Find duplicate, conflicting, stale, oversized, or broken guidance.
- See token estimates before prompts get too large.
- Generate focused context packs for frontend, backend, database, testing, security, and deployment tasks.
- Install modular agent skills with a step-by-step wizard.
- Choose skills by all, category, subcategory, or exact skill.
- Tune imported skills for the model and provider you use.
- Edit, remove, and safely update local skills without losing your changes.

## Best For

- Developers using AI coding agents every day.
- Teams standardizing prompt and instruction files across repositories.
- Projects with multiple agent formats such as `AGENTS.md`, `CLAUDE.md`, Cursor rules, and Copilot instructions.
- Local-first workflows that do not want telemetry or external API calls.

## SEO Keywords

AI coding agent context manager, AGENTS.md manager, Claude instructions, Cursor rules, GitHub Copilot instructions, Codex instructions, MCP skill server, AI prompt library, VS Code AI developer tools, repository context hygiene.

## Extension Views

Open the AgentContextKit activity bar to access:

- **Project Context**: overview, instruction files, issues, context packs, and skills.
- **Setup**: scan controls, diagnostics settings, token thresholds, and generation defaults.
- **Skill Install Wizard**: select scope, preview exact skills, choose provider/model setup, and install.

## Commands

| Command | Description |
|---|---|
| `AgentContextKit: Scan Workspace` | Scan for AI instruction files |
| `AgentContextKit: Open Report` | Open the local report |
| `AgentContextKit: Refresh` | Re-run the scan |
| `AgentContextKit: Generate Instructions` | Generate project-specific instruction files |
| `AgentContextKit: Split Instruction File` | Split a large instruction file into modules |
| `AgentContextKit: Convert Instructions` | Convert between instruction formats |
| `AgentContextKit: Create Context Pack` | Create a focused context pack |
| `AgentContextKit: Install Skills Wizard` | Import skills with provider/model setup |

Command IDs still use `contextkit` for compatibility.

## Privacy

AgentContextKit processes everything locally. No repository data is sent externally. No telemetry. No model API calls.

## Requirements

- VS Code 1.90.0 or newer

## License

MIT
