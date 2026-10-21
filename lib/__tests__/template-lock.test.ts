import { describe, expect, it } from "vitest";
import { TEMPLATES_RELEASE_AT, templateLocked } from "@/lib/plans";

describe("templateLocked", () => {
  const release = Date.parse(TEMPLATES_RELEASE_AT);

  it("locks a template before release, for everyone", () => {
    expect(templateLocked("template-launch", release - 1)).toBe(true);
  });

  it("unlocks it at release", () => {
    expect(templateLocked("template-launch", release)).toBe(false);
  });

  it("never touches a component", () => {
    expect(templateLocked("dot-dissolve", release - 1)).toBe(false);
  });
});
