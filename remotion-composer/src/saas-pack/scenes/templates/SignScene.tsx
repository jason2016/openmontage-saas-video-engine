// Sign beat: the signer's phone (doc + drawn signature) next to identity (OTP)
// resolving to a verified badge.
import { AbsoluteFill } from "remotion";
import { Tokens } from "../../tokens";
import { PhoneMockup } from "../../components/PhoneMockup";
import { PDFViewer } from "../../components/PDFViewer";
import { SignatureStroke } from "../../components/SignatureStroke";
import { OTPInput } from "../../components/OTPInput";
import { VerificationBadge } from "../../components/VerificationBadge";
import { SceneCaption } from "../SceneCaption";

interface SignSceneProps {
  theme: Tokens;
  docTitle?: string;
  otp?: string;
  caption?: string;
  verifiedLabel?: string;
}

export const SignScene: React.FC<SignSceneProps> = ({
  theme,
  docTitle = "Agreement",
  otp = "284913",
  caption,
  verifiedLabel = "Identity verified",
}) => (
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 96 }}>
      <PhoneMockup theme={theme} width={430}>
        <PDFViewer
          theme={theme}
          title={docTitle}
          lines={6}
          compact
          fill
          signatureLabel="Sign here"
          signed={<SignatureStroke theme={theme} width={232} height={48} drawSeconds={1.3} delaySeconds={0.7} strokeWidth={4} />}
        />
      </PhoneMockup>
      <div style={{ display: "flex", flexDirection: "column", gap: 40, alignItems: "flex-start" }}>
        <div style={{ color: theme.color.textMuted, fontSize: 20, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: theme.type.family }}>
          One-time passcode
        </div>
        <OTPInput theme={theme} code={otp} revealStartSeconds={1.7} verifiedAtSeconds={3.1} boxWidth={66} boxHeight={80} gap={12} />
        <VerificationBadge theme={theme} layout="inline" label={verifiedLabel} sublabel="One-time passcode confirmed" size={58} delaySeconds={3.2} tone="success" />
      </div>
    </div>
    {caption && <SceneCaption theme={theme} text={caption} position="bottom" />}
  </AbsoluteFill>
);
