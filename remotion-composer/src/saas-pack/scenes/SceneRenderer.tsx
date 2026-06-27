// Data-driven dispatch: scene.type -> a reusable scene template, with content
// passed through from scene.props. Adding a beat = adding a registry entry, not
// editing the composition. No product-specific content lives here.
import { Tokens } from "../tokens";
import { SceneFrame } from "./SceneFrame";
import { SceneSpec } from "./types";
import { ProblemScene } from "./templates/ProblemScene";
import { BrandScene } from "./templates/BrandScene";
import { UploadScene } from "./templates/UploadScene";
import { SendScene } from "./templates/SendScene";
import { SignScene } from "./templates/SignScene";
import { TrustScene } from "./templates/TrustScene";
import { CTAScene } from "./templates/CTAScene";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const REGISTRY: Record<string, React.FC<any>> = {
  problem: ProblemScene,
  brand: BrandScene,
  upload: UploadScene,
  send: SendScene,
  sign: SignScene,
  trust: TrustScene,
  cta: CTAScene,
};

export const SceneRenderer: React.FC<{ scene: SceneSpec; theme: Tokens }> = ({ scene, theme }) => {
  const Template = REGISTRY[scene.type] ?? CTAScene;
  return (
    <SceneFrame>
      <Template theme={theme} {...(scene.props ?? {})} />
    </SceneFrame>
  );
};
