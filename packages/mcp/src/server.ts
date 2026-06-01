import {
  createNodeFileSystemAdapter,
  getInstalledSkills,
  getSkill,
  getSkillCatalog,
  installSkills,
  readInstalledSkill,
  removeInstalledSkill,
  resolveSkillSelection,
  updateInstalledSkillsSafe,
  writeInstalledSkill,
  type FileSystemAdapter,
  type InstructionFormat,
  type SkillCategory,
  type SkillSelection,
} from "@contextkit/core";

type JsonRpcId = string | number | null;

type JsonRpcRequest = {
  jsonrpc?: "2.0";
  id?: JsonRpcId;
  method?: string;
  params?: Record<string, unknown>;
};

type JsonRpcResponse = {
  jsonrpc: "2.0";
  id: JsonRpcId;
  result?: any;
  error?: { code: number; message: string; data?: unknown };
};

type ToolDefinition = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
};

type HandlerContext = {
  defaultRootDir?: string;
  fs?: FileSystemAdapter;
};

type ToolHandlers = ReturnType<typeof createSkillToolHandlers>;

const SERVER_INFO = {
  name: "agentcontextkit-skills",
  version: "0.2.1",
};

const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: "skills_catalog",
    description: "Browse available AgentContextKit skills by all, category, subcategory, group, or exact skill selection.",
    inputSchema: objectSchema({
      all: { type: "boolean" },
      category: { type: "string" },
      categories: { type: "array", items: { type: "string" } },
      subcategory: { type: "string" },
      subcategories: { type: "array", items: { type: "string" } },
      skills: { type: "array", items: { type: "string" } },
    }),
  },
  {
    name: "skills_preview",
    description: "Preview a built-in skill before importing it.",
    inputSchema: objectSchema({ name: { type: "string" } }, ["name"]),
  },
  {
    name: "skills_import",
    description: "Import selected skills into the target project without importing the full catalog unless all is true.",
    inputSchema: objectSchema({
      rootDir: { type: "string" },
      all: { type: "boolean" },
      categories: { type: "array", items: { type: "string" } },
      subcategories: { type: "array", items: { type: "string" } },
      skills: { type: "array", items: { type: "string" } },
      provider: { type: "string" },
      model: { type: "string" },
      updateInstructionFiles: { type: "boolean" },
      targetFormat: { type: "string" },
    }),
  },
  {
    name: "skills_installed",
    description: "List installed skills and show modified or outdated status for ongoing library management.",
    inputSchema: objectSchema({ rootDir: { type: "string" } }),
  },
  {
    name: "skills_remove",
    description: "Delete an installed skill from the target project and update the skill manifest.",
    inputSchema: objectSchema({ rootDir: { type: "string" }, name: { type: "string" }, force: { type: "boolean" } }, ["name"]),
  },
  {
    name: "skills_read",
    description: "Read an imported skill so users can inspect or edit its local content.",
    inputSchema: objectSchema({ rootDir: { type: "string" }, name: { type: "string" } }, ["name"]),
  },
  {
    name: "skills_write",
    description: "Write edited skill content back to an imported skill and record the new local baseline.",
    inputSchema: objectSchema({ rootDir: { type: "string" }, name: { type: "string" }, content: { type: "string" } }, ["name", "content"]),
  },
  {
    name: "skills_update_check",
    description: "Check for skill updates and return review candidates without overwriting user-modified content.",
    inputSchema: objectSchema({ rootDir: { type: "string" }, skills: { type: "array", items: { type: "string" } } }),
  },
  {
    name: "skills_update_apply",
    description: "Apply safe skill updates. Modified or critical skills are returned for review instead of overwritten.",
    inputSchema: objectSchema({ rootDir: { type: "string" }, skills: { type: "array", items: { type: "string" } } }),
  },
];

