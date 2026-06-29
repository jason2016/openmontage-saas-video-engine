// v5.1.2 anti-shimmer fix for the INVITE beat.
//
// Root cause (see InviteSceneV51 + StatusFlow): the left text column was already on the
// static overlay since v5.1, but the right StatusFlow card still lived in the camera
// STAGE (camera "pan-left" — changing translate until the settle) and entered through
// useEntrance (translateY). So the card's readable text — "Invitation", "In progress",
// the document title, the four step labels/subs — rode the camera's changing transform
// and jittered.
//
// The fix mirrors OTP/Audit/Sign: the visible card is rendered on the static OVERLAY
// (StatusFlowStable — opacity-only card entrance, integer geometry, no camera). The STAGE
// keeps only an opacity-0 parity card so the shared centered flex row keeps the exact
// v5.1 geometry. The intentional live-status motion (spinner, connector fill, terminal
// pulse) is preserved verbatim inside StatusFlowStable. Copy, colors, timing, layout and
// scene order are unchanged.
import { AbsoluteFill } from "remotion";
import { Tokens } from "../tokens";
import { StatusFlowStable, FlowStep } from "./StatusFlowStable";
import { useSnapEntrance } from "../v51/snap";

type Layer = "stage" | "overlay";

interface Props {
  theme: Tokens;
  layer: Layer;
  eyebrow?: string;
  headline?: string;
  subtitle?: string;
  docTitle?: string;
  steps?: FlowStep[];
}

export const InviteSceneV512: React.FC<Props> = ({
  theme,
  layer,
  eyebrow = "Invitation",
  headline = "Sent in one click.",
  subtitle = "We email a secure, single-use signing link — and track every step until it's signed.",
  docTitle = "Contrat de prestation de services.pdf",
  steps,
}) => {
  const head = useSnapEntrance({ delaySeconds: 0.5 });
  const sub = useSnapEntrance({ delaySeconds: 0.68 });
  const isStage = layer === "stage";
  const tOpacity = (e: number) => (isStage ? 0 : e);

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 96 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 30, alignItems: "flex-start", maxWidth: 470, fontFamily: theme.type.family }}>
          <div
            style={{
              color: theme.color.primaryBright,
              fontSize: theme.type.size.eyebrow,
              fontWeight: theme.type.weight.label,
              letterSpacing: theme.type.tracking.eyebrow,
              textTransform: "uppercase",
              opacity: tOpacity(head.opacity),
              transform: head.transform,
            }}
          >
            {eyebrow}
          </div>
          <div
            style={{
              opacity: tOpacity(head.opacity),
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
            <div style={{ opacity: tOpacity(sub.opacity), transform: sub.transform, color: theme.color.textSecondary, fontSize: 25, lineHeight: 1.45 }}>
              {subtitle}
            </div>
          )}
        </div>

        {/* Visible card lives on the overlay (no camera); the stage keeps an opacity-0
            parity card so the centered flex row geometry is byte-identical to v5.1. */}
        <div style={{ opacity: isStage ? 0 : 1 }}>
          <StatusFlowStable theme={theme} steps={steps ?? DEFAULT_STEPS} docTitle={docTitle} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// StatusFlowStable requires `steps`; the v5 props always supply them, but keep a safe
// default identical to the approved invite flow (clawshow-esign-v5.json) so the parity
// twin never throws and matches the master byte-for-byte if ever rendered without props.
const DEFAULT_STEPS: FlowStep[] = [
  { label: "Preparing invitation", sub: "Generating secure signing link", icon: "spark" },
  { label: "Email sent", sub: "To demo-client@example.com", icon: "mail" },
  { label: "Signer inbox", sub: "Delivered · message opened", icon: "inbox" },
  { label: "Awaiting signature", sub: "Single-use link · expires in 7 days", icon: "clock" },
];
