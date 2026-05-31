import type { Tokenizer } from "../types/index.js";

export function createDefaultTokenizer(): Tokenizer {
  return {
    estimateTokens(text: string): number {
      return Math.ceil(text.length / 4);
    },
  };
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
