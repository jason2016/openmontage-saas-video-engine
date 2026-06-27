// The base atmospheric layer for every scene: canvas + GradientMesh + Particles
// + a breathing grid + vignette. Rendered once at the composition root so it is
// continuous across scenes (never resets — design brief §6).
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { tokens as baseTokens, Tokens } from "../tokens";
import { GradientMesh } from "./GradientMesh";
import { Particles } from "./Particles";

interface AnimatedBackgroundProps {
  theme?: Tokens;
  intensity?: number;
  grid?: boolean;
  vignette?: boolean;
  particles?: boolean;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  theme = baseTokens,
  intensity = 1,
  grid = true,
  vignette = true,
  particles = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const breathe = 0.45 + 0.12 * Math.sin(frame / (fps * 12));

  return (
    <AbsoluteFill style={{ background: theme.color.canvas }}>
      <GradientMesh theme={theme} opacityA={0.15 * intensity} opacityB={0.1 * intensity} />
      {particles && <Particles theme={theme} opacity={0.06 * intensity} />}
      {grid && (
        <AbsoluteFill
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
            `,
            backgroundSize: "64px 64px",
            opacity: breathe,
          }}
        />
      )}
      {vignette && (
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse at center, transparent 55%, ${theme.color.canvasDeep} 130%)`,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
