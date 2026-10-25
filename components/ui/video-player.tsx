"use client";

import {
  Loader2,
  Maximize,
  Minimize,
  Pause,
  PictureInPicture2,
  Play,
  Volume2,
  VolumeOff,
} from "lucide-react";
import {
  type ComponentProps,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * A video with its own controls: play, mute, a scrubber that shows what has
 * buffered and previews the time under the pointer, picture-in-picture and
 * fullscreen. The bar fades out while the film plays and the pointer rests,
 * and comes back on any movement, focus or pause.
 *
 * A plain `<video>` underneath, so `ref` is the element itself — a caller can
 * still seek it, listen to `timeupdate`, or play it — and every `<video>` prop
 * passes through. `children` sit over the picture, under the bar. `sources`
 * instead of `src` offers one file per screen: the browser takes the first
 * whose `media` matches.
 *
 * Keyboard, with the player focused: Space or K plays and pauses, M mutes,
 * F goes fullscreen, ← and → step five seconds.
 */
export function VideoPlayer({
  ref,
  className,
  children,
  sources,
  ...props
}: Omit<ComponentProps<"video">, "ref" | "controls" | "children"> & {
  ref?: Ref<HTMLVideoElement>;
  children?: ReactNode;
  sources?: { src: string; media?: string }[];
}) {
  const frame = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(Boolean(props.muted));
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [awake, setAwake] = useState(true);
  const [full, setFull] = useState(false);
  const [pip, setPip] = useState(false);
  // Until the first play the bar is not the way in — a big button is.
  const [started, setStarted] = useState(false);
  // Playing but starved of data: say so, or a stalled film reads as broken.
  const [waiting, setWaiting] = useState(false);
  const idle = useRef<ReturnType<typeof setTimeout> | null>(null);

  // The caller's ref and ours on the same element.
  const setVideo = useCallback(
    (el: HTMLVideoElement | null) => {
      video.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) ref.current = el;
    },
    [ref],
  );

  useEffect(() => {
    const el = video.current;
    if (!el) return;
    setPip(typeof document !== "undefined" && document.pictureInPictureEnabled);
    let raf = 0;
    // `timeupdate` fires about four times a second — a stepping bar. While
    // playing, the bar reads the clock every frame instead.
    const tick = () => {
      setTime(el.currentTime);
      raf = requestAnimationFrame(tick);
    };
    const onPlay = () => {
      setPlaying(true);
      setStarted(true);
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    };
    const onPause = () => {
      setPlaying(false);
      cancelAnimationFrame(raf);
      setTime(el.currentTime);
    };
    const onMeta = () => setDuration(el.duration || 0);
    const onProgress = () => {
      const r = el.buffered;
      setBuffered(r.length ? r.end(r.length - 1) : 0);
    };
    const onVolume = () => setMuted(el.muted);
    const onWaiting = () => setWaiting(true);
    const onFlowing = () => setWaiting(false);
    const onTime = () => {
      if (el.paused) setTime(el.currentTime);
    };
    const events: [string, () => void][] = [
      ["play", onPlay],
      ["pause", onPause],
      ["ended", onPause],
      ["loadedmetadata", onMeta],
      ["durationchange", onMeta],
      ["progress", onProgress],
      ["volumechange", onVolume],
      ["timeupdate", onTime],
      ["waiting", onWaiting],
      ["stalled", onWaiting],
      ["playing", onFlowing],
      ["canplay", onFlowing],
      ["pause", onFlowing],
    ];
    for (const [e, f] of events) el.addEventListener(e, f);
    onMeta();
    onProgress();
    onVolume();
    if (!el.paused) onPlay();
    return () => {
      cancelAnimationFrame(raf);
      for (const [e, f] of events) el.removeEventListener(e, f);
    };
  }, []);

  useEffect(() => {
    const onChange = () =>
      setFull(document.fullscreenElement === frame.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      if (idle.current) clearTimeout(idle.current);
    };
  }, []);

  const wake = useCallback(() => {
    setAwake(true);
    if (idle.current) clearTimeout(idle.current);
    idle.current = setTimeout(() => setAwake(false), 2200);
  }, []);

  const toggle = () => {
    const el = video.current;
    if (!el) return;
    if (el.paused) el.play().catch(() => {});
    else el.pause();
  };
  const toggleMute = () => {
    const el = video.current;
    if (el) el.muted = !el.muted;
  };
  const seek = (t: number) => {
    const el = video.current;
    if (!el || !duration) return;
    el.currentTime = Math.min(duration, Math.max(0, t));
    setTime(el.currentTime);
  };
  const toggleFull = () => {
    const box = frame.current;
    if (!box) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else if (box.requestFullscreen) box.requestFullscreen().catch(() => {});
    else {
      // iOS Safari has no element fullscreen; the video can still go native.
      (
        video.current as HTMLVideoElement & {
          webkitEnterFullscreen?: () => void;
        }
      )?.webkitEnterFullscreen?.();
    }
  };
  const togglePip = () => {
    const el = video.current;
    if (!el) return;
    if (document.pictureInPictureElement)
      document.exitPictureInPicture().catch(() => {});
    else el.requestPictureInPicture().catch(() => {});
  };

  const onKey = (e: KeyboardEvent) => {
    // Buttons answer Space and Enter themselves; only the frame's own keys here.
    if (e.target !== e.currentTarget) return;
    const k = e.key.toLowerCase();
    if (k === " " || k === "k") toggle();
    else if (k === "m") toggleMute();
    else if (k === "f") toggleFull();
    else if (k === "arrowleft") seek(time - 5);
    else if (k === "arrowright") seek(time + 5);
    else return;
    e.preventDefault();
    wake();
  };

  const shown = started && (!playing || awake);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: keyboard shortcuts for the focused player; every action also has a button.
    <div
      ref={frame}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: the frame takes focus for the player's keyboard shortcuts; every action also has a button.
      tabIndex={0}
      onKeyDown={onKey}
      onPointerMove={wake}
      onPointerLeave={() => setAwake(false)}
      onFocus={wake}
      className={cn(
        "group/player relative size-full overflow-hidden bg-black outline-none focus-visible:ring-2 focus-visible:ring-ring",
        started && !shown && "cursor-none",
        className,
      )}
    >
      <video
        ref={setVideo}
        onClick={toggle}
        className="size-full cursor-pointer object-cover"
        {...props}
      >
        {sources?.map((s) => (
          <source key={s.src} src={s.src} media={s.media} type="video/mp4" />
        ))}
      </video>
      {children}

      {playing && waiting ? (
        <output
          aria-label="Loading"
          className="pointer-events-none absolute inset-0 m-auto flex size-14 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm"
        >
          <Loader2 className="size-6 animate-spin" />
        </output>
      ) : null}

      {started ? null : (
        <button
          type="button"
          aria-label="Play"
          onClick={toggle}
          className="absolute inset-0 m-auto flex size-16 cursor-pointer items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/25 backdrop-blur-md transition-[transform,background-color] duration-150 ease-out hover:bg-white/25 active:scale-95 md:size-20"
        >
          <Play className="ml-1 size-6 fill-current stroke-none md:size-7" />
        </button>
      )}

      <div
        className={cn(
          "absolute inset-x-0 bottom-0 flex h-12 items-center gap-1 bg-linear-to-t from-black/60 to-transparent px-2 text-white transition-opacity duration-200 ease-out md:h-16 md:gap-1.5 md:px-4",
          shown ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <Control label={playing ? "Pause" : "Play"} onClick={toggle}>
          {playing ? (
            <Pause className="size-3.5 fill-current stroke-none" />
          ) : (
            <Play className="size-3.5 fill-current stroke-none" />
          )}
        </Control>
        <Control label={muted ? "Unmute" : "Mute"} onClick={toggleMute}>
          {muted ? (
            <VolumeOff className="size-4" />
          ) : (
            <Volume2 className="size-4" />
          )}
        </Control>

        <span className="w-9 shrink-0 text-center font-mono text-[0.6875rem] tabular-nums md:w-10 md:text-xs">
          {clock(time)}
        </span>
        <Scrubber
          time={time}
          duration={duration}
          buffered={buffered}
          onSeek={seek}
          onScrub={wake}
        />
        <span className="w-10 shrink-0 text-center font-mono text-[0.6875rem] tabular-nums md:w-11 md:text-xs">
          −{clock(Math.max(0, duration - time))}
        </span>

        {pip ? (
          <Control label="Picture in picture" onClick={togglePip}>
            <PictureInPicture2 className="size-3.5" />
          </Control>
        ) : null}
        <Control
          label={full ? "Exit fullscreen" : "Fullscreen"}
          onClick={toggleFull}
        >
          {full ? (
            <Minimize className="size-3.5" />
          ) : (
            <Maximize className="size-3.5" />
          )}
        </Control>
      </div>
    </div>
  );
}

function Control({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="size-7 shrink-0 rounded-md text-white hover:bg-white/10 hover:text-white focus-visible:ring-white/50 dark:hover:bg-white/10"
    >
      {children}
    </Button>
  );
}

/**
 * The timeline: what has buffered, what has played, and — under the pointer —
 * a hairline with the time it would seek to. Drag to scrub; arrow keys step
 * five seconds when it has focus.
 */
function Scrubber({
  time,
  duration,
  buffered,
  onSeek,
  onScrub,
}: {
  time: number;
  duration: number;
  buffered: number;
  onSeek: (t: number) => void;
  onScrub: () => void;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const dragging = useRef(false);

  const at = (e: PointerEvent) => {
    const r = track.current?.getBoundingClientRect();
    if (!r || r.width === 0) return 0;
    return Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
  };
  const pct = (t: number) => (duration ? `${(t / duration) * 100}%` : "0%");

  return (
    <div
      ref={track}
      role="slider"
      tabIndex={0}
      aria-label="Seek"
      aria-valuemin={0}
      aria-valuemax={Math.round(duration)}
      aria-valuenow={Math.round(time)}
      aria-valuetext={`${clock(time)} of ${clock(duration)}`}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          e.preventDefault();
          e.stopPropagation();
          onSeek(time + (e.key === "ArrowRight" ? 5 : -5));
          onScrub();
        }
      }}
      onPointerDown={(e) => {
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        onSeek(at(e) * duration);
      }}
      onPointerMove={(e) => {
        setHover(at(e));
        if (dragging.current) onSeek(at(e) * duration);
      }}
      onPointerUp={() => {
        dragging.current = false;
      }}
      onPointerCancel={() => {
        dragging.current = false;
      }}
      onPointerLeave={() => setHover(null)}
      className="relative flex h-full min-w-0 flex-1 cursor-crosshair touch-none items-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-white/50"
    >
      <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/15">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-white/30"
          style={{ width: pct(buffered) }}
        />
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-white"
          style={{ width: pct(time) }}
        />
      </div>
      {hover !== null && duration > 0 ? (
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 h-6 w-px -translate-y-1/2 bg-white/70"
          style={{ left: `${hover * 100}%` }}
        >
          <span className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded bg-black/70 px-1.5 py-0.5 font-mono text-[0.6875rem] text-white tabular-nums">
            {clock(hover * duration)}
            <span className="opacity-50"> / {clock(duration)}</span>
          </span>
        </div>
      ) : null}
    </div>
  );
}

const clock = (s: number) => {
  const t = Math.floor(Number.isFinite(s) ? s : 0);
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
};
