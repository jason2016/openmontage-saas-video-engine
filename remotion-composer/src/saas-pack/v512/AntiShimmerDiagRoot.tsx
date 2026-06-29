// v5.1.2 anti-shimmer DIAGNOSTIC root — OTP + Audit, original vs fixed.
//
// Four compositions over the SAME approved scene props, so the ONLY variable is where
// the readable product-UI surface lives (camera STAGE vs static OVERLAY) and how its
// content enters (scale/spring vs opacity-only). Each renders ONE scene through the
// master's StableSceneFrame wrapper with the approved camera ("push") and the scene's
// exact production duration, so the camera settle math matches the full master and the
// comparison is faithful, not exaggerated.
//
//   OtpOriginal   — OtpSceneV51:   phone+badge in the camera stage, spring scale(pop)
//                   digits, animated lock glow. Reproduces the reported OTP jitter.
//   OtpFixed      — OtpSceneV512:  phone+badge on the static overlay, opacity-only
//                   digits, integer geometry, static glow.
//   AuditOriginal — AuditSceneV51: AuditTrail card in the camera stage, GlassCard +
//                   per-row scale(0.98→1) entrances. Reproduces the audit-card jitter.
//   AuditFixed    — AuditSceneV512: AuditTrailStable on the static overlay, opacity-
//                   only card + rows, integer geometry, static glow, SHA on overlay.
//
// Both audit compositions read the privacy-updated signer identity (Marc Delorme).
import { AbsoluteFill, Composition } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { mergeBrand, BrandOverrides } from "../theme";
import { AnimatedBackground } from "../primitives/AnimatedBackground";
import { StableSceneFrame } from "../v51/StableSceneFrame";
import { CameraMove } from "../scenes/SceneFrame";
import { OtpSceneV51 } from "../v51/OtpSceneV51";
import { OtpSceneV512 } from "./OtpSceneV512";
import { AuditSceneV51 } from "../v51/AuditSceneV51";
import { AuditSceneV512 } from "./AuditSceneV512";
import { UploadSceneV51 } from "../v51/UploadSceneV51";
import { UploadSceneV512 } from "./UploadSceneV512";
import { InviteSceneV51 } from "../v51/InviteSceneV51";
import { InviteSceneV512 } from "./InviteSceneV512";
import { ComplianceSceneV51 } from "../v51/ComplianceSceneV51";
import { ComplianceSceneV512 } from "./ComplianceSceneV512";

