import { describe, it, expect, vi, beforeEach } from "vitest";
import * as path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..", "..", "..");
const fixtureDir = path.join(projectRoot, "examples", "basic-next-app");

describe("CLI - Token Command", () => {
  let stdout: string[] = [];
  let stderr: string[] = [];

  beforeEach(() => {
    stdout = [];
    stderr = [];
    vi.restoreAllMocks();
    const mockWrite = (data: string) => {
      stdout.push(data);
      return true;
    };
    const mockErr = (data: string) => {
      stderr.push(data);
      return true;
    };
    vi.spyOn(process.stdout, "write").mockImplementation(mockWrite);
    vi.spyOn(process.stderr, "write").mockImplementation(mockErr);
  });

  it("should show per-file token counts with --by-file", async () => {
    const { handleTokens } = await import("../src/commands/tokens.js");
    await handleTokens({
      command: "tokens",
      root: fixtureDir,
      byFile: true,
      positional: [],
      flags: {},
      json: false,
      verbose: false,
      quiet: false,
      strict: false,
      dryRun: false,
      help: false,
    });

    const output = stdout.join("");
    expect(output).toContain("tokens");
    expect(output).toContain("AGENTS.md");
  });

  it("should show total token count without --by-file", async () => {
    const { handleTokens } = await import("../src/commands/tokens.js");
    await handleTokens({
      command: "tokens",
      root: fixtureDir,
      byFile: false,
      positional: [],
      flags: {},
      json: false,
      verbose: false,
      quiet: false,
      strict: false,
      dryRun: false,
      help: false,
    });

    const output = stdout.join("");
    expect(output).toContain("Total estimated tokens");
    expect(output).toContain("Total files");
  });

  it("rejects token estimates for files outside the project root", async () => {
    const { handleTokens } = await import("../src/commands/tokens.js");
    const outsideProject = path.join(projectRoot, "package.json");
    const exit = vi.spyOn(process, "exit").mockImplementation((() => {
      throw new Error("process.exit");
    }) as never);

    await expect(
      handleTokens({
        command: "tokens",
        root: fixtureDir,
        byFile: false,
        positional: [outsideProject],
        flags: {},
        json: false,
        verbose: false,
        quiet: false,
        strict: false,
        dryRun: false,
        help: false,
      }),
    ).rejects.toThrow("process.exit");

    expect(exit).toHaveBeenCalledWith(1);
    expect(stderr.join("")).toContain("Cannot read file");
    expect(stdout.join("")).toBe("");
  });
});

describe("CLI - Scan Command", () => {
  let stdout: string[] = [];

  beforeEach(() => {
    stdout = [];
    const mockWrite = (data: string) => {
      stdout.push(data);
      return true;
    };
    vi.spyOn(process.stdout, "write").mockImplementation(mockWrite as any);
  });

  it("should scan example project and report files", async () => {
    const { handleScan } = await import("../src/commands/scan.js");
    await handleScan({
      command: "scan",
      root: fixtureDir,
      positional: [],
      flags: {},
      json: false,
      verbose: false,
      quiet: false,
      strict: false,
      dryRun: false,
      help: false,
    });

    const output = stdout.join("");
    expect(output).toContain("ContextKit Scan");
    expect(output).toContain("Instruction files");
    expect(output).toContain("Health score");
  });

  it("should output JSON when --json flag is set", async () => {
    const { handleScan } = await import("../src/commands/scan.js");
    await handleScan({
      command: "scan",
      root: fixtureDir,
      positional: [],
      flags: {},
      json: true,
      verbose: false,
      quiet: false,
      strict: false,
      dryRun: false,
      help: false,
    });

    const output = stdout.join("");
    const parsed = JSON.parse(output);
    expect(parsed).toHaveProperty("files");
    expect(parsed).toHaveProperty("issues");
    expect(parsed).toHaveProperty("healthScore");
    expect(parsed.files.length).toBeGreaterThan(0);
  });
});

