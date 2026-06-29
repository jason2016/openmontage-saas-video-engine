// v5.1 ANTI-SHIMMER DIAGNOSTIC (non-destructive). Renders three short comparison
// clips over the 5 affected scenes + PNG sequences around the brand wordmark.
//   A  v5-original-test.mp4        DiagOriginal, 1080p, default encoding (current v5)
//   B  v5-typography-fixed-1080p   DiagFixed,    1080p, CRF 16, x264 preset slow
//   C  v5-typography-fixed-4k      DiagFixed,    4K (scale 2), CRF 16, preset slow
// Does NOT touch the approved v5 source/master. Does NOT render the full master.
import { bundle } from "@remotion/bundler";
import { selectComposition, renderMedia, renderStill } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const composerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const entry = path.join(composerRoot, "src", "saas-pack", "index-v51.tsx");
const propsPath = path.join(composerRoot, "public", "demo-props", "clawshow-esign-v51-diag.json");
const inputProps = JSON.parse(fs.readFileSync(propsPath, "utf8"));

const outDir = path.resolve(composerRoot, "..", "projects", "clawshow-esign", "renders", "anti-shimmer-tests");
const pngOrig = path.join(outDir, "png-original");
const pngFixed = path.join(outDir, "png-fixed");
for (const d of [outDir, pngOrig, pngFixed]) fs.mkdirSync(d, { recursive: true });

console.log("Bundling:", entry);
const serveUrl = await bundle({ entryPoint: entry });
console.log("Bundled OK");

const cOrig = await selectComposition({ serveUrl, id: "DiagOriginal", inputProps });
const cFixed = await selectComposition({ serveUrl, id: "DiagFixed", inputProps });
console.log("DiagOriginal:", cOrig.width + "x" + cOrig.height, cOrig.durationInFrames + "f");
console.log("DiagFixed:", cFixed.width + "x" + cFixed.height, cFixed.durationInFrames + "f");

const prog = (label) => {
  let last = -1;
  return ({ progress }) => {
    const pct = Math.floor(progress * 100);
    if (pct !== last && pct % 10 === 0) { console.log(label + " " + pct + "%"); last = pct; }
  };
};

async function clip(comp, file, opts) {
  const out = path.join(outDir, file);
  const t0 = process.hrtime.bigint();
  await renderMedia({ composition: comp, serveUrl, codec: "h264", outputLocation: out, inputProps, onProgress: prog(file), ...opts });
  const secs = Number(process.hrtime.bigint() - t0) / 1e9;
  const bytes = fs.statSync(out).size;
  console.log("CLIP DONE " + file + " size_mb=" + (bytes / 1024 / 1024).toFixed(2) + " render_s=" + secs.toFixed(1));
}

// PNG sequences FIRST (fast — validates both compositions render before the long
// clips). Around the brand wordmark "ClawShow eSign": the wordmark has fully entered
// (~f50) but the pull camera is still moving (settle ends ~f61) — so any frame-to-
// frame change in the wordmark band is pure camera-driven subpixel shift.
const frames = [52, 53, 54, 55, 56, 57, 58, 59, 60];
for (const f of frames) {
  const tag = String(f).padStart(3, "0");
  await renderStill({ serveUrl, composition: cOrig, output: path.join(pngOrig, `brand-${tag}.png`), frame: f, inputProps, overwrite: true });
  await renderStill({ serveUrl, composition: cFixed, output: path.join(pngFixed, `brand-${tag}.png`), frame: f, inputProps, overwrite: true });
}
console.log("PNG SEQ DONE frames " + frames[0] + ".." + frames[frames.length - 1] + " (original + fixed)");

// A — current v5 behavior, unchanged (default encoding, 1080p).
await clip(cOrig, "v5-original-test.mp4", {});
// B — typography fix, 1080p, high quality.
await clip(cFixed, "v5-typography-fixed-1080p.mp4", { crf: 16, x264Preset: "slow" });
// C — same corrected source at 4K (scale 2), high quality.
await clip(cFixed, "v5-typography-fixed-4k.mp4", { crf: 16, x264Preset: "slow", scale: 2 });

console.log("ALL DONE -> " + outDir);
