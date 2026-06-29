// Electronic-signature beat: the signer's phone holds the document; the signature
// draws on inside the field; a "Signed" stamp settles. In v5 (autoscroll) the page
// behaves like a real PDF — it scrolls from the first page through the articles to
// the signature area, the signature draws, and a "Signé" stamp lands. Identity
// (OTP) is its own prior beat, so this scene stays focused on the act of signing.
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Tokens } from "../../tokens";
import { PhoneMockup } from "../../components/PhoneMockup";
import { PDFViewer } from "../../components/PDFViewer";
import { ContractDocument } from "../../components/ContractDocument";
import { SignatureStroke } from "../../components/SignatureStroke";
import { VerificationBadge } from "../../components/VerificationBadge";
import { SceneCaption } from "../SceneCaption";
import { useEntrance } from "../../hooks/useEntrance";
import { easeSettle } from "../../hooks/easings";

interface SignSceneProps {
  theme: Tokens;
  docTitle?: string;
  headline?: string;
  subtitle?: string;
  signedLabel?: string;
  caption?: string;
  // Opt-in (v4): render the real anonymized contract page on the phone.
  contract?: boolean;
  // Opt-in (v5): auto-scroll the page like a real PDF before signing.
  autoscroll?: boolean;
}

// A "Signé" confirmation stamp that pops onto the signature field after the stroke.
const SignedStamp: React.FC<{ theme: Tokens; delaySeconds: number }> = ({ theme, delaySeconds }) => {
  const e = useEntrance({ delaySeconds, distance: 0, fromScale: 0.7 });
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: 999,
        background: `${theme.color.success}1f`,
        border: `1px solid ${theme.color.success}66`,
        color: "#15803D",
        fontSize: 12.5,
        fontWeight: 700,
        opacity: e.opacity,
        transform: `scale(${e.scale})`,
      }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#15803D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 L9 17 L4 12" /></svg>
      Signé
    </div>
  );
};

export const SignScene: React.FC<SignSceneProps> = ({
  theme,
  docTitle = "Service Agreement",
  headline = "Sign on any device.",
  subtitle = "Draw once. Bound everywhere — desktop, tablet or phone.",
  signedLabel = "Signed",
  caption,
  contract = false,
  autoscroll = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const head = useEntrance({ delaySeconds: 0.6 });
  const sub = useEntrance({ delaySeconds: 0.78 });

  // --- v5 auto-scroll choreography ---
  // Content is bottom-anchored in a ~1140px page; viewport ≈ 770px → max scroll ≈ 370.
  const A = 190; // first stop: parties / Article 1 in view
  const MAX = 372; // final stop: signature area bottom-aligned
  const scroll = interpolate(t, [0.8, 2.0, 2.6, 4.0], [0, A, A, MAX], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeSettle });
  const scrollFrac = scroll / MAX;
  const strokeDelay = 4.25;
  const badgeDelay = autoscroll ? 6.0 : 2.7;
  const badgeOpacity = autoscroll ? interpolate(t, [badgeDelay - 0.1, badgeDelay + 0.3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;

  const scrollStroke = <SignatureStroke theme={theme} width={250} height={54} drawSeconds={1.5} delaySeconds={strokeDelay} strokeWidth={4} color={theme.color.primary} />;
  const pinnedStroke = <SignatureStroke theme={theme} width={300} height={56} drawSeconds={1.5} delaySeconds={1.0} strokeWidth={4} color={theme.color.primary} />;

  let document: React.ReactNode = undefined;
  if (contract && autoscroll) {
    document = <ContractDocument theme={theme} variant="mobile" scroll={scroll} scrollFrac={scrollFrac} signed={scrollStroke} stamp={<SignedStamp theme={theme} delaySeconds={strokeDelay + 1.45} />} />;
  } else if (contract) {
    document = <ContractDocument theme={theme} variant="mobile" signed={pinnedStroke} />;
  }

  return (
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
            paper={contract ? "#FFFFFF" : undefined}
            signed={<SignatureStroke theme={theme} width={236} height={50} drawSeconds={1.5} delaySeconds={1.0} strokeWidth={4} color={theme.color.primary} />}
            document={document}
          />
        </PhoneMockup>

        <div style={{ display: "flex", flexDirection: "column", gap: 30, alignItems: "flex-start", maxWidth: 470, fontFamily: theme.type.family }}>
          <div
            style={{
              color: theme.color.primaryBright,
              fontSize: theme.type.size.eyebrow,
              fontWeight: theme.type.weight.label,
              letterSpacing: theme.type.tracking.eyebrow,
              textTransform: "uppercase",
              opacity: head.opacity,
              transform: head.transform,
            }}
          >
            Electronic signature
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
          {subtitle && (
            <div style={{ opacity: sub.opacity, transform: sub.transform, color: theme.color.textSecondary, fontSize: 25, lineHeight: 1.45 }}>
              {subtitle}
            </div>
          )}
          <div style={{ opacity: badgeOpacity }}>
            <VerificationBadge theme={theme} layout="inline" label={signedLabel} sublabel="Bound to the verified signer" size={60} delaySeconds={badgeDelay} tone="success" />
          </div>
        </div>
      </div>
      {caption && <SceneCaption theme={theme} text={caption} position="bottom" />}
    </AbsoluteFill>
  );
};
