# Conflict Rules

ContextKit detects conflicting instructions across AI context files.

## Built-in Conflict Groups

### Package Manager

Detects conflicting package manager guidance:

- "Use npm" vs "Use pnpm" vs "Use yarn" vs "Use bun"

### Semicolons

Detects conflicting semicolon conventions:

- "Always use semicolons" vs "Never use semicolons"
- "Use semicolons" vs "No semicolons"

### Tailwind / Styling

Detects conflicting CSS framework preferences:

- "Use Tailwind" vs "Do not use Tailwind"
- "Tailwind required" vs "Avoid Tailwind"

### Testing

Detects conflicting testing practices:

- "Run tests before..." vs "Skip tests..."
- "Always run tests" vs "Do not run tests"

### React Server Components

Detects conflicting RSC guidance:

- "Use React Server Components" vs "Do not use React Server Components"

### Formatting Tools

Detects conflicting formatter preferences:

- "Use Prettier" vs "Do not use Prettier"
- "Use Biome" vs "Do not use Biome"

### Linting

Detects conflicting linter guidance:

- "Use ESLint" vs "Do not use ESLint"
- "Lint before..." vs "Skip lint"

## Custom Conflict Rules

Add custom conflict rules in `contextkit.config.json`:

```json
{
  "conflictRules": [
    {
      "id": "my-custom-rule",
      "oppositePatterns": [
        ["/use Redis/i", "/use PostgreSQL/i"]
      ]
    },
    {
      "id": "my-multi-value-rule",
      "values": ["option-a", "option-b", "option-c"],
      "patterns": ["/use option-a/i", "/use option-b/i", "/use option-c/i"]
    }
  ]
}
```

## Resolution

When conflicts are found, ContextKit recommends:

1. Choose a single approach
2. Update all instruction files consistently
3. Remove or comment out the conflicting instruction in one file
4. Re-run `contextkit validate` to confirm resolution
