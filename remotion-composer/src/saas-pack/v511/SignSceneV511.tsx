// v5.1.1 mobile-document anti-shimmer fix for the SIGN beat.
//
// Root cause (see SignSceneV51): the phone — and therefore the real-DOM contract
// text inside it — lived in the camera STAGE, so it inherited the pan-right camera
// transform (constant non-integer scale 1.03 + fractional translateX every frame),
// AND the PDF auto-scroll translated the document by a FRACTIONAL number of pixels.
// Three stacked subpixel re-rasterization sources on one text surface => the jitter.
//
// The fix — same proven principle as the approved v5.1 scene-level typography fix
// (scale exactly 1 + integer-pixel translation = no subpixel re-rasterization):
//
//   1. The phone is rendered in the static OVERLAY layer, NOT the camera stage. It
//      therefore never inherits the camera scale/pan. The stage keeps only an empty,
//      opacity-0 phone so the centered flex-row layout is byte-identical to v5.1.
//      (The PhoneMockup KEEPS its approved entrance, which settles to scale exactly 1
//      and integer Y by ~0.6s — before the readable scroll begins at 0.8s.)
//
//   2. The PDF scroll offset is snapped to whole pixels: Math.round(scroll). The
//      document surface is never scaled (its internal `s` sizing is constant, not an
//      animated transform), so an integer translateY at DPR 1 lands every glyph on the
//      same subpixel grid each frame — the text shifts cleanly without shimmering.
//
// Nothing else changes: copy, colors, timing, the document content, the auto-scroll
// choreography, the signature draw, the "Signé" stamp and the Signed badge are all
// preserved verbatim from v5.1. Layout stays visually identical to approved v5.1.
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Tokens } from "../tokens";
import { PhoneMockup } from "../components/PhoneMockup";
import { PDFViewer } from "../components/PDFViewer";
import { ContractDocument } from "../components/ContractDocument";
import { SignatureStroke } from "../components/SignatureStroke";
import { VerificationBadge } from "../components/VerificationBadge";
import { useEntrance } from "../hooks/useEntrance";
import { easeSettle } from "../hooks/easings";
import { useSnapEntrance } from "../v51/snap";

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

export const SignSceneV511: React.FC<Props> = ({
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

  // --- v5 auto-scroll choreography (verbatim) — but snapped to whole pixels. ---
  const A = 190;
  const MAX = 372;
  const scrollRaw = interpolate(t, [0.8, 2.0, 2.6, 4.0], [0, A, A, MAX], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeSettle });
  // INTEGER-PIXEL SCROLL: the document text only ever translates by whole pixels, so
  // glyph edges never cross a subpixel boundary between frames -> no shimmer.
  const scroll = Math.round(scrollRaw);
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

  // The REAL phone lives in the static overlay (never camera-transformed). The stage
  // carries only an empty, opacity-0 phone of the same width so the centered flex row
  // keeps the exact v5.1 geometry in both layers.
  const realPhone = (
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
  );

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 96 }}>
        {isStage ? (
          <div style={{ opacity: 0 }}>
            <PhoneMockup theme={theme} width={430} />
          </div>
        ) : (
          realPhone
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
          <div style={{ opacity: isStage ? 0 : badgeOpacity }}>
            <VerificationBadge theme={theme} layout="inline" label={signedLabel} sublabel="Bound to the verified signer" size={60} delaySeconds={badgeDelay} tone="success" />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
