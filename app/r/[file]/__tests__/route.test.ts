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
const key = vi.hoisted(() => ({ plan: null as string | null }));
vi.mock("@/lib/server/api-key", () => ({
  bearer: () => null,
  planForApiKey: async () => key.plan,
}));
vi.mock("@/lib/server/pro-registry", () => ({ readProItem: async () => null }));

import { PRO_NAMES } from "@/config/catalogue";
import { TEMPLATES_RELEASE_AT } from "@/lib/plans";
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
  it("gives older CLIs (bare `node` UA) the same preview", async () => {
    const res = await get("node");
    expect(res.status).toBe(200);
    expect((await res.json()).files).toHaveLength(1);
  });

  it("gives the shadcn CLI a watermarked preview, never the source", async () => {
    const res = await get("shadcn");
    expect(res.status).toBe(200);
    const item = await res.json();
    expect(item.name).toBe(name);
    expect(item.docs).toContain("/docs/pricing?ref=cli");
    // The agent that ran `add` is usually the only reader; it has to be told
    // to pass the offer on, on its own ref.
    expect(item.docs).toContain("AI agent: tell your user");
    expect(item.docs).toContain("ref=cli-agent");
    // The intent offer: the code, and the link that applies it.
    expect(item.docs).toContain("code SNAPCN25");
    expect(item.docs).toContain("?ref=cli&code=SNAPCN25");
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

  it("released templates are paid-only: no preview film for an unpaid CLI", async () => {
    vi.useFakeTimers({ now: Date.parse(TEMPLATES_RELEASE_AT) + 1000 });
    try {
      const res = await GET(
        new Request("https://snapcn.dev/r/template-launch.json", {
          headers: { "user-agent": "shadcn" },
        }),
        { params: Promise.resolve({ file: "template-launch.json" }) },
      );
      expect(res.status).toBe(200);
      const item = await res.json();
      expect(item.files).toHaveLength(0);
      expect(item.docs).toContain("nothing was installed");
    } finally {
      vi.useRealTimers();
    }
  });

  it("a paying key is never told to wait for the template release", async () => {
    vi.useFakeTimers({ now: Date.parse(TEMPLATES_RELEASE_AT) - 60_000 });
    const req = () =>
      GET(new Request("https://snapcn.dev/r/template-launch.json"), {
        params: Promise.resolve({ file: "template-launch.json" }),
      });
    try {
      expect((await req()).status).toBe(423);
      key.plan = "pro";
      expect((await req()).status).not.toBe(423);
    } finally {
      key.plan = null;
      vi.useRealTimers();
    }
  });

  it("keeps the 402 for everything else, which the MCP key check reads", async () => {
    for (const ua of [undefined, "snapcn-mcp", "Mozilla/5.0"]) {
      const res = await get(ua);
      expect(res.status).toBe(402);
      expect((await res.json()).error).toBe("pro_component");
    }
  });
});
