# AgentContextKit MCP Skill Server

Run AgentContextKit as a standalone MCP server for browsing, importing, editing, removing, and safely updating skill documents.

## Run From A GitHub Checkout

```powershell
pnpm install
pnpm --filter @contextkit/mcp build
node packages/mcp/dist/index.js
```

The CLI also exposes the same server:

```powershell
contextkit mcp
agentcontextkit mcp
```

## Tools

- `skills_catalog` browses all skills, categories, subcategories, and selected exact skills.
- `skills_preview` previews a built-in skill before import.
- `skills_import` imports exact selections, categories, subcategories, or all skills with optional provider/model setup.
- `skills_installed` lists installed skills with modified status, model fit, and rough token estimates.
- `skills_remove` deletes an installed skill.
- `skills_read` and `skills_write` let users inspect and tweak imported skill content.
- `skills_update_check` and `skills_update_apply` protect user edits by returning review candidates for modified or critical skills.

## Provider And Model Setup

Pass `provider` and `model` to `skills_import` to stamp imported skill frontmatter and append an AgentContextKit import profile with:

- selected provider and model
- compatibility fit
- rough token usage
- setup notes
- context optimization guidance

