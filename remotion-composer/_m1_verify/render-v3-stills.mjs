// Render representative stills of the SaasPromo composition with the v3 props,
// one near the middle of each scene, for fast visual review before full render.
import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const composerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const entry = path.join(composerRoot, "src", "saas-pack", "index.tsx");
const propsPath = path.join(composerRoot, "public", "demo-props", "clawshow-esign-v3.json");
const inputProps = JSON.parse(fs.readFileSync(propsPath, "utf8"));
const outDir = path.resolve(composerRoot, "..", "projects", "templates", "saas-promo", "design", "stills", "v3");
fs.mkdirSync(outDir, { recursive: true });

console.log("Bundling:", entry);
const serveUrl = await bundle({ entryPoint: entry });
console.log("Bundled OK");
const composition = await selectComposition({ serveUrl, id: "SaasPromo", inputProps });
console.log("duration frames:", composition.durationInFrames);

// near-mid frame per scene (brand,problem,upload,invite,otp,sign,audit,aes,cta)
const shots = { brand: 60, problem: 195, upload: 380, invite: 555, otp: 735, sign: 890, audit: 1080, aes: 1235, cta: 1420 };
let ok = 0;
for (const [label, frame] of Object.entries(shots)) {
  try {
    await renderStill({ serveUrl, composition, output: path.join(outDir, `v3-${label}.png`), frame, inputProps, overwrite: true });
    console.log("OK   " + label + " @" + frame);
    ok++;
  } catch (e) {
    console.error("FAIL " + label + " - " + (e && e.message ? e.message : String(e)));
  }
}
console.log("DONE " + ok + "/" + Object.keys(shots).length + " -> " + outDir);
