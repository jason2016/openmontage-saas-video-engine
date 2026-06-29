// Invitation beat (v5): the document leaves the app as a secure signing link and
// the request walks through real product states — preparing, sent, delivered,
// awaiting signature. A focused message on the left, a live status flow on the
// right. Reads like a real SaaS, not a single email card.
import { AbsoluteFill } from "remotion";
import { Tokens } from "../../tokens";
import { StatusFlow, FlowStep } from "../../components/StatusFlow";
import { SceneCaption } from "../SceneCaption";
import { useEntrance } from "../../hooks/useEntrance";

interface InviteSceneProps {
  theme: Tokens;
  eyebrow?: string;
  headline?: string;
  subtitle?: string;
  docTitle?: string;
  steps?: FlowStep[];
  caption?: string;
}

const DEFAULT_STEPS: FlowStep[] = [
  { label: "Preparing invitation", sub: "Generating secure signing link", icon: "spark" },
  { label: "Email sent", sub: "To demo-client@example.com", icon: "mail" },
  { label: "Signer inbox", sub: "Delivered · message opened", icon: "inbox" },
  { label: "Awaiting signature", sub: "Single-use link · expires in 7 days", icon: "clock" },
];

export const InviteScene: React.FC<InviteSceneProps> = ({
  theme,
  eyebrow = "Invitation",
  headline = "Sent in one click.",
  subtitle = "We email a secure, single-use signing link — and track every step until it's signed.",
  docTitle = "Contrat de prestation de services.pdf",
  steps = DEFAULT_STEPS,
  caption,
}) => {
  const head = useEntrance({ delaySeconds: 0.5 });
  const sub = useEntrance({ delaySeconds: 0.68 });

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
              opacity: head.opacity,
              transform: head.transform,
            }}
          >
            {eyebrow}
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
        </div>

        <StatusFlow theme={theme} steps={steps} docTitle={docTitle} />
      </div>
      {caption && <SceneCaption theme={theme} text={caption} position="bottom" />}
    </AbsoluteFill>
  );
};
