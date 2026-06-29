// v5.1.2 OTP + Audit anti-shimmer DIAGNOSTIC renders.
//   • Four short clips (1920x1080, 30fps, H.264, CRF 16, preset slow):
//       otp-anti-shimmer-tests/v511-original-otp.mp4   (OtpSceneV51   — current master)
//       otp-anti-shimmer-tests/v512-fixed-otp.mp4      (OtpSceneV512  — fixed)
//       audit-anti-shimmer-tests/v511-original-audit.mp4 (AuditSceneV51  — current master)
//       audit-anti-shimmer-tests/v512-fixed-audit.mp4    (AuditSceneV512 — fixed)
//   • Lossless adjacent PNG stills at the diagnostic beats for each, straight from the
//     composition (NO H.264), so the readable-text regions can be PSNR-compared without
//     any encoder rounding. inf on the FIXED stills = byte-identical source frames =
//     zero shimmer at the source.
import { bundle } from "@remotion/bundler";
import { selectComposition, renderMedia, renderStill } from "@remotion/renderer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const composerRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const entry = path.join(composerRoot, "src", "saas-pack", "index-antishimmer-diag.tsx");
const rendersRoot = path.resolve(composerRoot, "..", "projects", "clawshow-esign", "renders");

const otpDir = path.join(rendersRoot, "otp-anti-shimmer-tests");
const auditDir = path.join(rendersRoot, "audit-anti-shimmer-tests");

// Adjacent-frame beats (within each scene's frame range).
const OTP_FRAMES = [33, 34, 47, 48, 50, 51, 57, 58, 90, 91, 100, 101, 150, 151];
const AUDIT_FRAMES = [9, 10, 22, 23, 34, 35, 40, 41, 54, 55, 70, 71, 150, 151];

const JOBS = [
  { id: "OtpOriginal", mp4: path.join(otpDir, "v511-original-otp.mp4"), still: path.join(otpDir, "lossless", "original"), frames: OTP_FRAMES },
  { id: "OtpFixed", mp4: path.join(otpDir, "v512-fixed-otp.mp4"), still: path.join(otpDir, "lossless", "fixed"), frames: OTP_FRAMES },
  { id: "AuditOriginal", mp4: path.join(auditDir, "v511-original-audit.mp4"), still: path.join(auditDir, "lossless", "original"), frames: AUDIT_FRAMES },
  { id: "AuditFixed", mp4: path.join(auditDir, "v512-fixed-audit.mp4"), still: path.join(auditDir, "lossless", "fixed"), frames: AUDIT_FRAMES },
];

const t0 = Date.now();
console.log("bundling " + entry);
const serveUrl = await bundle({ entryPoint: entry });

for (const job of JOBS) {
  fs.mkdirSync(path.dirname(job.mp4), { recursive: true });
  fs.mkdirSync(job.still, { recursive: true });
  const composition = await selectComposition({ serveUrl, id: job.id });
  console.log(`\n=== ${job.id} (${composition.durationInFrames}f ${composition.width}x${composition.height}) ===`);

  // 1) the H.264 diagnostic clip
  const ms = Date.now();
  await renderMedia({
    serveUrl,
    composition,
    codec: "h264",
    crf: 16,
    x264Preset: "slow",
    outputLocation: job.mp4,
    // deterministic; suppress the WSL cgroup memory chatter from concurrency picks
  });
  const size = fs.statSync(job.mp4).size;
  console.log(`  mp4 -> ${job.mp4}  (${(size / 1048576).toFixed(2)} MB, ${((Date.now() - ms) / 1000).toFixed(1)}s)`);

  // 2) lossless adjacent PNG stills at the diagnostic beats
  for (const f of job.frames) {
    await renderStill({ serveUrl, composition, output: path.join(job.still, `ll-${f}.png`), frame: f, overwrite: true });
  }
  console.log(`  stills -> ${job.still}  [${job.frames.join(", ")}]`);
}

console.log(`\nDONE in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
