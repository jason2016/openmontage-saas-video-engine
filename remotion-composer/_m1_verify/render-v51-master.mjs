// v5.1 ANTI-SHIMMER PRODUCTION MASTER (1080p). Renders the full nine-scene film
// through SaasPromoV51 (typography lifted out of the camera transform, pixel-snapped)
// using the approved v5 scene graph/props VERBATIM. Encoding = diagnostic clip B:
// H.264, CRF 16, x264 preset slow, 1920x1080, 30fps. Writes a NEW file and never
// touches clawshow-esign-v5.mp4 or any earlier version.
import { bundle } from "@remotion/bundler";
import { selectComposition, renderMedia, renderStill } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const composerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const entry = path.join(composerRoot, "src", "saas-pack", "index-v51.tsx");
// The approved v5 scene graph — unchanged. Only the rendering architecture differs.
const propsPath = path.join(composerRoot, "public", "demo-props", "clawshow-esign-v5.json");
const inputProps = JSON.parse(fs.readFileSync(propsPath, "utf8"));

const outDir = path.resolve(composerRoot, "..", "projects", "clawshow-esign", "renders");
const stillsDir = path.join(outDir, "stills-v51");
fs.mkdirSync(stillsDir, { recursive: true });
const outPath = path.join(outDir, "clawshow-esign-v5.1.mp4");
const v5Path = path.join(outDir, "clawshow-esign-v5.mp4");

console.log("Bundling:", entry);
const serveUrl = await bundle({ entryPoint: entry });
console.log("Bundled OK");

const composition = await selectComposition({ serveUrl, id: "SaasPromoV51", inputProps });
console.log("composition:", composition.id, composition.width + "x" + composition.height,
  composition.durationInFrames + "f @", composition.fps + "fps",
  "(" + (composition.durationInFrames / composition.fps).toFixed(2) + "s)");

// PREFLIGHT (hard gate) — must match the approved v5 spec exactly.
const expect = { width: 1920, height: 1080, fps: 30, durationInFrames: 1677 };
const mism = [];
if (composition.width !== expect.width) mism.push(`width ${composition.width}`);
if (composition.height !== expect.height) mism.push(`height ${composition.height}`);
if (composition.fps !== expect.fps) mism.push(`fps ${composition.fps}`);
if (composition.durationInFrames !== expect.durationInFrames) mism.push(`frames ${composition.durationInFrames} != 1677`);
if (mism.length) { console.error("PREFLIGHT FAIL: " + mism.join("; ")); process.exit(2); }
// Guard: never overwrite the approved v5 master.
if (path.resolve(outPath) === path.resolve(v5Path)) { console.error("REFUSE: would overwrite v5 master"); process.exit(3); }
console.log("PREFLIGHT OK: 1920x1080 @30fps, 1677 frames; output != v5 master");

// 13 spot-check stills FIRST — exercises all nine scene types in ~1 min, so any
// runtime error surfaces before the multi-minute encode. Same frame offsets as v5.
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
    await renderStill({ serveUrl, composition, output: path.join(stillsDir, `clawshow-esign-v51-${label}.png`), frame, inputProps, overwrite: true });
    console.log("STILL OK " + label + " @" + frame);
    ok++;
  } catch (e) {
    console.error("STILL FAIL " + label + " - " + (e && e.message ? e.message : String(e)));
  }
}
console.log("DONE stills " + ok + "/" + shots.length + " -> " + stillsDir);

let lastPct = -1;
const t0 = process.hrtime.bigint();
await renderMedia({
  composition,
  serveUrl,
  codec: "h264",
  crf: 16,
  x264Preset: "slow",
  outputLocation: outPath,
  inputProps,
  onProgress: ({ progress }) => {
    const pct = Math.floor(progress * 100);
    if (pct !== lastPct && pct % 5 === 0) { console.log("progress " + pct + "%"); lastPct = pct; }
  },
});
const secs = Number(process.hrtime.bigint() - t0) / 1e9;
const bytes = fs.statSync(outPath).size;
console.log("DONE mp4 -> " + outPath);
console.log("size_bytes=" + bytes + " size_mb=" + (bytes / 1024 / 1024).toFixed(2) + " render_s=" + secs.toFixed(1));
