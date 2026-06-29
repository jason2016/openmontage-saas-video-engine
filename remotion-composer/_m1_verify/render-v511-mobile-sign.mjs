// v5.1.1 mobile-document anti-shimmer DIAGNOSTIC render.
// Renders the affected SIGN scene as two short comparison clips + adjacent lossless
// PNG frames, using the approved v5 sign-scene props verbatim. Encoding = clip B:
// H.264, CRF 16, x264 preset slow, 1920x1080, 30fps. Writes ONLY into
// renders/mobile-anti-shimmer-tests/ — never touches v5, v5.1 or any master file.
import { bundle } from "@remotion/bundler";
import { selectComposition, renderMedia, renderStill } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const composerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const entry = path.join(composerRoot, "src", "saas-pack", "index-v511-signdiag.tsx");

// Approved v5 scene graph — pull the SIGN scene props + brand verbatim.
const v5 = JSON.parse(fs.readFileSync(path.join(composerRoot, "public", "demo-props", "clawshow-esign-v5.json"), "utf8"));
const sign = v5.scenes.find((s) => s.id === "sign");
if (!sign) { console.error("could not find the sign scene in v5 props"); process.exit(2); }
const inputProps = { brand: v5.brand, camera: sign.camera, props: sign.props };
console.log("sign scene:", JSON.stringify({ camera: sign.camera, durationSeconds: sign.durationSeconds }));

const outDir = path.resolve(composerRoot, "..", "projects", "clawshow-esign", "renders", "mobile-anti-shimmer-tests");
fs.mkdirSync(outDir, { recursive: true });

console.log("Bundling:", entry);
const serveUrl = await bundle({ entryPoint: entry });
console.log("Bundled OK");

// Adjacent-frame capture points across every phase of the choreography (225f @30fps):
//   active scroll  ~1.3s   (0.8->2.0s ramp)
//   deceleration   ~1.9s   (approaching scroll=190)
//   scroll hold    ~2.2s   (scroll constant 190; isolates the CAMERA contribution)
//   scroll stops   ~4.0s   (reaches scroll=372 and rests)
//   signature draw ~4.8s   (stroke drawing)
//   signed end     ~6.5s   (stamp + badge shown, everything static)
const SHOTS = [
  ["scroll-39", 39], ["scroll-40", 40], ["scroll-41", 41],
  ["decel-57", 57], ["decel-58", 58], ["decel-59", 59],
  ["hold-66", 66], ["hold-67", 67], ["hold-68", 68],
  ["stop-119", 119], ["stop-120", 120], ["stop-121", 121],
  ["sign-144", 144], ["sign-145", 145], ["sign-146", 146],
  ["signed-194", 194], ["signed-195", 195], ["signed-196", 196],
];

const VARIANTS = [
  { id: "SignDiagOriginal", clip: "v51-original-mobile-sign.mp4", frames: "frames-original" },
  { id: "SignDiagFixed", clip: "v511-fixed-mobile-sign.mp4", frames: "frames-fixed" },
];

for (const v of VARIANTS) {
  console.log("\n=== " + v.id + " ===");
  const composition = await selectComposition({ serveUrl, id: v.id, inputProps });
  console.log("composition:", composition.id, composition.width + "x" + composition.height,
    composition.durationInFrames + "f @", composition.fps + "fps",
    "(" + (composition.durationInFrames / composition.fps).toFixed(2) + "s)");

  const framesDir = path.join(outDir, v.frames);
  fs.mkdirSync(framesDir, { recursive: true });
  let ok = 0;
  for (const [label, frame] of SHOTS) {
    try {
      await renderStill({ serveUrl, composition, output: path.join(framesDir, `${label}.png`), frame, inputProps, overwrite: true });
      ok++;
    } catch (e) {
      console.error("STILL FAIL " + label + " - " + (e && e.message ? e.message : String(e)));
    }
  }
  console.log("stills " + ok + "/" + SHOTS.length + " -> " + framesDir);

  const outPath = path.join(outDir, v.clip);
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
      if (pct !== lastPct && pct % 20 === 0) { console.log("  progress " + pct + "%"); lastPct = pct; }
    },
  });
  const secs = Number(process.hrtime.bigint() - t0) / 1e9;
  const bytes = fs.statSync(outPath).size;
  console.log("DONE mp4 -> " + outPath);
  console.log("size_bytes=" + bytes + " size_mb=" + (bytes / 1024 / 1024).toFixed(2) + " render_s=" + secs.toFixed(1));
}

console.log("\nALL_DONE");
