// OTP verification beat: the signer's phone shows a one-time-passcode screen that
// fills in and resolves; a side panel states the identity guarantee.
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Tokens } from "../../tokens";
import { PhoneMockup } from "../../components/PhoneMockup";
import { OTPInput } from "../../components/OTPInput";
import { VerificationBadge } from "../../components/VerificationBadge";
import { SceneCaption } from "../SceneCaption";
import { useEntrance } from "../../hooks/useEntrance";

interface OtpSceneProps {
  theme: Tokens;
  phoneHint?: string;
  otp?: string;
  headline?: string;
  verifiedLabel?: string;
  caption?: string;
}

const LockGlyph: React.FC<{ color: string; size?: number }> = ({ color, size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11 V7 a4 4 0 0 1 8 0 v4" />
  </svg>
);

export const OtpScene: React.FC<OtpSceneProps> = ({
  theme,
  phoneHint = "+1 ••• 4821",
  otp = "284913",
  headline = "One code. One signer.",
  verifiedLabel = "Identity verified",
  caption,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const head = useEntrance({ delaySeconds: 0.5 });
  const screen = useEntrance({ delaySeconds: 0.55, distance: 16 });
  // dim the phone's prompt once verified, to focus the side confirmation
  const verifiedGlow = interpolate(t, [3.0, 3.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 104 }}>
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
                boxShadow: `0 0 ${24 * verifiedGlow}px ${theme.color.success}55`,
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
              <OTPInput theme={theme} code={otp} revealStartSeconds={1.1} stepSeconds={0.16} verifiedAtSeconds={2.9} boxWidth={44} boxHeight={56} gap={9} />
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ color: theme.color.textMuted, fontSize: 15 }}>Resend code</div>
          </div>
        </PhoneMockup>

        <div style={{ display: "flex", flexDirection: "column", gap: 34, alignItems: "flex-start", maxWidth: 460, fontFamily: theme.type.family }}>
          <div
            style={{
              color: theme.color.textMuted,
              fontSize: theme.type.size.eyebrow,
              fontWeight: theme.type.weight.label,
              letterSpacing: theme.type.tracking.eyebrow,
              textTransform: "uppercase",
              opacity: head.opacity,
              transform: head.transform,
            }}
          >
            One-time passcode
          </div>
          <div
            style={{
              opacity: head.opacity,
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
          <VerificationBadge theme={theme} layout="inline" label={verifiedLabel} sublabel="Passcode confirmed · timestamped" size={60} delaySeconds={3.1} tone="success" />
        </div>
      </div>
      {caption && <SceneCaption theme={theme} text={caption} position="bottom" />}
    </AbsoluteFill>
  );
};
