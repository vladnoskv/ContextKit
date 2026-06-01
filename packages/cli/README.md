# AgentContextKit CLI

AgentContextKit helps you keep AI coding agent instructions clean, focused, and useful.

Use it to scan repositories for `AGENTS.md`, Claude, Cursor, Copilot, Codex, Roo, Windsurf, and Gemini instruction files; find stale or conflicting guidance; create focused context packs; and manage a modular skill library for AI agents.

## Install

```bash
npm install -g contextkit
contextkit scan
```

The CLI still uses the `contextkit` command for compatibility.

## Common Commands

```bash
contextkit scan
contextkit validate
contextkit report --format markdown --out agent-context-report.md
contextkit tokens
contextkit generate agents --dry-run
contextkit split AGENTS.md --dry-run
contextkit convert --from AGENTS.md --to copilot --dry-run
contextkit pack frontend --out context/frontend.md
contextkit skills list
contextkit skills add react-ui
contextkit mcp
```

## What It Does

- **Scan**: find AI instruction files across a project.
- **Validate**: detect duplicate, conflicting, stale, oversized, or broken guidance.
- **Measure**: estimate local token usage without API calls.
- **Generate**: create starter instruction files from project detection.
- **Split**: break large prompts into modular instruction files.
- **Convert**: move guidance between agent formats.
- **Pack**: create task-focused context packs.
- **Manage skills**: install, edit, remove, and safely update agent skills.
- **Run MCP**: expose the skill library to MCP-compatible clients.

## Privacy

AgentContextKit is local-first. It does not send code or prompts anywhere, does not call LLM APIs, and does not collect telemetry.

## SEO Keywords

AI coding agent CLI, AGENTS.md tool, Claude instructions manager, Cursor rules manager, Codex context tool, MCP skill server, AI prompt library, coding agent context hygiene.
