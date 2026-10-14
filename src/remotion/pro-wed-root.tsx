import { AbsoluteFill, Composition, registerRoot, Series } from "remotion";
import { FocusPull } from "@/registry/snap-cn-pro/focus-pull";
import { GlassPrompt } from "@/registry/snap-cn-pro/glass-prompt";
import { LockupReveal } from "@/registry/snap-cn-pro/lockup-reveal";
import { RenderWall } from "@/registry/snap-cn-pro/render-wall";
import { ScreenWall } from "@/registry/snap-cn-pro/screen-wall";
import { StretchWord } from "@/registry/snap-cn-pro/stretch-word";
import { VersionDrop } from "@/registry/snap-cn-pro/version-drop";

/**
 * The 22s "100% snapcn Pro" cut for the Wed 14 Oct Shadcn Labs post — every
 * frame a Pro scene, cut harder than the launch (`labs-launch-root.tsx`).
 *
 * ## Sync
 *
 * Hitslab's "Advertising Product Launch" (Pixabay), muxed afterwards from
 * 11.689s. Fitted grid: 126.0bpm, beat k at 0.26 + 0.47620·k s — confirmed by
 * the track's own stop-time breaks, 3.811s (8 beats) apart. The drums enter on
 * k32, so the hook gets the 8 quiet beats before it and the prompt lands on the
 * drop. Every cut is on a beat (B = 14.2857f):
 *
 *   k24 →   0  FocusPull    "Are you / Still / editing demos by hand?", one line per 2 beats
 *   k32 → 114  GlassPrompt  the drop: the prompt, the dive, the ring
 *   k41 → 243  RenderWall   "and ship."
 *   k44 → 286  ScreenWall   "52 Pro scenes." — the catalogue count, Oct 2026
 *   k49 → 357  StretchWord  "And moooore" stretching through the k52.75 break
 *   k54 → 429  VersionDrop  "snapcn Pro Lifetime" → "$249" landing on k59
 *   k61 → 529  LockupReveal its light on k68; the music stops under it at k69.3
 */
const B = 30 * 0.4762;
const at = (k: number) => Math.round((k - 24) * B);
const span = (a: number, b: number) => at(b) - at(a);

const ACCENT = "#E4823F";
const INK = "#292327";
const PAPER = "#EDEBE7";

export const SnapcnProWed = () => (
  <AbsoluteFill style={{ background: INK }}>
    <Series>
      <Series.Sequence durationInFrames={span(24, 32)}>
        {/* overlap 5: starts at 0, 29, 57 — one line every two beats. */}
        <FocusPull
          beats={[
            {
              text: "Are you",
              fontSize: 302,
              frames: 34,
              scaleFrom: 1.27,
              slideFrom: 2.2,
              spread: 12,
            },
            {
              text: "Still",
              fontSize: 180,
              frames: 33,
              scaleFrom: 0.86,
              slideFrom: 1.05,
              spread: 2,
            },
            {
              text: "editing demos by hand?",
              fontSize: 74,
              frames: 57,
              scaleFrom: 1,
              slideFrom: 1.25,
              spread: 7,
            },
          ]}
        />
      </Series.Sequence>
      <Series.Sequence durationInFrames={span(32, 41)}>
        <GlassPrompt
          prompt="Make a launch video for my app"
          pointer={ACCENT}
          speed={151 / span(32, 41)}
        />
      </Series.Sequence>
      <Series.Sequence durationInFrames={span(41, 44)}>
        <RenderWall
          headline="and ship."
          accent={ACCENT}
          speed={42 / span(41, 44)}
        />
      </Series.Sequence>
      <Series.Sequence durationInFrames={span(44, 49)}>
        <ScreenWall
          headline={["52", "Pro scenes."]}
          words={["Prompt.", "Render.", "Ship."]}
          accent={ACCENT}
          speed={70 / span(44, 49)}
        />
      </Series.Sequence>
      <Series.Sequence durationInFrames={span(49, 54)}>
        <StretchWord
          lead="And"
          word="more"
          closing="All one shadcn add away"
          theme={{ primary: ACCENT }}
          fontSize={92}
          speed={73 / span(49, 54)}
        />
      </Series.Sequence>
      <Series.Sequence durationInFrames={span(54, 61)}>
        {/* Name typed by the cut (k55), the price cut in on k57, last digit on k59. */}
        <VersionDrop
          name="snapcn Pro Lifetime"
          version="$249"
          versionSize={430}
          color={INK}
          background={PAPER}
          startAt={2}
          perChar={1}
          cutAt={at(55) - at(54)}
          versionAt={at(57) - at(54)}
          versionPerChar={7}
        />
      </Series.Sequence>
      <Series.Sequence durationInFrames={span(61, 70)}>
        <LockupReveal
          name="snapcn.dev/pro"
          ink={INK}
          paper={PAPER}
          speed={98.7 / span(61, 68)}
        />
      </Series.Sequence>
    </Series>
  </AbsoluteFill>
);

export function ProWedRoot() {
  return (
    <Composition
      id="SnapcnProWed"
      component={SnapcnProWed}
      durationInFrames={at(70)}
      fps={30}
      width={1280}
      height={720}
    />
  );
}

registerRoot(ProWedRoot);
