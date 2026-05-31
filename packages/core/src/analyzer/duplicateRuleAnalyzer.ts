import type { InstructionFile, DuplicateInfo, SentenceInfo } from "../types/index.js";
import { parseMarkdown, normalizeText } from "../parser/index.js";

export interface DuplicateAnalysis {
  duplicates: DuplicateInfo[];
}

export function analyzeDuplicates(
  files: InstructionFile[],
  threshold: number = 0.82,
): DuplicateAnalysis {
  const allSentences: SentenceInfo[] = [];

  for (const file of files) {
    const parsed = parseMarkdown(file.content, file.path);
    allSentences.push(...parsed.sentences);
  }

  const duplicates: DuplicateInfo[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < allSentences.length; i++) {
    for (let j = i + 1; j < allSentences.length; j++) {
      const a = allSentences[i]!;
      const b = allSentences[j]!;

      if (a.filePath === b.filePath && Math.abs(a.line - b.line) < 5) continue;

      const key = `${a.filePath}:${a.line}-${b.filePath}:${b.line}`;
      if (seen.has(key)) continue;
      seen.add(key);

      const similarity = jaccardSimilarity(a.normalized, b.normalized);
      if (similarity >= threshold) {
        duplicates.push({
          sentence1: a,
          sentence2: b,
          similarity: Math.round(similarity * 100) / 100,
        });
      }
    }
  }

  return { duplicates };
}

function jaccardSimilarity(a: string, b: string): number {
  const wordsA = new Set(tokenize(a));
  const wordsB = new Set(tokenize(b));

  if (wordsA.size === 0 && wordsB.size === 0) return 0;

  const intersection = new Set([...wordsA].filter((w) => wordsB.has(w)));
  const union = new Set([...wordsA, ...wordsB]);

  return intersection.size / union.size;
}

function tokenize(text: string): string[] {
  return text
    .split(/\s+/)
    .filter((w) => w.length > 1);
}
