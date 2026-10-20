import { NAV_LINKS } from "@/config/site";
import { NavDesktop } from "./header-nav";
import { HeaderActions, HeaderLogo } from "./header-parts";
import { StickyHeaderShell } from "./sticky-header-shell";

export function SiteHeader() {
  return (
    <StickyHeaderShell>
      {/* Tenor's bar: the logo alone on the left, the links and the actions
          together on the right. Still two groups under `justify-between`. */}
      <HeaderLogo />
      <div className="flex items-center gap-3">
        <NavDesktop links={NAV_LINKS} />
        <HeaderActions />
      </div>
    </StickyHeaderShell>
  );
}
