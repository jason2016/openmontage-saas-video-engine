# 01 · Design Brief — SaaS Marketing Video Engine

**Author:** Claude Design (acting as senior motion designer)
**Status:** For review — no implementation until all five docs are approved.
**North star:** *Calm, premium, modern SaaS storytelling.* Not flashy. Motion that a viewer feels but never notices.

---

## 0. Design thesis

> The best product films feel inevitable. Nothing moves to impress you; everything moves to explain. Confidence is communicated through restraint — slow reveals, deep negative space, one idea per breath.

Three references, three lessons we will actually copy:

| Product | What we take |
|---|---|
| **Apple** | Type-led storytelling. Cinematic, almost imperceptible push-ins on a single hero object. Long holds. Silence is allowed. |
| **Stripe** | Crisp, real-looking product UI. Choreographed gradient meshes. Developer-grade precision in alignment and spacing. |
| **Linear** | Dark, high-contrast, fast-but-calm. Micro-interactions with intent. Nothing decorative. |
| **Vercel** | Extreme reduction. Black canvas, geometric layout, mono accents, thin motion lines as the only flourish. |
| **Arc** | Warmth inside restraint — soft gradients, rounded glass, a *single* delightful beat per scene. |
| **OpenAI** | Quiet neutrality. Monochrome surfaces, understated motion, generous whitespace, trust through plainness. |

The engine must be **configurable**, so a future product can dial brand personality from "Vercel-severe" to "Arc-warm" without new code. ClawShow eSign sits at **"Stripe-precise + Apple-calm."**

---

## 1. Visual language

- **Dark-first canvas.** Near-black navy base; content floats in depth, not on a page.
- **Depth through layers, not decoration.** Three planes: background (mesh + particles, very low contrast) → midground (product chrome, glass cards, slightly recessed) → foreground (the one proof element, crisp, full contrast).
- **Real UI over abstraction.** When we show "upload a PDF," we show a believable browser, a believable document — not an icon. Fidelity earns trust.
- **Generous negative space.** A scene should look under-filled. If it looks busy, remove something.
- **Hairlines and glass.** 1px borders at ~8% white; frosted surfaces at ~4% white fill. Light is implied, never neon.
- **Grid.** 12-column, 1920×1080 safe area inset 96px. Optical centering over mathematical centering for hero type.

## 2. Motion language

Motion is **subtractive**: we animate the minimum that makes a change legible.

- **Primary easing:** `cubic-bezier(0.16, 1, 0.3, 1)` — the long, soft "settle." Used for 90% of entrances.
- **Springs (when physical):** damping 22–26, stiffness 90–140, mass 1. Calm, near-critically damped — *at most one* whisper of overshoot, only for a success beat.
- **Durations:** micro 150–200ms · standard 320–420ms · scene entrance 520–680ms · ambient loops 8–20s.
- **Stagger:** 50–70ms between siblings (lists, OTP digits, timeline rows). Never simultaneous, never a wave.
- **One hero motion per scene.** Everything else is support and stays quieter (lower opacity delta, smaller travel).
- **Allowed:** fade, slide (≤40px), scale (0.96→1.0), draw-on (paths/underlines), parallax, soft blur focus.
- **Forbidden:** spin, bounce, flash, glitch, neon glow pulse, fast zoom, 3D card flips, letter-by-letter typewriter on long copy, confetti.

## 3. Typography

One family does the talking. Hierarchy comes from **size + weight + color**, never from effects.

- **Display font:** a geometric grotesk — **Inter** (primary, always available via `@remotion/google-fonts`); optional **Geist** / **Space Grotesk** for a sharper editorial feel. Configurable per brand.
- **Numeric/mono:** tabular figures for stats, OTP, timestamps, hashes (Inter tabular or a mono like JetBrains Mono).

**Type scale (1920×1080):**

| Role | Size | Weight | Tracking | Color |
|---|---|---|---|---|
| Display / hero | 120–140 | 640 | −0.02em | text-primary |
| H1 scene headline | 84–96 | 600 | −0.015em | text-primary |
| H2 sub-headline | 48–56 | 500 | −0.01em | text-primary |
| Body / subtitle | 28–34 | 400 | 0 | text-secondary |
| Eyebrow / label | 20–22 | 600 | +0.12em, UPPERCASE | accent |
| UI / caption | 18–22 | 500 | 0 | text-secondary |
| Mono / data | 22–26 | 500 | 0 | text-secondary |

Line-height: 1.05 for display, 1.15 for headlines, 1.5 for body. Max line length ~24 words; prefer 2 lines over 1 long line.

## 4. Color system

Dark-first, restrained. **Two accents maximum**: one primary (brand), one success (trust/done). Everything else is neutral.

