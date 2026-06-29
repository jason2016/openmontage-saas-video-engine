// A hand-drawn signature that draws on (stroke dashoffset by frame). Sits inside
// a PDFViewer signature slot or a standalone pad. Path + ink color are props.
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { tokens as baseTokens, Tokens } from "../tokens";
import { easeSignature } from "../hooks/easings";

const DEFAULT_PATH =
  "M12 88 C 34 30, 66 28, 76 80 C 82 116, 58 120, 62 86 C 68 42, 104 40, 122 86 C 134 120, 152 118, 158 82 C 166 42, 198 48, 212 86 C 224 118, 246 112, 254 78 C 264 38, 300 50, 314 92 C 322 120, 346 116, 362 84";

interface SignatureStrokeProps {
  theme?: Tokens;
  path?: string;
  color?: string;
  strokeWidth?: number;
  drawSeconds?: number;
  delaySeconds?: number;
  width?: number;
  height?: number;
  viewBox?: string;
}

export const SignatureStroke: React.FC<SignatureStrokeProps> = ({
  theme = baseTokens,
  path = DEFAULT_PATH,
  color,
  strokeWidth = 5,
  drawSeconds = 1.4,
  delaySeconds = 0,
  width = 380,
  height = 132,
  viewBox = "0 0 374 132",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const progress = interpolate(t, [delaySeconds, delaySeconds + drawSeconds], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeSignature,
  });
  const ink = color ?? theme.color.primary;

  return (
    <svg width={width} height={height} viewBox={viewBox} fill="none" style={{ overflow: "visible" }}>
      <path
        d={path}
        stroke={ink}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={1 - progress}
      />
    </svg>
  );
};
