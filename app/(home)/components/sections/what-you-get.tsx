import { ArrowUp, Plus } from "lucide-react";
import { GALLERY_COUNT } from "@/lib/gallery-data";
import { FadeUp } from "../fade-up";
import { AgentsVisual } from "./agents-visual";
import { CardCarousel } from "./card-carousel";

/**
 * Five steps, five cards in a carousel — Tenor's "There's room to surprise yourself"
 * section: a picture on top, a big title and two lines of copy at the foot,
 * flat muted panels with barely-there corners. The panels inside take explicit
 * px radii (Tenor's, halved from a 2x capture): this site's `--radius` is
 * 0.28rem, so `rounded-2xl` is only 8px and read as square.
 *
 * It replaced a grid of the seven categories, each linking to its docs page.
 * Those links still exist — the footer lists every category and component — so
 * the long-tail pages lose no authority from the home page.
 */

const CARD =
  "flex flex-col overflow-hidden rounded-[5px] bg-muted text-foreground";
const PANEL =
  "border border-border/60 bg-background shadow-[0_1px_2px_rgba(0,0,0,0.04)]";

/** Step one: the install command, set in a prompt box. */
function InstallVisual() {
  return (
    <div className={`${PANEL} w-full max-w-[22rem] rounded-[18px] p-3`}>
      <p className="truncate px-2 pt-1 pb-5 font-mono text-[0.8125rem] text-current/70">
        npx shadcn add @snapcn/text-reveal
      </p>
      <div className="flex items-center gap-2">
        <span className="grid size-8 place-items-center rounded-full bg-muted">
          <Plus className="size-4 text-current/60" aria-hidden />
        </span>
        <span className="ml-auto text-sm text-current/70">@snapcn</span>
        <span className="grid size-8 place-items-center rounded-full bg-foreground/40 text-background">
          <ArrowUp className="size-4" aria-hidden />
        </span>
      </div>
    </div>
  );
}

