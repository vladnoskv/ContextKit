# Token Estimation

AgentContextKit estimates token counts for instruction files and context packs using a local, offline algorithm.

## Default Estimator

The default token estimator uses a simple character-based approximation:

```
estimatedTokens = ceil(characterCount / 4)
```

This is a rough approximation based on the observation that, on average, each token in English text represents roughly 4 characters.

## Accuracy

- **Not exact** — The default estimator is intentionally simple and offline
- **Directionally correct** — It provides a useful relative measure for comparing files
- **Consistent** — Same input always produces the same output

## Custom Tokenizers

AgentContextKit exposes a pluggable `Tokenizer` interface:

```ts
interface Tokenizer {
  estimateTokens(text: string): number;
}
```

To use a custom tokenizer:

```ts
import { scanContext } from "@contextkit/core";

const result = await scanContext({
  rootDir: process.cwd(),
  // Custom tokenizer could be passed through config
});
```

Future versions may include optional support for:
- `tiktoken` (OpenAI tokenizer)
- `claude-tokenizer` (Anthropic tokenizer)
- Custom project-specific tokenizers

## Thresholds

Default thresholds:

| Level | Tokens | Description |
|---|---|---|
| Warning | 4,000 | File is getting large. Consider splitting. |
| Error | 8,000 | File is oversized. Split recommended. |
| Critical | 20,000 | Total project context is very large. |

Configure thresholds in `contextkit.config.json`:

```json
{
  "tokenWarningThreshold": 3000,
  "tokenErrorThreshold": 6000
}
```
