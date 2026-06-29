// Lossless adjacent-frame proof for the v5.1.1 master. Renders consecutive PNG stills
// (straight from the SaasPromoV511 composition — NO H.264) at the sign-scene hold,
// stop and signed beats, so the phone-text region can be PSNR-compared without any
// encoder rounding. inf = byte-identical source frames = zero shimmer at the source.
import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const composerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const entry = path.join(composerRoot, "src", "saas-pack", "index-v511.tsx");
const propsPath = path.join(composerRoot, "public", "demo-props", "clawshow-esign-v5.json");
const inputProps = JSON.parse(fs.readFileSync(propsPath, "utf8"));
const outDir = path.resolve(composerRoot, "..", "projects", "clawshow-esign", "renders", "master-shimmer-check", "lossless");
fs.mkdirSync(outDir, { recursive: true });

const serveUrl = await bundle({ entryPoint: entry });
const composition = await selectComposition({ serveUrl, id: "SaasPromoV511", inputProps });

// Sign scene absolute frames: hold 936/937, stop 991/992, signed 1064/1065.
const frames = [936, 937, 991, 992, 1064, 1065];
for (const f of frames) {
  await renderStill({ serveUrl, composition, output: path.join(outDir, `ll-${f}.png`), frame: f, inputProps, overwrite: true });
  console.log("LL STILL OK " + f);
}
console.log("DONE lossless stills -> " + outDir);
