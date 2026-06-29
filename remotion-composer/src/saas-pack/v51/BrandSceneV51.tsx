// v5.1 brand reveal — same layout/copy/type as v5 BrandScene, split into layers.
// Stage: ConvergenceStreams (background) + Logo (decorative mark). Overlay: eyebrow
// / wordmark / tagline, lifted out of the camera transform and pixel-snapped.
// Both layers share the identical flex column, so the in-flow Logo (opacity-toggled)
// keeps the text in EXACTLY its v5 position — zero layout drift.
import { AbsoluteFill } from "remotion";
import { Tokens } from "../tokens";
import { Logo } from "../components/Logo";
import { ConvergenceStreams } from "../primitives/ConvergenceStreams";
import { useSnapEntrance } from "./snap";

type Layer = "stage" | "overlay";

interface Props {
  theme: Tokens;
  layer: Layer;
  eyebrow?: string;
  productName?: string;
  tagline?: string;
}

export const BrandSceneV51: React.FC<Props> = ({ theme, layer, eyebrow, productName, tagline }) => {
  const eEyebrow = useSnapEntrance({ delaySeconds: 0.95 });
  const eName = useSnapEntrance({ delaySeconds: 1.08 });
  const eTag = useSnapEntrance({ delaySeconds: 1.28 });
  const isStage = layer === "stage";
  const tOpacity = (e: number) => (isStage ? 0 : e); // text only shows in overlay

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {isStage && <ConvergenceStreams theme={theme} opacity={0.34} count={16} delaySeconds={0.1} />}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", fontFamily: theme.type.family }}>
        <div style={{ opacity: isStage ? 1 : 0 }}>
          <Logo theme={theme} size={184} delaySeconds={0.18} />
        </div>

        {eyebrow && (
          <div
            style={{
              opacity: tOpacity(eEyebrow.opacity),
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
              opacity: tOpacity(eName.opacity),
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
              opacity: tOpacity(eTag.opacity),
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
