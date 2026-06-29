// v5.1.2 anti-shimmer OTP input — the stable twin of OTPInput.
//
// Root cause it removes (see OTPInput): every digit entered with a spring
// `scale(pop)` (0.6 -> 1, underdamped => overshoot), so each glyph was being
// re-rasterized at a changing fractional scale during its entry — and the whole row
// ALSO rode the OTP scene's "push" camera scale(). Stacked subpixel re-rasterization.
//
// This component is designed to live on the STATIC overlay (scale exactly 1, no
// camera). On top of that it removes every per-cell motion:
//   • Digit entry is OPACITY ONLY — no scale, no spring, no translate. It ends at
//     exactly opacity 1, after which the glyph is pixel-identical frame to frame.
//   • Integer cell geometry via box-sizing: border-box. The OUTER box size is kept
//     byte-identical to v5.1.1 (44x56 content + 1.5px border = 47x59 outer), so the
//     six-cell row width (6*47 + 5*9 = 327) and every box centre are unchanged — the
//     only delta is the border resolves to an integer 2px instead of 1.5px.
//   • The "verified" green state is a DISCRETE step (border colour + one static final
//     glow). No border-width animation, no animated box-shadow, no continuous pulse.
// Deterministic on useCurrentFrame(): no CSS transition/animation, no rAF, no Date.now().
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { tokens as baseTokens, Tokens } from "../tokens";

interface OTPInputStableProps {
  theme?: Tokens;
  code?: string;
  revealStartSeconds?: number;
  stepSeconds?: number;
  verifiedAtSeconds?: number;
  boxWidth?: number; // OUTER width (border-box)
  boxHeight?: number; // OUTER height (border-box)
  gap?: number;
  accent?: string;
  fadeSeconds?: number;
}

export const OTPInputStable: React.FC<OTPInputStableProps> = ({
  theme = baseTokens,
  code = "284913",
  revealStartSeconds = 0.3,
  stepSeconds = 0.16,
  verifiedAtSeconds,
  boxWidth = 47,
  boxHeight = 59,
  gap = 9,
  accent,
  fadeSeconds = 0.18,
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
        // OPACITY ONLY — no scale, no spring, no translate; ends at exactly 1.
        const digitOpacity = interpolate(t, [at, at + fadeSeconds], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const border = verified ? theme.color.success : filled || isActive ? acc : theme.color.hairline;
        return (
          <div
            key={i}
            style={{
              boxSizing: "border-box",
              width: boxWidth,
              height: boxHeight,
              borderRadius: 14,
              border: `2px solid ${border}`, // integer width; geometry never animates
              background: filled ? `${acc}10` : "rgba(255,255,255,0.03)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: theme.color.textPrimary,
              fontSize: 46,
              fontWeight: 600,
              // discrete static glow once verified — NOT animated, NO pulse.
              boxShadow: verified ? `0 0 26px ${theme.color.success}30` : undefined,
            }}
          >
            <span style={{ opacity: digitOpacity, display: "inline-block" }}>{d}</span>
          </div>
        );
      })}
    </div>
  );
};
