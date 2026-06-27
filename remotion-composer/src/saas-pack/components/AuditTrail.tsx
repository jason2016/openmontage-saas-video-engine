// Evidentiary log on a glass panel: each entry (action, actor, timestamp) reveals
// top-down; ends with a SHA-256 fingerprint chip and a "sealed" lock row. All
// content is props — generic defaults shown here.
import { tokens as baseTokens, Tokens } from "../tokens";
import { GlassCard } from "../primitives/GlassCard";
import { useEntrance } from "../hooks/useEntrance";

export interface AuditEntry {
  action: string;
  actor?: string;
  timestamp: string;
}

interface AuditTrailProps {
  theme?: Tokens;
  title?: string;
  entries?: AuditEntry[];
  fingerprint?: string;
  sealLabel?: string;
  delaySeconds?: number;
  stepSeconds?: number;
  width?: number;
}

const DEFAULT_ENTRIES: AuditEntry[] = [
  { action: "Document sent", actor: "you@company.com", timestamp: "09:42:11" },
  { action: "Opened by signer", actor: "alex@client.com", timestamp: "09:55:03" },
  { action: "Identity verified · OTP", actor: "+1 ••• 4821", timestamp: "09:55:46" },
  { action: "Signed", actor: "Alex Doe", timestamp: "09:56:20" },
];

const Row: React.FC<{ theme: Tokens; entry: AuditEntry; delay: number }> = ({ theme, entry, delay }) => {
  const e = useEntrance({ delaySeconds: delay, distance: 12 });
  return (
    <div style={{ display: "flex", gap: 16, alignItems: "center", opacity: e.opacity, transform: e.transform }}>
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: "50%",
          background: `${theme.color.success}1f`,
          border: `1.5px solid ${theme.color.success}66`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={theme.color.successBright} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6 L9 17 L4 12" />
        </svg>
      </div>
      <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 }}>
        <div style={{ color: theme.color.textPrimary, fontSize: 21, fontWeight: 500 }}>
          {entry.action}
          {entry.actor && <span style={{ color: theme.color.textMuted, fontWeight: 400 }}>{"  ·  " + entry.actor}</span>}
        </div>
        <div style={{ color: theme.color.textMuted, fontSize: 16, fontFamily: theme.type.mono, whiteSpace: "nowrap" }}>{entry.timestamp}</div>
      </div>
    </div>
  );
};

export const AuditTrail: React.FC<AuditTrailProps> = ({
  theme = baseTokens,
  title = "Audit trail",
  entries = DEFAULT_ENTRIES,
  fingerprint = "SHA-256  3f9a 7c12 b80e … a4d1",
  sealLabel = "Sealed",
  delaySeconds = 0,
  stepSeconds = 0.18,
  width = 760,
}) => {
  const seal = useEntrance({ delaySeconds: delaySeconds + entries.length * stepSeconds + 0.2, distance: 10 });

  return (
    <GlassCard theme={theme} padding={40} style={{ width }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 22, fontFamily: theme.type.family }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ color: theme.color.textPrimary, fontSize: 22, fontWeight: 700 }}>{title}</div>
          <div style={{ color: theme.color.textMuted, fontSize: 13, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Tamper-evident
          </div>
        </div>
        <div style={{ height: 1, background: theme.color.hairline }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {entries.map((en, i) => (
            <Row key={i} theme={theme} entry={en} delay={delaySeconds + i * stepSeconds} />
          ))}
        </div>
        <div style={{ height: 1, background: theme.color.hairline }} />
        <div style={{ opacity: seal.opacity, transform: seal.transform, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={theme.color.successBright} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="11" width="14" height="9" rx="2" />
              <path d="M8 11 V7 a4 4 0 0 1 8 0 v4" />
            </svg>
            <span style={{ color: theme.color.successBright, fontSize: 19, fontWeight: 600 }}>{sealLabel}</span>
          </div>
          <span style={{ color: theme.color.textMuted, fontSize: 15, fontFamily: theme.type.mono }}>{fingerprint}</span>
        </div>
      </div>
    </GlassCard>
  );
};
