# ClawShow eSign — Remaining Shimmer Audit (full film, 9 scenes)

**Scope of this document:** a complete transform-ancestry audit of every readable
in-product UI element and thin border across all nine scenes of the master film, so we
stop fixing shimmer one scene at a time. It records the systemic root cause, classifies
every readable surface, and recommends the exact scope of the next full master.

- **Film:** `SaasPromoV511` (master template) → per scene: one continuous
  `AnimatedBackground` + one `Sequence` → `StableSceneFrame`.
- **Render target:** 1920×1080, 30 fps, DPR 1, H.264 CRF 16 / preset slow.
- **Status date:** in-progress v5.1.2 correction pass (OTP + Audit + privacy).
- **Masters frozen:** v3, v4, v5, v5.1, v5.1.1 unchanged. This audit informs the
  *next* master only; nothing here has been rendered to a master yet.

---

## 1. The systemic root cause (one mechanism, many scenes)

`StableSceneFrame` renders each scene as **two sibling layers**:

```
<AbsoluteFill opacity={sceneCrossfade}>
  <AbsoluteFill transform="translate(tx,ty) scale(scale)" willChange="transform">
     {stage}     ← camera-transformed
  </AbsoluteFill>
  <AbsoluteFill>{overlay}</AbsoluteFill>   ← NO transform, scale exactly 1
</AbsoluteFill>
```

Camera math (`StableSceneFrame`), with `g = easeCamera(frame/settleEnd)`,
`settleEnd = 0.46 × durationInFrames`:

| Camera | Transform while `g` goes 0→1 | After settle (held) |
|---|---|---|
| `push` | `scale = 1 + 0.038·g` — **changing scale** | constant `scale 1.038` |
| `pull` | `scale = 1.04 − 0.038·g` — **changing scale** | constant `scale 1.002` |
| `pan-right`/`pan-left` | `scale 1.03` const, `tx = ∓26 ± 52·g` — **changing translate** | constant `scale 1.03`, tx held |

**Why text shimmers:** any glyph rendered inside the stage is re-rasterized every frame
while the camera transform changes (the `0…settleEnd` window). A **changing scale**
(`push`/`pull`) re-rasterizes glyph *interiors and edges* (worst); a **changing translate**
(`pan`) re-rasterizes glyph *edges* (milder). Once the camera settles, the transform is
constant — the text is then *soft but stable* (a constant non-integer scale is rendered
identically every frame, so there is no frame-to-frame jitter; only a one-time softening).

**What v5.1 / v5.1.1 already did:** the v5.1 pass lifted only the **marketing typography**
(scene headlines, eyebrows, subtitles, captions, the CTA hero lockup) to the static
overlay. v5.1.1 additionally lifted the **sign-scene phone**. **Everything else — every
scene's in-product UI panel — is still on the camera stage.** OTP and Audit are simply
the two where the product text is small, central, high-contrast, and visible *during* the
camera's changing window, so the jitter is obvious.

**Compounding factor — entrance scale.** Several stage panels enter through `useEntrance`,
which animates `scale(0.98→1)` (and `translateY`) on the readable rows/cards themselves —
this stacks on top of the camera transform during the entrance. `useSnapEntrance`
(opacity + integer-pixel Y, scale exactly 1) is the shimmer-safe alternative already used
by the overlay typography.

**The fix pattern (proven in v5.1, v5.1.1, and this v5.1.2 pass):** lift the visible
readable surface to the static overlay, keep an `opacity:0` parity copy on the stage for
exact layout, and make its internal entrances **opacity-only** (no scale/spring/fractional
translate); use integer geometry; make any "success" glow a **discrete static** value, not
an animated box-shadow/pulse.

---

## 2. PART A — OTP transform-ancestry trace (REQUIRES CORRECTION → fixed in v5.1.2)

Scene `otp`, camera **`push`**, duration 5.6 s = 168 f, settle `0.46×168 ≈ 77 f ≈ 2.58 s`.
Digits become readable at **1.1 s** and finish at **1.9 s** — entirely inside the
changing-scale window.

