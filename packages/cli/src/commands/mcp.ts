import type { CliArgs } from "./args.js";

export async function handleMcp(args: CliArgs): Promise<void> {
  const packageName = "@contextkit/mcp";
  const { runStdioServer } = await import(packageName) as {
    runStdioServer: (context: { defaultRootDir?: string }) => Promise<void>;
  };
  await runStdioServer({
    defaultRootDir: args.root ?? process.cwd(),
  });
}
