// CTA beat: brand close on the real mark, then a single clear action.
import { AbsoluteFill } from "remotion";
import { Tokens } from "../../tokens";
import { Logo } from "../../components/Logo";
import { CTAHero } from "../../components/CTAHero";

interface TrustSignal {
  label: string;
  icon?: "check" | "globe" | "code" | "server";
}

interface CTASceneProps {
  theme: Tokens;
  productName?: string;
  badge?: string;
  tagline?: string;
  buttonLabel?: string;
  url?: string;
  trustSignals?: TrustSignal[];
}

export const CTAScene: React.FC<CTASceneProps> = ({ theme, productName, badge, tagline, buttonLabel, url, trustSignals }) => (
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 120 }}>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Logo theme={theme} size={116} delaySeconds={0.1} pulse={false} />
      <div style={{ height: 30 }} />
      <CTAHero theme={theme} productName={productName} badge={badge} tagline={tagline} buttonLabel={buttonLabel} url={url} trustSignals={trustSignals} />
    </div>
  </AbsoluteFill>
);