| Token | Value (ClawShow default) | Use |
|---|---|---|
| `canvas` | `#0A0E1A` | base background |
| `canvas-deep` | `#070A12` | vignette / edges |
| `surface` | `#0F1629` | opaque cards |
| `glass-fill` | `rgba(255,255,255,0.04)` | frosted cards |
| `hairline` | `rgba(255,255,255,0.08)` | borders, dividers |
| `text-primary` | `#F8FAFC` | headlines |
| `text-secondary` | `#94A3B8` | body |
| `text-muted` | `#64748B` | captions, metadata |
| `primary` | `#3B82F6` | brand accent (workflow) |
| `primary-bright` | `#60A5FA` | hover/active highlights |
| `success` | `#22C55E` | verified / trust / done |
| `success-bright` | `#4ADE80` | success highlights |

- **Gradient mesh:** two low-opacity radial blooms (primary ~15%, success ~10%) drifting slowly over `canvas`. Never more than two hues in motion.
- **Accent discipline:** accents touch ≤10% of pixels in any frame. Color carries meaning — **blue = the workflow, green = trust & completion.**
- **Contrast floor:** primary text ≥ 12:1 on canvas; never place body text on the brightest mesh region.
- All tokens are **configurable**; a project overrides `primary` (and optionally `success`/`canvas`) and the whole system re-tunes.

## 5. Scene rhythm

- **Cadence:** 6–8 scenes, 4–8s each, total **45–60s**.
- **Beat shape per scene:** *settle* (≈0.3s near-stillness) → *enter* (0.5–0.7s hero motion) → *hold/read* (3–5s) → *exit* (0.3–0.4s).
- **One idea per scene.** If a scene needs two sentences of narration to explain, it's two scenes.
- **Breathing:** allow ~0.3s where almost nothing moves before a key reveal. Stillness makes the next motion feel intentional.
- **Energy arc:** quiet problem → confident solution → crisp workflow → reassuring trust → warm close. Never escalate to frantic.

## 6. Camera movement

We have no real camera; we *simulate* one with scale + translate on the scene group.

- **Default:** a slow push-in, scale `1.00 → 1.03` across the scene's hold. Imperceptible but alive.
- **Drift:** translate ≤2% to lead the eye toward the next focal point.
- **Parallax:** background moves 0.3–0.6× foreground; midground 0.7–0.9×. Sells depth without 3D.
- **Match-cut:** when two scenes share an element (e.g., the browser persists from Upload → Send), keep it on screen and move *around* it instead of cutting. Premium glue.
- **Never:** whip pans, rotation, dolly zoom, handheld shake.

## 7. UI hierarchy

Per frame, exactly one thing is the subject. Establish it with the **depth stack**:

1. **Foreground (subject):** full opacity, full contrast, sharp, largest scale. The proof.
2. **Midground (context):** product chrome / supporting cards at ~85% opacity, −1 contrast step, optional 1–2px blur.
3. **Background (atmosphere):** mesh + particles ≤15% contrast, heavy blur, slow drift.

Focal placement: center for hero/brand/CTA; rule-of-thirds for product demos so labels have room. Labels and eyebrows sit in consistent slots (top-left eyebrow, bottom-left lower-third) so the eye learns where to look.

## 8. Brand personality

**Engine-level (configurable):** a `personality` axis from *severe ↔ warm* and *playful ↔ precise*, expressed via radius, gradient warmth, motion overshoot, and copy tone.

**ClawShow eSign (this project):** **"Effortless trust."**

- **Adjectives:** trustworthy · precise · effortless · premium · quietly confident.
- **Voice:** plain, short, benefit-led. "Send. Sign. Done." not "Revolutionize your document workflow."
- **Feel:** business-grade but human; secure without being cold; fast without being frantic.
- **Tells:** crisp real UI, green only at the moment of trust, a single calm signature stroke, audit data shown literally (it has nothing to hide).

---

## 9. Design tokens (single source of truth)

These tokens are referenced by every later document and will become one shared module the components import (see `04_architecture.md`). Nothing hardcodes a color or duration that lives here.

```
color:   canvas/surface/glass/hairline · text(primary/secondary/muted) · primary(+bright) · success(+bright)
type:    family · scale(display→mono) · weights · tracking · line-height
motion:  ease.settle · spring.calm · duration(micro/standard/entrance/ambient) · stagger
space:   grid(12col) · safe-inset 96 · radius(card 20 / chip 999) · hairline 1px
depth:   plane(fg/mg/bg) opacity+blur+scale presets
```

## 10. Definition of "premium" (acceptance lens)

A scene passes if, muted and at 0.5× speed, it still reads as: **calm, legible, intentional, and trustworthy** — and you cannot point to a single element that exists only to look cool.
