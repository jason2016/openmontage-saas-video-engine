// v5 REVIEW PASS: representative stills only (no full mp4 yet). v5 = the final
// production-quality master: real Contracts workspace before upload, a SaaS
// invitation status flow, an auto-scrolling phone PDF that signs, and a redesigned
// CTA with trust signals. Stills first so the new screens can be reviewed.
import { bundle } from "@remotion/bundler";
import { selectComposition, renderStill } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const composerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const entry = path.join(composerRoot, "src", "saas-pack", "index.tsx");
const propsPath = path.join(composerRoot, "public", "demo-props", "clawshow-esign-v5.json");
const inputProps = JSON.parse(fs.readFileSync(propsPath, "utf8"));
const outDir = path.resolve(composerRoot, "..", "projects", "clawshow-esign", "renders", "stills-v5");
fs.mkdirSync(outDir, { recursive: true });

console.log("Bundling:", entry);
const serveUrl = await bundle({ entryPoint: entry });
console.log("Bundled OK");
const composition = await selectComposition({ serveUrl, id: "SaasPromo", inputProps });
console.log("duration frames:", composition.durationInFrames);

// Scene bounds @30fps (v5 motion-direction pacing): brand 0-132, problem 132-312,
// upload 312-522, invite-flow 522-702, otp 702-870, sign 870-1095, audit 1095-1275,
// aes 1275-1443, cta 1443-1647. Total 1677 frames.
const shots = [
  ["01-brand", 80],
  ["02-problem", 230],
  ["03-upload-workspace", 384], // button hover-lift + cursor pressing "New document"
  ["04-upload-doc", 500],       // preview opened + "PDF added" toast
  ["05-invite-mid", 600],       // status flow: early steps resolving
  ["06-invite-await", 680],     // status flow: awaiting-signature pulse
  ["07-otp", 800],
  ["08-sign-scroll", 950],      // phone PDF mid auto-scroll
  ["09-sign-signed", 1070],     // signature drawn + "Signé" stamp + Signed badge
  ["10-audit", 1180],
  ["11-aes", 1360],
  ["12-cta", 1560],             // Request Demo + trust signals
  ["13-poster", 1600],
];

let ok = 0;
for (const [label, frame] of shots) {
  try {
    await renderStill({ serveUrl, composition, output: path.join(outDir, `clawshow-esign-v5-${label}.png`), frame, inputProps, overwrite: true });
    console.log("STILL OK " + label + " @" + frame);
    ok++;
  } catch (e) {
    console.error("STILL FAIL " + label + " - " + (e && e.message ? e.message : String(e)));
  }
}
console.log("DONE stills " + ok + "/" + shots.length + " -> " + outDir);
