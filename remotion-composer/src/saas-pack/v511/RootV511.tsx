// v5.1.1 ANTI-SHIMMER PRODUCTION ROOT. Registers the single canonical full-film
// composition (all nine scenes) through SaasPromoV511 — the approved v5.1 master with
// the verified mobile-document sign-scene fix swapped in. Duration is computed from the
// scene props exactly like v5/v5.1 (sum of durationSeconds + 1s CTA tail hold), so the
// frame count and the deliberate CTA tail are identical to the approved master.
import { Composition, CalculateMetadataFunction } from "remotion";
import { SaasPromoV511, SaasPromoV511Props } from "./SaasPromoV511";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const calc: CalculateMetadataFunction<any> = async ({ props }) => {
  const scenes = props.scenes || [];
  const total = scenes.reduce((acc: number, s: { durationSeconds?: number }) => acc + (s.durationSeconds || 0), 0);
  return { durationInFrames: Math.max(30, Math.ceil((total + 1) * 30)) };
};

export const RootV511: React.FC = () => {
  return (
    <Composition
      id="SaasPromoV511"
      component={SaasPromoV511}
      durationInFrames={300}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{ scenes: [] } as SaasPromoV511Props}
      calculateMetadata={calc}
    />
  );
};
