import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The closing call to action, Tenor's layout: a big centred line, two short
 * lines under it, one dark button, and a cluster of blobs either side.
 *
 * The blobs are our own: overlapping circles melted into one shape by a
 * "gooey" filter (blur, then a hard alpha threshold).
 * Painted in `currentColor` and the page background, so they flip with the
 * theme. Decorative only, and hidden below `md` where they would crowd the copy.
 */

type Blob = [cx: number, cy: number, r: number];

const LEFT: { blobs: Blob[] } = {
  blobs: [
    [90, 90, 70],
    [190, 70, 62],
    [300, 62, 58],
    [350, 80, 40],
    [150, 150, 50],
    [215, 170, 55],
    [230, 245, 50],
    [95, 300, 62],
    [160, 310, 40],
    [215, 345, 60],
    [100, 370, 48],
    [280, 340, 40],
  ],
};

const RIGHT: { blobs: Blob[] } = {
  blobs: [
    [120, 75, 60],
    [230, 60, 66],
    [330, 80, 52],
    [200, 140, 48],
    [300, 170, 62],
    [340, 240, 55],
    [260, 260, 56],
    [190, 320, 58],
    [290, 340, 62],
    [345, 320, 40],
    [130, 360, 45],
  ],
};

function Blobs({
  id,
  shape,
  className,
}: {
  id: string;
  shape: { blobs: Blob[] };
  className?: string;
}) {
  return (
    <svg viewBox="-20 -20 460 460" aria-hidden className={className}>
      <defs>
        {/* Generous region: the default one clips a blob flat at the edge. */}
        <filter id={`${id}-goo`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="14" />
          <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 28 -12" />
        </filter>
        {/* The goo as a mask, then one flat fill through it — filtering the
            painted shape itself left a lighter ring inside the edge. */}
        <mask
          id={`${id}-mask`}
          maskUnits="userSpaceOnUse"
          x="-100"
          y="-100"
          width="620"
          height="620"
        >
          <g filter={`url(#${id}-goo)`} fill="white">
            {shape.blobs.map(([cx, cy, r]) => (
              <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
            ))}
          </g>
        </mask>
      </defs>
      <rect
        x="-100"
        y="-100"
        width="620"
        height="620"
        fill="currentColor"
        mask={`url(#${id}-mask)`}
      />
    </svg>
  );
}

/**
 * The site's one closing section. The copy is the home page's by default;
 * another page passes its own and gets the same section — templates, pricing
 * and every docs page close on it. `children` replaces the button when the
 * ask is something else, like the newsletter form.
 *
 * It always spans the window, wherever it is mounted: inside a page's
 * `.section` it bleeds back out to the edges, so the blobs are never clipped.
 */
export function Cta({
  title = "Make a video",
  body = (
    <>
      Start with one component,
      <br />
      see where it can go.
    </>
  ),
  href = "/docs/video-editor",
  label = "Open the editor",
  children,
}: {
  title?: ReactNode;
  body?: ReactNode;
  href?: string;
  label?: ReactNode;
  children?: ReactNode;
} = {}) {
  return (
    <section
      id="cta"
      className="relative mx-[calc(50%-50vw)] overflow-hidden py-24 sm:py-32"
    >
      <Blobs
        id="cta-blobs-left"
        shape={LEFT}
        className="pointer-events-none absolute top-1/2 left-0 hidden h-[92%] -translate-x-[12%] -translate-y-1/2 text-primary md:block"
      />
      <Blobs
        id="cta-blobs-right"
        shape={RIGHT}
        className="pointer-events-none absolute top-1/2 right-0 hidden h-[92%] translate-x-[12%] -translate-y-1/2 text-primary md:block"
      />
      {/* Wide enough for a longer line than "Make a video" to set on two
          lines, not one word per line; balanced so they come out even. */}
      <div className="relative mx-auto flex max-w-2xl flex-col items-center px-6 text-center">
        <h2 className="text-balance font-normal text-[clamp(2.75rem,6vw,4.5rem)] text-foreground leading-none tracking-[-0.04em]">
          {title}
        </h2>
        <div className="mt-6 text-body-lg text-current/70">{body}</div>
        {children ? (
          <div className="mt-8 w-full max-w-md">{children}</div>
        ) : (
          <Link
            href={href}
            className="mt-8 inline-flex h-10 items-center rounded-button bg-foreground px-5 font-medium text-background text-sm transition-colors hover:bg-foreground/85"
          >
            {label}
          </Link>
        )}
      </div>
    </section>
  );
}
