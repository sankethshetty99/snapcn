import { AbsoluteFill, Composition, registerRoot, Series } from "remotion";
import { OrbSwarm } from "@/registry/snap-cn/orb-swarm";
import { ReelCollage } from "@/registry/snap-cn/reel-collage";
import { LockupReveal } from "@/registry/snap-cn-pro/lockup-reveal";
import { ScreenWall } from "@/registry/snap-cn-pro/screen-wall";
import { SearchRetype } from "@/registry/snap-cn-pro/search-retype";
import { at, BEAT, Warp } from "./warp";

/**
 * Product Hunt launch cut v2 — same music and grid as v1, but built on the
 * track's shape: k0–k10 is the quiet build, the drop is k10 (RMS doubles),
 * the last hit k33, and the track ends at 16.9s.
 *
 *   k0   OrbSwarm      the build: one card or word per beat, the ring on k8
 *   k10  ReelCollage   the drop: the reel flurry, the swap on k13
 *   k16  SearchRetype  first key k16.5, erase k19, whip k21.5
 *   k22  ScreenWall    words k23 k24 k25
 *   k27  LockupReveal  its light on k33
 */
const INK = "#292327";
const PAPER = "#EDEBE7";
const ACCENT = "#E4823F";
const span = (a: number, b: number) => at(b) - at(a);

export const SnapcnPhLaunchV2 = () => (
  <AbsoluteFill style={{ background: INK }}>
    <Series>
      <Series.Sequence durationInFrames={span(0, 10)}>
        {/* Native (24fps beats ×1.25): cards 0 12.5, words 27.5 35 42.5 46.25 56.25 60 65, ring card 110, end 160. */}
        <Warp
          from={0}
          keys={[
            [0, 0],
            [1, 12.5],
            [2, 27.5],
            [3, 35],
            [4, 42.5],
            [4.5, 46.25],
            [5, 56.25],
            [5.5, 60],
            [6, 65],
            [8, 110],
            [10, 160],
          ]}
        >
          <OrbSwarm
            script="launch day | what if | your video | was one | shadcn add away | snapcn"
            background={PAPER}
            ink={INK}
            orbColor={ACCENT}
          />
        </Warp>
      </Series.Sequence>
      <Series.Sequence durationInFrames={span(10, 16)}>
        {/* Native: reel cuts 0→29, the eyelid shuts into the swap at 46, end 96. */}
        <Warp
          from={10}
          keys={[
            [10, 0],
            [12, 29],
            [13, 46],
            [16, 96],
          ]}
        >
          <ReelCollage
            topLine="Demo videos"
            bottomLine="for launch day"
            swapTop="Built in"
            swapBottom="React"
            background={PAPER}
            textColor={INK}
          />
        </Warp>
      </Series.Sequence>
      <Series.Sequence durationInFrames={span(16, 22)}>
        {/* Native: first key 6, typed 39, erase 53, retype 65→103, whip 120, end 125. */}
        <Warp
          from={16}
          keys={[
            [16, 0],
            [16.5, 6],
            [18, 39],
            [19, 53],
            [19.5, 65],
            [21.25, 103],
            [21.6, 120],
            [22, 125],
          ]}
        >
          <SearchRetype
            placeholder="Search snapcn"
            query="Animated launch videos"
            accent={ACCENT}
            theme={{ background: PAPER, foreground: INK }}
          />
        </Warp>
      </Series.Sequence>
      <Series.Sequence durationInFrames={span(22, 27)}>
        {/* Native: cut and first word 21, words 37 53, end 70. */}
        <Warp
          from={22}
          keys={[
            [22, 0],
            [23, 21],
            [24, 37],
            [25, 53],
            [26.5, 70],
          ]}
        >
          <ScreenWall
            headline={["57 Pro", "scenes."]}
            words={["Copy.", "Paste.", "Ship."]}
            accent={ACCENT}
          />
        </Warp>
      </Series.Sequence>
      <Series.Sequence durationInFrames={480 - at(27)}>
        <LockupReveal
          name="snapcn.dev"
          ink={INK}
          paper={PAPER}
          speed={98.7 / (33 * BEAT - at(27))}
        />
      </Series.Sequence>
    </Series>
  </AbsoluteFill>
);

registerRoot(() => (
  <Composition
    id="SnapcnPhLaunchV2"
    component={SnapcnPhLaunchV2}
    durationInFrames={480}
    fps={30}
    width={1280}
    height={720}
  />
));
