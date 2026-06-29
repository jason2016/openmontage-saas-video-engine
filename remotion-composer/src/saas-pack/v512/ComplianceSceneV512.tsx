// v5.1.2 anti-shimmer fix for the COMPLIANCE / AES eIDAS beat.
//
// Root cause (see ComplianceSceneV51): the eyebrow/headline/subtitle were already on the
// static overlay since v5.1, but the row of four standard chips still lived in the camera
// STAGE (camera "pull" — scale 1.04→1 changing until the ~2.58 s settle) and each chip
// entered through GlassCard's useEntrance scale(0.98→1)+translateY. So the chip text —
// "AES", "eIDAS", "SHA-256", "OTP 2FA" and the sub-labels — rode the camera scale and the
// per-chip entrance scale and shimmered.
//
// The fix mirrors OTP/Audit/Invite: the visible chips are rendered on the static OVERLAY
// (StableChip — opacity-only entrance, integer geometry, scale exactly 1, no camera). The
// STAGE keeps an opacity-0 parity chip row so the centered flex column keeps the exact
// v5.1 geometry. Chip geometry, copy, colors, the reveal cadence and scene order are
// unchanged; chips have no perpetual internal motion, so once revealed they are static.
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { tokens as baseTokens, Tokens } from "../tokens";
import { useSnapEntrance } from "../v51/snap";

type Layer = "stage" | "overlay";

interface Standard {
  label: string;
  sub?: string;
}

interface Props {
  theme: Tokens;
  layer: Layer;
  eyebrow?: string;
  headline?: string;
  subtitle?: string;
  standards?: Standard[];
}

const DEFAULT_STANDARDS: Standard[] = [
  { label: "AES", sub: "Advanced e-signature" },
  { label: "eIDAS", sub: "EU regulation" },
  { label: "SHA-256", sub: "Document hash" },
  { label: "OTP 2FA", sub: "Identity proof" },
];

const ShieldCheck: React.FC<{ color: string; size?: number }> = ({ color, size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3 l7 3 v5 c0 4.5 -3 7.5 -7 9 c-4 -1.5 -7 -4.5 -7 -9 V6 z" />
    <path d="M9 12 l2 2 l4 -4" />
  </svg>
);

// Stable twin of the v5.1 Chip (GlassCard padding=0, width 234, radiusCard, 1px hairline).
// Opacity-only entrance; scale exactly 1; integer geometry. No transform after reveal =>
// once opacity reaches 1 the chip is pixel-identical frame to frame.
const StableChip: React.FC<{ theme: Tokens; std: Standard; delay: number; fadeSeconds?: number }> = ({ theme, std, delay, fadeSeconds = 0.4 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const opacity = interpolate(t, [delay, delay + fadeSeconds], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div
      style={{
        width: 234,
        boxSizing: "border-box",
        opacity,
        background: theme.color.glassFill,
        border: `${theme.space.hairline}px solid ${theme.color.hairline}`,
        borderRadius: theme.space.radiusCard,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
      }}
    >
      <div style={{ padding: "26px 26px", display: "flex", flexDirection: "column", gap: 12, fontFamily: theme.type.family }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            boxSizing: "border-box",
            background: `${theme.color.success}1a`,
            border: `1px solid ${theme.color.success}44`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ShieldCheck color={theme.color.successBright} size={24} />
        </div>
        <div style={{ color: theme.color.textPrimary, fontSize: 28, fontWeight: 700, letterSpacing: "-0.01em" }}>{std.label}</div>
        {std.sub && <div style={{ color: theme.color.textMuted, fontSize: 16 }}>{std.sub}</div>}
      </div>
    </div>
  );
};

export const ComplianceSceneV512: React.FC<Props> = ({
  theme,
  layer,
  eyebrow = "Compliance",
  headline = "AES eIDAS ready.",
  subtitle = "Advanced electronic signatures, aligned to EU eIDAS — built in, not bolted on.",
  standards = DEFAULT_STANDARDS,
}) => {
  const eEyebrow = useSnapEntrance({ delaySeconds: 0.3 });
  const head = useSnapEntrance({ delaySeconds: 0.42 });
  const sub = useSnapEntrance({ delaySeconds: 0.56 });
  const isStage = layer === "stage";
  const tOpacity = (e: number) => (isStage ? 0 : e);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 80 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 22, maxWidth: 1180, fontFamily: theme.type.family }}>
        <div
          style={{
            opacity: tOpacity(eEyebrow.opacity),
            transform: eEyebrow.transform,
            color: theme.color.primaryBright,
            fontSize: theme.type.size.eyebrow,
            fontWeight: theme.type.weight.label,
            letterSpacing: theme.type.tracking.eyebrow,
            textTransform: "uppercase",
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            opacity: tOpacity(head.opacity),
            transform: head.transform,
            color: theme.color.textPrimary,
            fontSize: theme.type.size.h1,
            fontWeight: theme.type.weight.display,
            letterSpacing: theme.type.tracking.display,
            lineHeight: 1.06,
          }}
        >
          {headline}
        </div>
        {subtitle && (
          <div style={{ opacity: tOpacity(sub.opacity), transform: sub.transform, color: theme.color.textSecondary, fontSize: theme.type.size.body, lineHeight: 1.45, maxWidth: 820 }}>
            {subtitle}
          </div>
        )}
        {/* Visible chips live on the overlay (no camera); the stage keeps an opacity-0
            parity chip row so the centered flex column geometry is byte-identical to v5.1. */}
        <div style={{ display: "flex", gap: 22, marginTop: 26, opacity: isStage ? 0 : 1 }}>
          {standards.map((s, i) => (
            <StableChip key={s.label} theme={theme} std={s} delay={0.8 + i * 0.12} />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
