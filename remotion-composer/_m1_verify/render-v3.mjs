// Full render of the SaasPromo composition with the ClawShow eSign v3 scene graph.
// Reuses the proven @remotion/bundler + @remotion/renderer path (same as the stills
// script) so the saas-pack entry is the only thing touched. Output: v3 mp4 under the
// project's renders/ dir. v1/v2 are left untouched (different filenames).
import { bundle } from "@remotion/bundler";
import { selectComposition, renderMedia } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const composerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const entry = path.join(composerRoot, "src", "saas-pack", "index.tsx");
const propsPath = path.join(composerRoot, "public", "demo-props", "clawshow-esign-v3.json");
const inputProps = JSON.parse(fs.readFileSync(propsPath, "utf8"));

const outDir = path.resolve(composerRoot, "..", "projects", "clawshow-esign", "renders");
fs.mkdirSync(outDir, { recursive: true });
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
console.log("DONE -> " + outPath);
console.log("size_bytes=" + bytes + " size_mb=" + (bytes / 1024 / 1024).toFixed(2));
