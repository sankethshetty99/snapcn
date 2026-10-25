import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import type { ReactNode } from "react";
import {
  AbsoluteFill,
  Composition,
  Easing,
  Freeze,
  interpolate,
  registerRoot,
  Sequence,
  useCurrentFrame,
} from "remotion";
import { CaptureReveal } from "@/registry/snap-cn/capture-reveal";
import { ReelCollage } from "@/registry/snap-cn/reel-collage";
import { StatusCycle } from "@/registry/snap-cn/status-cycle";
import { TextReveal } from "@/registry/snap-cn/text-reveal";
import { WordmarkCut } from "@/registry/snap-cn/wordmark-cut";
import { LibraryFlight } from "@/registry/snap-cn-pro/library-flight";
import { LockupReveal } from "@/registry/snap-cn-pro/lockup-reveal";
import { OrbitFlow } from "@/registry/snap-cn-pro/orbit-flow";

/**
 * X cut for the 25 Oct templates post.
 *
 * ## Sync
 *
 * Maksym Malko "Product Launch", muxed with its first 0.425s (silence) trimmed
 * so beat 0 is frame 0 (`tmp/x-oct25/render.mts`). Grid: 138.00bpm, beat k at
 * 0.434783·k s.
 *
 * The beat is syncopated: a bar's hits are on 0, 0.75, 1.5, 3 or 0, 1, 2.5 —
 * not on every beat. A cut on a beat with no hit reads as off the music, so
 * every cut and every in-scene event below sits on a measured hit (onset
 * peaks of the track, in beats):
 *
 *   k0 / 1.51 / 3      Calling / all / builders
 *   k4   capture       k8 its drop and the "Added" toast
 *   k13  wordmark      k16 its cut
 *   k17.5 orbit · k24 collage · k30.5 status (k38.5 last chip)
 *   k44  flight        k46.5 / k49.5 its moves
 *   k56  Sell · k57–60 your story to the · k61 world.
 *   k64  logo          k68 its light — both on kicks
 *
 * ## Transitions
 *
 * Hard cuts read as sudden, so most cuts are a short fade / slide / wipe that
 * ENDS on the hit — the music lands as the new shot does. The incoming shot
 * holds its first frame through the transition (`Hold`), so nothing inside it
 * moves off the grid. Only k24 and the logo stay hard cuts: the two biggest
 * hits, where a cut is the punch.
 */
const FPS = 60;
const B = (60 * FPS) / 138;
const at = (k: number) => Math.round(k * B);
const span = (a: number, b: number) => at(b) - at(a);

export const LENGTH = at(72);

/** Seconds a component's own clock should cover across beats a→b. */
const fit = (native: number, a: number, b: number) =>
  native / (span(a, b) / FPS);

/** Plays `children` on a clock remapped through [beat, native seconds] keys,
 *  `from` being the scene's first beat. Children run at speed 1. */
