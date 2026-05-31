export function printHelp(): void {
  process.stdout.write(`ContextKit - AI Coding Context Manager

Usage:
  contextkit <command> [options]

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
  --help, -h    Show this help message

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
`);
}
