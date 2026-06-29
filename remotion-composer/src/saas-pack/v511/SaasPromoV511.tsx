// v5.1.1 timeline. IDENTICAL to the approved v5.1 SaasPromoV51 (same data-driven
// layout, same one-continuous-AnimatedBackground + one-Sequence-per-scene structure,
// same StableSceneFrame stage/overlay split) with EXACTLY ONE change: the `sign` beat
// is rendered through SignSceneV511 instead of SignSceneV51. SignSceneV511 is the
// verified mobile-document anti-shimmer fix — phone lifted into the static overlay
// (never camera-transformed) and integer-pixel (Math.round) PDF scroll. Its props
// interface is byte-identical to SignSceneV51, so it is a pure drop-in. All eight
// other scenes are imported VERBATIM from the v5.1 modules — frames outside the sign
// beat are bit-for-bit identical to the approved v5.1 master.
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { mergeBrand, BrandOverrides } from "../theme";
import { AnimatedBackground } from "../primitives/AnimatedBackground";
import { SceneSpec } from "../scenes/types";
import { StableSceneFrame } from "../v51/StableSceneFrame";
import { BrandSceneV51 } from "../v51/BrandSceneV51";
import { ProblemSceneV51 } from "../v51/ProblemSceneV51";
import { UploadSceneV51 } from "../v51/UploadSceneV51";
import { InviteSceneV51 } from "../v51/InviteSceneV51";
import { OtpSceneV51 } from "../v51/OtpSceneV51";
import { SignSceneV511 } from "./SignSceneV511";
import { AuditSceneV51 } from "../v51/AuditSceneV51";
import { ComplianceSceneV51 } from "../v51/ComplianceSceneV51";
import { CtaSceneV51 } from "../v51/CtaSceneV51";

const { fontFamily } = loadFont("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const REGISTRY: Record<string, React.FC<any>> = {
  brand: BrandSceneV51,
  problem: ProblemSceneV51,
  upload: UploadSceneV51,
  "invite-flow": InviteSceneV51,
  otp: OtpSceneV51,
  sign: SignSceneV511, // <-- the only delta vs SaasPromoV51 (v5.1.1 anti-shimmer fix)
  audit: AuditSceneV51,
  aes: ComplianceSceneV51,
  compliance: ComplianceSceneV51,
  cta: CtaSceneV51,
};

export interface SaasPromoV511Props {
  [key: string]: unknown;
  brand?: BrandOverrides;
  scenes: SceneSpec[];
}

export const SaasPromoV511: React.FC<SaasPromoV511Props> = ({ brand, scenes = [] }) => {
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
