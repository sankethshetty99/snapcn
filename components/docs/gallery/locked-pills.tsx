import { Lock } from "lucide-react";

/**
 * Categories that are coming, shown after the live ones in the filter bar —
 * greyed, not clickable, with a lock on the top-right corner. Picked from what
 * people searched for and installed (PostHog, Aug–Sep 2026): cursor,
 * blur-in/tracking-in, rolling-number, product-hero, marker-highlight.
 *
 * When a category ships, move it to `GALLERY_CATEGORIES` and drop it here.
 */
export const UPCOMING_CATEGORIES = [
  "Cursor & Clicks",
  "Transitions",
  "Numbers & Counters",
  "Product Hero",
  "Callouts",
  "End Cards",
  "Notifications",
];

export function LockedPills() {
  return UPCOMING_CATEGORIES.map((label) => (
    <span
      key={label}
      aria-disabled="true"
      title={`${label} — coming soon`}
      className="relative shrink-0 cursor-not-allowed select-none rounded-full bg-gallery-card px-3.5 py-1.5 font-medium text-foreground/40 text-sm"
    >
      {label}
      <span className="absolute -top-1.5 -right-1 text-sky-700 dark:text-sky-400">
        <Lock className="size-3.5" strokeWidth={2.25} aria-hidden="true" />
      </span>
      <span className="sr-only"> (coming soon)</span>
    </span>
  ));
}