| Element | Transform ancestry (outermost → element) | Camera-transformed? | Fractional coords? | Animated / non-1 scale? |
|---|---|---|---|---|
| Visible PhoneMockup | StableSceneFrame stage `scale(1+0.038g)` → row → `PhoneMockup` entrance `translateY(28→0) scale(0.96→1)` | **YES (push)** | yes (camera scale; entrance settles 0.6 s) | **YES** — camera changing scale + entrance scale |
| OTP row container | …phone → screen `opacity` → row flex | YES | row width 327 (int) but on camera scale | inherits camera scale |
| Each of six cells | …row → cell | YES | cell 44×56 int; **border 1.5px (non-int)** | inherits camera scale |
| Each digit glyph | …cell → `<span transform=scale(pop)>` | YES | — | **YES** — per-digit `spring(from 0.6→1)` overshoot **+** camera scale |
| Green borders | …cell `border:1.5px solid` (color step) | YES | **1.5px non-integer** | width const; re-rasterized by camera scale |
| Validation lock icon | …screen → icon `boxShadow:0 0 (24·verifiedGlow)px` | YES | — | **animated box-shadow glow** (3.0–3.4 s) + camera scale |
| "Identity verified" badge | stage column → `VerificationBadge` medallion `scale(pop)` (damping 9 overshoot) | YES | — | **YES** — medallion spring + camera scale |
| "Resend code" | …phone screen (static text) | YES | — | camera scale only |

**Dominant source: a COMBINATION, led by the camera `push` (a continuously-changing
scale on the entire phone during the exact window the digits are readable).** Stacked on
top: (2) the per-digit `spring scale(pop)` overshoot; (3) the animated lock-icon glow;
(4) the badge medallion spring; and the latent (5) 1.5px non-integer cell border amplified
by the camera scale. PhoneMockup's entrance scale settles before 1.1 s, so it contributes
only an early (pre-readable) flicker.

**Fix (v5.1.2 — `OtpSceneV512` + `OTPInputStable`):** phone **and** badge lifted to the
static overlay (opacity:0 parity phone on the stage); digits enter **opacity-only**
(no `pop`); integer border-box cell geometry (outer 47×59 preserved, border → integer
2px); lock glow → **discrete static** step at the verify moment.

---

## 3. PART A2 — Audit Trail transform-ancestry trace (REQUIRES CORRECTION → fixed in v5.1.2)

Scene `audit`, camera **`push`**, duration 6.0 s = 180 f, settle `0.46×180 ≈ 83 f ≈ 2.76 s`.
Rows reveal 0.7 / 0.9 / 1.1 / 1.3 s, seal 1.7 s — inside the changing-scale window.

| Element | Transform ancestry | Camera-transformed? | Fractional coords? | Animated / non-1 scale? |
|---|---|---|---|---|
| Visible AuditTrail card | stage `scale(1+0.038g)` → column → `GlassCard` entrance `translateY + scale(0.98→1)` | **YES (push)** | — | **YES** — camera scale + card entrance scale |
| Card header ("Audit trail", "TAMPER-EVIDENT") | …card → header flex | YES | — | inherits card+camera scale |
| Each event row | …card → `Row` `transform = useEntrance.transform` (`translateY + scale 0.98→1`) | YES | distance 12 px translateY | **YES** — per-row entrance scale **+** camera scale |
| Left-side check icons | …row → circle `border:1.5px solid success66` | YES | **1.5px non-integer** ring | inherits row+camera scale |
| Row labels / actor / email | …row text (21 px / muted) | YES | — | inherits row+camera scale |
| Right-side timestamps | …row → `fontFamily mono`, 16 px | YES | — | **mono text on camera+entrance scale** (highly visible) |
| "Sealed" footer + lock icon | …card → seal `transform = useEntrance.transform` | YES | — | **YES** — footer entrance scale + camera scale |
| SHA-256 fingerprint | …seal → `fontFamily mono`, 15 px muted | YES | — | **mono text on camera+entrance scale** |
| Card border / row dividers | GlassCard `1px` border; dividers `height:1` | YES | 1px (int) but re-rasterized by camera scale | camera scale |

No continuous pulse/blur/filter inside AuditTrail itself (unlike StatusFlow). The jitter is
**camera `push` (changing scale) + GlassCard card-entrance scale + per-row entrance scale**,
worst on the small **monospace timestamps and the SHA-256 fingerprint**. `willChange:
transform` is set on the camera stage (StableSceneFrame), not on the card itself.

