import { AbsoluteFill, Composition, registerRoot, Series } from "remotion";
import { ColumnCut } from "@/registry/snap-cn-pro/column-cut";
import { EchoStack } from "@/registry/snap-cn-pro/echo-stack";
import { LockupReveal } from "@/registry/snap-cn-pro/lockup-reveal";
import { ScreenWall } from "@/registry/snap-cn-pro/screen-wall";
import { SearchRetype } from "@/registry/snap-cn-pro/search-retype";
import { TrendType } from "@/registry/snap-cn-pro/trend-type";
import { at, BEAT, Warp } from "./warp";

/**
 * Product Hunt launch cut, 20 Oct — the labs-launch structure (hook → promise →
 * how → proof → brand) rebuilt from Pro scenes, on the same music and grid
 * (133.30bpm, beat k at frame 13.504·k), so the original's audio muxes as is.
 *
 * Every cut is on a beat, and so is every event inside a scene: each scene's
 * own clock is time-warped (`Warp`) so its key frames land on beats.
 *
 *   k0   ColumnCut     lines; cut to the photo column on k1; words k2 k3 k3.5 k4
 *   k5   TrendType     "your" k5.5, "launch" k6, "video" k7, "in" k8, "minutes" k9
 *   k10  SearchRetype  first key k10.5, erase k13, retyped by k16, whip k16.5
 *   k17  ScreenWall    cut k18, words k18 k19 k20
 *   k22  EchoStack     echoes open on k23
 *   k27  LockupReveal  its light on k33
 */
const INK = "#292327";
const PAPER = "#EDEBE7";
const ACCENT = "#E4823F";

const span = (a: number, b: number) => at(b) - at(a);

export const SnapcnPhLaunch = () => (
  <AbsoluteFill style={{ background: INK }}>
    <Series>
      <Series.Sequence durationInFrames={span(0, 5)}>
        {/* Native: cut 11, words 21 28 33 40, end 52. */}
        <Warp
          from={0}
          keys={[
            [0, 0],
            [1, 11],
            [2, 21],
            [3, 28],
            [3.5, 33],
            [4, 40],
            [5, 52],
          ]}
        >
          <ColumnCut
            lines={["STOP", "EDITING", "START", "SHIPPING"]}
            words={["shadcn", "for", "your", "videos"]}
            accent={ACCENT}
            background={PAPER}
            ink={INK}
          />
        </Warp>
      </Series.Sequence>
      <Series.Sequence durationInFrames={span(5, 10)}>
        {/* Native word ends (60fps k, halved): your 20.5, launch 46.5, video 72, in 111.9, minutes 155.5. */}
        <Warp
          from={5}
          keys={[
            [5, 0],
            [5.5, 10.25],
            [6, 23.25],
            [7, 36],
            [8, 55.95],
            [9, 77.75],
            [10, 87],
          ]}
        >
          <TrendType
            text="Ship your *launch* *video* in *minutes*"
            theme="dawn"
          />
        </Warp>
      </Series.Sequence>
      <Series.Sequence durationInFrames={span(10, 17)}>
        {/* Native: first key 6, typed 39, erase 53, retype 65→103, whip 120, end 125. */}
        <Warp
          from={10}
          keys={[
            [10, 0],
            [10.5, 6],
            [12, 39],
            [13, 53],
            [13.5, 65],
            [16, 103],
            [16.5, 120],
            [17, 125],
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
      <Series.Sequence durationInFrames={span(17, 22)}>
        {/* Native: cut and first word 21, words 37 53, end 70. */}
        <Warp
          from={17}
          keys={[
            [17, 0],
            [18, 21],
            [19, 37],
            [20, 53],
            [21.5, 70],
          ]}
        >
          <ScreenWall
            headline={["57 Pro", "scenes."]}
            words={["Copy.", "Paste.", "Ship."]}
            accent={ACCENT}
          />
        </Warp>
      </Series.Sequence>
      <Series.Sequence durationInFrames={span(22, 27)}>
        {/* `hold` is in 60fps frames: one beat, so the echoes open on k23. */}
        <EchoStack text="own the code." palette="midnight" hold={2 * BEAT} />
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
    id="SnapcnPhLaunch"
    component={SnapcnPhLaunch}
    durationInFrames={480}
    fps={30}
    width={1280}
    height={720}
  />
));
