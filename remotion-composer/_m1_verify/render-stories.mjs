// M1 verification helper (additive; not part of the bundle or core).
// Bundles the isolated stories entry ONCE, then renders one still per component.
import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const composerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const entry = path.join(composerRoot, "src", "saas-pack", "stories", "index.tsx");
const sub = process.env.STILLS_SUBDIR || "m1";
const outDir = path.resolve(composerRoot, "..", "projects", "templates", "saas-promo", "design", "stills", sub);
fs.mkdirSync(outDir, { recursive: true });

console.log("Bundling:", entry);
const serveUrl = await bundle({ entryPoint: entry });
console.log("Bundled OK");

const argv = process.argv.slice(2);
const ids = argv.length
  ? argv
  : ["s-BrowserWindow", "s-PhoneMockup", "s-PDFViewer", "s-Cursor", "s-MouseClick", "s-Toast", "s-CTAHero"];

let ok = 0;
for (const id of ids) {
  try {
    const composition = await selectComposition({ serveUrl, id });
    const output = path.join(outDir, id + ".png");
    await renderStill({ serveUrl, composition, output, frame: 90, overwrite: true });
    console.log("OK   " + id);
    ok++;
  } catch (e) {
    console.error("FAIL " + id + " - " + (e && e.message ? e.message : String(e)));
  }
}
console.log("DONE " + ok + "/" + ids.length + " -> " + outDir);
