// Trust beat: the compliance claim beside the tamper-evident audit trail.
import { AbsoluteFill } from "remotion";
import { Tokens } from "../../tokens";
import { AuditTrail, AuditEntry } from "../../components/AuditTrail";
import { VerificationBadge } from "../../components/VerificationBadge";
import { useEntrance } from "../../hooks/useEntrance";

interface TrustSceneProps {
  theme: Tokens;
  headline?: string;
  subtitle?: string;
  badge?: string;
  fingerprint?: string;
  auditEntries?: AuditEntry[];
}

export const TrustScene: React.FC<TrustSceneProps> = ({
  theme,
  headline = "Audit-ready by design.",
  subtitle,
  badge = "AES eIDAS compliant",
  fingerprint,
  auditEntries,
}) => {
  const head = useEntrance({ delaySeconds: 0.4 });
  const sub = useEntrance({ delaySeconds: 0.55 });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 84 }}>
        <div style={{ maxWidth: 460, display: "flex", flexDirection: "column", gap: 30, fontFamily: theme.type.family }}>
          <div
            style={{
              opacity: head.opacity,
              transform: head.transform,
              color: theme.color.textPrimary,
              fontSize: theme.type.size.h2,
              fontWeight: theme.type.weight.heading,
              letterSpacing: theme.type.tracking.heading,
              lineHeight: 1.12,
            }}
          >
            {headline}
          </div>
          {subtitle && (
            <div
              style={{ opacity: sub.opacity, transform: sub.transform, color: theme.color.textSecondary, fontSize: 26, lineHeight: 1.45 }}
            >
              {subtitle}
            </div>
          )}
          <VerificationBadge theme={theme} layout="inline" label={badge} size={56} delaySeconds={0.7} tone="success" />
        </div>
        <AuditTrail theme={theme} fingerprint={fingerprint} entries={auditEntries} width={700} delaySeconds={0.5} />
      </div>
    </AbsoluteFill>
  );
};
