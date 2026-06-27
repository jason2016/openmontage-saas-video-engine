// Upload beat: a browser hosting a PDF, a cursor gliding in, a quiet toast.
import { AbsoluteFill } from "remotion";
import { Tokens } from "../../tokens";
import { BrowserWindow } from "../../components/BrowserWindow";
import { PDFViewer } from "../../components/PDFViewer";
import { Cursor } from "../../components/Cursor";
import { NotificationToast } from "../../components/NotificationToast";
import { SceneCaption } from "../SceneCaption";

interface UploadSceneProps {
  theme: Tokens;
  url?: string;
  docTitle?: string;
  caption?: string;
  toast?: string;
}

export const UploadScene: React.FC<UploadSceneProps> = ({ theme, url, docTitle, caption, toast = "PDF added" }) => (
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
    <div style={{ transform: "scale(0.9) translateY(-20px)" }}>
      <BrowserWindow theme={theme} url={url} width={1320} height={660}>
        <PDFViewer theme={theme} title={docTitle} lines={9} delaySeconds={0.55} />
      </BrowserWindow>
    </div>
    <Cursor theme={theme} from={{ x: 24, y: 86 }} to={{ x: 50, y: 47 }} startSeconds={0.5} durationSeconds={1.3} />
    <NotificationToast theme={theme} text={toast} icon="upload" tone="primary" position="top-right" delaySeconds={1.7} />
    {caption && <SceneCaption theme={theme} text={caption} position="bottom" />}
  </AbsoluteFill>
);
