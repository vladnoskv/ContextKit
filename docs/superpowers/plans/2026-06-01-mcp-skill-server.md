# MCP Skill Server Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add MCP access to ContextKit skills so users can browse, selectively import, edit, remove, and safely update skills.

**Architecture:** Keep all catalog, import, edit, delete, and update safety rules in `@contextkit/core`. Expose the same behavior through an integrated `contextkit mcp` CLI command and a standalone `@contextkit/mcp` workspace package with a `contextkit-mcp` bin.

**Tech Stack:** TypeScript, pnpm workspaces, Vitest, tsup, official `@modelcontextprotocol/server` stdio server API.

---

### Task 1: Core Skill Management APIs

**Files:**
- Modify: `packages/core/src/types/index.ts`
- Modify: `packages/core/src/skills/index.ts`
- Modify: `packages/core/src/skills/data.ts`
- Modify: `packages/core/src/index.ts`
- Test: `packages/core/test/skills.test.ts`

- [ ] Write failing tests for catalog selection, skill read/write, remove behavior, and update candidates for modified skills.
- [ ] Extend skill metadata with subcategory and compatibility knowledge.
- [ ] Add APIs for `getSkillCatalog`, `resolveSkillSelection`, `readInstalledSkill`, `writeInstalledSkill`, and safe update planning/apply.
- [ ] Run targeted core tests.

### Task 2: MCP Shared Server Module

**Files:**
- Create: `packages/mcp/package.json`
- Create: `packages/mcp/tsconfig.json`
- Create: `packages/mcp/vitest.config.ts`
- Create: `packages/mcp/src/server.ts`
- Create: `packages/mcp/src/index.ts`
- Test: `packages/mcp/test/server.test.ts`
- Modify: `package.json`

- [ ] Write failing tests for MCP tool listing and representative tool calls.
- [ ] Register tools for catalog, preview, import, installed, remove, read, write, update check, and update apply.
- [ ] Use JSON responses in `content` and `structuredContent`.
- [ ] Add package build/test scripts.

### Task 3: Integrated CLI Entry Point

**Files:**
- Create: `packages/cli/src/commands/mcp.ts`
- Modify: `packages/cli/src/index.ts`
- Modify: `packages/cli/src/output/help.ts`
- Modify: `packages/cli/package.json`
- Test: `packages/cli/test/commands.test.ts`

- [ ] Add `contextkit mcp` command that starts the same stdio server.
- [ ] Keep the command quiet on stdout except for MCP protocol traffic.
- [ ] Add help text and dependency wiring.

### Task 4: Validation

**Commands:**
- `pnpm --filter @contextkit/core test`
- `pnpm --filter @contextkit/mcp test`
- `pnpm --filter contextkit test`
- `pnpm typecheck`
- `pnpm build`

- [ ] Run tests and typecheck.
- [ ] Fix root causes of any failures.
- [ ] Re-run failing checks until evidence is clean or document any external blocker.
