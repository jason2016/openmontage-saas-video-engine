// Brand / CTA lockup — eyebrow, title, trust badge, tagline, button, URL.
// Staggered settle entrances. Drives both the brand-intro and closing scenes.
// Every string is a prop; no product text baked in.
import { tokens as baseTokens, Tokens } from "../tokens";
import { useEntrance } from "../hooks/useEntrance";

interface TrustSignal {
  label: string;
  icon?: "check" | "globe" | "code" | "server";
}

interface CTAHeroProps {
  theme?: Tokens;
  eyebrow?: string;
  productName?: string;
  headline?: string;
  tagline?: string;
  badge?: string;
  buttonLabel?: string;
  url?: string;
  trustSignals?: TrustSignal[];
}

const TrustIcon: React.FC<{ name: TrustSignal["icon"]; color: string }> = ({ name, color }) => {
  const c = { width: 17, height: 17, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "globe") return <svg {...c}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 2.5 15 0 18M12 3c-2.5 2.5-2.5 15 0 18" /></svg>;
  if (name === "code") return <svg {...c}><path d="M8 6l-5 6 5 6M16 6l5 6-5 6" /></svg>;
  if (name === "server") return <svg {...c}><rect x="3" y="4" width="18" height="7" rx="2" /><rect x="3" y="13" width="18" height="7" rx="2" /><path d="M7 7.5h.01M7 16.5h.01" /></svg>;
  return <svg {...c}><path d="M20 6 L9 17 L4 12" /></svg>;
};

export const CTAHero: React.FC<CTAHeroProps> = ({
  theme = baseTokens,
  eyebrow,
  productName,
  headline,
  tagline,
  badge,
  buttonLabel,
  url,
  trustSignals,
}) => {
  const title = headline ?? productName ?? "";
  const eEyebrow = useEntrance({ delaySeconds: 0.08 });
  const eTitle = useEntrance({ delaySeconds: 0.2 });
  const eBadge = useEntrance({ delaySeconds: 0.34 });
  const eTag = useEntrance({ delaySeconds: 0.46 });
  const eBtn = useEntrance({ delaySeconds: 0.6 });
  const eTrust = useEntrance({ delaySeconds: 0.78 });

  return (
    <div style={{ textAlign: "center", maxWidth: 1300, fontFamily: theme.type.family }}>
      {eyebrow && (
        <div
          style={{
            opacity: eEyebrow.opacity,
            transform: eEyebrow.transform,
            color: theme.color.primary,
            fontSize: theme.type.size.eyebrow,
            fontWeight: theme.type.weight.label,
            letterSpacing: theme.type.tracking.eyebrow,
            textTransform: "uppercase",
            marginBottom: 24,
          }}
        >
          {eyebrow}
        </div>
      )}

      <div
        style={{
          opacity: eTitle.opacity,
          transform: eTitle.transform,
          color: theme.color.textPrimary,
          fontSize: theme.type.size.display,
          fontWeight: theme.type.weight.display,
          letterSpacing: theme.type.tracking.display,
          lineHeight: theme.type.lineHeight.display,
        }}
      >
        {title}
      </div>

      {badge && (
        <div style={{ opacity: eBadge.opacity, transform: eBadge.transform, marginTop: 28, display: "flex", justifyContent: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 18px",
              borderRadius: 999,
              background: `${theme.color.success}1a`,
              border: `1px solid ${theme.color.success}55`,
              color: theme.color.successBright,
              fontSize: 20,
              fontWeight: 600,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={theme.color.successBright} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 L9 17 L4 12" />
            </svg>
            {badge}
          </div>
        </div>
      )}

      {tagline && (
        <div
          style={{
            opacity: eTag.opacity,
            transform: eTag.transform,
            color: theme.color.textSecondary,
            fontSize: 34,
            fontWeight: theme.type.weight.medium,
            marginTop: 28,
            lineHeight: 1.3,
          }}
        >
          {tagline}
        </div>
      )}

      {(buttonLabel || url) && (
        <div
          style={{
            opacity: eBtn.opacity,
            transform: eBtn.transform,
            marginTop: 44,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 18,
          }}
        >
          {buttonLabel && (
            <div
              style={{
                padding: "18px 38px",
                borderRadius: 14,
                background: theme.color.primary,
                color: "#FFFFFF",
                fontSize: 24,
                fontWeight: 600,
                boxShadow: `0 16px 40px ${theme.color.primary}44`,
              }}
            >
              {buttonLabel}
            </div>
          )}
          {url && <div style={{ color: theme.color.textMuted, fontSize: 22, fontWeight: 500 }}>{url}</div>}
        </div>
      )}

      {trustSignals && trustSignals.length > 0 && (
        <div
          style={{
            opacity: eTrust.opacity,
            transform: eTrust.transform,
            marginTop: 34,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 12,
          }}
        >
          {trustSignals.map((sig) => (
            <div
              key={sig.label}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                padding: "10px 16px",
                borderRadius: 999,
                background: theme.color.glassFill,
                border: `1px solid ${theme.color.hairline}`,
                color: theme.color.textSecondary,
                fontSize: 18,
                fontWeight: 500,
              }}
            >
              <TrustIcon name={sig.icon} color={theme.color.successBright} />
              {sig.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
