"use client";

import { ArrowRight, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTrackEvent } from "@/lib/analytics";
import { CATALOGUE_PRICE, EARLY_BIRD } from "@/lib/plans";
import { cn } from "@/lib/utils";

const HREF = "/docs/pricing?ref=sale_banner#plans";
const END = Date.parse(EARLY_BIRD.endsAt);
/** Published as `--fd-banner-height`; everything sticky offsets by it. */
const HEIGHT = "3.5rem";

function left(now: number) {
  const s = Math.max(0, Math.floor((END - now) / 1000));
  return {
    total: s,
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

/** One odometer digit: the old one rolls up and out as the new one rolls in. */
function Digit({ value }: { value: number }) {
  const [cur, setCur] = useState(value);
  const [prev, setPrev] = useState<number | null>(null);

  useEffect(() => {
    if (value === cur) return;
    setPrev(cur);
    setCur(value);
    const id = setTimeout(() => setPrev(null), 400);
    return () => clearTimeout(id);
  }, [value, cur]);

  return (
    <span className="relative inline-flex h-[1.4em] w-[0.62em] items-center justify-center overflow-hidden">
      {prev !== null && (
        <span className="absolute inset-0 flex animate-[digit-out_0.35s_ease-in_forwards] items-center justify-center">
          {prev}
        </span>
      )}
      <span
        key={cur}
        className={cn(
          "absolute inset-0 flex items-center justify-center",
          prev !== null &&
            "animate-[digit-in_0.35s_cubic-bezier(0.16,1,0.3,1)]",
        )}
      >
        {cur}
      </span>
    </span>
  );
}

function Pair({ value }: { value: number }) {
  return (
    <div className="flex items-center justify-center rounded-md bg-white/20 px-1.5 py-0.5 font-medium font-mono text-sm tabular-nums leading-none shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_0_12px_rgba(255,255,255,0.25)] ring-1 ring-white/25">
      <Digit value={Math.floor(value / 10)} />
      <Digit value={value % 10} />
    </div>
  );
}

/**
 * The site-wide early-bird bar, above every page until `EARLY_BIRD.endsAt`,
 * now counting down to it: days, hours, minutes and seconds, each digit
 * rolling like an odometer. Dismissible for the visit.
 *
 * Decided on the client only: most pages are prerendered, and a deadline baked
 * into their HTML would outlive the deadline.
 */
export function SaleBanner() {
  const trackEvent = useTrackEvent();
  const [time, setTime] = useState<ReturnType<typeof left> | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setTime(left(Date.now()));
    const id = setInterval(() => {
      const t = left(Date.now());
      setTime(t);
      if (t.total <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  if (!time || time.total <= 0 || dismissed) return null;

  const colon = cn(
    "self-center text-sm font-light transition-opacity duration-500",
    time.seconds % 2 === 0 ? "opacity-60" : "opacity-30",
  );
  const label =
    "text-center text-[8px] font-medium uppercase tracking-[0.15em] text-white/60";
  const units: [number, string][] = [
    ...(time.days > 0 ? ([[time.days, "days"]] as [number, string][]) : []),
    [time.hours, "hrs"],
    [time.minutes, "min"],
    [time.seconds, "sec"],
  ];

  return (
    <div
      className="sticky top-0 z-40 flex h-(--fd-banner-height) items-center justify-center overflow-hidden px-10 text-white"
      style={{
        background:
          "radial-gradient(45% 160% at 50% 50%, #5a92ea 0%, transparent 75%), radial-gradient(30% 140% at 85% 40%, #4a86e4 0%, transparent 70%), linear-gradient(90deg, #2458b0, #3072db 35%, #3072db 65%, #2458b0)",
      }}
    >
      <style>{`:root { --fd-banner-height: ${HEIGHT}; }
@keyframes digit-out { to { transform: translateY(-100%); opacity: 0; } }
@keyframes digit-in { from { transform: translateY(100%); opacity: 0; } }
@keyframes banner-shine { 0% { transform: translateX(-100%) skewX(-20deg); } 55%, 100% { transform: translateX(450%) skewX(-20deg); } }`}</style>
      {/* Dot-matrix texture over the gradient, denser at the edges so the copy stays clean. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.35) 0.75px, transparent 1.25px)",
          backgroundSize: "6px 6px",
          maskImage:
            "linear-gradient(90deg, #000 0%, rgba(0,0,0,0.25) 30%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.25) 70%, #000 100%)",
        }}
      />
      {/* The shine: a soft band of light sweeping across every few seconds. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-1/4 animate-[banner-shine_4s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/35 to-transparent motion-reduce:hidden"
      />
      <div className="relative flex items-center gap-x-6">
        <span className="hidden font-medium text-sm md:inline">
          Early-bird pricing ends {EARLY_BIRD.endsOn}
          <span className="hidden lg:inline">
            {" "}
            — Pro is {CATALOGUE_PRICE.annual}/yr or {CATALOGUE_PRICE.lifetime}{" "}
            once
          </span>
        </span>

        {/* Labels in their own grid row, so they never shift the digits off
            the bar's centre line. */}
        <div
          className="inline-grid grid-flow-col grid-rows-[auto_auto] items-center gap-x-1.5"
          role="timer"
          aria-label={`${time.days} days ${time.hours} hours ${time.minutes} minutes left`}
        >
          {units.map(([value, name], i) => (
            <Unit
              key={name}
              value={value}
              name={name}
              last={i === units.length - 1}
              colon={colon}
              label={label}
            />
          ))}
        </div>

        <Link
          href={HREF}
          onClick={() =>
            trackEvent("cta_clicked", { cta: "sale_banner", destination: HREF })
          }
          className="group inline-flex h-8 shrink-0 items-center gap-1 rounded-button bg-white px-3.5 font-medium text-[#2458b0] text-sm shadow-[0_0_18px_rgba(255,255,255,0.45)] transition-shadow hover:shadow-[0_0_26px_rgba(255,255,255,0.7)]"
        >
          Lock it in
          <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      </div>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-white/60 transition-all duration-150 hover:bg-white/10 hover:text-white active:scale-90"
        aria-label="Dismiss"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}

/** A digit pair over its label, then a colon column — four grid cells. */
function Unit({
  value,
  name,
  last,
  colon,
  label,
}: {
  value: number;
  name: string;
  last: boolean;
  colon: string;
  label: string;
}) {
  return (
    <>
      <Pair value={value} />
      <span className={label}>{name}</span>
      {last ? null : (
        <>
          <span className={colon}>:</span>
          <span />
        </>
      )}
    </>
  );
}
