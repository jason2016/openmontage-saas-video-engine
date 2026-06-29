// Audit-trail beat: a headline over the tamper-evident log that builds top-down
// and seals with a SHA-256 fingerprint. Centered, evidentiary, calm.
import { AbsoluteFill } from "remotion";
import { Tokens } from "../../tokens";
import { AuditTrail, AuditEntry } from "../../components/AuditTrail";
import { useEntrance } from "../../hooks/useEntrance";

interface AuditSceneProps {
  theme: Tokens;
  headline?: string;
  subtitle?: string;
  fingerprint?: string;
  auditEntries?: AuditEntry[];
}

export const AuditScene: React.FC<AuditSceneProps> = ({ theme, headline = "Every step, recorded.", subtitle, fingerprint, auditEntries }) => {
  const head = useEntrance({ delaySeconds: 0.35 });
  const sub = useEntrance({ delaySeconds: 0.5 });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 80 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40, fontFamily: theme.type.family }}>
        <div style={{ textAlign: "center", maxWidth: 900 }}>
          <div
            style={{
              opacity: head.opacity,
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
            <div style={{ opacity: sub.opacity, transform: sub.transform, color: theme.color.textSecondary, fontSize: theme.type.size.body, marginTop: 18, lineHeight: 1.4 }}>
              {subtitle}
            </div>
          )}
        </div>
        <AuditTrail theme={theme} width={840} fingerprint={fingerprint} entries={auditEntries} delaySeconds={0.7} stepSeconds={0.2} />
      </div>
    </AbsoluteFill>
  );
};
