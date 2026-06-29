// v5.1 CTA close — same as v5 CTAScene. Stage: the Logo mark. Overlay: CTAHero
// (wordmark / tagline / Request Demo button / url / trust labels), lifted entirely
// out of the camera transform. Both stay in the shared centered flex column
// (opacity-toggled) so the lockup position matches v5 exactly.
//
// Note: CTAHero keeps its own brief internal entrance (the v5 component is reused
// unchanged), but it no longer rides the continuous camera scale() — the dominant
// shimmer source — because it now lives in the static overlay layer.
import { AbsoluteFill } from "remotion";
import { Tokens } from "../tokens";
import { Logo } from "../components/Logo";
import { CTAHero } from "../components/CTAHero";

type Layer = "stage" | "overlay";

interface TrustSignal {
  label: string;
  icon?: "check" | "globe" | "code" | "server";
}

interface Props {
  theme: Tokens;
  layer: Layer;
  productName?: string;
  badge?: string;
  tagline?: string;
  buttonLabel?: string;
  url?: string;
  trustSignals?: TrustSignal[];
}

export const CtaSceneV51: React.FC<Props> = ({ theme, layer, productName, badge, tagline, buttonLabel, url, trustSignals }) => {
  const isStage = layer === "stage";
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 120 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ opacity: isStage ? 1 : 0 }}>
          <Logo theme={theme} size={116} delaySeconds={0.1} pulse={false} />
        </div>
        <div style={{ height: 30 }} />
        <div style={{ opacity: isStage ? 0 : 1 }}>
          <CTAHero theme={theme} productName={productName} badge={badge} tagline={tagline} buttonLabel={buttonLabel} url={url} trustSignals={trustSignals} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
