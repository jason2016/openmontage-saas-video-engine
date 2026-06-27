// A click confirmation: a bright ring that expands past the target and fades,
// at a point (percent of parent). Tone tints it. Pairs with Cursor.
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { tokens as baseTokens, Tokens } from "../tokens";

interface MouseClickProps {
  theme?: Tokens;
  x: number;
  y: number;
  startSeconds?: number;
  tone?: "primary" | "success" | "neutral";
  size?: number;
}

export const MouseClick: React.FC<MouseClickProps> = ({
  theme = baseTokens,
  x,
  y,
  startSeconds = 0,
  tone = "primary",
  size = 120,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps - startSeconds;
  const duration = 0.6;
  const p = interpolate(t, [0, duration], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const visible = t >= 0 && t <= duration;
  const color =
    tone === "success"
      ? theme.color.successBright
      : tone === "neutral"
      ? theme.color.textSecondary
      : theme.color.primaryBright;
  const scale = 0.45 + p * 1.45; // expands beyond the target so the arc reads on dark
  const ringOpacity = visible ? (1 - p) * 0.9 : 0;
  const flashOpacity = visible ? (1 - p) * 0.28 : 0;

  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
        zIndex: 25,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: size,
          height: size,
          marginLeft: -size / 2,
          marginTop: -size / 2,
          borderRadius: "50%",
          border: `2.5px solid ${color}`,
          transform: `scale(${scale})`,
          opacity: ringOpacity,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: size * 0.5,
          height: size * 0.5,
          marginLeft: -size * 0.25,
          marginTop: -size * 0.25,
          borderRadius: "50%",
          background: color,
          opacity: flashOpacity,
          filter: "blur(6px)",
        }}
      />
    </div>
  );
};