export function createSkillToolHandlers(context: HandlerContext = {}) {
  const fs = context.fs ?? createNodeFileSystemAdapter();
  const defaultRootDir = context.defaultRootDir ?? process.cwd();

  const root = (value: unknown): string => (typeof value === "string" && value.length > 0 ? value : defaultRootDir);

  return {
    async skills_catalog(args: Record<string, unknown> = {}) {
      const catalog = getSkillCatalog();
      const selection = parseSelection(args);
      const selectedSkills = resolveSkillSelection(selection);
      return { ...catalog, selectedSkills };
    },

    async skills_preview(args: Record<string, unknown>) {
      const name = requireString(args, "name");
      const skill = getSkill(name);
      if (!skill) throw new Error(`Skill "${name}" not found.`);
      return skill;
    },

    async skills_import(args: Record<string, unknown> = {}) {
      const selection = parseSelection(args);
      const selected = resolveSkillSelection(selection);
      return installSkills({
        rootDir: root(args.rootDir),
        skills: selected,
        provider: optionalString(args.provider),
        model: optionalString(args.model),
        targetFormat: parseInstructionFormat(args.targetFormat),
        updateInstructionFiles: Boolean(args.updateInstructionFiles),
      }, fs);
    },

    async skills_installed(args: Record<string, unknown> = {}) {
      return { installed: await getInstalledSkills(root(args.rootDir), fs) };
    },

    async skills_remove(args: Record<string, unknown>) {
      return removeInstalledSkill(root(args.rootDir), requireString(args, "name"), fs, Boolean(args.force));
    },

    async skills_read(args: Record<string, unknown>) {
      const name = requireString(args, "name");
      return { name, content: await readInstalledSkill(root(args.rootDir), name, fs) };
    },

    async skills_write(args: Record<string, unknown>) {
      const name = requireString(args, "name");
      await writeInstalledSkill(root(args.rootDir), name, requireString(args, "content"), fs);
      return { name, written: true };
    },

    async skills_update_check(args: Record<string, unknown> = {}) {
      return updateInstalledSkillsSafe(root(args.rootDir), fs, {
        apply: false,
        skills: parseStringArray(args.skills),
      });
    },

    async skills_update_apply(args: Record<string, unknown> = {}) {
      return updateInstalledSkillsSafe(root(args.rootDir), fs, {
        apply: true,
        skills: parseStringArray(args.skills),
      });
    },
  };
}

export async function handleMcpRequest(
  request: JsonRpcRequest,
  context: HandlerContext = {},
): Promise<JsonRpcResponse | undefined> {
  if (!request.id && request.method?.startsWith("notifications/")) return undefined;

  try {
    if (request.method === "initialize") {
      return ok(request.id ?? null, {
        protocolVersion: "2025-06-18",
        capabilities: { tools: {} },
        serverInfo: SERVER_INFO,
        instructions: "Use AgentContextKit skills_catalog first to browse all skills, categories, and subcategories. Import only the selected skills. Update tools never overwrite modified local content.",
      });
    }

    if (request.method === "ping") {
      return ok(request.id ?? null, {});
    }

    if (request.method === "tools/list") {
      return ok(request.id ?? null, { tools: TOOL_DEFINITIONS });
    }

    if (request.method === "tools/call") {
      const params = request.params ?? {};
      const name = requireString(params, "name");
      const args = isRecord(params.arguments) ? params.arguments : {};
      const handlers = createSkillToolHandlers(context) as Record<string, (input: Record<string, unknown>) => Promise<unknown>>;
      const handler = handlers[name];
      if (!handler) throw new Error(`Unknown tool "${name}".`);
      const data = await handler(args);
      return ok(request.id ?? null, {
        content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
        structuredContent: data,
      });
    }

    return error(request.id ?? null, -32601, `Method not found: ${request.method ?? "<missing>"}`);
  } catch (err: any) {
    return error(request.id ?? null, -32000, err.message ?? String(err));
  }
}

export async function runStdioServer(context: HandlerContext = {}): Promise<void> {
  process.stdin.setEncoding("utf8");
  let buffer = "";

  for await (const chunk of process.stdin) {
    buffer += chunk;
    let newlineIndex = buffer.indexOf("\n");
    while (newlineIndex >= 0) {
      const line = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);
      newlineIndex = buffer.indexOf("\n");
      if (!line) continue;

      const response = await handleMcpRequest(JSON.parse(line) as JsonRpcRequest, context);
      if (response) process.stdout.write(`${JSON.stringify(response)}\n`);
    }
  }
}

function parseSelection(args: Record<string, unknown>): SkillSelection {
  return {
    all: Boolean(args.all),
    categories: [
      ...parseStringArray(args.categories),
      ...(typeof args.category === "string" ? [args.category] : []),
    ] as SkillCategory[],
    subcategories: [
      ...parseStringArray(args.subcategories),
      ...(typeof args.subcategory === "string" ? [args.subcategory] : []),
    ],
    skills: parseStringArray(args.skills),
  };
}

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string" && item.length > 0);
}

function parseInstructionFormat(value: unknown): InstructionFormat | undefined {
  const allowed: InstructionFormat[] = ["agents", "claude", "cursor", "copilot", "roo", "codex", "windsurf", "gemini", "markdown"];
  return typeof value === "string" && allowed.includes(value as InstructionFormat) ? value as InstructionFormat : undefined;
}

function requireString(args: Record<string, unknown>, key: string): string {
  const value = args[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`"${key}" must be a non-empty string.`);
  }
  return value;
}

function optionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function ok(id: JsonRpcId, result: any): JsonRpcResponse {
  return { jsonrpc: "2.0", id, result };
}

function error(id: JsonRpcId, code: number, message: string): JsonRpcResponse {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

function objectSchema(properties: Record<string, unknown>, required: string[] = []): Record<string, unknown> {
  return {
    type: "object",
    properties,
    required,
    additionalProperties: false,
  };
}

export type ContextKitMcpToolHandlers = ToolHandlers;
