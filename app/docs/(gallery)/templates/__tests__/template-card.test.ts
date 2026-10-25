/**
 * Templates are paid-only. The locked card is what anyone without the Pro
 * catalogue gets, and its HTML must never carry the film or the install name;
 * the unlocked card is only built for a paying reader after release.
 *
 * Run with:  pnpm vitest run "app/docs/(gallery)/templates"
 */

import { createElement } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TemplateCard } from "@/components/docs/gallery/template-card";
import { REELS } from "@/components/docs/gallery/template-reels";

const reel = REELS[0];
const card = {
  slug: reel.slug,
  title: reel.title,
  description: reel.description,
  beats: reel.beats.length,
  seconds: 25,
};
const html = (props: Partial<Parameters<typeof TemplateCard>[0]>) =>
  renderToString(
    createElement(TemplateCard, { reel: card, released: true, ...props }),
  );

describe("template card", () => {
  it("locked: no film, no install name, released copy", () => {
    const out = html({});
    expect(out).not.toContain("templates-wip");
    expect(out).not.toContain(reel.install);
    expect(out).toContain("Preview with Pro");
    expect(out).not.toContain("until 25 Oct");
  });

  it("locked before release still names the day", () => {
    expect(html({ released: false })).toContain("Preview opens");
  });

  it("unlocked: the film and the real install", () => {
    const out = html({ unlocked: { reel, install: reel.install } });
    expect(out).toContain(`templates-wip/${reel.slug}-${reel.v}.mp4`);
    expect(out).toContain(`add @snapcn/${reel.install}`);
    expect(out).not.toContain("Unlock with Pro");
  });

  it("unlocked without a registry item: no command that would 404", () => {
    const out = html({ unlocked: { reel, install: null } });
    expect(out).not.toContain("@snapcn/");
    expect(out).toContain("lands here when");
  });
});
