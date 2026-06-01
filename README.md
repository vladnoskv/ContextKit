# AgentContextKit

**AgentContextKit is a local-first toolkit for keeping AI coding agents accurate, focused, and easy to manage.**

It helps teams scan, clean up, split, convert, and improve the instruction files used by AI coding tools such as Codex, Claude, Cursor, GitHub Copilot, Roo, Windsurf, and Gemini.

## Why AgentContextKit?

AI coding agents work better when their project context is clear. Most teams eventually collect scattered instruction files, duplicated rules, stale setup notes, and oversized prompts that waste context window space.

AgentContextKit gives you a simple workflow to:

- find every AI instruction file in a repository
- detect duplicate, conflicting, outdated, oversized, or broken guidance
- generate focused context packs for frontend, backend, database, testing, security, and deployment work
- install curated skills by exact skill, category, subcategory, or all
- tune skills for the target model and provider
- update skills without overwriting local edits
- manage everything locally with no telemetry and no LLM API calls

## SEO Keywords

AI coding agent context manager, AGENTS.md manager, Claude instructions, Cursor rules, GitHub Copilot instructions, Codex instructions, MCP skill server, AI prompt library, AI developer tools, local-first AI tooling, repository context hygiene, coding agent skills.

## Quick Start

```bash
# Install the CLI
npm install -g contextkit

# Scan your project
contextkit scan

# Check context health
contextkit validate

# Browse and install skills
contextkit skills list

# Start the MCP skill server
contextkit mcp
```

The current CLI command remains `contextkit` for compatibility. The product name is AgentContextKit.

## Supported Instruction Files

| File / Pattern | Tool |
|---|---|
| `AGENTS.md` | General AI coding agents |
| `CLAUDE.md` | Claude |
| `.cursor/rules/*.mdc` | Cursor |
| `.github/copilot-instructions.md` | GitHub Copilot |
| `.roo/rules/*.md` | Roo |
| `.codex/instructions.md` | Codex |
| `.windsurf/rules` | Windsurf |
| `.gemini/GEMINI.md` | Gemini |

## Skills and MCP

AgentContextKit includes a modular skill library for AI coding workflows.

- Import everything with the `all` option.
- Drill down by category and subcategory.
- Select exact skills when you want tight context.
- Edit imported skills to match your project.
- Remove skills when they are no longer needed.
- Review improved upstream skill prompts before applying updates to locally edited content.
- Use the standalone MCP server or `contextkit mcp` to expose the same workflow to MCP-compatible clients.

## VS Code Extension

The VS Code extension adds:

- a project context sidebar
- a setup view for scanning and defaults
- a step-by-step skill install wizard
- provider and model setup guidance for imported skills
- diagnostics for instruction files
- a local webview report
- commands for scanning, generating, splitting, converting, and packing context

## Privacy

AgentContextKit runs locally. It does not send repository data to external services, call model APIs, or collect telemetry.

## Packages

| Package | Description |
|---|---|
| `contextkit` | CLI tool, currently kept under the original package name for compatibility |
| `@contextkit/core` | Runtime-agnostic core engine |
| `@contextkit/mcp` | MCP server for skill library management |
| `contextkit-vscode` | VS Code extension package |

## Development

```bash
pnpm install
pnpm build
pnpm test
pnpm typecheck
```

## License

MIT
