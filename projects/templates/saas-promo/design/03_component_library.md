# 03 · Reusable Component Library — SaaS Motion Pack

**Author:** Claude Design
**Principle:** Design for *every* future SaaS product, not for eSign. ClawShow is the first tenant, never the schema.

---

## Shared conventions (every component obeys)

- **Token-driven.** Components import the design tokens from `01_design_brief.md §9` (one shared module). No hardcoded colors, fonts, durations, or radii. A brand re-skins by changing tokens, not components.
- **Deterministic & frame-based.** Animation is a pure function of `useCurrentFrame()` — required for Remotion. No randomness without a seeded helper; identical frame ⇒ identical pixels.
- **Self-timed, Sequence-friendly.** Each component accepts `delaySeconds` and reads `useVideoConfig()` for fps; it animates relative to its own start so it can be dropped into any `<Sequence>`.
- **Presentational only.** Props in, pixels out. No data fetching, no side effects, no paid APIs, no GPU.
- **Accent-aware.** Common optional props: `accent` (default `tokens.primary`), `success` (default `tokens.success`), `tone` (`"primary" | "success" | "neutral"`).
- **Reduced-motion safe.** All entrances are opacity + small transform (≤40px / scale ≥0.96). Nothing depends on real video.
- **Composable depth.** Components accept a `plane` hint (`"fg" | "mg" | "bg"`) that maps to opacity/blur/scale presets.

Standard timing props (shared type): `{ delaySeconds?, durationSeconds?, accent?, tone?, plane?, style? }`.

---

## A. Surfaces & chrome

