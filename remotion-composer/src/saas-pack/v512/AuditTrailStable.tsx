// v5.1.2 anti-shimmer audit trail — the stable twin of AuditTrail.
//
// Root cause it removes (see AuditTrail + AuditSceneV51): the whole card lived in the
// camera STAGE (camera "push" => scale 1 + 0.038*g, changing until the 0.46*180≈83-
// frame settle ≈ 2.76 s), AND it entered through GlassCard's useEntrance scale(0.98→1),
// AND every event Row entered with its own useEntrance transform (translateY + scale
// 0.98→1). The small monospace timestamps, the SHA-256 fingerprint and the 1.5px icon
// rings rode all of that => the reported jitter in the card.
//
// This component is built to live on the STATIC overlay (scale exactly 1, no camera),
// and on top of that removes every internal motion:
//   • Card entrance is OPACITY ONLY (geometry is final from frame 0).
//   • Each event row reveals with OPACITY ONLY — never translated or scaled after it
//     becomes visible; once a row's opacity reaches 1 it is pixel-identical frame to
//     frame.
//   • The seal / SHA-256 footer reveals with OPACITY ONLY and is then static.
//   • Integer geometry throughout; icon rings use an integer 2px border (border-box,
//     so the 29px outer ring size matches v5.1.1 exactly). Dividers/card border 1px.
//   • The green "Sealed" state and the check/lock icons never pulse or breathe.
// Visual layout is otherwise byte-for-byte the v5.1.1 AuditTrail. Deterministic on
// useCurrentFrame(): no CSS transition/animation, no rAF, no Date.now().
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { tokens as baseTokens, Tokens } from "../tokens";

export interface AuditEntry {
  action: string;
  actor?: string;
  timestamp: string;
}

interface AuditTrailStableProps {
  theme?: Tokens;
  title?: string;
  entries?: AuditEntry[];
  fingerprint?: string;
  sealLabel?: string;
  delaySeconds?: number;
  stepSeconds?: number;
  width?: number;
  fadeSeconds?: number;
}

const DEFAULT_ENTRIES: AuditEntry[] = [
  { action: "Document sent", actor: "demo-prestataire@example.com", timestamp: "09:42:11" },
  { action: "Opened by signer", actor: "demo-client@example.com", timestamp: "09:55:03" },
  { action: "Identity verified · OTP", actor: "+1 ••• 4821", timestamp: "09:55:46" },
  { action: "Signed", actor: "Marc Delorme", timestamp: "09:56:20" },
];

const Row: React.FC<{ theme: Tokens; entry: AuditEntry; opacity: number }> = ({ theme, entry, opacity }) => (
  <div style={{ display: "flex", gap: 16, alignItems: "center", opacity }}>
    <div
      style={{
        boxSizing: "border-box",
        width: 29,
        height: 29,
        borderRadius: "50%",
        background: `${theme.color.success}1f`,
        border: `2px solid ${theme.color.success}66`,
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

export const AuditTrailStable: React.FC<AuditTrailStableProps> = ({
  theme = baseTokens,
  title = "Audit trail",
  entries = DEFAULT_ENTRIES,
  fingerprint = "SHA-256  3f9a 7c12 b80e … a4d1",
  sealLabel = "Sealed",
  delaySeconds = 0,
  stepSeconds = 0.18,
  width = 760,
  fadeSeconds = 0.22,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  // Card: opacity-only entrance; geometry is final from frame 0.
  const cardOpacity = interpolate(t, [0, 0.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const sealDelay = delaySeconds + entries.length * stepSeconds + 0.2;
  const sealOpacity = interpolate(t, [sealDelay, sealDelay + fadeSeconds], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div
      style={{
        width,
        boxSizing: "border-box",
        opacity: cardOpacity,
        background: theme.color.glassFill,
        border: `${theme.space.hairline}px solid ${theme.color.hairline}`,
        borderRadius: theme.space.radiusCard,
        padding: 40,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 22, fontFamily: theme.type.family }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ color: theme.color.textPrimary, fontSize: 22, fontWeight: 700 }}>{title}</div>
          <div style={{ color: theme.color.textMuted, fontSize: 13, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Tamper-evident
          </div>
        </div>
        <div style={{ height: 1, background: theme.color.hairline }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {entries.map((en, i) => {
            const rowDelay = delaySeconds + i * stepSeconds;
            const rowOpacity = interpolate(t, [rowDelay, rowDelay + fadeSeconds], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return <Row key={i} theme={theme} entry={en} opacity={rowOpacity} />;
          })}
        </div>
        <div style={{ height: 1, background: theme.color.hairline }} />
        <div style={{ opacity: sealOpacity, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
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
    </div>
  );
};
