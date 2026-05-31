import type { InstructionFile, ContextIssue } from "../types/index.js";
import { parseMarkdown } from "../parser/index.js";

export async function analyzeBrokenLinks(
  files: InstructionFile[],
  fileExists: (path: string) => Promise<boolean>,
  resolvePath: (...segments: string[]) => string,
): Promise<ContextIssue[]> {
  const issues: ContextIssue[] = [];

  for (const file of files) {
    const parsed = parseMarkdown(file.content, file.path);
    for (const link of parsed.links) {
      if (!link.isLocal) continue;
      if (link.url.startsWith("mailto:")) continue;

      let targetPath = link.url;
      if (targetPath.startsWith("./")) targetPath = targetPath.slice(2);

      const fileDir = file.path.split("/").slice(0, -1).join("/");
      const resolvedTarget = fileDir
        ? resolvePath(fileDir, targetPath)
        : targetPath;

      const exists = await fileExists(resolvedTarget);
      if (!exists) {
        issues.push({
          id: `broken-link-${file.path}-${link.line}`,
          severity: "warning",
          type: "broken_link",
          message: `Broken link in ${file.path}: "${link.text}" -> "${link.url}" (file not found)`,
          filePath: file.path,
          line: link.line,
          suggestion: `Update or remove the link to "${link.url}"`,
        });
      }
    }
  }

  return issues;
}
