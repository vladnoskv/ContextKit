import type { FileSystemAdapter } from "../types/index.js";
import * as fs from "node:fs/promises";
import * as path from "node:path";

export function createNodeFileSystemAdapter(): FileSystemAdapter {
  return {
    async readFile(filePath: string): Promise<string> {
      return fs.readFile(filePath, "utf-8");
    },

    async writeFile(filePath: string, content: string): Promise<void> {
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(filePath, content, "utf-8");
    },

    async removeFile(filePath: string): Promise<void> {
      await fs.rm(filePath, { force: true });
    },

    async fileExists(filePath: string): Promise<boolean> {
      try {
        const st = await fs.lstat(filePath);
        if (st.isSymbolicLink()) return false;
        return st.isFile();
      } catch {
        return false;
      }
    },

    async directoryExists(filePath: string): Promise<boolean> {
      try {
        const st = await fs.lstat(filePath);
        if (st.isSymbolicLink()) return false;
        return st.isDirectory();
      } catch {
        return false;
      }
    },

    async listFiles(dir: string): Promise<string[]> {
      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        return entries.filter((e) => !e.isSymbolicLink()).map((e) => e.name);
      } catch {
        return [];
      }
    },

    async stat(filePath: string): Promise<{ size: number; mtimeMs: number }> {
      const st = await fs.lstat(filePath);
      if (st.isSymbolicLink()) {
        throw new Error(`Cannot stat symlink: ${filePath}`);
      }
      return { size: st.size, mtimeMs: st.mtimeMs };
    },

    async mkdir(dirPath: string): Promise<void> {
      await fs.mkdir(dirPath, { recursive: true });
    },

    resolvePath(...segments: string[]): string {
      return path.resolve(...segments);
    },

    joinPath(...segments: string[]): string {
      return path.join(...segments);
    },

    isAbsolute(p: string): boolean {
      return path.isAbsolute(p);
    },

    relativePath(from: string, to: string): string {
      const rel = path.relative(from, to);
      return rel.replace(/\\/g, "/");
    },
  };
}
