// v5.1.1 ANTI-SHIMMER PRODUCTION MASTER (1080p). Renders the full nine-scene film
// through SaasPromoV511 — the approved v5.1 master with the VERIFIED mobile-document
// sign-scene fix (phone in static overlay; integer-pixel Math.round PDF scroll) swapped
// in for the sign beat ONLY. Uses the approved v5 scene graph/props VERBATIM.
// Encoding = H.264 / libx264, CRF 16, x264 preset slow, 1920x1080, 30fps. Writes a NEW
// file (clawshow-esign-v5.1.1.mp4) and never touches v5 or v5.1.
import { bundle } from "@remotion/bundler";
import { selectComposition, renderMedia, renderStill } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const composerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const entry = path.join(composerRoot, "src", "saas-pack", "index-v511.tsx");
// The approved v5 scene graph — unchanged. Only the sign-scene rendering differs.
const propsPath = path.join(composerRoot, "public", "demo-props", "clawshow-esign-v5.json");
if (!fs.existsSync(propsPath)) { console.error("MISSING PROPS: " + propsPath); process.exit(10); }
const inputProps = JSON.parse(fs.readFileSync(propsPath, "utf8"));

// Sanity: the props must contain the nine scenes incl. the sign beat we are fixing.
const scenes = inputProps.scenes || [];
const sign = scenes.find((s) => s.type === "sign");
if (scenes.length !== 9) { console.error("PREFLIGHT FAIL: expected 9 scenes, got " + scenes.length); process.exit(11); }
if (!sign || !sign.props || sign.props.autoscroll !== true || sign.props.contract !== true) {
  console.error("PREFLIGHT FAIL: sign scene missing or not contract+autoscroll"); process.exit(12);
}

const outDir = path.resolve(composerRoot, "..", "projects", "clawshow-esign", "renders");
const stillsDir = path.join(outDir, "stills-v511-master");
fs.mkdirSync(stillsDir, { recursive: true });
const outPath = path.join(outDir, "clawshow-esign-v5.1.1.mp4");
const v5Path = path.join(outDir, "clawshow-esign-v5.mp4");
const v51Path = path.join(outDir, "clawshow-esign-v5.1.mp4");

// Hard guard: the output must not collide with ANY earlier master.
for (const [name, p] of [["v5", v5Path], ["v5.1", v51Path]]) {
  if (path.resolve(outPath) === path.resolve(p)) { console.error("REFUSE: would overwrite " + name + " master"); process.exit(3); }
}

console.log("Bundling:", entry);
const serveUrl = await bundle({ entryPoint: entry });
console.log("Bundled OK");

const composition = await selectComposition({ serveUrl, id: "SaasPromoV511", inputProps });
console.log("composition:", composition.id, composition.width + "x" + composition.height,
  composition.durationInFrames + "f @", composition.fps + "fps",
  "(" + (composition.durationInFrames / composition.fps).toFixed(2) + "s)");

// PREFLIGHT (hard gate) — must match the approved v5 / v5.1 spec exactly.
const expect = { width: 1920, height: 1080, fps: 30, durationInFrames: 1677 };
const mism = [];
if (composition.width !== expect.width) mism.push(`width ${composition.width}`);
if (composition.height !== expect.height) mism.push(`height ${composition.height}`);
if (composition.fps !== expect.fps) mism.push(`fps ${composition.fps}`);
if (composition.durationInFrames !== expect.durationInFrames) mism.push(`frames ${composition.durationInFrames} != 1677`);
if (mism.length) { console.error("PREFLIGHT FAIL: " + mism.join("; ")); process.exit(2); }
console.log("PREFLIGHT OK: 1920x1080 @30fps, 1677 frames (55.90s); output != v5 / v5.1 masters");

// Final-render visual spot-check stills FIRST — exercises all nine scene types plus the
// five sign sub-beats in ~1.5 min, so any runtime error surfaces before the long encode.
// Frame offsets: brand 0-131, problem 132-311, upload 312-521, invite 522-701,
// otp 702-869, SIGN 870-1094, audit 1095-1274, aes 1275-1442, cta 1443-1646, tail 1647-1676.
const shots = [
  ["01-brand-wordmark", 80],
  ["02-problem-headline", 230],
  ["03-contracts-workspace", 384],
  ["04-desktop-contract", 500],
  ["05-invitation-flow", 600],
  ["06-otp", 800],
  ["07-sign-active-scroll", 909],   // sign local t~1.30s — PDF mid-scroll
  ["08-sign-decel", 928],           // sign local t~1.93s — approaching first plateau
  ["09-sign-stop", 991],            // sign local t~4.03s — scroll fully stopped
  ["10-signature-drawing", 1020],   // sign local t~5.00s — signature mid-draw
  ["11-signed-end-state", 1074],    // sign local t~6.80s — Signe stamp + Signed badge
  ["12-audit-trail", 1180],
  ["13-compliance", 1360],
  ["14-final-cta", 1560],
  ["15-cta-tail", 1664],            // CTA tail hold (identical to v5.1)
];
let ok = 0;
for (const [label, frame] of shots) {
  try {
    await renderStill({ serveUrl, composition, output: path.join(stillsDir, `clawshow-esign-v511-${label}.png`), frame, inputProps, overwrite: true });
    console.log("STILL OK " + label + " @" + frame);
    ok++;
  } catch (e) {
    console.error("STILL FAIL " + label + " - " + (e && e.message ? e.message : String(e)));
  }
}
console.log("DONE stills " + ok + "/" + shots.length + " -> " + stillsDir);
if (ok !== shots.length) { console.error("ABORT: not all spot-check stills rendered (a scene failed to compile)"); process.exit(4); }

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
console.log("ENCODE crf=16 x264Preset=slow codec=h264");
