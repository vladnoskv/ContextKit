import type { InstructionFile, ConflictGroup } from "../types/index.js";
import { parseMarkdown } from "../parser/index.js";

export interface ConflictFinding {
  groupId: string;
  fileA: string;
  fileB: string;
  sentenceA: string;
  sentenceB: string;
  lineA?: number;
  lineB?: number;
}

const DEFAULT_CONFLICT_GROUPS: ConflictGroup[] = [
  {
    id: "package-manager",
    values: ["npm", "pnpm", "yarn", "bun"],
    patterns: [/use npm/i, /use pnpm/i, /use yarn/i, /use bun/i],
  },
  {
    id: "semicolons",
    oppositePatterns: [
      [/always use semicolons/i, /never use semicolons/i],
      [/use semicolons/i, /no semicolons/i],
    ],
  },
  {
    id: "tailwind",
    oppositePatterns: [
      [/use tailwind/i, /do not use tailwind/i],
      [/tailwind required/i, /avoid tailwind/i],
    ],
  },
  {
    id: "testing",
    oppositePatterns: [
      [/run tests before/i, /skip tests/i],
      [/always run tests/i, /do not run tests/i],
    ],
  },
  {
    id: "react-rsc",
    oppositePatterns: [
      [/use react server components/i, /do not use react server components/i],
      [/use server components/i, /avoid server components/i],
    ],
  },
  {
    id: "formatting",
    oppositePatterns: [
      [/use prettier/i, /do not use prettier/i],
      [/use biome/i, /do not use biome/i],
    ],
  },
  {
    id: "linting",
    oppositePatterns: [
      [/use eslint/i, /do not use eslint/i],
      [/lint before/i, /skip lint/i],
    ],
  },
];

export function analyzeConflicts(
  files: InstructionFile[],
  customConflictGroups?: ConflictGroup[],
): ConflictFinding[] {
  const groups = [...DEFAULT_CONFLICT_GROUPS, ...(customConflictGroups ?? [])];
  const findings: ConflictFinding[] = [];

  const sentencesByFile = files.map((f) => ({
    path: f.path,
    sentences: parseMarkdown(f.content, f.path).sentences,
  }));

  for (let i = 0; i < sentencesByFile.length; i++) {
    for (let j = i + 1; j < sentencesByFile.length; j++) {
      const fileA = sentencesByFile[i]!;
      const fileB = sentencesByFile[j]!;

      for (const group of groups) {
        if (group.patterns && group.values) {
          for (let vi = 0; vi < group.patterns.length; vi++) {
            for (let vj = vi + 1; vj < group.patterns.length; vj++) {
              const matchA = fileA.sentences.find((s) => group.patterns![vi]!.test(s.text));
              const matchB = fileB.sentences.find((s) => group.patterns![vj]!.test(s.text));
              if (matchA && matchB) {
                findings.push({
                  groupId: group.id,
                  fileA: fileA.path,
                  fileB: fileB.path,
                  sentenceA: matchA.text,
                  sentenceB: matchB.text,
                  lineA: matchA.line,
                  lineB: matchB.line,
                });
              }
            }
          }
        }

        if (group.oppositePatterns) {
          for (const [patA, patB] of group.oppositePatterns) {
            const matchA = fileA.sentences.find((s) => patA.test(s.text));
            const matchB = fileB.sentences.find((s) => patB.test(s.text));
            if (matchA && matchB) {
              findings.push({
                groupId: group.id,
                fileA: fileA.path,
                fileB: fileB.path,
                sentenceA: matchA.text,
                sentenceB: matchB.text,
                lineA: matchA.line,
                lineB: matchB.line,
              });
            }
            // Also check reversed
            const matchA2 = fileA.sentences.find((s) => patB.test(s.text));
            const matchB2 = fileB.sentences.find((s) => patA.test(s.text));
            if (matchA2 && matchB2) {
              findings.push({
                groupId: group.id,
                fileA: fileA.path,
                fileB: fileB.path,
                sentenceA: matchA2.text,
                sentenceB: matchB2.text,
                lineA: matchA2.line,
                lineB: matchB2.line,
              });
            }
          }
        }
      }
    }
  }

  return deduplicateFindings(findings);
}

function deduplicateFindings(findings: ConflictFinding[]): ConflictFinding[] {
  const seen = new Set<string>();
  return findings.filter((f) => {
    const key = `${f.groupId}:${f.fileA}:${f.fileB}:${f.sentenceA}:${f.sentenceB}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