/** Step two: a props panel, the customizer's controls as a still. */
function PropsVisual() {
  return (
    <div className={`${PANEL} w-full max-w-[20rem] rounded-[16px] p-4 text-sm`}>
      <div className="flex gap-1">
        <span className="rounded-[8px] bg-muted px-2.5 py-1 font-medium">
          Props
        </span>
        <span className="px-2.5 py-1 text-current/60">Theme</span>
      </div>
      <div className="mt-4 space-y-3 border-border/60 border-t pt-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-current/60">text</span>
          <span className="rounded-[6px] border border-primary px-2 py-0.5">
            Ship it in minutes
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-current/60">theme</span>
          <span className="rounded-[6px] bg-muted px-2 py-0.5">midnight ▾</span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-current/60">speed</span>
          <span className="relative h-1 w-32 rounded-full bg-muted">
            <span className="absolute inset-y-0 left-0 w-3/5 rounded-full bg-foreground/70" />
            <span className="absolute top-1/2 left-3/5 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border bg-background" />
          </span>
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-current/60">accent</span>
          <span className="flex gap-1.5">
            {["#E4823F", "#2F6FE0", "#292327"].map((c) => (
              <span
                key={c}
                className="size-5 rounded-[5px] border border-border/60"
                style={{ background: c }}
              />
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}

/** Step three: two scenes on a timeline, the way `<Series>` lays them out. */
function ComposeVisual() {
  const ROWS = [
    { name: "LogoAssemble", from: 0, to: 43, tone: "bg-[#E4823F]" },
    { name: "TextReveal", from: 43, to: 100, tone: "bg-primary" },
  ];
  return (
    <div className={`${PANEL} w-full max-w-[22rem] rounded-[16px] p-4 text-sm`}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[0.8125rem] text-current/70">
          launch-scene.tsx
        </span>
        <span className="text-current/50 text-xs">210f · 30fps</span>
      </div>
      <div className="relative mt-4 space-y-2 border-border/60 border-t pt-4">
        {ROWS.map((r) => (
          <div key={r.name} className="relative h-8 rounded-[8px] bg-muted">
            <span
              className={`absolute inset-y-0 flex items-center rounded-[8px] px-2.5 font-medium text-white text-xs ${r.tone}`}
              style={{ left: `${r.from}%`, width: `${r.to - r.from}%` }}
            >
              {r.name}
            </span>
          </div>
        ))}
        {/* The playhead. */}
        <span className="absolute top-2 bottom-0 left-[58%] w-px bg-foreground">
          <span className="absolute -top-1 -left-[3px] size-[7px] rounded-full bg-foreground" />
        </span>
      </div>
    </div>
  );
}

/** Step four: the spring every component is written with, drawn. */
function AnimateVisual() {
  return (
    <div className={`${PANEL} w-full max-w-[20rem] rounded-[16px] p-4 text-sm`}>
      <span className="font-mono text-[0.8125rem] text-current/70">
        spring({"{"} frame, fps {"}"})
      </span>
      <svg
        viewBox="0 0 200 90"
        className="mt-3 w-full border-border/60 border-t pt-3"
        aria-hidden
      >
        <path
          d="M0 85 C 30 85, 40 -6, 70 10 S 105 30, 125 18 S 160 14, 200 15"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <line
          x1="0"
          y1="15"
          x2="200"
          y2="15"
          stroke="currentColor"
          strokeOpacity="0.15"
          strokeDasharray="3 4"
        />
        <circle cx="70" cy="10" r="4.5" fill="#E4823F" />
      </svg>
      <div className="mt-2 flex justify-between text-current/50 text-xs">
        <span>damping 12</span>
        <span>stiffness 120</span>
      </div>
    </div>
  );
}

const STEPS = [
  {
    title: "Pick a shot",
    body: "One command, and the component's source lands in components/snap-cn/ — a file you own, not a package.",
    Visual: InstallVisual,
  },
  {
    title: "Tune every prop",
    body: "Copy, colours and timing are all props. Change one in the editor and the frame updates under your cursor.",
    Visual: PropsVisual,
  },
  {
    title: "Compose scenes",
    body: "Scenes drop into a Remotion timeline like any React component. Sequence them, nest them — it is all JSX, in your repo.",
    Visual: ComposeVisual,
  },
  {
    title: "Animate anything",
    body: "No keyframe graph to learn: every component is plain useCurrentFrame, interpolate and spring, so any number is yours to change.",
    Visual: AnimateVisual,
  },
  {
    title: "Hand it to your agent",
    body: "Claude Code, Cursor, Codex and the rest read the registry over MCP and assemble the video with you.",
    Visual: AgentsVisual,
  },
];

export function WhatYouGet() {
  return (
    <section id="what-you-get" className="relative pb-20 sm:pb-28">
      <div className="section">
        <FadeUp>
          <h2 className="text-pretty font-sans text-[clamp(2rem,3.6vw,2.75rem)] font-normal leading-[1.1] tracking-[-0.03em] text-foreground">
            A shadcn registry, for video
          </h2>
          <p className="mt-4 max-w-xl text-pretty text-body-lg text-current/70">
            {GALLERY_COUNT} Remotion components you install with the shadcn CLI.
            No runtime, no version to pin — the code is yours.
          </p>
        </FadeUp>

        <FadeUp delay={0.08}>
          <div className="mt-6">
            <CardCarousel>
              {STEPS.map(({ title, body, Visual }) => (
                <li key={title} className={CARD}>
                  <div className="flex h-72 items-center justify-center overflow-hidden px-8 sm:h-80">
                    <Visual />
                  </div>
                  <div className="px-8 pt-6 pb-8">
                    <h3 className="font-medium text-[1.75rem] leading-tight tracking-[-0.02em]">
                      {title}
                    </h3>
                    <p className="mt-3 max-w-[34ch] text-pretty text-current/70 leading-relaxed">
                      {body}
                    </p>
                  </div>
                </li>
              ))}
            </CardCarousel>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
