// v4 REVIEW PASS: representative stills only (no full mp4 yet) so the real
// anonymized contract can be reviewed before committing to a full render.
// Emphasis frames: the desktop contract (upload) and the phone contract (sign),
// which carry the document text that must be checked for sensitive content.
import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const composerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const entry = path.join(composerRoot, "src", "saas-pack", "index.tsx");
const propsPath = path.join(composerRoot, "public", "demo-props", "clawshow-esign-v4.json");
const inputProps = JSON.parse(fs.readFileSync(propsPath, "utf8"));
const outDir = path.resolve(composerRoot, "..", "projects", "clawshow-esign", "renders", "stills-v4");
fs.mkdirSync(outDir, { recursive: true });

console.log("Bundling:", entry);
const serveUrl = await bundle({ entryPoint: entry });
console.log("Bundled OK");
const composition = await selectComposition({ serveUrl, id: "SaasPromo", inputProps });
console.log("duration frames:", composition.durationInFrames);

// Scene bounds @30fps: brand 0-108, problem 108-276, upload 276-456,
// invite 456-624, otp 624-792, sign 792-972, audit 972-1152, aes 1152-1320, cta 1320-1500.
const shots = [
  ["01-brand", 92],
  ["02-problem", 215],
  ["03-upload", 360],     // contract in browser + "PDF added" toast
  ["04-upload-doc", 330], // closer/earlier — desktop contract legibility + anonymization check
  ["05-invite", 575],
  ["06-otp", 745],
  ["07-sign", 930],       // contract on phone, signature drawn, "Signed"
  ["08-sign-doc", 900],   // phone contract — anonymization check
  ["09-audit", 1095],
  ["10-aes", 1245],
  ["11-cta", 1410],
  ["12-poster", 1485],
];

let ok = 0;
for (const [label, frame] of shots) {
  try {
    await renderStill({ serveUrl, composition, output: path.join(outDir, `clawshow-esign-v4-${label}.png`), frame, inputProps, overwrite: true });
    console.log("STILL OK " + label + " @" + frame);
    ok++;
  } catch (e) {
    console.error("STILL FAIL " + label + " - " + (e && e.message ? e.message : String(e)));
  }
}
console.log("DONE stills " + ok + "/" + shots.length + " -> " + outDir);
