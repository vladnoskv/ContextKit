export interface CliArgs {
  command: string;
  root?: string;
  json?: boolean;
  verbose?: boolean;
  quiet?: boolean;
  strict?: boolean;
  dryRun?: boolean;
  format?: string;
  out?: string;
  from?: string;
  to?: string;
  byFile?: boolean;
  help?: boolean;
  positional: string[];
  flags: Record<string, string | boolean>;
}

export function parseArgs(argv: string[]): CliArgs {
  const positional: string[] = [];
  const flags: Record<string, string | boolean> = {};
  let command = "";

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i]!;

    if (arg === "--help" || arg === "-h") {
      return createDefaultArgs("help", { help: true });
    }

    if (arg.startsWith("--")) {
      const eqIdx = arg.indexOf("=");
      if (eqIdx > 2) {
        const key = arg.slice(2, eqIdx);
        const val = arg.slice(eqIdx + 1);
        flags[key] = val;
      } else {
        const key = arg.slice(2);
        const next = argv[i + 1];
        if (next && !next.startsWith("-")) {
          flags[key] = next;
          i++;
        } else {
          flags[key] = true;
        }
      }
    } else if (arg.startsWith("-")) {
      const key = arg.slice(1);
      const next = argv[i + 1];
      if (next && !next.startsWith("-")) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    } else {
      if (!command) {
        command = arg;
      } else {
        positional.push(arg);
      }
    }
  }

  return {
    command: command || "scan",
    root: (flags.root as string) || (flags.r as string) || undefined,
    json: !!flags.json || !!flags.j,
    verbose: !!flags.verbose || !!flags.v,
    quiet: !!flags.quiet || !!flags.q,
    strict: !!flags.strict,
    dryRun: !!flags["dry-run"] || !!flags.d,
    format: (flags.format as string) || (flags.f as string) || undefined,
    out: (flags.out as string) || (flags.o as string) || undefined,
    from: (flags.from as string) || undefined,
    to: (flags.to as string) || undefined,
    byFile: !!flags["by-file"],
    help: false,
    positional,
    flags,
  };
}

function createDefaultArgs(command: string, overrides?: Partial<CliArgs>): CliArgs {
  return {
    command,
    positional: [],
    flags: {},
    ...overrides,
  };
}
