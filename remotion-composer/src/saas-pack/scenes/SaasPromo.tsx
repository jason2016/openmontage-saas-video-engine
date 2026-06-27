// The SaaS Promo composition. Data-driven: it lays out a scene graph (from
// props) as a sequence of SceneRenderers over one continuous AnimatedBackground.
// No product content here — everything comes from `scenes`.
import { AbsoluteFill, Sequence, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { mergeBrand, BrandOverrides } from "../theme";
import { AnimatedBackground } from "../primitives/AnimatedBackground";
import { SceneRenderer } from "./SceneRenderer";
import { SceneSpec } from "./types";

const { fontFamily } = loadFont("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });

export interface SaasPromoProps {
  [key: string]: unknown;
  brand?: BrandOverrides;
  scenes: SceneSpec[];
}

export const SaasPromo: React.FC<SaasPromoProps> = ({ brand, scenes = [] }) => {
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
        return (
          <Sequence key={scene.id} from={from} durationInFrames={duration} name={scene.type}>
            <SceneRenderer scene={scene} theme={theme} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
