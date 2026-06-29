// The real ClawShow "Convergence" mark, composited over the dark canvas.
// Premium reveal: scale-settle + a soft brand bloom + one emanating pulse ring
// from the central node ("where inputs converge"). Uses the real PNG brand asset
// shipped in public/brand/. Optional inline wordmark lockup.
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { tokens as baseTokens, Tokens } from "../tokens";

interface LogoProps {
  theme?: Tokens;
  size?: number;
  delaySeconds?: number;
  glow?: boolean;
  pulse?: boolean;
  src?: string;
  wordmark?: string;
  layout?: "mark" | "row";
}

export const Logo: React.FC<LogoProps> = ({
  theme = baseTokens,
  size = 200,
  delaySeconds = 0,
  glow = true,
  pulse = true,
  src = "brand/clawshow-logo.png",
  wordmark,
  layout = "mark",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps - delaySeconds;
  const appear = spring({ frame: Math.max(0, t * fps), fps, config: { damping: 18, stiffness: 105, mass: 1 }, from: 0.72, to: 1 });
  const opacity = interpolate(t, [0, 0.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pulseT = interpolate(t, [0.25, 1.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const wordOpacity = interpolate(t, [0.45, 0.9], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const mark = (
    <div style={{ position: "relative", width: size, height: size, opacity, transform: `scale(${appear})`, flexShrink: 0 }}>
      {glow && (
        <div
          style={{
            position: "absolute",
            inset: -size * 0.42,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${theme.color.primary}3a 0%, ${theme.color.primary}10 38%, transparent 66%)`,
            filter: "blur(6px)",
          }}
        />
      )}
      {pulse && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: size * 0.46,
            height: size * 0.46,
            marginLeft: -(size * 0.23),
            marginTop: -(size * 0.23),
            borderRadius: "50%",
            border: `2px solid ${theme.color.primaryBright}`,
            opacity: (1 - pulseT) * 0.55,
            transform: `scale(${0.55 + pulseT * 2.0})`,
          }}
        />
      )}
      <Img src={staticFile(src)} style={{ position: "relative", width: size, height: size, objectFit: "contain" }} />
    </div>
  );

  if (layout === "row" && wordmark) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: size * 0.26 }}>
        {mark}
        <div
          style={{
            opacity: wordOpacity,
            color: theme.color.textPrimary,
            fontSize: size * 0.5,
            fontWeight: theme.type.weight.heading,
            letterSpacing: theme.type.tracking.heading,
            fontFamily: theme.type.family,
          }}
        >
          {wordmark}
        </div>
      </div>
    );
  }
  return mark;
};
