import type { Metadata } from "next";
import { Cta } from "@/app/(home)/components/sections/cta";
import { DocsTopBar } from "@/components/docs/gallery/docs-top-bar";
import { GalleryFrame } from "@/components/docs/gallery/gallery-frame";
import { TemplateCard } from "@/components/docs/gallery/template-card";
import { REELS } from "@/components/docs/gallery/template-reels";
import { EarlyBirdStrip } from "@/components/early-bird";
import { DOCS_PAGE_META } from "@/config/site";
import { metaDescription, metaTitle } from "@/lib/meta";
import { PageJsonLd } from "@/lib/page-json-ld";
import { docsBreadcrumb } from "@/lib/structured-data";

const { title: TITLE, description: DESCRIPTION } = DOCS_PAGE_META.templates;
/** Per-page card. `/og` alone is the generic site card. */
const OG_IMAGE = "/og/templates?v=2";

export const metadata: Metadata = {
  title: metaTitle(DOCS_PAGE_META.templates.seoTitle ?? TITLE),
  description: metaDescription(DESCRIPTION),
  alternates: { canonical: "/docs/templates" },
  openGraph: {
    type: "website",
    url: "/docs/templates",
    title: TITLE,
    description: DESCRIPTION,
    siteName: "snapcn",
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: TITLE }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

/** Hourly, so the days-left count is right to the hour on a static page. */
export const revalidate = 3600;

const BUY = "/docs/pricing?ref=templates#plans";

/**
 * The order the page shows them in. `template-reels.ts` is generated, so the
 * order lives here; a template not named below goes to the end.
 */
const ORDER = [
  "Weekly changelog",
  "Feature drop",
  "Startup pitch",
  "Product tour",
  "Product launch",
];
const rank = (title: string) => {
  const i = ORDER.indexOf(title);
  return i === -1 ? ORDER.length : i;
};
const ORDERED = [...REELS].sort((a, b) => rank(a.title) - rank(b.title));

/**
 * `/docs/templates` — what lands on 25 October, and why today is the day to buy.
 *
 * It was a coming-soon card with one button, on the second-busiest docs page
 * (719 people a month, for templates that did not exist yet). Every one of
 * them is already telling us what they want; this page shows them what is
 * coming, prices it, and says plainly what waiting costs — a real date, a real
 * count, and the renewal promise Dodo actually keeps.
 */
export default function TemplatesPage() {
  return (
    <GalleryFrame>
      {/* It was the one route with no schema at all. */}
      <PageJsonLd
        path="/docs/templates"
        graph={[docsBreadcrumb(TITLE, "/docs/templates")]}
      />
      <DocsTopBar />

      <div className="w-full py-12 sm:py-16">
        {/* Hero */}
        <section className="flex flex-col items-center text-center">
          <EarlyBirdStrip />
          <h1 className="mt-8 text-balance font-normal font-sans text-[clamp(2.25rem,5vw,3.75rem)] text-foreground leading-[1.05] tracking-[-0.03em]">
            Video templates
          </h1>
          <p className="mt-4 max-w-xl text-pretty text-current/70">
            Complete videos built from snapcn components, cut to time and ready
            to render. Every template is included in Pro and Lifetime.
          </p>
        </section>

        {/* The templates, one after another */}
        <div className="mt-20 flex flex-col gap-28">
          {/* Only what the card shows: the install name, film and still
              hashes stay on the server, since a client component's props
              ship in the page. */}
          {ORDERED.map(({ slug, title, description, fps, beats }) => (
            <TemplateCard
              key={slug}
              reel={{
                slug,
                title,
                description,
                beats: beats.length,
                seconds: Math.round(
                  beats.reduce((n, b) => n + b.frames, 0) / fps,
                ),
              }}
            />
          ))}
        </div>

        {/* Last call: the site's closing section, with this page's copy. */}
        <div className="mt-24">
          <Cta
            title="Every template, included in Pro."
            body={<EarlyBirdStrip />}
            href={BUY}
            label="See the early-bird prices"
          />
        </div>
      </div>
    </GalleryFrame>
  );
}
