"use client";

import { Play, Plus } from "lucide-react";
import {
  MediaControlBar,
  MediaController,
  MediaMuteButton,
  MediaPlayButton,
  MediaTimeRange,
} from "media-chrome/react";
import { AnimatePresence, motion, useSpring } from "motion/react";
import { useEffect, useState } from "react";

/**
 * The hero's film: a muted loop with a "Play" chip that follows the pointer;
 * a click opens it full-size, with sound and controls, growing out of the
 * thumbnail and shrinking back into it on close (a shared `layoutId`).
 * Controls are media-chrome's, painted with `mix-blend-exclusion`
 * so they read on any frame.
 */
/** The open/close flight between the thumbnail and the full-size player. */
const FLY = { type: "spring" as const, stiffness: 100, damping: 20 };

export function HeroVideo({ src, poster }: { src: string; poster?: string }) {
  const [open, setOpen] = useState(false);
  const SPRING = { mass: 0.1 };
  const x = useSpring(0, SPRING);
  const y = useSpring(0, SPRING);
  const opacity = useSpring(0, SPRING);

  return (
    <>
      <AnimatePresence>
        {open && <VideoPopOver src={src} onClose={() => setOpen(false)} />}
      </AnimatePresence>
      <button
        type="button"
        aria-label="Play the launch video with sound"
        onClick={() => setOpen(true)}
        onPointerMove={(e) => {
          opacity.set(1);
          const b = e.currentTarget.getBoundingClientRect();
          x.set(e.clientX - b.left);
          y.set(e.clientY - b.top);
        }}
        onPointerLeave={() => opacity.set(0)}
        className="relative block aspect-video w-full overflow-hidden rounded-[14px] bg-[#292327]"
      >
        <motion.span
          style={{ x, y, opacity }}
          className="pointer-events-none absolute top-0 left-0 z-20 flex w-fit select-none items-center gap-2 p-2 text-sm text-white mix-blend-exclusion"
        >
          <Play className="size-4 fill-white" /> Play
        </motion.span>
        {/* The same `layoutId` as the open player: while it is open this one
            is absent, so motion flies the box from here to there and back. */}
        {open ? null : (
          <motion.div
            layoutId="hero-video"
            transition={FLY}
            className="absolute inset-0 overflow-hidden"
            style={{ borderRadius: 14 }}
          >
            <video
              src={src}
              poster={poster}
              autoPlay
              muted
              playsInline
              loop
              preload="metadata"
              className="size-full object-cover"
            />
          </motion.div>
        )}
      </button>
    </>
  );
}

function VideoPopOver({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed top-0 left-0 z-[101] flex h-screen w-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="absolute top-0 left-0 size-full bg-background/90 backdrop-blur-lg"
        onClick={onClose}
      />
      <motion.div
        layoutId="hero-video"
        transition={FLY}
        style={{ borderRadius: 14 }}
        className="relative aspect-video w-full max-w-7xl overflow-hidden"
      >
        <MediaController style={{ width: "100%", height: "100%" }}>
          {/* biome-ignore lint/a11y/useMediaCaption: music only, no speech to caption. */}
          <video
            slot="media"
            src={src}
            autoPlay
            playsInline
            className="size-full object-cover"
          />
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute top-2 right-2 z-10 rounded-full p-1"
          >
            <Plus className="size-5 rotate-45 text-white" />
          </button>
          <MediaControlBar className="absolute bottom-0 left-1/2 flex w-full max-w-7xl -translate-x-1/2 items-center justify-center px-5 mix-blend-exclusion md:px-10 md:py-5">
            <MediaPlayButton className="h-4 bg-transparent" />
            <MediaTimeRange className="bg-transparent [--media-range-thumb-opacity:0] [--media-range-track-height:2px]" />
            <MediaMuteButton className="size-4 bg-transparent" />
          </MediaControlBar>
        </MediaController>
      </motion.div>
    </div>
  );
}