const Warp = ({
  from,
  keys,
  children,
}: {
  from: number;
  keys: [number, number][];
  children: ReactNode;
}) => {
  const native = interpolate(
    useCurrentFrame(),
    keys.map(([k]) => at(k) - at(from)),
    keys.map(([, s]) => s * FPS),
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
  return <Freeze frame={native}>{children}</Freeze>;
};

/** Frames each transition takes, ending on the hit. */
const T = 14;
const timing = linearTiming({
  durationInFrames: T,
  easing: Easing.inOut(Easing.cubic),
});

/** Holds the first frame for `T` frames — the incoming side of a transition —
 *  then plays, so the shot's own clock still starts on its hit. */
const Hold = ({ children }: { children: ReactNode }) => (
  <Freeze frame={Math.max(0, useCurrentFrame() - T)}>{children}</Freeze>
);

export const XOct25 = () => (
  <AbsoluteFill style={{ background: "#ffffff" }}>
    <TransitionSeries>
      {/* Lead word big on k0, "all" pushes in on k1.51, "builders" on k3.
          Frame counts are 60fps. */}
      <TransitionSeries.Sequence durationInFrames={span(0, 4)}>
        <TextReveal
          text="Calling all builders"
          fontSize={128}
          introDuration={12}
          holdDuration={8}
          recedeDuration={28}
          assembleDuration={60}
          wordDelay={at(1.51) - 20}
          wordStagger={at(3) - at(1.51)}
          wordDuration={20}
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={timing} />
      {/* Native 1.34s is the drop: the window falls, the toast pops. */}
      <TransitionSeries.Sequence durationInFrames={span(4, 13) + T}>
        <Hold>
          <Warp
            from={4}
            keys={[
              [4, 0],
              [8, 1.34],
              [13, 1.34 + span(8, 13) / FPS],
            ]}
          >
            <CaptureReveal
              capturing="Installing components..."
              copied="Added to your project."
            />
          </Warp>
        </Hold>
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={slide({ direction: "from-right" })}
        timing={timing}
      />
      <TransitionSeries.Sequence durationInFrames={span(13, 17.5) + T}>
        <Hold>
          <Warp
            from={13}
            keys={[
              [13, 0],
              [16, 1.222],
              [17.5, 1.222 + span(16, 17.5) / FPS],
            ]}
          >
            <WordmarkCut />
          </Warp>
        </Hold>
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={timing} />
      <TransitionSeries.Sequence durationInFrames={span(17.5, 24) + T}>
        <Hold>
          <OrbitFlow speed={fit(3.4, 17.5, 24)} />
        </Hold>
      </TransitionSeries.Sequence>
      {/* Hard cut: k24 is one of the two biggest hits. */}
      <TransitionSeries.Sequence durationInFrames={span(24, 30.5)}>
        <ReelCollage
          speed={fit(3.2, 24, 30.5)}
          collage={[
            "https://media.snapcn.dev/demos/orb-swarm.mp4",
            "https://media.snapcn.dev/pro-demos/checkout-push.mp4",
            "https://media.snapcn.dev/pro-demos/comment-storm.mp4",
            "https://media.snapcn.dev/pro-demos/metric-morph.mp4",
            "https://media.snapcn.dev/pro-demos/read-through.mp4",
            // Its last part only.
            "https://media.snapcn.dev/pro-demos/thank-you-swarm.mp4#t=2.4",
          ]}
        />
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={slide({ direction: "from-bottom" })}
        timing={timing}
      />
      {/* Cut as the chips land: the rest of its clock is a still hold. */}
      <TransitionSeries.Sequence durationInFrames={span(30.5, 44) + T}>
        <Hold>
          <Warp
            from={30.5}
            keys={[
              [30.5, 0],
              [38.5, 2.958],
              [44, 4.9],
            ]}
          >
            <StatusCycle />
          </Warp>
        </Hold>
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition
        presentation={wipe({ direction: "from-left" })}
        timing={timing}
      />
      <TransitionSeries.Sequence durationInFrames={span(44, 56) + T}>
        <Hold>
          <Warp
            from={44}
            keys={[
              [44, 0],
              [46.5, 0.715],
              [49.5, 2.342],
              [56, 4.39],
            ]}
          >
            <LibraryFlight />
          </Warp>
        </Hold>
      </TransitionSeries.Sequence>
      <TransitionSeries.Transition presentation={fade()} timing={timing} />
      {/* Same reveal as the opener: "Sell" big on the k56 kick, then a word a
          beat on the hits at k57–60, "world." on the bright hit at k61. */}
      <TransitionSeries.Sequence durationInFrames={span(56, 64) + T}>
        <Hold>
          <TextReveal
            text="Sell your story to the world."
            fontSize={104}
            introDuration={12}
            holdDuration={8}
            recedeDuration={28}
            assembleDuration={span(56, 62) - 20}
            wordDelay={span(56, 57) - 20}
            wordStagger={B}
            wordDuration={20}
          />
        </Hold>
      </TransitionSeries.Sequence>
      {/* Hard cut to the logo on the k64 kick, mid-slide. End part of the
          lockup only, at speed 1, offset so its cut to the light (CUT, native
          3.29s) lands on the k68 kick and END on k72. Not warped: under
          <Freeze> the light scene never draws. */}
      <TransitionSeries.Sequence durationInFrames={span(64, 72)}>
        <Sequence from={span(64, 68) - Math.round(3.29 * FPS)}>
          <LockupReveal />
        </Sequence>
      </TransitionSeries.Sequence>
    </TransitionSeries>
  </AbsoluteFill>
);

registerRoot(() => (
  <Composition
    id="XOct25"
    component={XOct25}
    durationInFrames={LENGTH}
    fps={FPS}
    width={1920}
    height={1080}
  />
));
