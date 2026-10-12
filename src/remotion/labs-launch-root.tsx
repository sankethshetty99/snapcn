import { AbsoluteFill, Composition, registerRoot, Series } from "remotion";
import { mixOklch } from "@/lib/snap-cn-ui";
import { CrossOut } from "@/registry/snap-cn-pro/cross-out";
import { LibraryFlight } from "@/registry/snap-cn-pro/library-flight";
import { LockupReveal } from "@/registry/snap-cn-pro/lockup-reveal";
import { ReadThrough } from "@/registry/snap-cn-pro/read-through";
import { TerminalSimulator } from "@/registry/snap-cn/terminal-simulator";

/**
 * The 16s "Introducing snapcn" cut for the Shadcn Labs launch post — modelled on
 * pdfcn's (175K views): the video carries the promise, the post stays 3 lines.
 *
 * Hook → promise → how → proof → brand:
 *
 *   k0  →  68  CrossOut     "Editing" struck out → "shadcn for videos"
 *   k5  → 176  ReadThrough  "Every frame is one shadcn add away." — not "a shadcn
 *                            component": they are a shadcn *registry*, not shadcn/ui
 *   k13 → 230  Terminal     `npx shadcn add @snapcn/text-reveal`
 *   k17 → 365  LibraryFlight  the wall of screens, landing on the install counts
 *   k27 → 480  LockupReveal  snapcn.dev, its light on the last hit
 *
 * ## Sync
 *
 * Cut to Starostin's "Commercial Advertising Product Launch" (Pixabay), muxed
 * afterwards with its first 0.055s trimmed so beat 0 is frame 0. Fitted grid:
 * 133.30bpm, beat k at frame 13.504·k, bars on k ≡ 1 (mod 4), last hit k=33.
 * Every cut is on a beat, and so is every event inside a scene: CrossOut's cut
 * to black (native f30) on k2; one ReadThrough word per beat, the last on k11;
 * the command typed by k14; the lockup's light (CUT, 98.7f native) on k33.
 *
 * ## One palette — the lockup's own
 *
 * The scenes ship four darks (CrossOut's black, the terminal's #141417, the
 * flight's #000, the lockup's #292327) and three lights. Read in a row that is
 * four videos. Everything here is the lockup's card and paper plus one orange:
 *
 *   · CrossOut's night is `mixOklch(foreground, black, 0.722)`, so a foreground
 *     of #ffe7f7 lands it on INK (#282327 — inside a unit).
 *   · The terminal's stage is `mixOklch(background, black, 0.35)`; #50464d → INK.
 *     It is cut before its last station, whose green bar and cursor are fixed.
 *   · The flight and the lockup take INK/PAPER as props.
 *
 * The counts are PostHog's floor, Aug 19 → Oct 12 2026: `registry_component_fetched`
 * from the shadcn CLI, node and agents, deduped per person×component, crawlers
 * out. Both are under the truth — nothing was tracked before Aug 19.
 */
const INK = "#292327";
const PAPER = "#EDEBE7";
const ACCENT = "#E4823F";
const BEAT = 13.504;

export const SnapcnLabsLaunch = () => (
  <AbsoluteFill style={{ background: INK }}>
    <Series>
      <Series.Sequence durationInFrames={68}>
        <CrossOut
          headline={["Editing", "Videos"]}
          phrase={["shadcn", "for", "videos"]}
          labels={["Remotion", "shadcn"]}
          marker={ACCENT}
          theme={{ foreground: "#ffe7f7" }}
          speed={30 / (2 * BEAT)}
        />
      </Series.Sequence>
      <Series.Sequence durationInFrames={108}>
        <ReadThrough
          above="You're watching a video."
          line="Every frame is one shadcn add away."
          below="Copy it. Paste it. Ship it."
          color={INK}
          mutedColor={mixOklch(PAPER, INK, 0.18)}
          accent={ACCENT}
          background={PAPER}
          stepFrames={BEAT}
          // 270 (the default) set "component." wider than the 1280 frame.
          fontSize={210}
        />
      </Series.Sequence>
      <Series.Sequence durationInFrames={54}>
        <TerminalSimulator
          intro={null}
          command={{
            managers: ["npx", "pnpm", "bun"],
            text: "npx shadcn add @snapcn/text-reveal",
          }}
          lines={[]}
          theme={{
            background: "#50464d",
            foreground: PAPER,
            mutedForeground: mixOklch(INK, PAPER, 0.55),
          }}
          background={mixOklch(INK, PAPER, 0.06)}
          borderColor={mixOklch(INK, PAPER, 0.14)}
          // 1.6: typed by k14, and 54f end before the pull (112 native).
          speed={1.6}
        />
      </Series.Sequence>
      <Series.Sequence durationInFrames={135}>
        <LibraryFlight
          title="snapcn"
          first="6,227 installs."
          second="1,256 developers."
          background={INK}
          color={PAPER}
        />
      </Series.Sequence>
      <Series.Sequence durationInFrames={115}>
        <LockupReveal
          name="snapcn.dev"
          ink={INK}
          paper={PAPER}
          speed={98.7 / (33 * BEAT - 365)}
        />
      </Series.Sequence>
    </Series>
  </AbsoluteFill>
);

export function LabsLaunchRoot() {
  return (
    <Composition
      id="SnapcnLabsLaunch"
      component={SnapcnLabsLaunch}
      durationInFrames={480}
      fps={30}
      width={1280}
      height={720}
    />
  );
}

registerRoot(LabsLaunchRoot);
