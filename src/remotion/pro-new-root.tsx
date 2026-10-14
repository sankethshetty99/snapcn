import { AbsoluteFill, Composition, registerRoot, Series } from "remotion";
import {
  AgentCompose,
  END as COMPOSE_END,
} from "@/registry/snap-cn-pro/agent-compose";
import { EchoStack } from "@/registry/snap-cn-pro/echo-stack";
import { MoodBoard } from "@/registry/snap-cn-pro/mood-board";
import { MOOD_BOARD_FRAMES } from "@/registry/snap-cn-pro/mood-board/config";
import { TrendType } from "@/registry/snap-cn-pro/trend-type";
import { TREND_TYPE_FRAMES } from "@/registry/snap-cn-pro/trend-type/config";

/**
 * "New components" X cut, 14 Oct: agent-compose (committed 13 Oct) and this
 * week's trend-type, echo-stack and mood-board.
 *
 * ## Sync
 *
 * M83 "Midnight City", muxed afterwards from 14.964s (`scripts/render-pro-new.mts`).
 * Fitted grid: 105.00bpm, beat k at 16.107 + 0.571429·k s; the drums enter on
 * k0, and k0→k8 and k52.11−16.11 = 63 beats agree to the millisecond. The video
 * starts two beats before the drums (B = 34.2857f at 60fps):
 *
 *   k-2 EchoStack "new" alone, its echoes bursting open on the drums at k0
 *   k2  TrendType
 *   k8  AgentCompose on the phrase
 *   k15 MoodBoard
 *   k23 EchoStack "snapcn.dev" alone, opening on the phrase at k24
 *   k27 end
 */
const B = (60 * 60) / 105;
const at = (k: number) => Math.round((k + 2) * B);
const span = (a: number, b: number) => at(b) - at(a);

export const AUDIO_FROM = 16.107 - 2 * (60 / 105);
export const LENGTH = at(27);

export const SnapcnNew = () => (
  <AbsoluteFill style={{ background: "#0a0a0b" }}>
    <Series>
      <Series.Sequence durationInFrames={span(-2, 2)}>
        <EchoStack text="new" palette="primary" hold={span(-2, 0)} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={span(2, 8)}>
        <TrendType
          text="*New* *components* this *week*"
          speed={TREND_TYPE_FRAMES / span(2, 8)}
        />
      </Series.Sequence>
      <Series.Sequence durationInFrames={span(8, 15)}>
        <AgentCompose speed={(COMPOSE_END + 1) / span(8, 15)} />
      </Series.Sequence>
      <Series.Sequence durationInFrames={span(15, 23)}>
        <MoodBoard
          lines={["every frame matched", "to the reference."]}
          speed={MOOD_BOARD_FRAMES / span(15, 23)}
        />
      </Series.Sequence>
      <Series.Sequence durationInFrames={span(23, 27)}>
        <EchoStack text="snapcn.dev" palette="midnight" hold={span(23, 24)} />
      </Series.Sequence>
    </Series>
  </AbsoluteFill>
);

registerRoot(() => (
  <Composition
    id="SnapcnNew"
    component={SnapcnNew}
    durationInFrames={LENGTH}
    fps={60}
    width={1920}
    height={1080}
  />
));
