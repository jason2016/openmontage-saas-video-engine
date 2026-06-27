// Sparse drifting motes for depth — very low contrast. Deterministic (seeded),
// so the same frame always renders identical pixels (required for Remotion).
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { tokens as baseTokens, Tokens } from "../tokens";

interface ParticlesProps {
  theme?: Tokens;
  count?: number;
  color?: string;
  opacity?: number;
  speed?: number;
  seed?: number;
}

// mulberry32 — tiny seeded PRNG. No Math.random in the render path.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const Particles: React.FC<ParticlesProps> = ({
  theme = baseTokens,
  count = 28,
  color,
  opacity = 0.06,
  speed = 1,
  seed = 7,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = (frame / fps) * speed;
  const rng = mulberry32(seed);
  const dots = Array.from({ length: count }, () => ({
    x: rng() * 100,
    y: rng() * 100,
    r: 1 + rng() * 2.5,
    drift: 4 + rng() * 8,
    phase: rng() * Math.PI * 2,
    twinkle: 0.5 + rng() * 0.5,
  }));
  const fill = color ?? theme.color.textSecondary;

  return (
    <AbsoluteFill>
      {dots.map((d, i) => {
        const y = d.y + Math.sin(t / d.drift + d.phase) * 1.2;
        const x = d.x + Math.cos(t / (d.drift * 1.3) + d.phase) * 0.8;
        const o = opacity * (0.6 + 0.4 * Math.sin(t * d.twinkle + d.phase));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: d.r * 2,
              height: d.r * 2,
              borderRadius: "50%",
              background: fill,
              opacity: o,
              filter: "blur(0.5px)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
