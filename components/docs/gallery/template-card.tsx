"use client";

import { Eye, Lock } from "lucide-react";
import Link from "next/link";
import { CodeBlockCommand } from "@/components/docs/code-block-command";
import { buttonVariants } from "@/components/ui/button";
import { installCommand } from "@/config/site";
import { convertNpmCommand } from "@/lib/convert-npm-command";
import { MEDIA_BASE } from "@/lib/demo-urls";
import { CATALOGUE_PRICE, EARLY_BIRD, PRICES_RISEN } from "@/lib/plans";
import { cn } from "@/lib/utils";
import type { Reel } from "./template-reels";

/**
 * Masked stills: each is the real one taken down to a 160px sketch — layout
 * and colour read, text and UI detail do not — blurred and
 * scaled back up, then uploaded on its own (`templates-locked/`). The real
 * stills and the film never reach the page, so there is no CSS to peel off in
 * devtools — what the browser has is all there is.
 */
const masked = (slug: string, i: number) =>
  `${MEDIA_BASE}/templates-locked/${slug}-${i + 1}-v2.webp`;

/**
 * What the locked block shows instead of the install command. Never the real
 * registry name: the page ships only this decoy, so there is nothing for
 * devtools to un-blur — and the real install needs a Pro key regardless.
 */
const DECOY = "pro-template";

/**
 * All the card is given: no install name, no film or still hashes, no beat
 * list (those name Pro components). The
 * page strips the rest on the server, because a client component's props ship
 * in the page.
 */
export type TemplateCardReel = Pick<Reel, "slug" | "title" | "description"> & {
  /** How many beats, and the film's length in seconds. */
  beats: number;
  seconds: number;
};

const clock = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/**
 * One template before its release: the name, one line, the facts, three masked
 * stills and the locked install. Nothing on it plays or copies — the preview
 * button is shown, disabled, with the day it opens.
 */
export function TemplateCard({ reel }: { reel: TemplateCardReel }) {
  return (
    <article>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <h2 className="font-semibold font-sans text-[clamp(1.75rem,3.2vw,2.5rem)] text-foreground leading-tight tracking-[-0.03em]">
            {reel.title}
          </h2>
          <p className="mt-3 text-pretty text-current/70 text-lg leading-relaxed">
            {reel.description}
          </p>
          <p className="mt-3 font-mono text-muted-foreground text-xs">
            {reel.beats} beats · {clock(reel.seconds)} · Included in Pro
          </p>
        </div>
        <button
          type="button"
          disabled
          className={cn(
            buttonVariants({ variant: "secondary", size: "lg" }),
            "h-12 shrink-0 cursor-not-allowed gap-2.5 rounded-xl px-6 text-base",
          )}
        >
          <Eye aria-hidden className="size-5" />
          Preview opens {EARLY_BIRD.endsOnShort}
        </button>
      </div>

      <div className="mt-8 grid w-full select-none grid-cols-1 gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          // biome-ignore lint/performance/noImgElement: R2 stills are pre-sized webp; next/image would need the media host in next.config.
          <img
            key={i}
            src={masked(reel.slug, i)}
            alt=""
            draggable={false}
            loading="lazy"
            className="pointer-events-none aspect-video w-full rounded-3xl bg-gallery-card object-cover"
          />
        ))}
      </div>

      {/* Locked until Pro: a decoy command, blurred and inert, under the
          offer. Before the release it says plainly that paying now buys the
          early-bird price and the template arrives on release day, so nobody
          pays expecting to install it this minute. */}
      <div className="relative mt-6 max-w-xl">
        <div
          aria-hidden
          inert
          className="pointer-events-none select-none blur-[3px]"
        >
          <CodeBlockCommand
            component={DECOY}
            variant="outline"
            {...convertNpmCommand(installCommand(DECOY))}
          />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-4 text-center">
          <Link
            href="/docs/pricing?ref=template-install#plans"
            className={cn(
              buttonVariants({ size: "lg" }),
              "h-11 gap-2 rounded-button px-5 transition-transform duration-150 ease-out active:scale-[0.97]",
            )}
          >
            <Lock aria-hidden className="size-4" />
            {PRICES_RISEN
              ? `Unlock with Pro · ${CATALOGUE_PRICE.annual}/yr`
              : `Unlock with Pro · ${CATALOGUE_PRICE.annual}/yr until ${EARLY_BIRD.endsOnShort}`}
          </Link>
          {PRICES_RISEN ? null : (
            <p className="text-muted-foreground text-xs">
              Releases {EARLY_BIRD.endsOn}. Buy now at the early-bird price; it
              unlocks in your account on release day.
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
