// Brand reveal: the real ClawShow mark converges in over a faint stream motif,
// then the wordmark + tagline settle. The launch "cold open".
import { AbsoluteFill } from "remotion";
import { Tokens } from "../../tokens";
import { Logo } from "../../components/Logo";
import { ConvergenceStreams } from "../../primitives/ConvergenceStreams";
import { useEntrance } from "../../hooks/useEntrance";

interface BrandSceneProps {
  theme: Tokens;
  eyebrow?: string;
  productName?: string;
  tagline?: string;
}

export const BrandScene: React.FC<BrandSceneProps> = ({ theme, eyebrow, productName, tagline }) => {
  const eEyebrow = useEntrance({ delaySeconds: 0.95 });
  const eName = useEntrance({ delaySeconds: 1.08 });
  const eTag = useEntrance({ delaySeconds: 1.28 });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <ConvergenceStreams theme={theme} opacity={0.34} count={16} delaySeconds={0.1} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", fontFamily: theme.type.family }}>
        <Logo theme={theme} size={184} delaySeconds={0.18} />

        {eyebrow && (
          <div
            style={{
              opacity: eEyebrow.opacity,
              transform: eEyebrow.transform,
              marginTop: 44,
              color: theme.color.primaryBright,
              fontSize: theme.type.size.eyebrow,
              fontWeight: theme.type.weight.label,
              letterSpacing: theme.type.tracking.eyebrow,
              textTransform: "uppercase",
            }}
          >
            {eyebrow}
          </div>
        )}

        {productName && (
          <div
            style={{
              opacity: eName.opacity,
              transform: eName.transform,
              marginTop: 16,
              color: theme.color.textPrimary,
              fontSize: 96,
              fontWeight: theme.type.weight.display,
              letterSpacing: theme.type.tracking.display,
              lineHeight: 1.04,
            }}
          >
            {productName}
          </div>
        )}

        {tagline && (
          <div
            style={{
              opacity: eTag.opacity,
              transform: eTag.transform,
              marginTop: 18,
              color: theme.color.textSecondary,
              fontSize: 32,
              fontWeight: theme.type.weight.medium,
            }}
          >
            {tagline}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
