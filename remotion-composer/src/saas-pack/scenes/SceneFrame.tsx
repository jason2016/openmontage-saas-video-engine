// Per-scene wrapper: a calm content fade-in/out + an imperceptible camera
// push-in. Because the AnimatedBackground is continuous beneath every scene,
// the content cross-dissolves cleanly (no black dip) — design brief §6.
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { easeSettle } from "../hooks/easings";

export const SceneFrame: React.FC<{ children: React.ReactNode; push?: boolean }> = ({ children, push = true }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const inP = interpolate(frame, [0, 0.5 * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeSettle });
  const outP = interpolate(frame, [durationInFrames - 0.4 * fps, durationInFrames], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const opacity = Math.min(inP, outP);
  const scale = push ? interpolate(frame, [0, durationInFrames], [1, 1.03], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;

  return <AbsoluteFill style={{ opacity, transform: `scale(${scale})` }}>{children}</AbsoluteFill>;
};
