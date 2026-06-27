// One-time-passcode boxes that fill in with a stagger, then resolve to a
// verified (success) state. Code length + value are props.
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { tokens as baseTokens, Tokens } from "../tokens";

interface OTPInputProps {
  theme?: Tokens;
  code?: string;
  revealStartSeconds?: number;
  stepSeconds?: number;
  verifiedAtSeconds?: number;
  boxWidth?: number;
  boxHeight?: number;
  gap?: number;
  accent?: string;
}

export const OTPInput: React.FC<OTPInputProps> = ({
  theme = baseTokens,
  code = "284913",
  revealStartSeconds = 0.3,
  stepSeconds = 0.16,
  verifiedAtSeconds,
  boxWidth = 78,
  boxHeight = 94,
  gap = 16,
  accent,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const acc = accent ?? theme.color.primary;
  const digits = code.split("");
  const lastReveal = revealStartSeconds + (digits.length - 1) * stepSeconds + 0.25;
  const verifyAt = verifiedAtSeconds ?? lastReveal + 0.3;
  const verified = t >= verifyAt;

  return (
    <div style={{ display: "flex", gap, fontFamily: theme.type.mono }}>
      {digits.map((d, i) => {
        const at = revealStartSeconds + i * stepSeconds;
        const filled = t >= at;
        const prevFilled = i === 0 || t >= revealStartSeconds + (i - 1) * stepSeconds;
        const isActive = !verified && !filled && prevFilled;
        const pop = spring({ frame: frame - at * fps, fps, config: { damping: 16, stiffness: 170 }, from: 0.6, to: 1 });
        const border = verified ? theme.color.success : filled || isActive ? acc : theme.color.hairline;
        return (
          <div
            key={i}
            style={{
              width: boxWidth,
              height: boxHeight,
              borderRadius: 14,
              border: `1.5px solid ${border}`,
              background: filled ? `${acc}10` : "rgba(255,255,255,0.03)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: theme.color.textPrimary,
              fontSize: 46,
              fontWeight: 600,
              boxShadow: verified ? `0 0 26px ${theme.color.success}30` : undefined,
            }}
          >
            {filled && <span style={{ transform: `scale(${pop})`, display: "inline-block" }}>{d}</span>}
          </div>
        );
      })}
    </div>
  );
};
