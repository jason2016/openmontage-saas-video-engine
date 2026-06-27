// Quiet status confirmation. Slides in from the edge + fades; optional auto-
// dismiss. Token-driven; tone tints the icon chip. Text is a prop.
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { tokens as baseTokens, Tokens } from "../tokens";
import { easeSettle } from "../hooks/easings";

type ToastIcon = "check" | "lock" | "mail" | "upload" | "none";
type Corner = "top-right" | "bottom-right" | "top-left" | "bottom-left";

interface NotificationToastProps {
  theme?: Tokens;
  text: string;
  icon?: ToastIcon;
  tone?: "primary" | "success" | "neutral";
  position?: Corner;
  delaySeconds?: number;
  holdSeconds?: number;
  width?: number;
}

const Glyph: React.FC<{ name: ToastIcon; color: string; size?: number }> = ({ name, color, size = 18 }) => {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: 2.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (name === "check") return <svg {...common}><path d="M20 6 L9 17 L4 12" /></svg>;
  if (name === "lock") return <svg {...common}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11 V7 a4 4 0 0 1 8 0 v4" /></svg>;
  if (name === "mail") return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7 l9 6 l9 -6" /></svg>;
  if (name === "upload") return <svg {...common}><path d="M12 16 V4" /><path d="M7 9 l5 -5 l5 5" /><path d="M5 20 h14" /></svg>;
  return null;
};

export const NotificationToast: React.FC<NotificationToastProps> = ({
  theme = baseTokens,
  text,
  icon = "check",
  tone = "success",
  position = "top-right",
  delaySeconds = 0,
  holdSeconds = 6,
  width = 360,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps - delaySeconds;
  const inP = interpolate(t, [0, 0.45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeSettle });
  const outP = interpolate(t, [holdSeconds, holdSeconds + 0.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = inP * (1 - outP);

  const right = position.includes("right");
  const top = position.includes("top");
  const dx = (1 - inP) * (right ? 44 : -44);
  const color = tone === "success" ? theme.color.success : tone === "primary" ? theme.color.primary : theme.color.textSecondary;
  const inset = Math.round(theme.space.safeInset * 0.55);

  const posStyle: React.CSSProperties = {
    position: "absolute",
    ...(right ? { right: inset } : { left: inset }),
    ...(top ? { top: inset } : { bottom: inset }),
  };

  return (
    <div style={{ ...posStyle, transform: `translateX(${dx}px)`, opacity, width, zIndex: 40, fontFamily: theme.type.family }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "16px 20px",
          borderRadius: 14,
          background: "rgba(17,24,39,0.72)",
          border: `1px solid ${theme.color.hairline}`,
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.45)",
        }}
      >
        {icon !== "none" && (
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: `${color}22`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Glyph name={icon} color={color} />
          </div>
        )}
        <div style={{ color: theme.color.textPrimary, fontSize: 19, fontWeight: 500 }}>{text}</div>
      </div>
    </div>
  );
};
