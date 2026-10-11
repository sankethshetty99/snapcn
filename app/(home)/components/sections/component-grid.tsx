import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { GalleryCard } from "@/components/docs/gallery/gallery-card";
import { Button } from "@/components/ui/button";
import {
  CATALOGUE_COUNT,
  CATALOGUE_ITEMS,
  FIRST_ROW,
} from "@/lib/gallery-data";

/**
 * The gallery, straight under the hero. `/docs/components` is 78% of the
 * site's traffic and the one sale went gallery → templates → pricing, so the
 * home page shows the product the way that page does instead of a separate
 * carousel. Same `GalleryCard`, same curated order: the two cannot drift.
 *
 * No `onOpen`, so a click navigates to the component's own URL — which opens
 * the same panel over the full grid. Cards mount their video only once seen
 * (`useLazyPlayer`), so twelve cards cost twelve posters, not twelve videos.
 */
const SHOWN = 12;

export function ComponentGrid() {
  return (
    <section id="components" className="pb-20 sm:pb-28">
      <div className="section">
        <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {CATALOGUE_ITEMS.slice(0, SHOWN).map((item, i) => (
            <GalleryCard key={item.href} item={item} priority={i < FIRST_ROW} />
          ))}
        </div>
        <div className="mt-8 flex justify-center">
          <Button
            size="lg"
            variant="outline"
            className="h-11 gap-2 px-6 text-sm"
            nativeButton={false}
            render={<Link href="/docs/components" />}
          >
            Browse all {CATALOGUE_COUNT} components
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </section>
  );
}
