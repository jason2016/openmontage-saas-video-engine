// v5.1.2 timeline. IDENTICAL data-driven structure to v5.1 / v5.1.1 (one continuous
// AnimatedBackground + one Sequence per scene, StableSceneFrame stage/overlay split). It
// closes the camera-stage readable-UI shimmer class across ALL nine scenes by swapping in
// the verified anti-shimmer scene fixes:
//
//   brand        BrandSceneV51        (marketing typography already on the overlay — unchanged)
//   problem      ProblemSceneV51      (headline on overlay; FloatingCards = intentional drift — unchanged)
//   upload       UploadSceneV512      (browser walkthrough lifted to overlay, camera-free; choreography preserved)
//   invite-flow  InviteSceneV512      (StatusFlow card lifted to overlay, opacity-only entrance; status motion preserved)
//   otp          OtpSceneV512         (phone + OTP cells on overlay, opacity-only digits, integer geometry, static glow)
//   sign         SignSceneV511        (mobile document fix verified in v5.1.1 — unchanged)
//   audit        AuditSceneV512       (audit card + all internal UI text on overlay, opacity-only rows, static glow)
//   aes          ComplianceSceneV512  (standard chips lifted to overlay, opacity-only entrance, integer geometry)
//   cta          CtaSceneV51          (overlay-entrance only — unchanged)
//
// Every fix is a pure drop-in: each V512/V511 scene's props interface is byte-identical to
// its v5.1 counterpart, and each keeps an opacity-0 parity twin on the camera stage so the
// approved layout/geometry is preserved. Copy, colors, layout, scene order, durations,
// cameras, CTA and narrative are unchanged. Reads the approved v5 scene graph verbatim.
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { mergeBrand, BrandOverrides } from "../theme";
import { AnimatedBackground } from "../primitives/AnimatedBackground";
import { SceneSpec } from "../scenes/types";
import { StableSceneFrame } from "../v51/StableSceneFrame";
import { BrandSceneV51 } from "../v51/BrandSceneV51";
import { ProblemSceneV51 } from "../v51/ProblemSceneV51";
import { UploadSceneV512 } from "./UploadSceneV512";
import { InviteSceneV512 } from "./InviteSceneV512";
import { OtpSceneV512 } from "./OtpSceneV512";
import { SignSceneV511 } from "../v511/SignSceneV511";
import { AuditSceneV512 } from "./AuditSceneV512";
import { ComplianceSceneV512 } from "./ComplianceSceneV512";
import { CtaSceneV51 } from "../v51/CtaSceneV51";

const { fontFamily } = loadFont("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const REGISTRY: Record<string, React.FC<any>> = {
  brand: BrandSceneV51,
  problem: ProblemSceneV51,
  upload: UploadSceneV512, // <-- v5.1.2 anti-shimmer fix
  "invite-flow": InviteSceneV512, // <-- v5.1.2 anti-shimmer fix
  otp: OtpSceneV512, // <-- v5.1.2 anti-shimmer fix
  sign: SignSceneV511, // <-- v5.1.1 anti-shimmer fix (verified, unchanged)
  audit: AuditSceneV512, // <-- v5.1.2 anti-shimmer fix
  aes: ComplianceSceneV512, // <-- v5.1.2 anti-shimmer fix
  compliance: ComplianceSceneV512, // <-- v5.1.2 anti-shimmer fix
  cta: CtaSceneV51,
};

export interface SaasPromoV512Props {
  [key: string]: unknown;
  brand?: BrandOverrides;
  scenes: SceneSpec[];
}

export const SaasPromoV512: React.FC<SaasPromoV512Props> = ({ brand, scenes = [] }) => {
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
