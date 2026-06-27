// The trust stamp: a medallion whose ring draws, check strokes on, and settles
// with one soft overshoot. Label + sublabel are props. stack or inline layout.
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { tokens as baseTokens, Tokens } from "../tokens";
import { easeSettle } from "../hooks/easings";

interface VerificationBadgeProps {
  theme?: Tokens;
  label?: string;
  sublabel?: string;
  state?: "verifying" | "verified";
  size?: number;
  delaySeconds?: number;
  layout?: "stack" | "inline";
  tone?: "success" | "primary";
}

export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  theme = baseTokens,
  label = "Verified",
  sublabel,
  state = "verified",
  size = 104,
  delaySeconds = 0,
  layout = "stack",
  tone = "success",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps - delaySeconds;
  const color = tone === "success" ? theme.color.success : theme.color.primary;
  const bright = tone === "success" ? theme.color.successBright : theme.color.primaryBright;
  const verifying = state === "verifying";

  const ring = interpolate(t, [0, 0.55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeSettle });
  const check = interpolate(t, [0.42, 0.85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeSettle });
  const pop = spring({ frame: Math.max(0, t * fps), fps, config: { damping: 9, stiffness: 140, mass: 0.8 }, from: 0.6, to: 1 });
  const labelOpacity = interpolate(t, [0.5, 0.9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const r = size / 2 - 5;
  const cx = size / 2;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: layout === "stack" ? "column" : "row",
        alignItems: "center",
        gap: layout === "stack" ? 16 : 18,
        fontFamily: theme.type.family,
      }}
    >
      <div style={{ width: size, height: size, transform: `scale(${pop})` }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={cx} cy={cx} r={r} fill={`${color}1a`} stroke={`${color}55`} strokeWidth={2} />
          <circle
            cx={cx}
            cy={cx}
            r={r}
            fill="none"
            stroke={bright}
            strokeWidth={3}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - ring}
            transform={`rotate(-90 ${cx} ${cx})`}
          />
          {!verifying && (
            <path
              d={`M ${size * 0.31} ${size * 0.52} L ${size * 0.44} ${size * 0.65} L ${size * 0.69} ${size * 0.37}`}
              fill="none"
              stroke={bright}
              strokeWidth={size * 0.06}
              strokeLinecap="round"
              strokeLinejoin="round"
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - check}
            />
          )}
        </svg>
      </div>
      {(label || sublabel) && (
        <div style={{ opacity: labelOpacity, textAlign: layout === "stack" ? "center" : "left" }}>
          {label && <div style={{ color: bright, fontSize: 24, fontWeight: 600, letterSpacing: "0.01em" }}>{label}</div>}
          {sublabel && <div style={{ color: theme.color.textMuted, fontSize: 16, marginTop: 5 }}>{sublabel}</div>}
        </div>
      )}
    </div>
  );
};
