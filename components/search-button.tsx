"use client";

import { useSearchContext } from "fumadocs-ui/contexts/search";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";

/**
 * Visible entry point to the site's search. The fumadocs `SearchProvider`
 * (mounted in the root `RootProvider`) already owns the dialog, the ⌘K hotkey
 * and the `/api/search` backend — this button just calls `setOpenSearch(true)`.
 *
 * Responsive by design so one component serves both navbars: a square icon
 * trigger below `lg`, expanding into a full input-styled box — placeholder plus
 * a ⌘/Ctrl+K hint — at `lg` and up. The desktop-only docs rail only ever renders
 * at `lg`, so it always shows the box; the home header shows the icon on
 * mobile/tablet and the box on desktop. Callers cap the box width via
 * `className` (e.g. `lg:w-56`), which `cn`/tailwind-merge lets win over the
 * base `lg:w-full`. `shrink-0` because the docs rail stacks it in a
 * height-capped flex column, which squeezed it to 24px — the ⌘K chips then
 * filled it edge to edge.
 */
export function SearchButton({
  className,
  iconOnly = false,
}: {
  className?: string;
  /** Stay the square icon at every width — the home header wants no box. */
  iconOnly?: boolean;
}) {
  const { setOpenSearch } = useSearchContext();

  // The modifier glyph is client-only (⌘ on Apple, Ctrl elsewhere). Default to
  // ⌘ so the server and first client render agree, then correct after mount —
  // the same hydration-safe pattern the theme toggle uses.
  const [mod, setMod] = useState("⌘");
  useEffect(() => {
    const isApple = /mac|iphone|ipad|ipod/i.test(
      navigator.platform || navigator.userAgent,
    );
    setMod(isApple ? "⌘" : "Ctrl");
  }, []);

  return (
    <button
      type="button"
      aria-label="Search"
      onClick={() => setOpenSearch(true)}
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-button border border-border bg-background px-0 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 focus-visible:outline-none",
        !iconOnly && "lg:w-full lg:justify-start lg:gap-2 lg:px-3",
        className,
      )}
    >
      <Search className="size-4 shrink-0" aria-hidden="true" />
      {iconOnly ? null : (
        <>
          <span className="hidden flex-1 text-left lg:block">Search…</span>
          <KbdGroup className="hidden lg:flex">
            <Kbd>{mod}</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
        </>
      )}
    </button>
  );
}
