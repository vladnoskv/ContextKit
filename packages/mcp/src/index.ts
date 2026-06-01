#!/usr/bin/env node
import { runStdioServer } from "./server.js";

runStdioServer().catch((err: any) => {
  process.stderr.write(`AgentContextKit MCP server failed: ${err.message ?? String(err)}\n`);
  process.exit(1);
});

export { createSkillToolHandlers, handleMcpRequest, runStdioServer } from "./server.js";
