// A small calm caption used to label product-demo scenes (upload/send/sign).
// Text + position are props; no product wording baked in.
import { AbsoluteFill } from "remotion";
import { Tokens } from "../tokens";
import { useEntrance } from "../hooks/useEntrance";

export const SceneCaption: React.FC<{
  theme: Tokens;
  text: string;
  position?: "top" | "bottom";
  accent?: boolean;
}> = ({ theme, text, position = "bottom", accent }) => {
  const e = useEntrance({ delaySeconds: 0.35 });
  return (
    <AbsoluteFill
      style={{
        justifyContent: position === "bottom" ? "flex-end" : "flex-start",
        alignItems: "center",
        padding: 84,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          opacity: e.opacity,
          transform: e.transform,
          color: accent ? theme.color.primaryBright : theme.color.textSecondary,
          fontSize: 30,
          fontWeight: 500,
          letterSpacing: "0.01em",
          fontFamily: theme.type.family,
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
};
