// Isolated root for the SaaS Motion Pack. Registered by ./index.tsx through its
// OWN entry, so the existing MVP root (src/Root.tsx) is never touched.
// Duration is derived from the scene graph (sum of durations + 1s tail).
import { Composition, CalculateMetadataFunction } from "remotion";
import { SaasPromo, SaasPromoProps } from "./scenes/SaasPromo";

const calculateMetadata: CalculateMetadataFunction<SaasPromoProps> = async ({ props }) => {
  const scenes = props.scenes || [];
  const total = scenes.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);
  return { durationInFrames: Math.max(30, Math.ceil((total + 1) * 30)) };
};

export const SaasPackRoot: React.FC = () => {
  return (
    <Composition
      id="SaasPromo"
      component={SaasPromo}
      durationInFrames={300}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{ scenes: [] } as SaasPromoProps}
      calculateMetadata={calculateMetadata}
    />
  );
};
