import type { CliArgs } from "../commands/args.js";
import * as path from "node:path";
import * as fs from "node:fs";

export function resolveRoot(args: CliArgs): string {
  if (args.root) {
    const resolved = path.resolve(process.cwd(), args.root);
    try {
      const real = fs.realpathSync(resolved);
      if (!fs.statSync(real).isDirectory()) {
        throw new Error(`Not a directory: ${real}`);
      }
      return real;
    } catch (err: any) {
      throw new Error(`Invalid root directory: ${args.root} (${err.message})`);
    }
  }
  return process.cwd();
}

export function isPathWithin(root: string, target: string): boolean {
  const resolvedRoot = path.resolve(root);
  const resolvedTarget = path.resolve(target);
  return resolvedTarget.startsWith(resolvedRoot + path.sep) || resolvedTarget === resolvedRoot;
}
