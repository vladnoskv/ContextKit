export function printHelp(): void {
  process.stdout.write(`AgentContextKit - AI Coding Agent Context Manager

Usage:
  contextkit <command> [options]
  agentcontextkit <command> [options]

Commands:
  scan          Scan workspace for AI instruction files
  report        Generate a Markdown or JSON report
  tokens        Show estimated token counts
  validate      Check for issues, duplicates, and conflicts
  convert       Convert between instruction file formats
  split         Split a large instruction file into modules
  generate      Generate project-specific instruction files
  pack          Create a context pack for a specific domain
  init          Create a contextkit.config.json file
  skills        Manage AgentContextKit skills for AI coding agents
  mcp           Start the AgentContextKit MCP skill server over stdio

Options:
  --root, -r    Root directory (default: current working directory)
  --json, -j    Output JSON format
  --verbose, -v Verbose output
  --quiet, -q   Suppress non-error output
  --strict      Exit with non-zero code on validation errors
  --dry-run, -d Preview changes without writing files
  --format, -f  Output format (markdown | json)
  --out, -o     Output file path
  --from        Source file path (for convert)
  --to          Target format (for convert)
  --by-file     Show tokens per file (for tokens)
  --kind, -k    Target instruction kind (for skills add/remove)
  --provider    Provider profile for skills add (for example: openai)
  --model       Model profile for skills add (for example: gpt-5)
  --help, -h    Show this help message

Skills Subcommands:
  skills list [category]       List available skills by category
  skills show <name>           Show skill content and metadata
  skills add <name>            Install a skill into the project
  skills remove <name>         Remove an installed skill
  skills installed             List installed skills in the project
  skills search <query>        Search for skills by name or tag
  skills categories            List all skill categories

Examples:
  contextkit scan
  contextkit scan --root ./my-project --verbose
  contextkit report --format markdown --out report.md
  contextkit tokens --by-file
  contextkit validate --strict
  contextkit convert --from AGENTS.md --to copilot
  contextkit split AGENTS.md --dry-run
  contextkit generate agents --dry-run
  contextkit pack frontend --out context/frontend.md
  contextkit skills list
  contextkit skills show typescript-strict
  contextkit skills add typescript-strict --provider openai --model gpt-5
  contextkit skills add core-engineering --group
  contextkit skills remove typescript-strict
  contextkit skills search react
  contextkit mcp
`);
}
