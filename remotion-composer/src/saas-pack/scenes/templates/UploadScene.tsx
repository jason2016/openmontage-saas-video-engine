// Upload beat: a browser hosting the product. In v5 (workspace), it opens on a
// real Contracts workspace, the cursor clicks "New document", and the chosen PDF
// preview cross-dissolves in with a quiet toast — a product walkthrough, not a
// bare upload box. Without `workspace`, it keeps the v4 single-screen behavior.
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Tokens } from "../../tokens";
import { BrowserWindow } from "../../components/BrowserWindow";
import { PDFViewer } from "../../components/PDFViewer";
import { ContractDocument } from "../../components/ContractDocument";
import { ContractsWorkspace } from "../../components/ContractsWorkspace";
import { Cursor } from "../../components/Cursor";
import { MouseClick } from "../../components/MouseClick";
import { NotificationToast } from "../../components/NotificationToast";
import { SceneCaption } from "../SceneCaption";
import { easeSettle } from "../../hooks/easings";

interface UploadSceneProps {
  theme: Tokens;
  url?: string;
  docTitle?: string;
  caption?: string;
  toast?: string;
  // Opt-in (v4): render the real anonymized contract page instead of placeholders.
  contract?: boolean;
  // Opt-in (v5): open on the Contracts workspace, click "New document", then preview.
  workspace?: boolean;
}

export const UploadScene: React.FC<UploadSceneProps> = ({ theme, url, docTitle, caption, toast = "PDF added", contract = false, workspace = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  if (!workspace) {
    // v4 behavior — unchanged.
    return (
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ transform: "scale(0.9) translateY(-20px)" }}>
          <BrowserWindow theme={theme} url={url} width={1320} height={660}>
            <PDFViewer
              theme={theme}
              title={docTitle}
              lines={9}
              delaySeconds={0.55}
              paper={contract ? "#FFFFFF" : undefined}
              document={contract ? <ContractDocument theme={theme} variant="desktop" /> : undefined}
            />
          </BrowserWindow>
        </div>
        <Cursor theme={theme} from={{ x: 24, y: 86 }} to={{ x: 50, y: 47 }} startSeconds={0.5} durationSeconds={1.3} />
        <NotificationToast theme={theme} text={toast} icon="upload" tone="primary" position="top-right" delaySeconds={1.7} />
        {caption && <SceneCaption theme={theme} text={caption} position="bottom" />}
      </AbsoluteFill>
    );
  }

  // v5 workspace → document choreography
  const clickAt = 2.35;
  const wsOpacity = interpolate(t, [clickAt + 0.15, clickAt + 0.7], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeSettle });
  const docOpacity = interpolate(t, [clickAt + 0.3, clickAt + 0.95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeSettle });
  const docScale = 0.985 + 0.015 * docOpacity;

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ transform: "scale(0.9) translateY(-20px)" }}>
        <BrowserWindow theme={theme} url={url} width={1320} height={660}>
          {/* workspace layer */}
          <div style={{ position: "absolute", inset: 0, opacity: wsOpacity }}>
            <ContractsWorkspace theme={theme} primaryHoverAtSeconds={clickAt - 0.35} />
          </div>
          {/* document preview layer */}
          <div style={{ position: "absolute", inset: 0, opacity: docOpacity, transform: `scale(${docScale})` }}>
            <PDFViewer
              theme={theme}
              title={docTitle}
              lines={9}
              paper={contract ? "#FFFFFF" : undefined}
              document={contract ? <ContractDocument theme={theme} variant="desktop" /> : undefined}
            />
          </div>
        </BrowserWindow>
      </div>

      {/* cursor glides to the "New document" button (top-right) and clicks */}
      <Cursor theme={theme} from={{ x: 34, y: 70 }} to={{ x: 75.5, y: 27 }} startSeconds={0.7} durationSeconds={1.45} pressAtSeconds={clickAt} />
      <MouseClick theme={theme} x={75.5} y={27} startSeconds={clickAt} tone="primary" />

      <NotificationToast theme={theme} text={toast} icon="upload" tone="primary" position="top-right" delaySeconds={clickAt + 0.9} />
      {caption && <SceneCaption theme={theme} text={caption} position="bottom" />}
    </AbsoluteFill>
  );
};
