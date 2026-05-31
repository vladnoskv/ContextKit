import type {
  ParsedMarkdown,
  HeadingNode,
  SentenceInfo,
  LinkInfo,
  MarkdownSection,
} from "../types/index.js";

export function parseMarkdown(content: string, filePath: string): ParsedMarkdown {
  const lines = content.split("\n");
  const headings: HeadingNode[] = [];
  const sentences: SentenceInfo[] = [];
  const links: LinkInfo[] = [];
  const sections: MarkdownSection[] = [];

  const headingStack: HeadingNode[] = [];
  const sectionStack: Array<{ startLine: number; heading: string; level: number }> = [];
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const lineNum = i + 1;

    // Track code block state
    if (line.trimStart().startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock) continue;

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1]!.length;
      const text = headingMatch[2]!.trim();
      const node: HeadingNode = {
        level,
        text,
        children: [],
        startLine: lineNum,
      };

      if (sectionStack.length > 0) {
        const prev = sectionStack[sectionStack.length - 1]!;
        sections.push({
          heading: prev.heading,
          headingLevel: prev.level,
          content: lines.slice(prev.startLine, lineNum - 1).join("\n"),
          startLine: prev.startLine,
          endLine: lineNum - 1,
        });
      }

      sectionStack.push({ startLine: lineNum, heading: text, level });

      while (headingStack.length > 0 && (headingStack[headingStack.length - 1]?.level ?? 0) >= level) {
        const closed = headingStack.pop();
        if (closed) closed.endLine = lineNum;
      }

      if (headingStack.length > 0) {
        headingStack[headingStack.length - 1]!.children.push(node);
      } else {
        headings.push(node);
      }
      headingStack.push(node);
    }

    // Extract links
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match: RegExpExecArray | null;
    while ((match = linkRegex.exec(line)) !== null) {
      const url = match[2] ?? "";
      const isLocal = !url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("#");
      links.push({
        text: match[1] ?? "",
        url,
        isLocal,
        line: lineNum,
      });
    }

    // Extract sentences
    const stripped = stripMarkdownInline(line);
    if (stripped.trim().length > 0) {
      const sentenceParts = splitSentences(stripped);
      for (const part of sentenceParts) {
        const normalized = normalizeText(part);
        if (normalized.length > 10) {
          sentences.push({
            text: part.trim(),
            normalized,
            line: lineNum,
            filePath,
          });
        }
      }
    }
  }

  // Last section
  if (sectionStack.length > 0) {
    const prev = sectionStack[sectionStack.length - 1]!;
    sections.push({
      heading: prev.heading,
      headingLevel: prev.level,
      content: lines.slice(prev.startLine).join("\n"),
      startLine: prev.startLine,
      endLine: lines.length,
    });
  }

  // Close remaining heading nodes
  for (const h of headingStack) {
    h.endLine = lines.length;
  }

  return { headings, sentences, links, sections };
}

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,:;!?()\[\]{}'"`/\\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.trim().length > 0);
}

export function stripMarkdownInline(text: string): string {
  return text
    .replace(/`[^`]*`/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_~]{1,3}([^*_~]+)[*_~]{1,3}/g, "$1")
    .replace(/^\s*[-*+>]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/#{1,6}\s+/g, "")
    .trim();
}

export function findHeadingNode(
  headings: HeadingNode[],
  text: string,
): HeadingNode | undefined {
  for (const h of headings) {
    if (h.text.toLowerCase().includes(text.toLowerCase())) return h;
    const found = findHeadingNode(h.children, text);
    if (found) return found;
  }
  return undefined;
}

function collectSectionContent(
  sections: MarkdownSection[],
  headingText: string,
): string | undefined {
  const section = sections.find(
    (s) => s.heading.toLowerCase().includes(headingText.toLowerCase()),
  );
  return section?.content;
}
