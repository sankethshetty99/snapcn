import type { ReactNode } from "react";
import { SiteFooter } from "@/app/(home)/components/site-footer";
import { SiteHeader } from "@/app/(home)/components/site-header";
import { cn } from "@/lib/utils";

/**
 * The frame every /docs and gallery route renders in: the home page's navbar
 * on top, the content, the home footer below — one chrome for the whole site.
 *
 * It used to be a fixed left sidebar (`gallery-sidebar.tsx`) with its own
 * collapse button; that rail is gone, and `--gallery-sidebar-w` is 0 in
 * globals.css so nothing still reserves room for it.
 *
 * `fill` is the video editor: exactly one screen tall under the banner and the
 * navbar (h-14), and no footer, because the editor is an app, not a page.
 */
export function GalleryFrame({
  children,
  fill = false,
}: {
  children: ReactNode;
  fill?: boolean;
}) {
  return (
    <>
      <SiteHeader />
      {/* `main`: the one content landmark — screen readers' skip target, and
          what answer engines read as "the article" rather than the chrome. */}
      <main
        className={cn(
          fill
            ? "h-[calc(100dvh-var(--fd-banner-height,0px)-3.5rem)] overflow-hidden"
            : "section min-h-screen",
        )}
      >
        {children}
      </main>
      {fill ? null : <SiteFooter />}
    </>
  );
}
