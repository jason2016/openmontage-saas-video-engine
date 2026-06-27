// Thin connector / energy strokes that draw on (Vercel-style restraint). Paths,
// color, and width are props. Optional glow dot at each line's leading edge.
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { tokens as baseTokens, Tokens } from "../tokens";
import { easeSettle } from "../hooks/easings";

interface MotionLinesProps {
  theme?: Tokens;
  paths?: string[];
  color?: string;
  strokeWidth?: number;
  drawSeconds?: number;
  delaySeconds?: number;
  stepSeconds?: number;
  opacity?: number;
  svgWidth?: number;
  svgHeight?: number;
}

const DEFAULT_PATHS = [
  "M40 320 C 300 320, 320 140, 600 140 S 900 140, 1120 140",
  "M40 200 C 360 200, 380 360, 760 360 S 980 360, 1120 360",
  "M40 100 C 260 100, 280 240, 560 240 S 860 240, 1120 240",
];

export const MotionLines: React.FC<MotionLinesProps> = ({
  theme = baseTokens,
  paths = DEFAULT_PATHS,
  color,
  strokeWidth = 2,
  drawSeconds = 1.4,
  delaySeconds = 0,
  stepSeconds = 0.18,
  opacity = 0.55,
  svgWidth = 1160,
  svgHeight = 420,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const stroke = color ?? theme.color.primaryBright;

  return (
    <svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${svgWidth} ${svgHeight}`} fill="none" style={{ overflow: "visible" }}>
      {paths.map((d, i) => {
        const start = delaySeconds + i * stepSeconds;
        const p = interpolate(t, [start, start + drawSeconds], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: easeSettle,
        });
        return (
          <path
            key={i}
            d={d}
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeOpacity={opacity}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - p}
          />
        );
      })}
    </svg>
  );
};
