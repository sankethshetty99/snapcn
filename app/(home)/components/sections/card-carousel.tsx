"use client";

import { MoveLeft, MoveRight } from "lucide-react";
import { type ReactNode, useRef } from "react";

/**
 * A row of cards that scrolls sideways: native scroll-snap does the work, the
 * two buttons only nudge it one card at a time. The cards come in as server-
 * rendered children, so the only JavaScript here is the nudge.
 */
export function CardCarousel({ children }: { children: ReactNode }) {
  const row = useRef<HTMLUListElement>(null);
  const nudge = (dir: 1 | -1) => {
    const el = row.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (!el || !card) return;
    el.scrollBy({ left: dir * (card.offsetWidth + 8), behavior: "smooth" });
  };
  const ARROW =
    "grid size-10 place-items-center text-current/70 transition-colors hover:text-foreground";

  return (
    <div>
      <div className="mb-4 flex justify-end gap-2">
        <button
          type="button"
          aria-label="Previous"
          className={ARROW}
          onClick={() => nudge(-1)}
        >
          <MoveLeft className="size-7" strokeWidth={1.5} aria-hidden />
        </button>
        <button
          type="button"
          aria-label="Next"
          className={ARROW}
          onClick={() => nudge(1)}
        >
          <MoveRight className="size-7" strokeWidth={1.5} aria-hidden />
        </button>
      </div>
      <ul
        ref={row}
        className="flex snap-x snap-mandatory gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&>li]:w-[85%] [&>li]:shrink-0 [&>li]:snap-start sm:[&>li]:w-[calc((100%-0.5rem)/2)] lg:[&>li]:w-[calc((100%-1rem)/3)]"
      >
        {children}
      </ul>
    </div>
  );
}
