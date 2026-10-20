import { loadFont } from "@remotion/google-fonts/GeistMono";
import {
  AbsoluteFill,
  Composition,
  Freeze,
  registerRoot,
  Sequence,
  Series,
} from "remotion";
import { CaptureReveal } from "@/registry/snap-cn/capture-reveal";
import { TextSwap } from "@/registry/snap-cn/text-swap";
import { BriefSend } from "@/registry/snap-cn-pro/brief-send";
import { LockupReveal } from "@/registry/snap-cn-pro/lockup-reveal";
import { Manifesto } from "@/registry/snap-cn-pro/manifesto";
import { WallCut } from "@/registry/snap-cn-pro/wall-cut";
import { WordMontage } from "@/registry/snap-cn-pro/word-montage";

/**
 * X post "Every scene in this video is a function." — Thu 15 Oct.
 * Shipped scenes only (Pro ones committed in the pro repo, none of template-02).
 *
 *   Manifesto     the claim: "This whole video / is just / code."
 *   WordMontage   what you make with it
 *   TextSwap      a word edit: CaptureReveal's headline → "yourapp | launch day"
 *   CaptureReveal …and the scene it produces
 *   WallCut       a theme edit: lit for the white page, then its own dark wall
 *   BriefSend     or skip the JSX: brief your agent and it writes the props
 *   LockupReveal  snapcn.dev
 *
 * White page, black type, green for the one accent; BriefSend, the dark WallCut
 * and LockupReveal keep their own colours. 30fps, like every scene it uses;
 * hard cuts.
 */
const { fontFamily: MONO } = loadFont("normal", {
  weights: ["400"],
  subsets: ["latin"],
});
const STAGE = "#FFFFFF";
const INK = "#0A0A0A";
const GREEN = "#22c55e";
/**
 * WallCut's theme switch: the wall lit for this white page, then the scene in
 * its own colours (dark LED panel, blue light) — the edit is one mode prop.
 */
const LIGHT_WALL = { mode: "light" as const, wall: STAGE };
/** Past WallCut's cut (0.888s) and its sweep (to 1.3s): the clean wide shot. */
const WALL_CUT_AT = 42;
const LIGHT_WALL_TAG = '<WallCut mode="light" wall="#ffffff" />';
const DARK_WALL_TAG = '<WallCut mode="dark" />';

/** Frames the "before" line holds before it swaps — long enough to read. */
const HOLD = 24;

/** The edit: one line of JSX with one prop rewritten. */
const Code = ({
  from,
  to,
  size = 50,
}: {
  from: string;
  to: string;
  size?: number;
}) => {
  const swap = (
    <TextSwap
      fromText={from}
      toText={to}
      transition="crossfade"
      // The new line starts in while the old one leaves: no blank page mid-swap.
      overlap={14}
      fontFamily={MONO}
      fontSize={size}
      color={INK}
      mode="light"
    />
  );
  // TextSwap exits on its frame 0; freeze it there for HOLD first.
  return (
    <AbsoluteFill style={{ background: STAGE }}>
      <Sequence durationInFrames={HOLD}>
        <Freeze frame={0}>{swap}</Freeze>
      </Sequence>
      <Sequence from={HOLD}>{swap}</Sequence>
    </AbsoluteFill>
  );
};

/** The intro, a touch quicker than the reference's own pace. */
const MANIFESTO_SPEED = 1.25;

const S = {
  manifesto: Math.round(130 / MANIFESTO_SPEED), // third beat at 87, then the payoff holds
  montage: 125, // the sentence lands ~100; 25f to read it, not 50
  code: 85, // the word-by-word swap ends ~60f in; hold the "after" ~0.8s
  capture: 130, // CaptureReveal's own durationInFrames
  wall: 85, // WallCut's pull ends at 2.74s
  lightWall: 85 - WALL_CUT_AT, // from its cut on
  brief: 130, // BriefSend's END, 4.333s
  outro: 150, // LockupReveal's END, 5s
};

export const XFunction = () => (
  <AbsoluteFill style={{ background: STAGE }}>
    <Series>
      <Series.Sequence durationInFrames={S.manifesto}>
        <Manifesto
          lineOne="This whole video"
          lineTwo="is just"
          lineThree="code."
          speed={MANIFESTO_SPEED}
          edgeColor={GREEN}
          edgeMidColor="#86efac"
          color={INK}
          mode="light"
        />
      </Series.Sequence>
      <Series.Sequence durationInFrames={S.montage}>
        <WordMontage
          lead="Your"
          words="demo;launch;changelog"
          sentence="written in React"
          // Its night turn ends the montage on white instead, the line in ink.
          paper={STAGE}
          night={STAGE}
          light={INK}
        />
      </Series.Sequence>
      <Series.Sequence durationInFrames={S.code}>
        <Code
          from={'<CaptureReveal headline="no more | keyframes" />'}
          to={'<CaptureReveal headline="yourapp | launch day" />'}
          size={36}
        />
      </Series.Sequence>
      <Series.Sequence durationInFrames={S.capture}>
        <CaptureReveal
          headline="yourapp | launch day"
          mode="light"
          // White page instead of its cream; the grid follows it.
          theme={{ background: STAGE }}
        />
      </Series.Sequence>
      <Series.Sequence durationInFrames={S.lightWall}>
        {/* Wide shot only: the close shot's sweep draws the LED dot grid
            as grey noise on a white panel, whatever the glow. */}
        <Sequence from={-WALL_CUT_AT}>
          <WallCut {...LIGHT_WALL} />
        </Sequence>
      </Series.Sequence>
      <Series.Sequence durationInFrames={S.code}>
        <Code from={LIGHT_WALL_TAG} to={DARK_WALL_TAG} size={40} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={S.wall}>
        <WallCut />
      </Series.Sequence>
      <Series.Sequence durationInFrames={S.brief}>
        <BriefSend
          project="yourapp launch"
          attachment="yourapp logo"
          brief="a 30s launch video for yourapp, green, ending on the logo, with"
          mention="wall-cut"
        />
      </Series.Sequence>
      <Series.Sequence durationInFrames={S.outro}>
        {/* Its own colours: the dark card, then the light scene. */}
        <LockupReveal name="snapcn.dev" />
      </Series.Sequence>
    </Series>
  </AbsoluteFill>
);

export function XFunctionRoot() {
  return (
    <Composition
      id="XFunction"
      component={XFunction}
      // code plays twice.
      durationInFrames={Object.values(S).reduce((a, b) => a + b) + S.code}
      fps={30}
      width={1280}
      height={720}
    />
  );
}

registerRoot(XFunctionRoot);
