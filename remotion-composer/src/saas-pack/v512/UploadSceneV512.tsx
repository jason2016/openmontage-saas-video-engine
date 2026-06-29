// v5.1.2 anti-shimmer fix for the UPLOAD beat.
//
// Root cause (see UploadSceneV51 + UploadScene): the bottom caption was already on the
// static overlay since v5.1, but the entire product walkthrough — the BrowserWindow with
// its URL, the Contracts workspace rows, and the previewed contract document — lived in
// the camera STAGE (camera "pan-right" — changing translate until the ~3.22 s settle). So
// the browser's readable text was continuously re-rasterized by the camera pan and the
// small UI text shimmered at its edges.
//
// Unlike OTP/Audit/Invite/Compliance, the Upload beat is a CHOREOGRAPHED product demo
// (cursor glides → click → workspace cross-dissolves to the document → toast). That
// choreography is intentional, approved motion and is preserved VERBATIM. The only change
// is WHERE it renders: the visible walkthrough is lifted to the static OVERLAY so the
// camera no longer pans the readable text. The STAGE keeps an opacity-0 parity twin so any
// layout/measurement stays byte-identical, and the camera still drives the ambient
// background (parallax preserved). After the dissolve settles, the document is static.
// Copy, colors, the scene's internal timing and scene order are unchanged.
import { AbsoluteFill } from "remotion";
import { Tokens } from "../tokens";
import { UploadScene } from "../scenes/templates/UploadScene";
import { useSnapEntrance } from "../v51/snap";

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

// Stable twin of SceneCaption (opacity + integer-pixel Y rise, no scale) — identical to
// the caption used by UploadSceneV51.
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

export const UploadSceneV512: React.FC<Props> = ({ theme, layer, url, docTitle, toast, caption, contract, workspace }) => {
  const isStage = layer === "stage";
  // The walkthrough renders on BOTH layers: opacity 0 on the camera stage (parity twin,
  // for byte-identical layout), opacity 1 on the static overlay (visible, camera-free).
  // Choreography (cursor/click/dissolve/toast) is preserved exactly.
  return (
    <>
      <div style={{ opacity: isStage ? 0 : 1 }}>
        <UploadScene theme={theme} url={url} docTitle={docTitle} toast={toast} contract={contract} workspace={workspace} />
      </div>
      {!isStage && caption ? <StableCaption theme={theme} text={caption} /> : null}
    </>
  );
};
