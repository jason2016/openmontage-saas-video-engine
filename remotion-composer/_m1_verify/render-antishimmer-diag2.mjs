// v5.1.2 anti-shimmer DIAGNOSTIC renders — round 2: Upload + Invite + Compliance.
//   • Six short clips (1920x1080, 30fps, H.264, CRF 16, preset slow):
//       upload-anti-shimmer-tests/v511-original-upload.mp4     (UploadSceneV51)
//       upload-anti-shimmer-tests/v512-fixed-upload.mp4        (UploadSceneV512)
//       invite-anti-shimmer-tests/v511-original-invite.mp4     (InviteSceneV51)
//       invite-anti-shimmer-tests/v512-fixed-invite.mp4        (InviteSceneV512)
//       compliance-anti-shimmer-tests/v511-original-compliance.mp4 (ComplianceSceneV51)
//       compliance-anti-shimmer-tests/v512-fixed-compliance.mp4    (ComplianceSceneV512)
//   • Lossless adjacent PNG stills at the diagnostic beats for each, straight from the
//     composition (NO H.264), so the readable-text regions can be PSNR-compared without
//     any encoder rounding. Each beat uses the scene's OWN approved camera (pan-right /
//     pan-left / pull) and exact production duration.
import { bundle } from "@remotion/bundler";
import { selectComposition, renderMedia, renderStill } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const composerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const entry = path.join(composerRoot, "src", "saas-pack", "index-antishimmer-diag.tsx");
const rendersRoot = path.resolve(composerRoot, "..", "projects", "clawshow-esign", "renders");

const uploadDir = path.join(rendersRoot, "upload-anti-shimmer-tests");
const inviteDir = path.join(rendersRoot, "invite-anti-shimmer-tests");
const complianceDir = path.join(rendersRoot, "compliance-anti-shimmer-tests");

// Adjacent-frame beats (within each scene's frame range).
const UPLOAD_FRAMES = [30, 31, 50, 51, 65, 66, 85, 86, 120, 121, 150, 151, 200, 201];
const INVITE_FRAMES = [20, 21, 40, 41, 60, 61, 90, 91, 120, 121, 150, 151, 175, 176];
const COMPLIANCE_FRAMES = [20, 21, 35, 36, 50, 51, 60, 61, 100, 101, 150, 151];

const JOBS = [
  { id: "UploadOriginal", mp4: path.join(uploadDir, "v511-original-upload.mp4"), still: path.join(uploadDir, "lossless", "original"), frames: UPLOAD_FRAMES },
  { id: "UploadFixed", mp4: path.join(uploadDir, "v512-fixed-upload.mp4"), still: path.join(uploadDir, "lossless", "fixed"), frames: UPLOAD_FRAMES },
  { id: "InviteOriginal", mp4: path.join(inviteDir, "v511-original-invite.mp4"), still: path.join(inviteDir, "lossless", "original"), frames: INVITE_FRAMES },
  { id: "InviteFixed", mp4: path.join(inviteDir, "v512-fixed-invite.mp4"), still: path.join(inviteDir, "lossless", "fixed"), frames: INVITE_FRAMES },
  { id: "ComplianceOriginal", mp4: path.join(complianceDir, "v511-original-compliance.mp4"), still: path.join(complianceDir, "lossless", "original"), frames: COMPLIANCE_FRAMES },
  { id: "ComplianceFixed", mp4: path.join(complianceDir, "v512-fixed-compliance.mp4"), still: path.join(complianceDir, "lossless", "fixed"), frames: COMPLIANCE_FRAMES },
];

const t0 = Date.now();
console.log("bundling " + entry);
const serveUrl = await bundle({ entryPoint: entry });

for (const job of JOBS) {
  fs.mkdirSync(path.dirname(job.mp4), { recursive: true });
  fs.mkdirSync(job.still, { recursive: true });
  const composition = await selectComposition({ serveUrl, id: job.id });
  console.log(`\n=== ${job.id} (${composition.durationInFrames}f ${composition.width}x${composition.height}) ===`);

  const ms = Date.now();
  await renderMedia({ serveUrl, composition, codec: "h264", crf: 16, x264Preset: "slow", outputLocation: job.mp4 });
  const size = fs.statSync(job.mp4).size;
  console.log(`  mp4 -> ${job.mp4}  (${(size / 1048576).toFixed(2)} MB, ${((Date.now() - ms) / 1000).toFixed(1)}s)`);

  for (const f of job.frames) {
    await renderStill({ serveUrl, composition, output: path.join(job.still, `ll-${f}.png`), frame: f, overwrite: true });
  }
  console.log(`  stills -> ${job.still}  [${job.frames.join(", ")}]`);
}

console.log(`\nDONE in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
