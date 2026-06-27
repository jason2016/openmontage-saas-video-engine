// CTA beat: brand close + a single clear action.
import { AbsoluteFill } from "remotion";
import { Tokens } from "../../tokens";
import { CTAHero } from "../../components/CTAHero";

interface CTASceneProps {
  theme: Tokens;
  productName?: string;
  badge?: string;
  tagline?: string;
  buttonLabel?: string;
  url?: string;
}

export const CTAScene: React.FC<CTASceneProps> = ({ theme, productName, badge, tagline, buttonLabel, url }) => (
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 120 }}>
    <CTAHero theme={theme} productName={productName} badge={badge} tagline={tagline} buttonLabel={buttonLabel} url={url} />
  </AbsoluteFill>
);