**Fix (v5.1.2 — `AuditSceneV512` + `AuditTrailStable`):** card lifted to the static
overlay (opacity:0 parity card on the stage); **opacity-only** card entrance and
**opacity-only** per-row reveals (no scale/translate); integer geometry (icon rings →
border-box integer 2px, outer 29 px preserved; dividers/border 1px); SHA-256 rendered on
the overlay, pixel-identical after reveal; green "Sealed"/icons static (no pulse).

---

## 4. Full-film classification table

Classification legend — **CORRECTED** (stable overlay) · **SAFE** (overlay typography) ·
**LOW** (camera-transformed but visually safe / intentional) · **MEDIUM** (readable
product text on the camera stage, same latent class as OTP/Audit, milder) ·
**REQUIRES CORRECTION** (confirmed visible shimmer).

### Scene 1 — BRAND (camera `pull`)
| Component | Readable text | Layer | Camera-tf? | Fractional? | Animated/≠1 scale? | Risk | Correction |
|---|---|---|---|---|---|---|---|
| eyebrow / wordmark / tagline | yes | **overlay** | no | no | no (snap entrance) | **SAFE** | none |
| `Logo` mark | no (decorative) | stage | yes (pull) | — | entrance/pulse, decorative | **LOW** | none (not text) |
| `ConvergenceStreams` | no | stage | yes | — | continuous, decorative | **LOW** | none (ambient) |

### Scene 2 — PROBLEM (camera `push`)
| Component | Readable text | Layer | Camera-tf? | Fractional? | Animated/≠1 scale? | Risk | Correction |
|---|---|---|---|---|---|---|---|
| headline / subtitle | yes | **overlay** | no | no | no (snap) | **SAFE** | none |
| `FloatingCards` labels (`NDA.pdf`…, "Awaiting signature") | yes (small, peripheral) | stage | yes (push) | **continuous sin/cos drift** on left/top % + entrance `scale(0.98→1)` | **YES** (intentional drift + entrance scale + camera) | **LOW** | Intentional parallax drift — accept. Labels are designed to float, not hold still; not the static-UI class. |

### Scene 3 — UPLOAD (camera `pan-right`, settle ≈ 3.22 s)
| Component | Readable text | Layer | Camera-tf? | Fractional? | Animated/≠1 scale? | Risk | Correction |
|---|---|---|---|---|---|---|---|
| bottom caption "Open any contract" | yes | **overlay** | no | no | no (snap) | **SAFE** | none |
| `BrowserWindow` chrome + url `app.clawshow.ai` | yes | stage | yes (pan) | — | entrance `scale(0.965→1)` + camera | **MEDIUM** | overlay-lift |
| `ContractsWorkspace` (nav, "Contracts", table header, 4 doc rows, "Signed" pills, "Studio Méridien/Business plan") | yes | stage | yes (pan) | row dividers 1px; pill border 1px | rows use `translateY` only (no scale) + camera tx | **MEDIUM** | overlay-lift |
| `ContractDocument` desktop (title, parties, **emails**, articles, pricing) | yes | stage | yes (pan) | many `×s` fractional sizes & 1px×s borders | static internally; camera tx during settle | **MEDIUM** | overlay-lift |
| `NotificationToast` "PDF added" | yes | stage | yes (pan) | — | slide-in `translateX` (settles) + camera | **LOW** | overlay-lift (optional) |

> Pan-translate edge-shimmer is milder than push/pull interior-shimmer, and the contract
> document is largely revealed *after* the cursor choreography (closer to camera settle),
> so visible residual is lower than OTP/Audit — but it is the same class.

### Scene 4 — INVITE (camera `pan-left`, settle ≈ 2.76 s)
| Component | Readable text | Layer | Camera-tf? | Fractional? | Animated/≠1 scale? | Risk | Correction |
|---|---|---|---|---|---|---|---|
| eyebrow / headline / subtitle | yes | **overlay** | no | no | no (snap) | **SAFE** | none |
| `StatusFlow` card (title, "In progress", docTitle, 4 step labels + subs, **demo-client@example.com**) | yes | stage | yes (pan) | node ring 1.5px; connector 2px | **card entrance `scale(0.98→1)`** + camera; step text is opacity-only | **MEDIUM** | overlay-lift; card entrance → opacity-only |
| `StatusFlow` spinner arc / amber "awaiting" halo | no | stage | yes | continuous rotation / sin pulse | continuous, **decorative** (non-text) | **LOW** | keep (intentional live-status) |

