// v5.1 timeline. Same data-driven layout as v5 SaasPromo (one continuous
// AnimatedBackground, one Sequence per scene), but each scene is rendered through
// StableSceneFrame with two instances of the scene component — a "stage" instance
// (camera-transformed) and an "overlay" instance (static typography). Used only for
// the anti-shimmer diagnostic; the approved v5 SaasPromo is untouched.
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { mergeBrand, BrandOverrides } from "../theme";
import { AnimatedBackground } from "../primitives/AnimatedBackground";
import { SceneSpec } from "../scenes/types";
import { StableSceneFrame } from "./StableSceneFrame";
import { BrandSceneV51 } from "./BrandSceneV51";
import { ProblemSceneV51 } from "./ProblemSceneV51";
import { UploadSceneV51 } from "./UploadSceneV51";
import { InviteSceneV51 } from "./InviteSceneV51";
import { OtpSceneV51 } from "./OtpSceneV51";
import { SignSceneV51 } from "./SignSceneV51";
import { AuditSceneV51 } from "./AuditSceneV51";
import { ComplianceSceneV51 } from "./ComplianceSceneV51";
import { CtaSceneV51 } from "./CtaSceneV51";

const { fontFamily } = loadFont("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const REGISTRY: Record<string, React.FC<any>> = {
  brand: BrandSceneV51,
  problem: ProblemSceneV51,
  upload: UploadSceneV51,
  "invite-flow": InviteSceneV51,
  otp: OtpSceneV51,
  sign: SignSceneV51,
  audit: AuditSceneV51,
  aes: ComplianceSceneV51,
  compliance: ComplianceSceneV51,
  cta: CtaSceneV51,
};

export interface SaasPromoV51Props {
  [key: string]: unknown;
  brand?: BrandOverrides;
  scenes: SceneSpec[];
}

export const SaasPromoV51: React.FC<SaasPromoV51Props> = ({ brand, scenes = [] }) => {
  const theme = mergeBrand(brand);
  const { fps } = useVideoConfig();

  let cursor = 0;
  return (
    <AbsoluteFill style={{ background: theme.color.canvas, fontFamily: `${fontFamily}, ${theme.type.family}` }}>
      <AnimatedBackground theme={theme} />
      {scenes.map((scene) => {
        const from = Math.round(cursor * fps);
        const duration = Math.max(1, Math.round(scene.durationSeconds * fps));
        cursor += scene.durationSeconds;
        const Comp = REGISTRY[scene.type] ?? CtaSceneV51;
        const props = scene.props ?? {};
        return (
          <Sequence key={scene.id} from={from} durationInFrames={duration} name={scene.type}>
            <StableSceneFrame
              camera={scene.camera}
              stage={<Comp theme={theme} layer="stage" {...props} />}
              overlay={<Comp theme={theme} layer="overlay" {...props} />}
            />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
