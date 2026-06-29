// Data-driven dispatch: scene.type -> a reusable scene template, with content
// passed through from scene.props and an optional per-beat camera move. Adding a
// beat = adding a registry entry, not editing the composition. No product-specific
// content lives here.
import { Tokens } from "../tokens";
import { SceneFrame } from "./SceneFrame";
import { SceneSpec } from "./types";
import { ProblemScene } from "./templates/ProblemScene";
import { BrandScene } from "./templates/BrandScene";
import { UploadScene } from "./templates/UploadScene";
import { SendScene } from "./templates/SendScene";
import { InviteScene } from "./templates/InviteScene";
import { OtpScene } from "./templates/OtpScene";
import { SignScene } from "./templates/SignScene";
import { AuditScene } from "./templates/AuditScene";
import { ComplianceScene } from "./templates/ComplianceScene";
import { TrustScene } from "./templates/TrustScene";
import { CTAScene } from "./templates/CTAScene";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const REGISTRY: Record<string, React.FC<any>> = {
  brand: BrandScene,
  problem: ProblemScene,
  upload: UploadScene,
  send: SendScene,
  invite: SendScene,
  "invite-flow": InviteScene,
  otp: OtpScene,
  sign: SignScene,
  audit: AuditScene,
  aes: ComplianceScene,
  compliance: ComplianceScene,
  trust: TrustScene,
  cta: CTAScene,
};

export const SceneRenderer: React.FC<{ scene: SceneSpec; theme: Tokens }> = ({ scene, theme }) => {
  const Template = REGISTRY[scene.type] ?? CTAScene;
  return (
    <SceneFrame camera={scene.camera}>
      <Template theme={theme} {...(scene.props ?? {})} />
    </SceneFrame>
  );
};
