// AES eIDAS beat: the compliance claim with a row of standard chips that settle in
// sequence. Reads as a trust layer, not a spec sheet.
import { AbsoluteFill } from "remotion";
import { Tokens } from "../../tokens";
import { GlassCard } from "../../primitives/GlassCard";
import { useEntrance } from "../../hooks/useEntrance";

interface Standard {
  label: string;
  sub?: string;
}

interface ComplianceSceneProps {
  theme: Tokens;
  eyebrow?: string;
  headline?: string;
  subtitle?: string;
  standards?: Standard[];
}

const DEFAULT_STANDARDS: Standard[] = [
  { label: "AES", sub: "Advanced e-signature" },
  { label: "eIDAS", sub: "EU regulation" },
  { label: "SHA-256", sub: "Document hash" },
  { label: "OTP 2FA", sub: "Identity proof" },
];

const ShieldCheck: React.FC<{ color: string; size?: number }> = ({ color, size = 26 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3 l7 3 v5 c0 4.5 -3 7.5 -7 9 c-4 -1.5 -7 -4.5 -7 -9 V6 z" />
    <path d="M9 12 l2 2 l4 -4" />
  </svg>
);

const Chip: React.FC<{ theme: Tokens; std: Standard; delay: number }> = ({ theme, std, delay }) => {
  return (
    <GlassCard theme={theme} padding={0} delaySeconds={delay} style={{ width: 234 }}>
      <div style={{ padding: "26px 26px", display: "flex", flexDirection: "column", gap: 12, fontFamily: theme.type.family }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: `${theme.color.success}1a`,
            border: `1px solid ${theme.color.success}44`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ShieldCheck color={theme.color.successBright} size={24} />
        </div>
        <div style={{ color: theme.color.textPrimary, fontSize: 28, fontWeight: 700, letterSpacing: "-0.01em" }}>{std.label}</div>
        {std.sub && <div style={{ color: theme.color.textMuted, fontSize: 16 }}>{std.sub}</div>}
      </div>
    </GlassCard>
  );
};

export const ComplianceScene: React.FC<ComplianceSceneProps> = ({
  theme,
  eyebrow = "Compliance",
  headline = "AES eIDAS ready.",
  subtitle = "Advanced electronic signatures, aligned to EU eIDAS — built in, not bolted on.",
  standards = DEFAULT_STANDARDS,
}) => {
  const eEyebrow = useEntrance({ delaySeconds: 0.3 });
  const head = useEntrance({ delaySeconds: 0.42 });
  const sub = useEntrance({ delaySeconds: 0.56 });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 80 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 22, maxWidth: 1180, fontFamily: theme.type.family }}>
        <div
          style={{
            opacity: eEyebrow.opacity,
            transform: eEyebrow.transform,
            color: theme.color.primaryBright,
            fontSize: theme.type.size.eyebrow,
            fontWeight: theme.type.weight.label,
            letterSpacing: theme.type.tracking.eyebrow,
            textTransform: "uppercase",
          }}
        >
          {eyebrow}
        </div>
        <div
          style={{
            opacity: head.opacity,
            transform: head.transform,
            color: theme.color.textPrimary,
            fontSize: theme.type.size.h1,
            fontWeight: theme.type.weight.display,
            letterSpacing: theme.type.tracking.display,
            lineHeight: 1.06,
          }}
        >
          {headline}
        </div>
        {subtitle && (
          <div style={{ opacity: sub.opacity, transform: sub.transform, color: theme.color.textSecondary, fontSize: theme.type.size.body, lineHeight: 1.45, maxWidth: 820 }}>
            {subtitle}
          </div>
        )}
        <div style={{ display: "flex", gap: 22, marginTop: 26 }}>
          {standards.map((s, i) => (
            <Chip key={s.label} theme={theme} std={s} delay={0.8 + i * 0.12} />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
