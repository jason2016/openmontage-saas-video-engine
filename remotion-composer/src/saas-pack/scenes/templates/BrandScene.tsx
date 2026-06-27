// Brand beat: the product lockup (eyebrow + wordmark + tagline).
import { AbsoluteFill } from "remotion";
import { Tokens } from "../../tokens";
import { CTAHero } from "../../components/CTAHero";

interface BrandSceneProps {
  theme: Tokens;
  eyebrow?: string;
  productName?: string;
  tagline?: string;
}

export const BrandScene: React.FC<BrandSceneProps> = ({ theme, eyebrow, productName, tagline }) => (
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 120 }}>
    <CTAHero theme={theme} eyebrow={eyebrow} productName={productName} tagline={tagline} />
  </AbsoluteFill>
);
