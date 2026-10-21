import fs from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { DOCS_PAGE_META } from "@/config/site";
import { proItemBySlugs } from "@/lib/gallery-data";
import { firstSentence } from "@/lib/structured-data";
import { blogSource, source } from "@/source";

export const revalidate = 3600;

/**
 * Read once per server instance, not once per card. Both live outside
 * `public/`, so `next.config.ts` names them in `outputFileTracingIncludes` —
 * without that they are absent from the deployed bundle and every card 500s.
 *
 * Saans is the site's face, and the OG card is the site. Satori cannot parse
 * woff2 (it throws "Unsupported OpenType signature wOF2"), which is why these
 * are ttf copies of the two woff2 faces `app/layout.tsx` loads.
 */
const loadAssets = async () => {
  const font = (name: string) =>
    fs.readFile(path.join(process.cwd(), "app", "og", "fonts", name));
  const png = (name: string) =>
    fs
      .readFile(path.join(process.cwd(), "public", "logo", name))
      .then((b) => `data:image/png;base64,${b.toString("base64")}`);
  const [regular, medium, logoWhite] = await Promise.all([
    font("Saans-Regular.ttf"),
    font("Saans-Medium.ttf"),
    png("snapcn-white.png"),
  ]);
  return {
    logoWhite,
    fonts: [
      {
        name: "Saans",
        data: regular,
        weight: 400 as const,
        style: "normal" as const,
      },
      {
        name: "Saans",
        data: medium,
        weight: 500 as const,
        style: "normal" as const,
      },
    ],
  };
};

let assets: ReturnType<typeof loadAssets> | undefined;
const getAssets = () => {
  assets ??= loadAssets();
  return assets;
};

/**
 * Two lines at 28px. Satori honours neither `-webkit-line-clamp`
 * nor `overflow: hidden` on a free-height box, so the cut is made on the string
 * — at a word boundary, or the ellipsis lands mid-word.
 */
const clamp = (text: string, max = 185) =>
  text.length <= max
    ? text
    : `${text
        .slice(0, max)
        .replace(/\s+\S*$/, "")
        .replace(/[\s,;:—–-]+$/, "")}…`;

/** One line when it fits; long titles step down instead of wrapping into a paragraph. */
const titleSize = (title: string) =>
  title.length <= 20
    ? 66
    : title.length <= 32
      ? 54
      : title.length <= 48
        ? 46
        : 40;

/** A cursor with a name tag — the collaborator-pointer motif. */
const Cursor = ({
  label,
  fill,
  color,
  style,
}: {
  label: string;
  fill: string;
  color: string;
  style: React.CSSProperties;
}) => (
  <div
    style={{
      position: "absolute",
      display: "flex",
      flexDirection: "column",
      ...style,
    }}
  >
    <svg width="34" height="34" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M2 2 L22 9 L12.5 12.5 L9 22 Z" fill={fill} />
    </svg>
    <div
      style={{
        display: "flex",
        marginLeft: 20,
        marginTop: 2,
        padding: "6px 12px",
        borderRadius: 7,
        backgroundColor: fill,
        color,
        fontSize: 21,
      }}
    >
      {label}
    </div>
  </div>
);

/**
 * Every card, site and per-page: black sky sweeping into a blue-to-cream
 * horizon, a big wordmark, a ghosted word behind the headline. A short subtitle
 * (the site tagline) is set as a second headline line; a page description is
 * set smaller beneath its title.
 */