const { fontFamily } = loadFont("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });

interface DiagProps {
  [key: string]: unknown;
  brand?: BrandOverrides;
  camera?: CameraMove;
  props?: Record<string, unknown>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const makeScene = (Comp: React.FC<any>): React.FC<DiagProps> =>
  function DiagScene({ brand, camera = "push", props = {} }) {
    const theme = mergeBrand(brand);
    return (
      <AbsoluteFill style={{ background: theme.color.canvas, fontFamily: `${fontFamily}, ${theme.type.family}` }}>
        <AnimatedBackground theme={theme} />
        <StableSceneFrame
          camera={camera}
          stage={<Comp theme={theme} layer="stage" {...props} />}
          overlay={<Comp theme={theme} layer="overlay" {...props} />}
        />
      </AbsoluteFill>
    );
  };

const OtpOriginalScene = makeScene(OtpSceneV51);
const OtpFixedScene = makeScene(OtpSceneV512);
const AuditOriginalScene = makeScene(AuditSceneV51);
const AuditFixedScene = makeScene(AuditSceneV512);
const UploadOriginalScene = makeScene(UploadSceneV51);
const UploadFixedScene = makeScene(UploadSceneV512);
const InviteOriginalScene = makeScene(InviteSceneV51);
const InviteFixedScene = makeScene(InviteSceneV512);
const ComplianceOriginalScene = makeScene(ComplianceSceneV51);
const ComplianceFixedScene = makeScene(ComplianceSceneV512);

const OTP_PROPS = {
  phoneHint: "+1 ••• 4821",
  otp: "284913",
  headline: "One code. One signer.",
  verifiedLabel: "Identity verified",
};

const AUDIT_PROPS = {
  headline: "Every step, recorded.",
  subtitle: "A tamper-evident trail behind every signature.",
  fingerprint: "SHA-256  3f9a 7c12 b80e … a4d1",
  auditEntries: [
    { action: "Document sent", actor: "demo-prestataire@example.com", timestamp: "09:42:11" },
    { action: "Opened by signer", actor: "demo-client@example.com", timestamp: "09:55:03" },
    { action: "Identity verified · OTP", actor: "+1 ••• 4821", timestamp: "09:55:46" },
    { action: "Signed", actor: "Marc Delorme", timestamp: "09:56:20" },
  ],
};

// Exact approved props (clawshow-esign-v5.json) for the three newly-corrected beats.
const UPLOAD_PROPS = {
  url: "app.clawshow.ai",
  docTitle: "Contrat de prestation de services.pdf",
  toast: "PDF added",
  caption: "Open any contract",
  contract: true,
  workspace: true,
};

const INVITE_PROPS = {
  eyebrow: "Invitation",
  headline: "Sent in one click.",
  subtitle: "A secure, single-use signing link — and you track every step until it's signed.",
  docTitle: "Contrat de prestation de services.pdf",
  steps: [
    { label: "Preparing invitation", sub: "Generating secure signing link", icon: "spark" },
    { label: "Email sent", sub: "To demo-client@example.com", icon: "mail" },
    { label: "Signer inbox", sub: "Delivered · message opened", icon: "inbox" },
    { label: "Awaiting signature", sub: "Single-use link · expires in 7 days", icon: "clock" },
  ],
};

const COMPLIANCE_PROPS = {
  eyebrow: "Compliance",
  headline: "AES eIDAS ready.",
  subtitle: "Advanced electronic signatures, aligned to EU eIDAS — built in, not bolted on.",
  standards: [
    { label: "AES", sub: "Advanced e-signature" },
    { label: "eIDAS", sub: "EU regulation" },
    { label: "SHA-256", sub: "Document hash" },
    { label: "OTP 2FA", sub: "Identity proof" },
  ],
};

export const AntiShimmerDiagRoot: React.FC = () => {
  return (
    <>
      <Composition id="OtpOriginal" component={OtpOriginalScene} durationInFrames={168} fps={30} width={1920} height={1080} defaultProps={{ camera: "push", props: OTP_PROPS } as DiagProps} />
      <Composition id="OtpFixed" component={OtpFixedScene} durationInFrames={168} fps={30} width={1920} height={1080} defaultProps={{ camera: "push", props: OTP_PROPS } as DiagProps} />
      <Composition id="AuditOriginal" component={AuditOriginalScene} durationInFrames={180} fps={30} width={1920} height={1080} defaultProps={{ camera: "push", props: AUDIT_PROPS } as DiagProps} />
      <Composition id="AuditFixed" component={AuditFixedScene} durationInFrames={180} fps={30} width={1920} height={1080} defaultProps={{ camera: "push", props: AUDIT_PROPS } as DiagProps} />

      {/* Three additional beats added to v5.1.2 scope — each rendered through its OWN
          approved camera (upload pan-right, invite pan-left, compliance pull) and exact
          production duration, so the comparison faithfully reproduces the master. */}
      <Composition id="UploadOriginal" component={UploadOriginalScene} durationInFrames={210} fps={30} width={1920} height={1080} defaultProps={{ camera: "pan-right", props: UPLOAD_PROPS } as DiagProps} />
      <Composition id="UploadFixed" component={UploadFixedScene} durationInFrames={210} fps={30} width={1920} height={1080} defaultProps={{ camera: "pan-right", props: UPLOAD_PROPS } as DiagProps} />
      <Composition id="InviteOriginal" component={InviteOriginalScene} durationInFrames={180} fps={30} width={1920} height={1080} defaultProps={{ camera: "pan-left", props: INVITE_PROPS } as DiagProps} />
      <Composition id="InviteFixed" component={InviteFixedScene} durationInFrames={180} fps={30} width={1920} height={1080} defaultProps={{ camera: "pan-left", props: INVITE_PROPS } as DiagProps} />
      <Composition id="ComplianceOriginal" component={ComplianceOriginalScene} durationInFrames={168} fps={30} width={1920} height={1080} defaultProps={{ camera: "pull", props: COMPLIANCE_PROPS } as DiagProps} />
      <Composition id="ComplianceFixed" component={ComplianceFixedScene} durationInFrames={168} fps={30} width={1920} height={1080} defaultProps={{ camera: "pull", props: COMPLIANCE_PROPS } as DiagProps} />
    </>
  );
};