### Scene 5 — OTP (camera `push`) — **REQUIRES CORRECTION** → fixed v5.1.2 (§2)

### Scene 6 — SIGN (camera `pan-right`) — **CORRECTED in v5.1.1**
| Component | Readable text | Layer | Camera-tf? | Animated/≠1 scale? | Risk | Notes |
|---|---|---|---|---|---|---|
| phone + contract (mobile PDF) | yes | **overlay** | no | integer-pixel scroll (`Math.round`) | **CORRECTED** | v5.1.1 fix verified |
| eyebrow/headline/subtitle | yes | overlay | no | snap | **SAFE** | — |
| "Signé" stamp / "Signed" badge | yes | overlay | no | small entrance `scale` that settles to 1 | **LOW** | on overlay; static after entrance |

### Scene 7 — AUDIT (camera `push`) — **REQUIRES CORRECTION** → fixed v5.1.2 (§3)

### Scene 8 — COMPLIANCE / AES (camera `pull`, settle ≈ 2.58 s)
| Component | Readable text | Layer | Camera-tf? | Fractional? | Animated/≠1 scale? | Risk | Correction |
|---|---|---|---|---|---|---|---|
| eyebrow / headline / subtitle | yes | **overlay** | no | no | no (snap) | **SAFE** | none |
| 4 chips ("AES/eIDAS/SHA-256/OTP 2FA" + subs, ShieldCheck) | yes | stage | yes (**pull = changing scale**) | icon box border 1px | **per-chip `GlassCard` entrance `scale(0.98→1)`** + camera scale | **MEDIUM** | overlay-lift; chip entrance → opacity-only |

### Scene 9 — CTA (camera `push`)
| Component | Readable text | Layer | Camera-tf? | Animated/≠1 scale? | Risk | Correction |
|---|---|---|---|---|---|---|
| `CTAHero` (wordmark, tagline, button, url, 4 trust signals) | yes | **overlay** | **no** | internal `useEntrance scale(0.98→1)` that settles ~1.4 s, then static through the 4 s+ hold | **LOW** | optional: swap CTAHero `useEntrance`→snap for scale-free entrance |
| `Logo` mark | no | stage | yes (push) | decorative | **LOW** | none |

### All scenes — `AnimatedBackground`
Continuous ambient gradient/particle motion behind every scene, by design. No readable
text. **Intentional continuous motion — acceptable.**

---

## 5. Combined correction scope

Per the directive, the corrected scope is:

1. **OTP digit boxes + OTP phone** — `OtpSceneV512` + `OTPInputStable` (§2). ✔ built.
2. **Audit Trail card + all internal UI text** — `AuditSceneV512` + `AuditTrailStable` (§3). ✔ built.
3. **Privacy replacement of the prior signer persona → `Marc Delorme`** — `ContractDocument` (desktop repr,
   mobile scroll footer, mobile footer) + `clawshow-esign-v5.json` (audit "Signed" actor). ✔ done.
   - Audit row now reads **"Signed · Marc Delorme"**; contract signer reads **"M. Marc Delorme · Directeur · Studio Méridien"**.
   - `clawshow-esign-v4.json` (the **frozen v4 source**) has also been scrubbed to `Marc Delorme`
     for repo-wide consistency, so no retired persona name remains anywhere in the source tree.
     The already-rendered `clawshow-esign-v5.1.1.mp4` is a frozen prior master and is not part of
     this source release.
4. **Additional high-risk items from this audit:** none rise to the *confirmed-visible* (HIGH)
   bar beyond OTP and Audit. The next tier is three **MEDIUM** panels of the same latent
   class — **Upload** (BrowserWindow/Workspace/Contract), **Invite** (StatusFlow card),
   **Compliance** (chip row). They are milder because Upload/Invite use *pan* cameras
   (edge-only translation) and Compliance's text is large/bold, and because their readable
   content largely settles near or after the camera hold.

### Recommended scope of the next full master (v5.1.2)
- **Include now (confirmed):** items 1–3 above (OTP + Audit + privacy). These are the
  observed defects and the privacy hardening.
