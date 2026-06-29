// v5.1.2 anti-shimmer fix for the OTP beat.
//
// Root cause (see OtpSceneV51): the PhoneMockup — and therefore the OTP cells,
// digits and borders inside it — lived in the camera STAGE, so it inherited the OTP
// scene's "push" camera transform: scale(1 + 0.038*g), a CONTINUOUSLY-CHANGING scale
// whose settle window (0.46 * 168 = ~77 frames ≈ 2.58 s) fully overlaps the window in
// which the digits become readable (reveal 1.1 s, last digit 1.9 s). On top of that
// each digit entered with a spring scale(pop) (overshoot) and the lock icon ran an
// animated box-shadow glow. Three stacked subpixel re-rasterization sources on the
// six boxes => the reported jitter.
//
// The fix — same proven principle as the approved v5.1 typography fix and the v5.1.1
// mobile-document fix (scale exactly 1 + integer-pixel position = no subpixel
// re-rasterization):
//
//   1. The visible phone is rendered in the static OVERLAY layer, never the camera
//      stage, so it never inherits the camera scale/pan. The stage keeps only an
//      empty, opacity-0 phone of the same width so the centered flex row is
//      byte-identical to v5.1. (PhoneMockup keeps its approved entrance, which settles
//      to scale exactly 1 / integer Y by ~0.6 s — before the digits read at 1.1 s.)
//   2. The OTP input is OTPInputStable: opacity-only digit entry (no scale pop),
//      integer border-box cell geometry, and a discrete static "verified" glow.
//   3. The "Identity verified" badge is moved to the overlay too, so its label/icon
//      never ride the camera; it settles to static after its entrance.
//   4. The lock-icon glow is a discrete step to its final static value at the verify
//      moment — no animated box-shadow.
//
// Nothing else changes: copy, colors, timing, layout and the product UI are preserved
// verbatim from v5.1. Layout stays visually identical to approved v5.1 / v5.1.1.
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Tokens } from "../tokens";
import { PhoneMockup } from "../components/PhoneMockup";
import { OTPInputStable } from "./OTPInputStable";
import { VerificationBadge } from "../components/VerificationBadge";
import { useEntrance } from "../hooks/useEntrance";
import { useSnapEntrance } from "../v51/snap";

type Layer = "stage" | "overlay";

interface Props {
  theme: Tokens;
  layer: Layer;
  phoneHint?: string;
  otp?: string;
  headline?: string;
  verifiedLabel?: string;
}

const LockGlyph: React.FC<{ color: string; size?: number }> = ({ color, size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11 V7 a4 4 0 0 1 8 0 v4" />
  </svg>
);

export const OtpSceneV512: React.FC<Props> = ({
  theme,
  layer,
  phoneHint = "+1 ••• 4821",
  otp = "284913",
  headline = "One code. One signer.",
  verifiedLabel = "Identity verified",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const head = useSnapEntrance({ delaySeconds: 0.5 });
  const screen = useEntrance({ delaySeconds: 0.55, distance: 16 });
  const isStage = layer === "stage";
  // OTP resolves to verified at 2.9 s (matches OTPInputStable verifiedAtSeconds).
  // The lock glow is a DISCRETE step to its final static value — never an animated
  // box-shadow blur ramp.
  const verified = t >= 2.9;

  // The REAL phone lives in the static overlay (never camera-transformed). The stage
  // carries only an empty, opacity-0 phone of the same width so the centered flex row
  // keeps the exact v5.1 geometry in both layers.
  const realPhone = (
    <PhoneMockup theme={theme} width={398}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          padding: "92px 34px 40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontFamily: theme.type.family,
          opacity: screen.opacity,
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: `${theme.color.primary}1f`,
            border: `1px solid ${theme.color.primary}44`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: verified ? `0 0 24px ${theme.color.success}55` : "none",
          }}
        >
          <LockGlyph color={theme.color.primaryBright} />
        </div>
        <div style={{ marginTop: 26, color: theme.color.textPrimary, fontSize: 26, fontWeight: 600 }}>Verify it's you</div>
        <div style={{ marginTop: 10, color: theme.color.textMuted, fontSize: 16, textAlign: "center", lineHeight: 1.4 }}>
          Enter the code sent to
          <br />
          <span style={{ color: theme.color.textSecondary, fontFamily: theme.type.mono }}>{phoneHint}</span>
        </div>
        <div style={{ marginTop: 34 }}>
          <OTPInputStable theme={theme} code={otp} revealStartSeconds={1.1} stepSeconds={0.16} verifiedAtSeconds={2.9} boxWidth={47} boxHeight={59} gap={9} />
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ color: theme.color.textMuted, fontSize: 15 }}>Resend code</div>
      </div>
    </PhoneMockup>
  );

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 104 }}>
        {isStage ? (
          <div style={{ opacity: 0 }}>
            <PhoneMockup theme={theme} width={398} />
          </div>
        ) : (
          realPhone
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 34, alignItems: "flex-start", maxWidth: 460, fontFamily: theme.type.family }}>
          <div
            style={{
              color: theme.color.textMuted,
              fontSize: theme.type.size.eyebrow,
              fontWeight: theme.type.weight.label,
              letterSpacing: theme.type.tracking.eyebrow,
              textTransform: "uppercase",
              opacity: isStage ? 0 : head.opacity,
              transform: head.transform,
            }}
          >
            One-time passcode
          </div>
          <div
            style={{
              opacity: isStage ? 0 : head.opacity,
              transform: head.transform,
              color: theme.color.textPrimary,
              fontSize: theme.type.size.h2,
              fontWeight: theme.type.weight.heading,
              letterSpacing: theme.type.tracking.heading,
              lineHeight: 1.1,
            }}
          >
            {headline}
          </div>
          <div style={{ opacity: isStage ? 0 : 1 }}>
            <VerificationBadge theme={theme} layout="inline" label={verifiedLabel} sublabel="Passcode confirmed · timestamped" size={60} delaySeconds={3.1} tone="success" />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
