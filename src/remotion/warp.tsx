import type { ReactNode } from "react";
import { Freeze, interpolate, useCurrentFrame } from "remotion";

/** The labs-launch music grid: 133.30bpm, beat k at frame 13.504·k (30fps). */
export const BEAT = 13.504;
export const at = (k: number) => Math.round(k * BEAT);

/**
 * Plays `children` on a clock remapped through [beat, native frame] keys —
 * `from` is the scene's first beat. Native frames are the component's own
 * at this composition's 30fps.
 */
export function Warp({
  from,
  keys,
  children,
}: {
  from: number;
  keys: [number, number][];
  children: ReactNode;
}) {
  const f = useCurrentFrame();
  const native = interpolate(
    f,
    keys.map(([k]) => k * BEAT - at(from)),
    keys.map(([, n]) => n),
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return <Freeze frame={native}>{children}</Freeze>;
}