- **Recommended to also include, to end the class for good** (the stated goal — "stop fixing
  one scene at a time"): lift **Upload, Invite, Compliance** product-UI panels to the static
  overlay with opacity-only entrances, exactly as OTP/Audit/Sign were. This permanently
  closes the camera-stage-text shimmer class across all nine scenes.
- **Risk note:** Upload/Invite/Compliance panels are more complex than OTP/Audit, so each
  overlay-lift must be parity-verified (opacity:0 stage twin) to keep layout byte-identical.
  If you prefer the smallest, safest next master, ship v5.1.2 = items 1–3 only, then do a
  focused **v5.1.3** consolidation pass for Upload/Invite/Compliance after a spot-check of
  the v5.1.2 master confirms whether any visible residual remains in those three.
- **Out of scope (correctly):** Brand/CTA logos, FloatingCards drift, StatusFlow
  spinner/halo, AnimatedBackground — these are decorative or intentional motion, not the
  static-UI shimmer class.

---

## 6. Verification method (per fixed surface)
Both fixed surfaces are validated by the diagnostic harness `AntiShimmerDiagRoot`
(compositions `OtpOriginal/OtpFixed/AuditOriginal/AuditFixed`, each rendered through the
master's `StableSceneFrame` with the approved `push` camera and exact scene duration):
adjacent **lossless** PNG frames at the diagnostic beats are PSNR-compared inside the
readable-text crops. **inf** (byte-identical adjacent frames) on the FIXED stills at any
settled beat = zero shimmer at the source; the ORIGINAL stills show finite PSNR across the
camera's changing window. See `renders/otp-anti-shimmer-tests/` and
`renders/audit-anti-shimmer-tests/`.

### 6.1 Measured results (adjacent-frame PSNR, lossless crops)

Rendered 2026-06-27..29. Four diagnostic clips (1920×1080, 30 fps, H.264 CRF 16, preset
slow) + lossless PNG beats. Higher dB = less per-frame change; **inf** = byte-identical.

**OTP** (settle = frame 77; phone is opaque so crops can reach true inf):

| Crop | Beat | ORIGINAL | FIXED |
|---|---|---|---|
| First revealed glyph | 47–48 | 33.4 | **inf** |
| First revealed glyph | 57–58 | 61.6 | **inf** |
| Lock + verified glow | 33–34 → 100–101 | 40–66 (finite at every beat) | **inf at every beat** |
| Completed six-cell row | 90–91 | 39.2 | **inf** |
| Completed six-cell row | 100–101 / 150–151 | inf / inf | **inf / inf** |

→ Once a digit is revealed it is **byte-identical** frame-to-frame in FIXED while the
ORIGINAL still re-rasterizes under camera push. The lock/verified glow is **static at every
beat** in FIXED (animated glow removed). Finite FIXED values at 47–58 on the *row* crop are
the intended opacity reveal of the *later* cells, not shimmer — proven by the already-revealed
first glyph reading inf at those same beats. Completed-state and final-hold = inf. ✔

**Audit** (settle = frame 83; glass card is **translucent**, so the floor is ambient
background, not card jitter — see 6.2):

| Crop | Beat (reveal) | ORIGINAL | FIXED |
|---|---|---|---|
| Event rows | 34–35 | 25.5 | **39.9** |
| Timestamps (mono) | 34–35 | 31.2 | **47.2** |
| SHA-256 (mono) | 54–55 | 26.5 | **39.1** |
| Sealed + lock | 54–55 | 24.4 | **35.9** |
| Event rows | 70–71 / 150–151 | 65.3 / 65.7 | 65.5 / 65.6 |
| SHA-256 | 70–71 / 150–151 | 62.9 / 62.4 | 62.9 / 62.4 |

→ FIXED **equals or beats ORIGINAL at every beat**, with the decisive gains during the
card/footer reveal (the camera+entrance window): ORIGINAL crashes to 24–31 dB while FIXED
stays at 36–47 dB (its own opacity reveal) and then returns to the background floor. After
reveal, FIXED = ORIGINAL at the floor → the FIXED card text is static (were it jittering,
FIXED would be *lower*). ✔

### 6.2 Why the Audit floor is ~65 dB, not inf (attribution check)

A pure-background crop (no card, no text) is **identical between ORIGINAL and FIXED** at
every beat (69.2 / 73.9 / 72.3 dB at 9–10 / 70–71 / 150–151). The `AnimatedBackground`
gradient is deterministic and the same in both clips. The audit card region floors slightly
lower (~62–66 dB) because that ambient gradient bleeds through the **translucent** glass
card. 65 dB ≈ 0.14 of one 8-bit level (sub-quantization) → imperceptible, and it was always
present in the approved master. The OTP phone is **opaque**, bleeds nothing, and therefore
hits true **inf**. Forcing the audit card to inf would require freezing the approved ambient
background behind it — a film redesign, explicitly out of scope. The *visible* shimmer (card
+ text re-rasterizing under camera scale + entrance scale) is eliminated.

### 6.3 Round 2 — Upload + Invite + Compliance (v5.1.2 expanded scope)

Per the decision to close the shimmer class across ALL nine scenes, the three MEDIUM panels
were lifted to the static overlay (Upload: whole browser walkthrough, camera-free, choreography
preserved; Invite: StatusFlowStable card, opacity-only entrance; Compliance: StableChip row,
opacity-only entrance) and verified the same way. Each diagnostic uses the scene's OWN approved
camera (upload pan-right, invite pan-left, compliance pull) and exact duration.

**Upload** (opaque white contract paper → can reach true inf; settle ≈ frame 97):

| Crop | Beat | ORIGINAL | FIXED |
|---|---|---|---|
| Workspace doc list | 50–51 | 31.7 | **inf** |
| Workspace doc list | 65–66 | 38.4 | **inf** |
| Contract title / client block | 120–121, 150–151 | inf / inf | **inf / inf** |

→ Workspace text is byte-identical frame-to-frame in fixed during the camera-pan window;
original is 31–38 dB (shimmer). After the camera settles AND the document cross-dissolve
finishes (~frame 99), both versions are static (the document only ever existed at/after the
settle). ✔

**Invite** (translucent glass card → floors at ambient background; settle ≈ frame 83). Step
crop EXCLUDES the left node column (the spinner/terminal-pulse are intentional live-status
motion):

| Crop | Beat | ORIGINAL | FIXED |
|---|---|---|---|
| Header text | 40–41 | 32.6 | **64.0** |
| Step labels | 40–41 | 37.6 | **55.8** |
| Step labels | 60–61 | 43.4 | **65.1** |
| Header / steps | 90–91 → 150–151 | 63.6–66.1 | 63.6–66.1 (at floor) |

**Compliance** (translucent glass chips → floors at ambient background; settle ≈ frame 77).
Headline is identical orig/fixed at every beat — it was already on the overlay since v5.1; only
the chips were on the camera stage:

| Crop | Beat | ORIGINAL | FIXED |
|---|---|---|---|
| Chips | 35–36 | 26.5 | **39.0** |
| Chips | 50–51 | 41.2 | **66.1** |
| Chips | 60–61 | 50.3 | **65.8** |
| Chips | 100–101, 150–151 | 65.8 / 65.7 | 65.8 / 65.6 (at floor) |

→ In both translucent cases the fixed surface reaches the ambient-background floor (static)
during/after the camera window, while the original sits 20–30 dB lower until its camera settles.
Background-attribution crop is byte-identical orig vs fixed (71.2 / 72.3 dB) → the floor is the
deterministic ambient gradient, not card/chip jitter.

**Late-beat note (honest):** at the very end of each scene (Upload 200–201, Invite 175–176) BOTH
versions drop together (≈23.7 and ≈36 dB). Visual inspection of those frames shows the scene is
in its **intentional end-of-scene fade-out** — a global opacity ramp on the whole scene, present
identically in original and fixed (hence ORIG ≈ FIXED). It is not shimmer and not introduced by
the fix; it is pre-existing approved behavior also present in v5 / v5.1 / v5.1.1.

**Verdict:** OTP, Audit, Upload, Invite and Compliance all pass. The camera-stage readable-UI
shimmer class is closed across all nine scenes (Brand/Problem/CTA never had product-UI on the
camera stage; Sign was fixed in v5.1.1). Cleared to render the v5.1.2 full master.
