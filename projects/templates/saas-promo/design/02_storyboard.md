# 02 · Storyboard — ClawShow eSign

**Author:** Claude Design (animation director pass)
**Film:** ClawShow eSign — Standalone PDF signing (use case 2 only)
**Format:** 1920×1080 · 30fps · ~50s · dark-SaaS · silent by default (narration optional via zero-key Piper TTS)
**Palette:** canvas `#0A0E1A` · primary `#3B82F6` (workflow) · success `#22C55E` (trust/done)
**Pacing:** 7 scenes. Energy arc: *quiet problem → confident solution → crisp workflow → reassuring trust → warm close.* One idea per scene.

> Components in **bold** are specified in `03_component_library.md`. Narration is the optional VO script; subtitles mirror it.

---

### Scene 1 — Cold Open · The friction
- **Purpose:** Name the pain before naming the product. Establish calm tension.
- **Key message:** Signatures still get stuck.
- **Motion:** 3–4 PDF/email cards drift with parallax; one card stalls and dims (the "stuck" beat) and settles lower with a soft shadow. *Hero motion:* the stalled card settling.
- **Camera:** very slow push-in `1.00→1.02`, slight downward drift.
- **Components:** **AnimatedBackground**, **GradientMesh**, **FloatingCards**, **Particles** (low).
- **Duration:** 6.0s
- **Transition (in):** fade up from `canvas-deep`.
- **Narration:** "Every deal still waits on a signature."
- **CTA:** —

### Scene 2 — Solution · Brand reveal
- **Purpose:** Introduce ClawShow eSign as the answer; set the brand's calm.
- **Key message:** Standalone PDF signing for any business.
- **Motion:** eyebrow `STANDALONE PDF SIGNING` fades in; wordmark + headline fade-rise with 60ms stagger; a hairline underline draws beneath the wordmark. *Hero motion:* headline settle.
- **Camera:** hold with micro push `1.00→1.015`. FloatingCards recede into the background plane.
- **Components:** **CTAHero** (brand mode), **GlassCard**, **AnimatedBackground**.
- **Duration:** 6.0s
- **Transition:** soft push (200ms) from S1.
- **Narration:** "Meet ClawShow eSign — signatures, handled."
- **CTA:** —

### Scene 3 — Upload · Step 1
- **Purpose:** Show step one with believable product UI.
- **Key message:** Upload any PDF.
- **Motion:** **Cursor** glides to a dropzone; a file card drops and settles (spring, calm); **PDFViewer** renders page 1 (fade + 12px rise); quiet **NotificationToast** "PDF added." *Hero motion:* the drop settle.
- **Camera:** slight push toward the dropzone, then settle on the rendered page.
- **Components:** **BrowserWindow**, **PDFViewer**, **Cursor**, **FloatingCards**, **NotificationToast**.
- **Duration:** 7.0s
- **Transition:** **match-cut** — the BrowserWindow flies in and *persists* into S4.
- **Narration:** "Drop in any PDF."
- **CTA:** —

### Scene 4 — Send · Step 2
- **Purpose:** The secure send, in seconds.
- **Key message:** Enter the signer's email; we send a secure link.
- **Motion:** name + email fields fill via mask-reveal (no per-letter typewriter); primary **Send** button **MouseClick** (scale 0.98 + ripple); **EmailFlow** draws a motion line app→inbox with a secure-link envelope; **NotificationToast** "Secure link sent." *Hero motion:* the email line drawing.
- **Camera:** gentle pan left→right following the email line.
- **Components:** **BrowserWindow** (persists), **Cursor**, **MouseClick**, **EmailFlow**, **MotionLines**, **NotificationToast**.
- **Duration:** 7.0s
- **Transition:** push; the envelope becomes S5's anchor.
- **Narration:** "Enter their email. We send a secure link."
- **CTA:** —

### Scene 5 — Sign · Step 3 + identity
- **Purpose:** The signer experience and OTP identity.
- **Key message:** The client signs online and confirms with a one-time code.
- **Motion:** **PhoneMockup** rises; **PDFViewer** (mobile) shows the doc; **SignatureStroke** draws a signature in one calm pass; **OTPInput** six digits fill with 60ms stagger; **VerificationBadge** ticks green with a single soft overshoot. *Hero motion:* signature draw → badge.
- **Camera:** push to the phone, then settle.
- **Components:** **PhoneMockup**, **PDFViewer**, **SignatureStroke**, **OTPInput**, **VerificationBadge**.
- **Duration:** 8.0s
- **Transition:** crossfade — the badge green carries into S6.
- **Narration:** "They sign online and confirm with a one-time code."
- **CTA:** —

### Scene 6 — Trust · Compliance & audit
- **Purpose:** Prove it's secure and evidentiary.
- **Key message:** AES eIDAS — every step timestamped, fingerprinted, audit-ready.
- **Motion:** **AuditTrail**/**Timeline** reveals rows top-down (70ms stagger): *Sent · Opened · OTP verified · Signed · Sealed*, each with a timestamp; a SHA-256 fingerprint chip (mono) sets; **VerificationBadge** "AES eIDAS" seals. *Hero motion:* the trail completing + seal.
- **Camera:** slow vertical drift down the timeline.
- **Components:** **Timeline**, **AuditTrail**, **VerificationBadge**, **GlassCard**.
- **Duration:** 8.0s
- **Transition:** push to brand.
- **Narration:** "Every step is timestamped, fingerprinted, and audit-ready."
- **CTA:** —

### Scene 7 — CTA · Close
- **Purpose:** Brand close + a single clear action.
- **Key message:** Send. Sign. Done.
- **Motion:** **CTAHero** — "ClawShow eSign" settles; badge "AES eIDAS compliant"; tagline "Send. Sign. Done."; primary **CTA button** "Start free" with one calm pulse; URL lower-third. *Hero motion:* button settle.
- **Camera:** near-still, faint push `1.00→1.01`.
- **Components:** **CTAHero**, **GlassCard**, **VerificationBadge**, **AnimatedBackground**.
- **Duration:** 8.0s
- **Transition (out):** fade to brand canvas.
- **Narration:** "ClawShow eSign. Send. Sign. Done."
- **CTA:** **clawshow.ai/esign** · button "Start free"

---

## Timing map

| # | Scene | In–Out | Dur | Accent | Hero motion |
|---|---|---|---|---|---|
| 1 | Friction | 0.0–6.0 | 6.0 | neutral | stalled card settles |
| 2 | Brand | 6.0–12.0 | 6.0 | primary | headline settle |
| 3 | Upload | 12.0–19.0 | 7.0 | primary | file drop settle |
| 4 | Send | 19.0–26.0 | 7.0 | primary | email line draws |
| 5 | Sign+OTP | 26.0–34.0 | 8.0 | primary→success | signature → badge |
| 6 | Trust | 34.0–42.0 | 8.0 | success | audit trail seals |
| 7 | CTA | 42.0–50.0 | 8.0 | success | button settle |

**Total ≈ 50s** (+1s tail). Blue carries scenes 1–4; the palette resolves to green at the moment of trust (5) and stays through the close.

## Director's notes
- **Reuse over bespoke:** every scene is built from library components. Nothing in this storyboard is ClawShow-only except the *copy* and *which* components are placed — exactly what the template config should drive.
- **Restraint check:** if any scene has more than one thing moving meaningfully at once, demote the rest to support.
- **Silence:** scenes 2 and 7 may hold ~0.4s of near-stillness before their hero motion. Let them breathe.
