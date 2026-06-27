// Two low-opacity radial color blooms drifting slowly over the canvas
// (Stripe-style). Re-skins instantly via the theme's primary/success colors.
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { tokens as baseTokens, Tokens } from "../tokens";

interface GradientMeshProps {
  theme?: Tokens;
  opacityA?: number;
  opacityB?: number;
  speed?: number;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const value = parseInt(full, 16);
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

export const GradientMesh: React.FC<GradientMeshProps> = ({
  theme = baseTokens,
  opacityA = 0.15,
  opacityB = 0.1,
  speed = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = (frame / fps) * speed;

  const a = hexToRgb(theme.color.primary);
  const b = hexToRgb(theme.color.success);

  // Slow lissajous drift of the two bloom centers.
  const ax = 30 + Math.sin(t / 10) * 18;
  const ay = 38 + Math.cos(t / 8) * 16;
  const bx = 70 + Math.cos(t / 7) * 18;
  const by = 62 + Math.sin(t / 9) * 20;

  const background = `
    radial-gradient(ellipse 60% 55% at ${ax}% ${ay}%, rgba(${a.r},${a.g},${a.b},${opacityA}) 0%, transparent 60%),
    radial-gradient(ellipse 55% 50% at ${bx}% ${by}%, rgba(${b.r},${b.g},${b.b},${opacityB}) 0%, transparent 58%)
  `;

  return <AbsoluteFill style={{ background }} />;
};
