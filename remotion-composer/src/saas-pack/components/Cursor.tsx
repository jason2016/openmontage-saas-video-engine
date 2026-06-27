// A synthetic pointer that guides the eye through UI. Travels from -> to over a
// window, eased on the settle curve; or sits statically at x,y. Optional press
// dip (pairs with MouseClick). Positions are percentages of the parent.
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { tokens as baseTokens, Tokens } from "../tokens";
import { easeSettle } from "../hooks/easings";

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
      easing: easeSettle,
    });
    px = from.x + (to.x - from.x) * p;
    py = from.y + (to.y - from.y) * p;
  }

  let pressScale = 1;
  if (pressed) {
    pressScale = 0.85;
  } else if (pressAtSeconds != null && Math.abs(t - pressAtSeconds) < 0.12) {
    pressScale = 0.85;
  }

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
      <svg width={size} height={size} viewBox="0 0 24 24" style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.55))" }}>
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
