// Send beat: a secure link leaving the app and landing in the signer's inbox.
import { AbsoluteFill } from "remotion";
import { Tokens } from "../../tokens";
import { EmailFlow } from "../../components/EmailFlow";
import { SceneCaption } from "../SceneCaption";

interface SendSceneProps {
  theme: Tokens;
  fromLabel?: string;
  toLabel?: string;
  subject?: string;
  caption?: string;
  secure?: boolean;
}

export const SendScene: React.FC<SendSceneProps> = ({ theme, fromLabel, toLabel, subject, caption, secure = true }) => (
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
    <EmailFlow theme={theme} fromLabel={fromLabel} toLabel={toLabel} subject={subject} secure={secure} />
    {caption && <SceneCaption theme={theme} text={caption} position="bottom" />}
  </AbsoluteFill>
);
