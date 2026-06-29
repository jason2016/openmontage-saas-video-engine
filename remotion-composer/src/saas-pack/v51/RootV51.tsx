// v5.1 diagnostic root — registers two compositions over the SAME diag props so the
// only variable between them is the typography architecture:
//   DiagOriginal — the UNCHANGED v5 SaasPromo (camera transform wraps typography).
//   DiagFixed    — SaasPromoV51 (camera on stage only; typography static + snapped).
// Both 1920x1080 @30; 4K is produced at render time via renderMedia scale: 2.
import { Composition, CalculateMetadataFunction } from "remotion";
import { SaasPromo, SaasPromoProps } from "../scenes/SaasPromo";
import { SaasPromoV51, SaasPromoV51Props } from "./SaasPromoV51";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const calc: CalculateMetadataFunction<any> = async ({ props }) => {
  const scenes = props.scenes || [];
  const total = scenes.reduce((acc: number, s: { durationSeconds?: number }) => acc + (s.durationSeconds || 0), 0);
  return { durationInFrames: Math.max(30, Math.ceil((total + 1) * 30)) };
};

export const RootV51: React.FC = () => {
  return (
    <>
      <Composition
        id="DiagOriginal"
        component={SaasPromo}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ scenes: [] } as SaasPromoProps}
        calculateMetadata={calc}
      />
      <Composition
        id="DiagFixed"
        component={SaasPromoV51}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ scenes: [] } as SaasPromoV51Props}
        calculateMetadata={calc}
      />
      {/* Canonical full v5.1 master composition (all nine scenes, typography fixed). */}
      <Composition
        id="SaasPromoV51"
        component={SaasPromoV51}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ scenes: [] } as SaasPromoV51Props}
        calculateMetadata={calc}
      />
    </>
  );
};
