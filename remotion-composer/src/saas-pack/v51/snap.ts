// v5.1 anti-shimmer — typography-safe entrance.
// The v5 useEntrance settles to scale 1 / translateY 0, but DURING the entrance it
// animates a fractional scale (0.98 -> 1) and a fractional Y, and — more importantly
// — every text node also rode inside SceneFrame's continuously-changing camera
// scale(). Both subpixel-rasterize glyph edges → shimmer.
//
// useSnapEntrance is opacity + an INTEGER-pixel Y rise only. No scale, no fractional
// translate. After entrance: opacity 1, y 0, scale exactly 1. Deterministic on
// useCurrentFrame() — no CSS transition/animation, no rAF, no Date.now().
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { easeEntrance } from "../hooks/easings";

export interface SnapEntrance {
  opacity: number;
  y: number;
  transform: string; // translateY(<int>px) — integer pixels, never a scale
}

export function useSnapEntrance(opts: { delaySeconds?: number; durationSeconds?: number; distance?: number } = {}): SnapEntrance {
  const { delaySeconds = 0, durationSeconds = 0.6, distance = 16 } = opts;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const start = delaySeconds * fps;
  const end = start + durationSeconds * fps;
  const progress = interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeEntrance,
  });
  const y = Math.round((1 - progress) * distance); // integer pixels only
  return { opacity: progress, y, transform: `translateY(${y}px)` };
}