### BrowserWindow
- **Purpose:** A believable desktop browser frame to host product UI (the #1 trust device).
- **Inputs:** `url`, `children` (the viewport content), `theme` (`"dark" | "light"`), `chrome` (`"mac" | "win"`), `showTrafficLights`, `tabTitle`.
- **Animation:** scale-in `0.96→1.0` + 16px rise (settle ease); optional subtle shadow bloom; address bar text mask-reveals.
- **Reuse:** Stripe dashboard demo · Linear app tour · any "here's the product" scene · ClawShow Upload/Send.

### LaptopMockup
- **Purpose:** Frame a full app shot in a device for hero/marquee scenes.
- **Inputs:** `screen` (node or image), `finish` (`"space-gray" | "silver"`), `angle` (`"flat" | "slight"`), `reflection`.
- **Animation:** slow push-in + faint screen glow ramp; optional lid-open settle (no flip).
- **Reuse:** product marquee · "works on desktop" · case-study openers.

### PhoneMockup
- **Purpose:** Mobile context — the signer/end-user experience.
- **Inputs:** `screen`, `model` (`"modern" | "rounded"`), `orientation`, `statusBar`.
- **Animation:** rise + settle from below; content fades in after the frame lands.
- **Reuse:** ClawShow Sign scene · mobile onboarding · notification demos · 2FA flows.

### GlassCard
- **Purpose:** Frosted surface for grouping content with depth.
- **Inputs:** `children`, `padding`, `radius`, `border` (hairline on/off), `blurStrength`, `tone`.
- **Animation:** fade + 12px rise; optional border-draw; hover-less (it's video).
- **Reuse:** stat panels · feature cards · CTA container · audit panel · pricing tiles.

### FloatingCards
- **Purpose:** A small constellation of cards drifting in parallax — atmosphere or "many items."
- **Inputs:** `cards[]` (label/icon/tone), `spread`, `driftAmplitude`, `count`, `parallax`.
- **Animation:** continuous slow drift (sin/cos by frame), staggered entrance, optional one card "stalls/dims."
- **Reuse:** problem scenes (clutter) · integrations grid · "works with everything" · ClawShow cold open.

## B. Backgrounds & atmosphere

### AnimatedBackground
- **Purpose:** The base atmospheric layer for every scene; composes GradientMesh + Particles + grid.
- **Inputs:** `tokens`/`accent`/`success`, `intensity`, `grid` (on/off), `vignette`.
- **Animation:** slow continuous drift (8–20s loops); never resets between scenes (continuity).
- **Reuse:** every scene of every product (the default canvas).

### GradientMesh
- **Purpose:** Two low-opacity radial color blooms drifting over the canvas (Stripe-style).
- **Inputs:** `colorA` (primary), `colorB` (success/secondary), `opacityA`, `opacityB`, `speed`.
- **Animation:** bloom centers drift on lissajous paths; angle breathes ±a few degrees.
- **Reuse:** brand scenes · CTA · anywhere needing warmth without clutter. Re-skins instantly via two colors.

### Particles
- **Purpose:** Sparse drifting motes for depth — *very* low contrast.
- **Inputs:** `count`, `color`, `opacity`, `speed`, `size`, `seed`.
- **Animation:** deterministic seeded drift; gentle twinkle (opacity sine).
- **Reuse:** cold opens · trust scenes · ambient filler. Keep ≤8% opacity.

### MotionLines
- **Purpose:** Thin animated connectors / "energy" strokes (Vercel-style restraint).
- **Inputs:** `paths[]` (from→to or SVG path), `color`, `width`, `dash`, `drawDurationSeconds`.
- **Animation:** stroke draw-on (dash offset by frame); optional traveling highlight dot.
- **Reuse:** EmailFlow · APIFlow · "connected" diagrams · step links.

## C. Product UI

### Dashboard
- **Purpose:** Generic analytics/app surface (KPIs, chart, table) to imply a real product.
- **Inputs:** `kpis[]`, `chart` (spec), `rows[]`, `title`, `density`.
- **Animation:** KPIs count-up (tabular), chart draws, rows stagger in.
- **Reuse:** analytics products · admin panels · "your data, organized" scenes.

### PDFViewer
- **Purpose:** Render a believable document page (the heart of eSign, reusable for any doc product).
- **Inputs:** `pages[]` (image or synthesized lines), `page`, `highlights[]`, `signatureSlot`, `scrollTo`.
- **Animation:** page fade+rise; optional slow scroll; highlight sweep; signature slot pulses when active.
- **Reuse:** eSign · contracts/CLM · invoicing · report viewers · "review the document" beats.

### NotificationToast
- **Purpose:** Quiet status confirmations.
- **Inputs:** `text`, `icon`, `tone`, `position`, `holdSeconds`.
- **Animation:** slide-in from edge + fade; auto-dismiss; tone tints the icon/hairline.
- **Reuse:** "Saved" · "Link sent" · "Verified" · success microcopy across every product.

### VerificationBadge
- **Purpose:** The trust stamp — checkmark + label (compliance, verified, secure).
- **Inputs:** `label` (e.g. "AES eIDAS"), `state` (`"verifying" | "verified"`), `icon`.
- **Animation:** ring draws → check strokes → one soft scale overshoot → settle (success tone).
- **Reuse:** security scenes · SOC2/GDPR/ISO badges · "verified" moments · ClawShow OTP + compliance.

### Timeline
- **Purpose:** Ordered sequence of events/steps with timestamps.
- **Inputs:** `events[]` (label, time, state, icon), `orientation`, `connector`.
- **Animation:** rows reveal top-down (stagger); connector draws between nodes; current node emphasized.
- **Reuse:** audit trails · onboarding steps · roadmap · "how it works" · changelog.

### AuditTrail
- **Purpose:** A Timeline specialization for evidentiary logs (hash, actor, timestamp).
- **Inputs:** `entries[]` (action, actor, timestampISO, hash?), `sealLabel`.
- **Animation:** entries stagger; a SHA-256 chip (mono) "sets"; a seal locks at the end.
- **Reuse:** eSign compliance · security/compliance products · "nothing to hide" trust scenes.

### APIFlow
- **Purpose:** Show request→response / system connections for developer products.
- **Inputs:** `nodes[]`, `edges[]`, `payload` (code snippet), `direction`.
- **Animation:** packets travel edges (MotionLines); node pulses on receive; payload mono types in.
- **Reuse:** API/infra products · integrations · "instant backend" · webhooks demos.

### EmailFlow
- **Purpose:** Visualize a message leaving an app and arriving in an inbox.
- **Inputs:** `from` (app), `to` (inbox), `subject`, `linkLabel`, `secure` (lock).
- **Animation:** envelope travels a drawn MotionLine; inbox row drops in with unread dot; optional lock glint.
- **Reuse:** ClawShow Send · invitations · magic-link auth · transactional email demos.

## D. Interaction layer

### Cursor
- **Purpose:** A synthetic pointer that guides the eye through UI.
- **Inputs:** `path[]` (waypoints in % or px), `kind` (`"arrow" | "hand"`), `speed`, `easing`.
- **Animation:** eased travel along waypoints (settle ease); slight scale dip on press.
- **Reuse:** every product-demo scene · onboarding walkthroughs · "click here" beats.

### MouseClick
- **Purpose:** A click confirmation ring at a point.
- **Inputs:** `at` (x,y), `tone`, `size`.
- **Animation:** expanding ring + fade; paired target scales 0.98→1.0.
- **Reuse:** button presses · toggles · any interaction emphasis. Pairs with Cursor.

### SignatureStroke
- **Purpose:** Hand-drawn signature path drawing on (the signature SaaS moment).
- **Inputs:** `path` (SVG path / preset name), `color`, `strokeWidth`, `drawSeconds`, `nib`.
- **Animation:** path draw-on via dash offset; subtle width variance for ink feel; settle.
- **Reuse:** eSign · "personal touch" beats · onboarding signatures · approval scenes.

## E. Narrative

### CTAHero
- **Purpose:** Brand/CTA lockup — wordmark, headline, eyebrow, badge, button, URL.
- **Inputs:** `productName`, `headline`, `eyebrow`, `badge`, `tagline`, `buttonLabel`, `url`, `logo`, `mode` (`"brand" | "cta"`).
- **Animation:** staggered fade-rise (eyebrow→headline→tagline→button), hairline underline draw, button single calm pulse.
- **Reuse:** opening brand scene · closing CTA · section title cards. Drives ClawShow S2 and S7.

---

## Reuse matrix (proof the pack generalizes)

| Component | eSign | API/Infra (e.g. semantic-os) | Inventory AI | Interior AI |
|---|---|---|---|---|
| BrowserWindow / PhoneMockup | ✅ | ✅ | ✅ | ✅ |
| GradientMesh / AnimatedBackground / Particles | ✅ | ✅ | ✅ | ✅ |
| CTAHero / GlassCard / NotificationToast | ✅ | ✅ | ✅ | ✅ |
| PDFViewer | ✅ docs | — | ✅ labels/SKUs | ✅ spec sheets |
| Dashboard / Timeline | ✅ | ✅ | ✅ stock charts | ✅ project board |
| VerificationBadge / AuditTrail | ✅ compliance | ✅ SOC2 | ✅ provenance | ✅ approvals |
| APIFlow / EmailFlow / MotionLines | ✅ email | ✅ requests | ✅ sync | ✅ render jobs |
| Cursor / MouseClick / SignatureStroke | ✅ | ✅ | ✅ | ✅ |

## Component contract checklist (Definition of Done)
A component ships only when it: (1) imports tokens, no hardcoded brand values; (2) is deterministic per frame; (3) accepts the standard timing props; (4) renders a clean **still** at its hero frame with no layout shift; (5) has a one-paragraph usage doc; (6) is used in ≥2 hypothetical products (reuse matrix).
