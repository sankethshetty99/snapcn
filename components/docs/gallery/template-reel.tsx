"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { VideoPlayer } from "@/components/ui/video-player";
import { MEDIA_BASE } from "@/lib/demo-urls";
import { cn } from "@/lib/utils";
import type { Reel } from "./template-reels";

/**
 * A template as one rendered film with its beats listed under it: click a
 * beat to jump there, and the beat playing stays lit.
 *
 * Every beat is a Pro component, so nothing here can run live (that tree is
 * gitignored — see `template-timeline.tsx`). Each film is the template rendered
 * with its default words, on R2 at `templates-wip/<slug>-<v>.mp4` (`v` is the mp4's
 * byte hash). The beats in `template-reels.ts` are generated from
 * `registry/snap-cn-pro/templates/<slug>`; `frames` place each beat in the film.
 */
const clock = (frames: number, fps: number) => {
  const s = Math.floor(frames / fps);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
};

export function TemplateReel({ reel }: { reel: Reel }) {
  const { fps, beats } = reel;
  // Hashes are in the names (see `template-reels.ts`); the first still is the poster.
  // 4K where the player is big enough to show it, 1080p on phones — a 15MB
  // film on a mobile connection is a spinner, not a preview.
  const sources = [
    {
      src: `${MEDIA_BASE}/templates-wip/${reel.slug}-${reel.v}.mp4`,
      media: "(min-width: 1024px)",
    },
    { src: `${MEDIA_BASE}/templates-wip/${reel.slug}-1080-${reel.v1080}.mp4` },
  ];
  const poster = `${MEDIA_BASE}/templates-wip/${reel.slug}-1-${reel.stills[0]}.webp`;
  const starts = useMemo(() => {
    const out: number[] = [];
    for (let i = 0, n = 0; i < beats.length; n += beats[i].frames, i++)
      out.push(n);
    return out;
  }, [beats]);
  const video = useRef<HTMLVideoElement>(null);
  const [at, setAt] = useState(0);

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    const onTime = () => {
      const f = el.currentTime * fps;
      let i = 0;
      while (i + 1 < starts.length && f >= starts[i + 1]) i++;
      setAt(i);
    };
    el.addEventListener("timeupdate", onTime);
    return () => el.removeEventListener("timeupdate", onTime);
  }, [fps, starts]);

  const jump = (i: number) => {
    const el = video.current;
    if (!el) return;
    el.currentTime = starts[i] / fps;
    el.play().catch(() => {});
  };

  return (
    <div>
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-gallery-card">
        <VideoPlayer
          ref={video}
          sources={sources}
          poster={poster}
          muted
          playsInline
          preload="metadata"
        >
          <span className="pointer-events-none absolute top-3 left-3 rounded-full bg-background/80 px-2.5 py-1 font-mono text-[0.6875rem] text-foreground backdrop-blur">
            {beats[at].label} · {beats[at].component} · Pro preview
          </span>
        </VideoPlayer>
      </div>
      <ol className="mt-5 grid grid-cols-2 gap-1.5 sm:grid-cols-4 lg:grid-cols-6">
        {beats.map((b, i) => (
          <li key={`${i}-${b.component}`}>
            <button
              type="button"
              onClick={() => jump(i)}
              aria-pressed={i === at}
              className={cn(
                "flex w-full flex-col items-start gap-0.5 rounded-xl px-3 py-2 text-left text-sm transition-colors",
                i === at
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              <span className="flex w-full items-baseline justify-between gap-2">
                <span className="truncate">{b.label}</span>
                <span className="font-mono text-[0.625rem] opacity-70">
                  {clock(starts[i], fps)}
                </span>
              </span>
              <span className="max-w-full truncate font-mono text-[0.625rem] opacity-70">
                {b.component}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
