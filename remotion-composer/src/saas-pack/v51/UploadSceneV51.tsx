// v5.1 upload beat. The entire approved v5 workspace→document choreography (browser,
// workspace, cursor, click, "PDF added" toast) is reused VERBATIM as the camera
// stage — all product motion preserved. The only marketing typography is the bottom
// caption, which is lifted into a static, pixel-snapped overlay.
import { AbsoluteFill } from "remotion";
import { Tokens } from "../tokens";
import { UploadScene } from "../scenes/templates/UploadScene";
import { useSnapEntrance } from "./snap";

type Layer = "stage" | "overlay";

interface Props {
  theme: Tokens;
  layer: Layer;
  url?: string;
  docTitle?: string;
  toast?: string;
  caption?: string;
  contract?: boolean;
  workspace?: boolean;
}

// Stable twin of SceneCaption (opacity + integer-pixel Y, no scale).
const StableCaption: React.FC<{ theme: Tokens; text: string }> = ({ theme, text }) => {
  const e = useSnapEntrance({ delaySeconds: 0.35 });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", padding: 84, pointerEvents: "none" }}>
      <div
        style={{
          opacity: e.opacity,
          transform: e.transform,
          color: theme.color.textSecondary,
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

export const UploadSceneV51: React.FC<Props> = ({ theme, layer, url, docTitle, toast, caption, contract, workspace }) => {
  if (layer === "stage") {
    // Approved v5 choreography, unchanged; caption omitted (it lives in the overlay).
    return <UploadScene theme={theme} url={url} docTitle={docTitle} toast={toast} contract={contract} workspace={workspace} />;
  }
  return caption ? <StableCaption theme={theme} text={caption} /> : null;
};
