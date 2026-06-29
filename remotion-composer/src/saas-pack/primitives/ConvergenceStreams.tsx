// On-brand atmospheric motif: faint streams of light drawing inward to a central
// node — an abstract echo of the ClawShow mark ("where inputs converge into
// instant backend"). Pure SVG, token-colored. Subtle by design; used behind brand
// moments and as connective tissue, never competing with the real logo.
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { tokens as baseTokens, Tokens } from "../tokens";
import { easeSettle } from "../hooks/easings";

interface ConvergenceStreamsProps {
  theme?: Tokens;
  delaySeconds?: number;
  opacity?: number;
  count?: number;
  drawSeconds?: number;
  // Render the central node + ring. Off by default: when a real logo sits at the
  // optical center, the node reads as a stray dot. Keep streams; drop the node.
  node?: boolean;
}

export const ConvergenceStreams: React.FC<ConvergenceStreamsProps> = ({
  theme = baseTokens,
  delaySeconds = 0,
  opacity = 0.4,
  count = 14,
  drawSeconds = 1.5,
  node = false,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps - delaySeconds;
  const cx = width / 2;
  const cy = height / 2;
  const draw = interpolate(t, [0, drawSeconds], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeSettle });
  // gentle continuous shimmer after the draw resolves
  const shimmer = 0.85 + 0.15 * Math.sin((frame / fps) * 0.8);
  const R = Math.max(width, height) * 0.62;

  return (
    <AbsoluteFill style={{ opacity: opacity * draw }}>
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="cv-fade" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={theme.color.primaryBright} stopOpacity="0.85" />
            <stop offset="55%" stopColor={theme.color.primary} stopOpacity="0.35" />
            <stop offset="100%" stopColor={theme.color.primary} stopOpacity="0" />
          </radialGradient>
        </defs>
        {Array.from({ length: count }).map((_, i) => {
          const ang = (i / count) * Math.PI * 2 + 0.35;
          const ox = cx + Math.cos(ang) * R;
          const oy = cy + Math.sin(ang) * R;
          // inner tip travels toward the center as the motif draws in
          const ix = cx + (ox - cx) * (1 - draw);
          const iy = cy + (oy - cy) * (1 - draw);
          return (
            <line
              key={i}
              x1={ox}
              y1={oy}
              x2={ix}
              y2={iy}
              stroke="url(#cv-fade)"
              strokeWidth={1.6}
              strokeLinecap="round"
              opacity={shimmer}
            />
          );
        })}
        {node && (
          <>
            <circle cx={cx} cy={cy} r={5 + draw * 5} fill={theme.color.primaryBright} opacity={draw * 0.9} />
            <circle cx={cx} cy={cy} r={(5 + draw * 5) * 2.6} fill="none" stroke={theme.color.primary} strokeWidth={1} opacity={draw * 0.3} />
          </>
        )}
      </svg>
    </AbsoluteFill>
  );
};
