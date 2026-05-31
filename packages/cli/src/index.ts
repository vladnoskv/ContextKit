#!/usr/bin/env node
import { parseArgs } from "./commands/args.js";
import { handleScan } from "./commands/scan.js";
import { handleReport } from "./commands/report.js";
import { handleTokens } from "./commands/tokens.js";
import { handleValidate } from "./commands/validate.js";
import { handleConvert } from "./commands/convert.js";
import { handleSplit } from "./commands/split.js";
import { handleGenerate } from "./commands/generate.js";
import { handlePack } from "./commands/pack.js";
import { handleInit } from "./commands/init.js";
import { handleSkills } from "./commands/skills.js";
import { printHelp } from "./output/help.js";

async function main(): Promise<void> {
  const args = parseArgs(process.argv);

  if (args.help || args.command === "help") {
    printHelp();
    process.exit(0);
  }

  try {
    switch (args.command) {
      case "init":
        await handleInit(args);
        break;
      case "scan":
        await handleScan(args);
        break;
      case "report":
        await handleReport(args);
        break;
      case "tokens":
        await handleTokens(args);
        break;
      case "validate":
        await handleValidate(args);
        break;
      case "convert":
        await handleConvert(args);
        break;
      case "split":
        await handleSplit(args);
        break;
      case "generate":
        await handleGenerate(args);
        break;
      case "pack":
        await handlePack(args);
        break;
      case "skills":
        await handleSkills(args);
        break;
      default:
        // Default to scan
        await handleScan({ ...args, command: "scan" });
    }
  } catch (err: any) {
    if (!args.quiet) {
      process.stderr.write(`Error: ${err.message}\n`);
    }
    process.exit(1);
  }
}

main();
