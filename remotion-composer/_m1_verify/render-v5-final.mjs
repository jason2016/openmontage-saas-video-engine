// FINAL MASTER: render clawshow-esign-v5.mp4 (the approved elevated production
// master) AND capture the 13 final review stills + one poster, in a single pass
// (bundle once → assert spec → render media → render stills). Output goes to the
// project's renders/ dir. v1–v4 untouched. Same proven bundler+renderer path as
// render-v3-final.mjs. No source changes after a successful master render.
import { bundle } from "@remotion/bundler";
import { selectComposition, renderMedia, renderStill } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const composerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const entry = path.join(composerRoot, "src", "saas-pack", "index.tsx");
const propsPath = path.join(composerRoot, "public", "demo-props", "clawshow-esign-v5.json");
const inputProps = JSON.parse(fs.readFileSync(propsPath, "utf8"));

const outDir = path.resolve(composerRoot, "..", "projects", "clawshow-esign", "renders");
const stillsDir = path.join(outDir, "stills-v5");
fs.mkdirSync(stillsDir, { recursive: true });
const outPath = path.join(outDir, "clawshow-esign-v5.mp4");

console.log("Bundling:", entry);
const serveUrl = await bundle({ entryPoint: entry });
console.log("Bundled OK");

const composition = await selectComposition({ serveUrl, id: "SaasPromo", inputProps });
console.log("composition:", composition.id, composition.width + "x" + composition.height,
  composition.durationInFrames + "f @", composition.fps + "fps",
  "(" + (composition.durationInFrames / composition.fps).toFixed(2) + "s)");

// PREFLIGHT (hard gate): render spec must match the approved master exactly.
const expect = { width: 1920, height: 1080, fps: 30, durationInFrames: 1677 };
const mismatches = [];
if (composition.width !== expect.width) mismatches.push(`width ${composition.width} != ${expect.width}`);
if (composition.height !== expect.height) mismatches.push(`height ${composition.height} != ${expect.height}`);
if (composition.fps !== expect.fps) mismatches.push(`fps ${composition.fps} != ${expect.fps}`);
if (composition.durationInFrames !== expect.durationInFrames) mismatches.push(`frames ${composition.durationInFrames} != ${expect.durationInFrames}`);
if (mismatches.length) {
  console.error("PREFLIGHT FAIL: " + mismatches.join("; "));
  process.exit(2);
}
console.log("PREFLIGHT OK: 1920x1080 @30fps, 1677 frames (~55.90s incl. 1s tail hold; content 54.90s)");

let lastPct = -1;
await renderMedia({
  composition,
  serveUrl,
  codec: "h264",
  outputLocation: outPath,
  inputProps,
  onProgress: ({ progress }) => {
    const pct = Math.floor(progress * 100);
    if (pct !== lastPct && pct % 5 === 0) {
      console.log("progress " + pct + "%");
      lastPct = pct;
    }
  },
});

const bytes = fs.statSync(outPath).size;
console.log("DONE mp4 -> " + outPath);
console.log("size_bytes=" + bytes + " size_mb=" + (bytes / 1024 / 1024).toFixed(2));

// 13 final stills — frames timed to land mid-scene after entrances settle, before
// the camera-settle/exit drift. Scene bounds @30fps (v5 pacing): brand 0-132,
// problem 132-312, upload 312-522, invite 522-702, otp 702-870, sign 870-1095,
// audit 1095-1275, aes 1275-1443, cta 1443-1647. Total 1677 frames.
const shots = [
  ["01-brand", 80],
  ["02-problem", 230],
  ["03-upload-workspace", 384],
  ["04-upload-doc", 500],
  ["05-invite-mid", 600],
  ["06-invite-await", 680],
  ["07-otp", 800],
  ["08-sign-scroll", 950],
  ["09-sign-signed", 1070],
  ["10-audit", 1180],
  ["11-aes", 1360],
  ["12-cta", 1560],
  ["13-poster", 1600],
];

let ok = 0;
for (const [label, frame] of shots) {
  try {
    await renderStill({ serveUrl, composition, output: path.join(stillsDir, `clawshow-esign-v5-${label}.png`), frame, inputProps, overwrite: true });
    console.log("STILL OK " + label + " @" + frame);
    ok++;
  } catch (e) {
    console.error("STILL FAIL " + label + " - " + (e && e.message ? e.message : String(e)));
  }
}

// One dedicated poster image — the fully-settled CTA lockup (Request Demo + trust
// signals), the strongest single frame to represent the film.
const posterPath = path.join(outDir, "clawshow-esign-v5-poster.png");
await renderStill({ serveUrl, composition, output: posterPath, frame: 1560, inputProps, overwrite: true });
console.log("POSTER OK -> " + posterPath);

console.log("DONE stills " + ok + "/" + shots.length + " -> " + stillsDir);
