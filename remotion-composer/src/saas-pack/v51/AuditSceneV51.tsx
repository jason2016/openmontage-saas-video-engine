// v5.1 audit beat. Camera stage: the AuditTrail card that builds top-down and seals
// with the SHA-256 fingerprint — purposeful progression preserved verbatim. Overlay:
// headline + subtitle, lifted out of the camera transform and pixel-snapped. Both
// stay in the shared centered flex column (opacity-toggled) so positions match v5.
import { AbsoluteFill } from "remotion";
import { Tokens } from "../tokens";
import { AuditTrail, AuditEntry } from "../components/AuditTrail";
import { useSnapEntrance } from "./snap";

type Layer = "stage" | "overlay";

interface Props {
  theme: Tokens;
  layer: Layer;
  headline?: string;
  subtitle?: string;
  fingerprint?: string;
  auditEntries?: AuditEntry[];
}

export const AuditSceneV51: React.FC<Props> = ({ theme, layer, headline = "Every step, recorded.", subtitle, fingerprint, auditEntries }) => {
  const head = useSnapEntrance({ delaySeconds: 0.35 });
  const sub = useSnapEntrance({ delaySeconds: 0.5 });
  const isStage = layer === "stage";

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 80 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40, fontFamily: theme.type.family }}>
        <div style={{ textAlign: "center", maxWidth: 900 }}>
          <div
            style={{
              opacity: isStage ? 0 : head.opacity,
              transform: head.transform,
              color: theme.color.textPrimary,
              fontSize: theme.type.size.h1,
              fontWeight: theme.type.weight.display,
              letterSpacing: theme.type.tracking.display,
              lineHeight: 1.08,
            }}
          >
            {headline}
          </div>
          {subtitle && (
            <div style={{ opacity: isStage ? 0 : sub.opacity, transform: sub.transform, color: theme.color.textSecondary, fontSize: theme.type.size.body, marginTop: 18, lineHeight: 1.4 }}>
              {subtitle}
            </div>
          )}
        </div>
        <div style={{ opacity: isStage ? 1 : 0 }}>
          <AuditTrail theme={theme} width={840} fingerprint={fingerprint} entries={auditEntries} delaySeconds={0.7} stepSeconds={0.2} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
