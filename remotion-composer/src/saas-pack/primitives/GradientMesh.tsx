// Slow-drifting radial color blooms over the canvas (Stripe/Linear-style soft
// lighting). Blue-dominant to match the ClawShow brand: two brand-blue blooms +
// one whisper of success. Re-skins instantly via theme colors.
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { tokens as baseTokens, Tokens } from "../tokens";

interface GradientMeshProps {
  theme?: Tokens;
  opacityA?: number;
  opacityB?: number;
  opacityC?: number;
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
  opacityA = 0.2,
  opacityB = 0.14,
  opacityC = 0.05,
  speed = 1,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = (frame / fps) * speed;

  const a = hexToRgb(theme.color.primary);
  const b = hexToRgb(theme.color.primaryBright);
  const c = hexToRgb(theme.color.success);

  // Three slow lissajous drifts — large, soft, mostly out toward the edges so the
  // center stays calm for content.
  const ax = 26 + Math.sin(t / 10) * 16;
  const ay = 34 + Math.cos(t / 8) * 14;
  const bx = 74 + Math.cos(t / 7) * 16;
  const by = 60 + Math.sin(t / 9) * 18;
  const cx = 52 + Math.sin(t / 11) * 22;
  const cy = 80 + Math.cos(t / 13) * 10;

  const background = `
    radial-gradient(ellipse 72% 62% at ${ax}% ${ay}%, rgba(${a.r},${a.g},${a.b},${opacityA}) 0%, transparent 60%),
    radial-gradient(ellipse 64% 56% at ${bx}% ${by}%, rgba(${b.r},${b.g},${b.b},${opacityB}) 0%, transparent 58%),
    radial-gradient(ellipse 54% 48% at ${cx}% ${cy}%, rgba(${c.r},${c.g},${c.b},${opacityC}) 0%, transparent 56%)
  `;

  return <AbsoluteFill style={{ background }} />;
};
