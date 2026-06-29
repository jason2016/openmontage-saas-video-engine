// v5.1.1 mobile-document anti-shimmer DIAGNOSTIC root. Two compositions over the
// SAME approved sign-scene props, so the ONLY variables are (a) where the phone lives
// and (b) whether the PDF scroll is integer-snapped:
//
//   SignDiagOriginal — the current v5.1 SignSceneV51: phone in the camera STAGE
//                      (inherits pan-right scale 1.03 + fractional translate) and a
//                      FRACTIONAL PDF scroll. Reproduces the reported jitter.
//   SignDiagFixed    — SignSceneV511: phone lifted to the static OVERLAY (no camera
//                      transform) and an INTEGER-PIXEL PDF scroll.
//
// Both render ONE sign scene through the master's StableSceneFrame wrapper, with the
// approved camera prop (pan-right) and the scene's exact 7.5 s production duration —
// so the camera settle math (0.46 x 225 frames) is identical to the full master and
// the comparison is faithful, not exaggerated.
import { AbsoluteFill, Composition } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { mergeBrand, BrandOverrides } from "../theme";
import { AnimatedBackground } from "../primitives/AnimatedBackground";
import { StableSceneFrame } from "../v51/StableSceneFrame";
import { CameraMove } from "../scenes/SceneFrame";
import { SignSceneV51 } from "../v51/SignSceneV51";
import { SignSceneV511 } from "./SignSceneV511";

const { fontFamily } = loadFont("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });

interface DiagProps {
  [key: string]: unknown;
  brand?: BrandOverrides;
  camera?: CameraMove;
  props?: Record<string, unknown>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const makeScene = (Comp: React.FC<any>): React.FC<DiagProps> =>
  function DiagScene({ brand, camera = "pan-right", props = {} }) {
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

const OriginalScene = makeScene(SignSceneV51);
const FixedScene = makeScene(SignSceneV511);

export const MobileSignDiagRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="SignDiagOriginal"
        component={OriginalScene}
        durationInFrames={225}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ camera: "pan-right", props: {} } as DiagProps}
      />
      <Composition
        id="SignDiagFixed"
        component={FixedScene}
        durationInFrames={225}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ camera: "pan-right", props: {} } as DiagProps}
      />
    </>
  );
};
