// Calm, subtractive entrance: opacity + small rise + small scale on the settle
// curve. The default building block for every reveal in the pack.
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { easeSettle } from "./easings";

export interface EntranceOptions {
  delaySeconds?: number;
  durationSeconds?: number;
  distance?: number; // px of upward travel
  fromScale?: number;
}

export interface Entrance {
  progress: number;
  opacity: number;
  translateY: number;
  scale: number;
  transform: string;
}

export function useEntrance(options: EntranceOptions = {}): Entrance {
  const { delaySeconds = 0, durationSeconds = 0.6, distance = 24, fromScale = 0.98 } = options;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const start = delaySeconds * fps;
  const end = start + durationSeconds * fps;
  const progress = interpolate(frame, [start, end], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeSettle,
  });
  const translateY = (1 - progress) * distance;
  const scale = fromScale + (1 - fromScale) * progress;
  return {
    progress,
    opacity: progress,
    translateY,
    scale,
    transform: `translateY(${translateY}px) scale(${scale})`,
  };
}
