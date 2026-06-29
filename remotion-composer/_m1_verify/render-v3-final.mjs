// Final deliverable: render clawshow-esign-v3.mp4 AND capture 10 representative
// stills in one pass (bundle once, render media, then render stills). Output goes
// to the project's renders/ dir. v1/v2 untouched. Same proven bundler+renderer path.
import { bundle } from "@remotion/bundler";
import { selectComposition, renderMedia, renderStill } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const composerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const entry = path.join(composerRoot, "src", "saas-pack", "index.tsx");
const propsPath = path.join(composerRoot, "public", "demo-props", "clawshow-esign-v3.json");
const inputProps = JSON.parse(fs.readFileSync(propsPath, "utf8"));

const outDir = path.resolve(composerRoot, "..", "projects", "clawshow-esign", "renders");
const stillsDir = path.join(outDir, "stills");
fs.mkdirSync(stillsDir, { recursive: true });
const outPath = path.join(outDir, "clawshow-esign-v3.mp4");

console.log("Bundling:", entry);
const serveUrl = await bundle({ entryPoint: entry });
console.log("Bundled OK");

const composition = await selectComposition({ serveUrl, id: "SaasPromo", inputProps });
console.log("composition:", composition.id, composition.width + "x" + composition.height,
  composition.durationInFrames + "f @", composition.fps + "fps",
  "(" + (composition.durationInFrames / composition.fps).toFixed(1) + "s)");

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

// 10 representative frames — each timed after its scene's entrances resolve, before
// the camera move drifts. Scene bounds @30fps: brand 0-108, problem 108-276,
// upload 276-456, invite 456-624, otp 624-792, sign 792-972, audit 972-1152,
// aes 1152-1320, cta 1320-1500.
const shots = [
  ["01-brand", 92],   // logo + wordmark + tagline lockup, streams settled
  ["02-problem", 215], // headline over stalled "Awaiting signature" card
  ["03-upload", 395],  // browser + PDF + "PDF added" toast
  ["04-invite", 575],  // email lands in signer inbox
  ["05-otp", 745],     // OTP verified (green), identity confirmed
  ["06-sign", 945],    // signature drawn, "Signed" badge crisp
  ["07-audit", 1095],  // full tamper-evident trail + Sealed/SHA-256
  ["08-aes", 1245],    // AES eIDAS chips settled
  ["09-cta", 1410],    // closing lockup + Start free
  ["10-poster", 1485], // settled hero hold — the poster frame
];

let ok = 0;
for (const [label, frame] of shots) {
  try {
    await renderStill({ serveUrl, composition, output: path.join(stillsDir, `clawshow-esign-v3-${label}.png`), frame, inputProps, overwrite: true });
    console.log("STILL OK " + label + " @" + frame);
    ok++;
  } catch (e) {
    console.error("STILL FAIL " + label + " - " + (e && e.message ? e.message : String(e)));
  }
}
console.log("DONE stills " + ok + "/" + shots.length + " -> " + stillsDir);