describe("CLI - Report Command", () => {
  let stdout: string[] = [];

  beforeEach(() => {
    stdout = [];
    vi.spyOn(process.stdout, "write").mockImplementation((data: string) => {
      stdout.push(data);
      return true;
    });
  });

  it("should generate markdown report", async () => {
    const { handleReport } = await import("../src/commands/report.js");
    await handleReport({
      command: "report",
      root: fixtureDir,
      positional: [],
      flags: {},
      format: "markdown",
      json: false,
      verbose: false,
      quiet: false,
      strict: false,
      dryRun: false,
      help: false,
    });

    const output = stdout.join("");
    expect(output).toContain("# ContextKit Report");
    expect(output).toContain("## Summary");
    expect(output).toContain("Instruction files");
  });

  it("should generate JSON report", async () => {
    const { handleReport } = await import("../src/commands/report.js");
    await handleReport({
      command: "report",
      root: fixtureDir,
      positional: [],
      flags: {},
      format: "json",
      json: false,
      verbose: false,
      quiet: false,
      strict: false,
      dryRun: false,
      help: false,
    });

    const output = stdout.join("");
    const parsed = JSON.parse(output);
    expect(parsed).toHaveProperty("rootDir");
    expect(parsed).toHaveProperty("files");
    expect(parsed).toHaveProperty("totalEstimatedTokens");
  });
});

describe("CLI - Validate Command", () => {
  let stdout: string[] = [];

  beforeEach(() => {
    stdout = [];
    vi.spyOn(process.stdout, "write").mockImplementation((data: string) => {
      stdout.push(data);
      return true;
    });
  });

  it("should validate and report issues", async () => {
    const { handleValidate } = await import("../src/commands/validate.js");
    await handleValidate({
      command: "validate",
      root: fixtureDir,
      positional: [],
      flags: {},
      json: false,
      verbose: false,
      quiet: false,
      strict: false,
      dryRun: false,
      help: false,
    });

    const output = stdout.join("");
    expect(output).toContain("Warnings");
  });

  it("should output JSON when --json flag is set", async () => {
    const { handleValidate } = await import("../src/commands/validate.js");
    await handleValidate({
      command: "validate",
      root: fixtureDir,
      positional: [],
      flags: {},
      json: true,
      verbose: false,
      quiet: false,
      strict: false,
      dryRun: false,
      help: false,
    });

    const output = stdout.join("");
    const parsed = JSON.parse(output);
    expect(parsed).toHaveProperty("valid");
    expect(parsed).toHaveProperty("errors");
    expect(parsed).toHaveProperty("warnings");
    expect(parsed).toHaveProperty("issues");
    expect(parsed.valid).toBe(true);
  });
});

describe("CLI - Split Command (dry-run)", () => {
  let stdout: string[] = [];

  beforeEach(() => {
    stdout = [];
    vi.spyOn(process.stdout, "write").mockImplementation((data: string) => {
      stdout.push(data);
      return true;
    });
  });

  it("should show split plan in dry-run mode", async () => {
    const { handleSplit } = await import("../src/commands/split.js");
    await handleSplit({
      command: "split",
      root: fixtureDir,
      positional: ["AGENTS.md"],
      flags: {},
      json: false,
      verbose: false,
      quiet: false,
      strict: false,
      dryRun: true,
      help: false,
    });

    const output = stdout.join("");
    expect(output).toContain("[DRY RUN]");
    expect(output).toContain("modules");
    expect(output).toContain("Backup");
  });
});

describe("CLI - Convert Command (dry-run)", () => {
  let stdout: string[] = [];

  beforeEach(() => {
    stdout = [];
    vi.spyOn(process.stdout, "write").mockImplementation((data: string) => {
      stdout.push(data);
      return true;
    });
  });

  it("should show conversion plan in dry-run mode", async () => {
    const { handleConvert } = await import("../src/commands/convert.js");
    await handleConvert({
      command: "convert",
      root: fixtureDir,
      positional: ["AGENTS.md", "copilot"],
      flags: {},
      from: "AGENTS.md",
      to: "copilot",
      json: false,
      verbose: false,
      quiet: false,
      strict: false,
      dryRun: true,
      help: false,
    });

    const output = stdout.join("");
    expect(output).toContain("[DRY RUN]");
    expect(output).toContain("copilot");
    expect(output).toContain("GitHub Copilot");
  });
});
