// v5.1 invitation beat — same as v5 InviteScene. The left text column is the
// overlay; the right StatusFlow card is the stage. Both columns stay in the shared
// centered flex row in BOTH layers (opacity-toggled), so positions are byte-identical
// to v5 — only the camera (pan-left) now moves the card, not the text.
import { AbsoluteFill } from "remotion";
import { Tokens } from "../tokens";
import { StatusFlow, FlowStep } from "../components/StatusFlow";
import { useSnapEntrance } from "./snap";

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

export const InviteSceneV51: React.FC<Props> = ({
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

        <div style={{ opacity: isStage ? 1 : 0 }}>
          <StatusFlow theme={theme} steps={steps ?? DEFAULT_STEPS} docTitle={docTitle} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// StatusFlow requires `steps`; the v5 props always supply them, but keep a safe default
// identical to the approved invite flow (clawshow-esign-v5.json) so the type is sound and
// the scene never throws if ever rendered without props. Behaviour-identical when steps is
// provided (the only case in practice).
const DEFAULT_STEPS: FlowStep[] = [
  { label: "Preparing invitation", sub: "Generating secure signing link", icon: "spark" },
  { label: "Email sent", sub: "To demo-client@example.com", icon: "mail" },
  { label: "Signer inbox", sub: "Delivered · message opened", icon: "inbox" },
  { label: "Awaiting signature", sub: "Single-use link · expires in 7 days", icon: "clock" },
];
