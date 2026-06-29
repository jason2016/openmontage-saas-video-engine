// v5.1 anti-shimmer scene frame. Identical camera math to the approved v5
// SceneFrame, but split into two sibling layers:
//
//   A. Camera stage  — gets the directional camera transform (translate + scale).
//      Background, product UI, PDF, cards, decorative marks live here.
//   B. Typography overlay — NO camera transform. Static position, scale exactly 1.
//      Headlines/eyebrows/subtitles/CTA/labels live here, so glyph edges are never
//      subpixel re-rasterized by a continuously-changing camera scale().
//
// The scene cross-dissolve (opacity envelope) still applies to BOTH layers, so the
// approved scene-to-scene transitions are preserved exactly. Opacity fades do not
// shimmer text edges — only fractional transforms do. Deterministic on
// useCurrentFrame(); no CSS transition/animation, no rAF, no Date.now().
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { easeSettle, easeCamera, easeExit } from "../hooks/easings";
import { tokens } from "../tokens";
import { CameraMove } from "../scenes/SceneFrame";

export const StableSceneFrame: React.FC<{
  stage: React.ReactNode;
  overlay: React.ReactNode;
  camera?: CameraMove;
}> = ({ stage, overlay, camera = "push" }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();

  const inP = interpolate(frame, [0, 0.5 * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeSettle });
  const outP = interpolate(frame, [durationInFrames - 0.45 * fps, durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeExit });
  const opacity = Math.min(inP, outP);

  // Same camera settle-and-hold as v5 SceneFrame — applied to the STAGE only.
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

  return (
    <AbsoluteFill style={{ opacity }}>
      <AbsoluteFill style={{ transform: `translate(${tx}px, ${ty}px) scale(${scale})`, willChange: "transform" }}>
        {stage}
      </AbsoluteFill>
      <AbsoluteFill>{overlay}</AbsoluteFill>
    </AbsoluteFill>
  );
};
