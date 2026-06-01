import { describe, expect, it } from "vitest";
import { createSkillToolHandlers, handleMcpRequest } from "../src/server.js";

describe("AgentContextKit MCP server", () => {
  it("lists skill management tools", async () => {
    const response = await handleMcpRequest({ jsonrpc: "2.0", id: 1, method: "tools/list" });

    expect(response.result.tools.map((tool: { name: string }) => tool.name)).toEqual(
      expect.arrayContaining([
        "skills_catalog",
        "skills_import",
        "skills_remove",
        "skills_read",
        "skills_write",
        "skills_update_check",
        "skills_update_apply",
      ]),
    );
  });

  it("calls catalog tool with all, category, and subcategory drilldown", async () => {
    const handlers = createSkillToolHandlers({ defaultRootDir: "/project", fs: createWritableMockFs({}) });
    const result = await handlers.skills_catalog({ category: "frontend", subcategory: "react" });

    expect(result.all.count).toBeGreaterThan(0);
    expect(result.categories.some((category) => category.id === "frontend")).toBe(true);
    expect(result.selectedSkills).toContain("react-ui");
  });

  it("imports and edits selected skills", async () => {
    const fs = createWritableMockFs({});
    const handlers = createSkillToolHandlers({ defaultRootDir: "/project", fs });

    const imported = await handlers.skills_import({
      rootDir: "/project",
      skills: ["typescript-strict"],
      provider: "openai",
      model: "gpt-5",
    });
    expect(imported.installed.map((skill) => skill.name)).toEqual(["typescript-strict"]);
    expect(imported.installed[0]?.selectedProvider).toBe("openai");
    expect(imported.installed[0]?.selectedModel).toBe("gpt-5");
    expect(imported.installed[0]?.estimatedTokens).toBeGreaterThan(100);

    await handlers.skills_write({
      rootDir: "/project",
      name: "typescript-strict",
      content: "# Local version",
    });
    const read = await handlers.skills_read({ rootDir: "/project", name: "typescript-strict" });
    expect(read.content).toBe("# Local version");
  });
});

function createWritableMockFs(initialFiles: Record<string, string>) {
  const files = { ...initialFiles };
  const resolve = (...s: string[]) => s.join("/");
  const dirCache = new Set<string>();
  const refreshDirs = () => {
    dirCache.clear();
    for (const key of Object.keys(files)) {
      const parts = key.split("/");
      for (let i = 1; i < parts.length; i++) {
        dirCache.add(parts.slice(0, i).join("/"));
      }
    }
  };
  refreshDirs();
  return {
    readFile: async (p: string) => {
      const content = files[p];
      if (content === undefined) throw new Error(`File not found: ${p}`);
      return content;
    },
    writeFile: async (p: string, c: string) => {
      files[p] = c;
      refreshDirs();
    },
    removeFile: async (p: string) => {
      delete files[p];
      refreshDirs();
    },
    fileExists: async (p: string) => files[p] !== undefined,
    directoryExists: async (p: string) => dirCache.has(p) || p === "" || p === "/" || p === "/project",
    listFiles: async () => [],
    stat: async () => ({ size: 0, mtimeMs: 0 }),
    mkdir: async (p: string) => {
      dirCache.add(p);
    },
    resolvePath: resolve,
    joinPath: resolve,
    isAbsolute: () => false,
    relativePath: () => "",
  };
}
