// v5.1 sign beat. Camera stage: the phone with the real auto-scrolling PDF, the
// signature stroke drawing, and the "Signé" stamp + Signed badge — all purposeful
// product motion preserved VERBATIM from v5. Overlay: eyebrow + headline + subtitle,
// lifted out of the camera transform and pixel-snapped. Hidden layer renders an empty
// same-width phone so the row layout is byte-identical.
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Tokens } from "../tokens";
import { PhoneMockup } from "../components/PhoneMockup";
import { PDFViewer } from "../components/PDFViewer";
import { ContractDocument } from "../components/ContractDocument";
import { SignatureStroke } from "../components/SignatureStroke";
import { VerificationBadge } from "../components/VerificationBadge";
import { useEntrance } from "../hooks/useEntrance";
import { easeSettle } from "../hooks/easings";
import { useSnapEntrance } from "./snap";

type Layer = "stage" | "overlay";

interface Props {
  theme: Tokens;
  layer: Layer;
  docTitle?: string;
  headline?: string;
  subtitle?: string;
  signedLabel?: string;
  contract?: boolean;
  autoscroll?: boolean;
}

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

export const SignSceneV51: React.FC<Props> = ({
  theme,
  layer,
  docTitle = "Service Agreement",
  headline = "Sign on any device.",
  subtitle = "Draw once. Bound everywhere — desktop, tablet or phone.",
  signedLabel = "Signed",
  contract = false,
  autoscroll = false,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const head = useSnapEntrance({ delaySeconds: 0.6 });
  const sub = useSnapEntrance({ delaySeconds: 0.78 });
  const isStage = layer === "stage";

  // --- v5 auto-scroll choreography (verbatim) ---
  const A = 190;
  const MAX = 372;
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
        {isStage ? (
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
        ) : (
          <div style={{ opacity: 0 }}>
            <PhoneMockup theme={theme} width={430} />
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 30, alignItems: "flex-start", maxWidth: 470, fontFamily: theme.type.family }}>
          <div
            style={{
              color: theme.color.primaryBright,
              fontSize: theme.type.size.eyebrow,
              fontWeight: theme.type.weight.label,
              letterSpacing: theme.type.tracking.eyebrow,
              textTransform: "uppercase",
              opacity: isStage ? 0 : head.opacity,
              transform: head.transform,
            }}
          >
            Electronic signature
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
          {subtitle && (
            <div style={{ opacity: isStage ? 0 : sub.opacity, transform: sub.transform, color: theme.color.textSecondary, fontSize: 25, lineHeight: 1.45 }}>
              {subtitle}
            </div>
          )}
          <div style={{ opacity: isStage ? badgeOpacity : 0 }}>
            <VerificationBadge theme={theme} layout="inline" label={signedLabel} sublabel="Bound to the verified signer" size={60} delaySeconds={badgeDelay} tone="success" />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
