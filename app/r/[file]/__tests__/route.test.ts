/**
 * The Pro wall has two audiences that need opposite responses: the shadcn CLI
 * prints a 200's `docs` and never an error body, while the MCP server reads a
 * 402 as "this key was refused". Break either and the upsell goes silent or
 * every key starts passing.
 *
 * Run with:  pnpm vitest run app/r
 */

import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/server/api-key", () => ({
  bearer: () => null,
  planForApiKey: async () => null,
}));
vi.mock("@/lib/server/pro-registry", () => ({ readProItem: async () => null }));

import { PRO_NAMES } from "@/config/catalogue";
import { GET } from "../route";

const name = PRO_NAMES[0];
const get = (ua?: string) =>
  GET(
    new Request(`https://snapcn.dev/r/${name}.json`, {
      headers: ua ? { "user-agent": ua } : {},
    }),
    { params: Promise.resolve({ file: `${name}.json` }) },
  );

describe("pro wall", () => {
  it("gives the shadcn CLI a watermarked preview, never the source", async () => {
    const res = await get("shadcn");
    expect(res.status).toBe(200);
    const item = await res.json();
    expect(item.name).toBe(name);
    expect(item.docs).toContain("/docs/pricing?ref=cli");
    expect(item.files).toHaveLength(1);
    const [file] = item.files;
    // Same path as the paid file, so buying overwrites it in place.
    expect(file.target).toBe(`components/snap-cn/${name}.tsx`);
    const exportName = name.replace(
      /(^|-)([a-z0-9])/g,
      (_: string, __: string, c: string) => c.toUpperCase(),
    );
    expect(file.content).toContain(`export function ${exportName}(`);
    expect(file.content).toContain("media.snapcn.dev/pro-demos/");
    expect(file.content).toContain("snapcn Pro preview");
  });

  it("keeps the 402 for everything else, which the MCP key check reads", async () => {
    for (const ua of [undefined, "node", "Mozilla/5.0"]) {
      const res = await get(ua);
      expect(res.status).toBe(402);
      expect((await res.json()).error).toBe("pro_component");
    }
  });
});
