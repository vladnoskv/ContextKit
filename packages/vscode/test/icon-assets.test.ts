import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const packageRoot = join(__dirname, "..");

function readPngHeader(relativePath: string) {
  const file = readFileSync(join(packageRoot, relativePath));
  return {
    signature: file.subarray(0, 8).toString("hex"),
    width: file.readUInt32BE(16),
    height: file.readUInt32BE(20),
    colorType: file[25],
  };
}

describe("VS Code icon assets", () => {
  it("uses separate transparent PNG activity bar icons for light and dark themes", () => {
    const manifest = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8"));
    const [activityBarContainer] = manifest.contributes.viewsContainers.activitybar;

    expect(activityBarContainer.icon).toEqual({
      light: "media/contextkit-activitybar-light.png",
      dark: "media/contextkit-activitybar-dark.png",
    });

    for (const iconPath of Object.values(activityBarContainer.icon) as string[]) {
      expect(existsSync(join(packageRoot, iconPath))).toBe(true);

      const header = readPngHeader(iconPath);
      expect(header).toMatchObject({
        signature: "89504e470d0a1a0a",
        width: 24,
        height: 24,
        colorType: 6,
      });
    }
  });
});

describe("VS Code command contributions", () => {
  it("contributes an Open WebView command from the sidebar title menu", () => {
    const manifest = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8"));

    expect(manifest.activationEvents).toContain("onCommand:contextkit.openWebview");
    expect(manifest.contributes.commands).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          command: "contextkit.openWebview",
          title: "AgentContextKit: Open WebView",
        }),
      ]),
    );
    expect(manifest.contributes.menus["view/title"]).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          command: "contextkit.openWebview",
          when: "view == contextkit.sidebar",
        }),
      ]),
    );
  });
});
