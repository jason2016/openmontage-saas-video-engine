// Per-scene wrapper: a calm content cross-dissolve + a subtle, directional camera
// move. Because the AnimatedBackground is continuous beneath every scene, content
// cross-dissolves cleanly (no black dip) — design brief §6. The camera move gives
// each beat its own gentle motion signature (push / pull / pan / tilt).
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { easeSettle, easeCamera, easeExit } from "../hooks/easings";
import { tokens } from "../tokens";

export type CameraMove = "push" | "pull" | "pan-left" | "pan-right" | "tilt-up" | "tilt-down" | "rise" | "still";

export const SceneFrame: React.FC<{ children: React.ReactNode; camera?: CameraMove }> = ({ children, camera = "push" }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  const inP = interpolate(frame, [0, 0.5 * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeSettle });
  const outP = interpolate(frame, [durationInFrames - 0.45 * fps, durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeExit });
  const opacity = Math.min(inP, outP);

  // The camera completes its move within the first settleFraction of the scene,
  // then holds dead still — so typography carries the back half (camera settle).
  // Small, intentional moves; the back-half hold is where the emphasis lives.
  const settleEnd = Math.max(1, tokens.motion.camera.settleFraction * durationInFrames);
  const g = interpolate(frame, [0, settleEnd], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeCamera });

  let scale = 1;
  let tx = 0;
  let ty = 0;
  switch (camera) {
    case "push": scale = 1 + 0.038 * g; break;
    case "pull": scale = 1.04 - 0.038 * g; break;
    case "pan-left": tx = 26 - 52 * g; scale = 1.03; break;
    case "pan-right": tx = -26 + 52 * g; scale = 1.03; break;
    case "tilt-up": ty = 22 - 44 * g; scale = 1.03; break;
    case "tilt-down": ty = -22 + 44 * g; scale = 1.03; break;
    case "rise": ty = 22 * (1 - g); scale = 1.035 - 0.035 * g; break;
    case "still": break;
  }

  return <AbsoluteFill style={{ opacity, transform: `translate(${tx}px, ${ty}px) scale(${scale})`, willChange: "transform, opacity" }}>{children}</AbsoluteFill>;
};
