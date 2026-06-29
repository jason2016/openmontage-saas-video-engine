// The base atmospheric layer for every scene: canvas + gradient mesh + particles
// + a soft top key-light + a breathing grid + film grain + vignette. Rendered
// once at the composition root so it is continuous across scenes (design brief §6).
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
  grain?: boolean;
}

// Tiny tiled fractal-noise texture for filmic depth (kept very low opacity).
const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  theme = baseTokens,
  intensity = 1,
  grid = true,
  vignette = true,
  particles = true,
  grain = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const breathe = 0.4 + 0.12 * Math.sin(frame / (fps * 12));

  return (
    <AbsoluteFill style={{ background: theme.color.canvas }}>
      <GradientMesh theme={theme} opacityA={0.2 * intensity} opacityB={0.14 * intensity} opacityC={0.05 * intensity} />

      {/* Soft top key-light — a gentle bloom from above for depth. */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 90% 55% at 50% -12%, rgba(255,255,255,0.055) 0%, transparent 55%)`,
        }}
      />

      {particles && <Particles theme={theme} opacity={0.06 * intensity} />}

      {grid && (
        <AbsoluteFill
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px)
            `,
            backgroundSize: "68px 68px",
            opacity: breathe,
            maskImage: "radial-gradient(ellipse 75% 70% at center, black 30%, transparent 80%)",
            WebkitMaskImage: "radial-gradient(ellipse 75% 70% at center, black 30%, transparent 80%)",
          }}
        />
      )}

      {vignette && (
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse at center, transparent 48%, ${theme.color.canvasDeep} 125%)`,
          }}
        />
      )}

      {grain && (
        <AbsoluteFill
          style={{
            backgroundImage: NOISE,
            backgroundSize: "180px 180px",
            opacity: 0.035,
            mixBlendMode: "overlay",
          }}
        />
      )}
    </AbsoluteFill>
  );
};