const card = ({
  logoWhite,
  title,
  subtitle,
  ghost,
}: {
  logoWhite: string;
  title: string;
  subtitle: string;
  ghost: string;
}) => (
  <div
    style={{
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      position: "relative",
      fontFamily: "Saans",
      // Diagonal horizon, low-left to mid-right, like light off a planet rim.
      backgroundImage:
        "linear-gradient(172deg, #000 0%, #000 30%, #1b2a45 44%, #5b8fd6 58%, #9cc3e6 66%, #e9ecc0 76%, #f7f6ea 86%, #ffffff 100%)",
    }}
  >
    {/* The dark dome over the top half — bends the straight horizon into a curve. */}
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: 1200,
        height: 630,
        backgroundImage:
          "radial-gradient(ellipse 62% 66% at 58% 0%, #000 0%, #000 62%, rgba(0,0,0,0) 100%)",
      }}
    />
    <div
      style={{
        position: "absolute",
        // A smaller ghost drops so its baseline stays on the horizon.
        top: 185 + (230 - Math.min(230, Math.floor(2200 / ghost.length))) * 0.5,
        width: "100%",
        display: "flex",
        justifyContent: "center",
        // ~0.5em per glyph; keeps a long category inside the card.
        fontSize: Math.min(230, Math.floor(2200 / ghost.length)),
        fontWeight: 400,
        letterSpacing: -8,
        color: "rgba(200, 222, 245, 0.22)",
      }}
    >
      {ghost}
    </div>
    <div
      style={{ display: "flex", alignItems: "center", gap: 26, marginTop: 44 }}
    >
      {/* biome-ignore lint/performance/noImgElement: Satori renders <img>, not next/image. */}
      <img src={logoWhite} alt="" width={96} height={85} />
      <div
        style={{
          fontSize: 104,
          fontWeight: 500,
          letterSpacing: -3.5,
          color: "#fff",
        }}
      >
        snapcn
      </div>
    </div>
    <Cursor
      label="You"
      fill="#ecebc0"
      color="#141414"
      style={{ top: 175, left: 930 }}
    />
    <Cursor
      label="AI agent"
      fill="#000"
      color="#fff"
      style={{ top: 300, left: 130 }}
    />
    <div
      style={{
        position: "absolute",
        bottom: 58,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        maxWidth: 1060,
        textAlign: "center",
        fontWeight: 500,
        lineHeight: 1.12,
      }}
    >
      <div
        style={{
          color: "#0d0d0d",
          fontSize: titleSize(title),
          letterSpacing: -0.03 * titleSize(title),
        }}
      >
        {title}
      </div>
      {subtitle.length <= 45 ? (
        <div
          style={{
            color: "#2c3e57",
            fontSize: titleSize(title),
            letterSpacing: -0.03 * titleSize(title),
          }}
        >
          {subtitle}
        </div>
      ) : (
        <div
          style={{
            color: "#2c3e57",
            fontSize: 28,
            fontWeight: 400,
            lineHeight: 1.4,
            marginTop: 14,
          }}
        >
          {clamp(subtitle, 120)}
        </div>
      )}
    </div>
  </div>
);

/**
 * Branded 1200x630 OpenGraph card. `/og` renders the site card; `/og/<docs
 * slug>` renders a per-page card with the page title, description and its
 * category as the ghosted word. Unknown slugs fall back to the site card so a stale share
 * link never 404s.
 */
export async function GET(
  _req: Request,
  props: { params: Promise<{ slug?: string[] }> },
) {
  const { slug } = await props.params;
  const { logoWhite, fonts } = await getAssets();

  const page = slug?.length ? source.getPage(slug) : undefined;
  const data = page?.data as { title?: string; description?: string };

  // The `(gallery)` routes — Video Editor, Showcase, Changelog, Roadmap — have
  // no MDX file, so `source.getPage` misses them and every one of them shared
  // the generic site card. They are the pages most likely to be shared.
  const bespoke =
    !page && slug?.length === 1 ? DOCS_PAGE_META[slug[0]] : undefined;
  // A paid component's page has no MDX either; its catalogue entry is the card.
  const pro = page ? null : proItemBySlugs(slug);
  // A post lives in the blog collection, which `source` cannot see at all. Its
  // card is the one most likely to be shared, since a post is written to be.
  const post =
    !page && slug?.length === 1 ? blogSource.getPage(slug) : undefined;

  const title =
    data?.title ??
    post?.data.title ??
    bespoke?.title ??
    pro?.name ??
    "Product demo videos, in React.";
  const description =
    data?.description ??
    post?.data.description ??
    bespoke?.description ??
    (pro ? firstSentence(pro.description) : undefined) ??
    "Copy-paste Remotion components for the shots a software demo is made of — streaming AI answers, terminals, device frames, captions.";

  // The category's own index page owns its label, so the card cannot drift from
  // the sidebar the way a hardcoded slug→label map here did.
  const category = post
    ? "Blog"
    : slug && slug.length > 1
      ? (source.getPage([slug[0]])?.data as { title?: string } | undefined)
          ?.title
      : undefined;

  const site = !data?.title && !post && !bespoke && !pro;
  return new ImageResponse(
    card({
      logoWhite,
      title: site ? "Product demo videos, in React:" : title,
      subtitle: site
        ? "Remotion components, installed with shadcn"
        : description,
      ghost: site ? "Remotion" : (category ?? "Remotion"),
    }),
    { width: 1200, height: 630, fonts },
  );
}
