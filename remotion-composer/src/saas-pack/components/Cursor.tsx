// A synthetic pointer that guides the eye through UI. Travels from -> to over a
// window on the *pointer* curve — accelerating from rest and decelerating into the
// target like a real hand — or sits statically at x,y. An optional press performs a
// quick down/up dip (pairs with MouseClick), and the pointer gains weight as it
// presses (its shadow tightens). Positions are percentages of the parent.
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { tokens as baseTokens, Tokens } from "../tokens";
import { easePointer } from "../hooks/easings";

interface Point {
  x: number;
  y: number;
}

interface CursorProps {
  theme?: Tokens;
  x?: number;
  y?: number;
  from?: Point;
  to?: Point;
  startSeconds?: number;
  durationSeconds?: number;
  pressAtSeconds?: number;
  pressed?: boolean;
  size?: number;
}

export const Cursor: React.FC<CursorProps> = ({
  theme = baseTokens,
  x = 50,
  y = 50,
  from,
  to,
  startSeconds = 0,
  durationSeconds = 1,
  pressAtSeconds,
  pressed,
  size = 34,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  let px = x;
  let py = y;
  if (from && to) {
    const p = interpolate(t, [startSeconds, startSeconds + durationSeconds], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: easePointer,
    });
    px = from.x + (to.x - from.x) * p;
    py = from.y + (to.y - from.y) * p;
  }

  // Press physics: a quick dip and recovery around pressAtSeconds (down in the
  // first 40% of the window, up over the rest) so the click reads as a real press.
  const { pressDepth, pressSeconds } = baseTokens.motion.pointer;
  let pressScale = 1;
  if (pressed) {
    pressScale = pressDepth;
  } else if (pressAtSeconds != null) {
    const start = pressAtSeconds - 0.02;
    if (t >= start && t <= start + pressSeconds) {
      const local = (t - start) / pressSeconds;
      const amt = local < 0.4 ? local / 0.4 : 1 - (local - 0.4) / 0.6;
      pressScale = 1 - (1 - pressDepth) * Math.max(0, Math.min(1, amt));
    }
  }
  // As the pointer presses, it gains weight: its drop-shadow tightens toward the
  // surface, reading as physical contact rather than a flat scale.
  const dip = (1 - pressScale) / (1 - pressDepth);
  const shadowY = 4 - 2 * dip;
  const shadowBlur = 8 - 3 * dip;

  return (
    <div
      style={{
        position: "absolute",
        left: `${px}%`,
        top: `${py}%`,
        transform: `translate(-8%, -6%) scale(${pressScale})`,
        transformOrigin: "top left",
        zIndex: 30,
        pointerEvents: "none",
      }}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" style={{ filter: `drop-shadow(0 ${shadowY}px ${shadowBlur}px rgba(0,0,0,0.55))` }}>
        <path
          d="M5.5 2.6 L5.5 20.8 L10.1 16.4 L13.0 22.6 L15.6 21.4 L12.8 15.4 L18.7 15.4 Z"
          fill="#FFFFFF"
          stroke="#0B1120"
          strokeWidth="1.1"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
