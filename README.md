<h1 align="center">OpenMontage SaaS Video Engine</h1>

<p align="center"><strong>Turn a JSON config into a premium, animated SaaS product video — locally, with zero API keys and no GPU.</strong></p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-AGPLv3-blue.svg" alt="License: AGPL v3"></a>
  <img src="https://img.shields.io/badge/render-CPU--only-success.svg" alt="CPU only">
  <img src="https://img.shields.io/badge/API%20keys-none%20required-success.svg" alt="Zero-key">
  <img src="https://img.shields.io/badge/built%20on-OpenMontage-8957E5.svg" alt="Built on OpenMontage">
</p>

<p align="center">
  <a href="#overview">Overview</a> ·
  <a href="#architecture">Architecture</a> ·
  <a href="#the-saas-promo-engine">SaaS Promo Engine</a> ·
  <a href="#saas-pack">saas-pack</a> ·
  <a href="#installation">Installation</a> ·
  <a href="#rendering">Rendering</a> ·
  <a href="#roadmap">Roadmap</a>
</p>

---

## Overview

**OpenMontage SaaS Video Engine** is a reusable marketing-video engine for SaaS products. Instead of hand-animating a promo for every product launch, you describe the product in a small `config.json` and the engine renders a polished 45–60s product video — dark-mode, glassmorphic, on-brand — entirely on CPU with no paid services.

It is built as an **isolated, additive layer on top of [OpenMontage](https://github.com/calesthio/OpenMontage)**, the open-source agentic video production system. OpenMontage provides the zero-key render pipeline (Remotion + FFmpeg + Piper TTS); this project adds a **premium component library (`saas-pack`)** and a **config-driven scene engine** purpose-built for SaaS storytelling.

**Design principles**

- **Config-driven** — one `config.json` per product → a full scene graph → a finished `.mp4`.
- **Zero-key & CPU-only** — no FAL/OpenAI/ElevenLabs keys needed; nothing leaves your machine.
- **Premium by default** — a single design-token source drives typography, color, motion, and depth so every scene looks like Stripe / Linear / Apple, not a slide deck.
- **Non-invasive** — the engine has its own Remotion entry and root; the OpenMontage core is never modified.

---

## Architecture

```
┌──────────────────────────┐     build.py            ┌────────────────────────────┐
│  projects/<product>/      │  ── config → scenes ──▶ │  demo-props/<product>.json  │
│  config.json             │   (--engine saas-pack)  │  (scene graph + brand)      │
└──────────────────────────┘                         └──────────────┬─────────────┘
                                                                     │ inputProps
                                                                     ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│  remotion-composer/src/saas-pack/    (isolated entry — own registerRoot)          │
│                                                                                   │
│   tokens.ts ─ theme.ts ──▶ hooks/ ──▶ primitives/ ──▶ components/ ──▶ scenes/     │
│   (design       (brand     (entrance,  (background,    (BrowserWindow,  (Scene-    │
│    system)       merge)     stagger,     glass, mesh)    PDFViewer,       Renderer, │
│                             easings)                     OTPInput, …)    templates) │
│                                                                  │                │
│                                                       SceneRenderer (registry)    │
│                                                       maps scene.type → template  │
└───────────────────────────────────────────────┬───────────────────────────────────┘
                                                 │  Remotion + FFmpeg (CPU, zero-key)
                                                 ▼
                                    projects/<product>/renders/<product>-vN.mp4
```

**Data flow:** `config.json` → `build.py --engine saas-pack` → scene-graph props → `SaasPromo` composition → `SceneRenderer` resolves each `scene.type` to a reusable template → Remotion renders to MP4.

---

## The SaaS Promo Engine

The engine lives in [`projects/templates/saas-promo/`](projects/templates/saas-promo/) and turns a product config into a 7-beat narrative:

| Beat | Scene type | What it shows |
|------|------------|---------------|
| 1 | `problem` | The pain (drifting "stuck" documents, headline + subtitle) |
| 2 | `brand` | Product name lockup + tagline |
| 3 | `upload` | In-app workflow (browser window, PDF, cursor, toast) |
| 4 | `send` | Delivery flow (app → connector → recipient inbox) |
| 5 | `sign` | Mobile signing (phone, signature stroke, OTP, verified) |
| 6 | `trust` | Compliance & audit trail (tamper-evident, sealed hash) |
| 7 | `cta` | Call to action (badge, tagline, button, URL) |

`build.py` reads the config, maps it onto these beats with sensible defaults, and writes a scene-graph JSON consumed by the Remotion composition. **No product copy is hardcoded in React** — every scene's content arrives through `scene.props`.

---

## saas-pack

[`remotion-composer/src/saas-pack/`](remotion-composer/src/saas-pack/) is the premium component library and rendering layer. It is fully token-driven and reusable across products.

```
saas-pack/
├── index.tsx            # OWN Remotion entry (registerRoot) — isolates from MVP
├── Root.tsx             # registers SaasPromo; duration derived from scene graph
├── tokens.ts            # single source of truth: color / type / motion / space / depth
├── theme.ts             # mergeBrand(): per-product brand overrides over base tokens
├── hooks/               # useEntrance, useStagger, easings (calm, settled motion)
├── primitives/          # AnimatedBackground, GradientMesh, Particles, GlassCard
├── components/          # BrowserWindow, PhoneMockup, PDFViewer, Cursor, MouseClick,
│                        # NotificationToast, CTAHero, EmailFlow, SignatureStroke,
│                        # OTPInput, VerificationBadge, Timeline, AuditTrail, …
└── scenes/              # data-driven scene system
    ├── types.ts         # SceneSpec { id, type, durationSeconds, props }
    ├── SceneRenderer.tsx# type → template registry (no product content here)
    ├── SaasPromo.tsx    # composition: brand merge + scene graph → Sequences
    └── templates/       # ProblemScene, BrandScene, UploadScene, SendScene,
                         # SignScene, TrustScene, CTAScene
```

**Why a registry?** `SceneRenderer` keeps a `Record<string, React.FC>` of scene templates. Adding a new beat is "write a template + register a key" — the composition and engine don't change.

---

## Config-driven video generation

A product is just a config file. Here is the shape (see [`projects/clawshow-esign/config.json`](projects/clawshow-esign/config.json)):

```json
{
  "productName": "ClawShow eSign",
  "website": "clawshow.ai/esign",
  "eyebrow": "Standalone PDF signing",
  "brandTagline": "E-signatures, handled.",
  "primaryColor": "#3B82F6",
  "successColor": "#22C55E",
  "backgroundColor": "#0A0E1A",
  "features": ["Upload any PDF", "OTP identity verification", "AES eIDAS compliant"],
  "scenes": {
    "problem":  { "headline": "Still emailing PDFs?", "subtitle": "…" },
    "security": { "headline": "AES eIDAS ready.",     "subtitle": "…" }
  },
  "cta": { "tagline": "Send. Sign. Done.", "badge": "AES eIDAS compliant" }
}
```

To create a video for a new product, copy the config, change the strings and colors, and render. No code changes required.

---

## OpenMontage integration

This repository **is a superset of OpenMontage** — the full upstream system is present and unmodified, so its agentic, zero-key pipeline (Remotion composer, FFmpeg, Piper TTS, Archive.org corpus) works as documented upstream. The SaaS engine sits beside it:

- The MVP / upstream compositions are registered through `remotion-composer/src/index.tsx` (untouched).
- The SaaS engine is registered through its **own** entry `remotion-composer/src/saas-pack/index.tsx`, so the two never collide.
- `render_demo.py` was patched only for cross-platform (Windows/WSL) `node`/`npm`/`npx` resolution — no behavioral change to the core.

For everything about the underlying agentic pipeline, providers, and prompt gallery, see the upstream docs preserved in this repo: [`AGENT_GUIDE.md`](AGENT_GUIDE.md), [`PROMPT_GALLERY.md`](PROMPT_GALLERY.md), [`docs/`](docs/), and the original project at **https://github.com/calesthio/OpenMontage**.

---

## Folder structure

```
openmontage/                        # repository root
├── README.md                       # this file
├── LICENSE                         # GNU AGPL v3 (inherited from OpenMontage)
├── .env.example                    # provider keys template (optional; not needed for saas-pack)
├── config.yaml                     # OpenMontage global config
├── render_demo.py                  # zero-key demo renderer (cross-platform patched)
├── requirements*.txt               # Python deps (core / dev / gpu)
│
├── remotion-composer/              # Remotion (React) video compositions
│   ├── src/
│   │   ├── index.tsx               # MVP / upstream entry  (untouched)
│   │   └── saas-pack/              # ← the SaaS engine (this project)
│   ├── public/demo-props/          # curated zero-key demo props (shipped)
│   └── package.json
│
├── projects/                       # one folder per product (configs + templates)
│   ├── templates/saas-promo/       # the engine: build.py, design docs, scene config
│   └── clawshow-esign/             # demo product: config.json (+ generated renders/)
│
├── lib/ · tools/ · skills/ · schemas/ · pipeline_defs/ · styles/   # OpenMontage core
└── docs/                           # OpenMontage documentation
```

> Generated artifacts — `renders/`, `node_modules/`, `.venv/`, `*.mp4`, `*.log` — are git-ignored. Clone, install, and render to reproduce them.

---

## Installation

**Prerequisites:** Python 3.12+, Node.js 18+, FFmpeg. CPU-only is fine; no GPU required. (Windows users: WSL2 recommended.)

```bash
git clone https://github.com/jason2016/openmontage-saas-video-engine.git
cd openmontage-saas-video-engine

# Python environment (OpenMontage core + build tooling)
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Remotion composer (Node)
cd remotion-composer
npm install
cd ..

# Optional: copy the env template only if you want OpenMontage's paid providers.
# The saas-pack engine needs NO keys.
cp .env.example .env
```

---

## Rendering

### 1. Build the scene graph from a product config

```bash
python3 projects/templates/saas-promo/build.py clawshow-esign \
  --out clawshow-esign-v3 --engine saas-pack
```

This writes `remotion-composer/public/demo-props/clawshow-esign-v3.json` and prints the render command.

### 2. Render the video (CPU, zero-key)

```bash
cd remotion-composer
npx remotion render src/saas-pack/index.tsx SaasPromo \
  ../projects/clawshow-esign/renders/clawshow-esign-v3.mp4 \
  --props=public/demo-props/clawshow-esign-v3.json --codec h264
```

Output: `projects/clawshow-esign/renders/clawshow-esign-v3.mp4` — 1920×1080, 30fps, H.264.

> Tip: for fast iteration, render a single still of any scene with
> `npx remotion still src/saas-pack/index.tsx SaasPromo out.png --frame=270 --props=…`.

---

## ClawShow eSign demo

[`projects/clawshow-esign/`](projects/clawshow-esign/) is the reference product shipped with the engine — a promo for a standalone PDF e-signing product.

- **Config:** [`config.json`](projects/clawshow-esign/config.json) (product name, brand colors, scene copy, CTA).
- **Output:** `clawshow-esign-v3.mp4` — **51.5s**, 7 scenes (problem → brand → upload → send → sign → trust → cta), ~9.5 MB.
- **Components on screen:** BrowserWindow, PDFViewer, Cursor, NotificationToast, EmailFlow, PhoneMockup, SignatureStroke, OTPInput, VerificationBadge, AuditTrail, CTAHero.
- Renders are git-ignored; run the two commands above to reproduce.

*(ClawShow eSign is used here purely as a realistic demo subject for the engine.)*

---

## Roadmap

- [ ] **Narration** — wire Piper TTS (zero-key) voiceover synced to scene timing.
- [ ] **More scene templates** — pricing table, testimonial, metric counter, integration grid.
- [ ] **Vertical / square exports** — 9:16 and 1:1 variants for social.
- [ ] **Brand auto-extraction** — derive tokens (logo, palette, font) from a product URL.
- [ ] **CLI** — `engine new <product>` scaffolding + `engine render <product>` one-shot.
- [ ] **GPU acceleration** — optional NVENC path for fast batch renders (RTX-class).
- [ ] **Theme presets** — light mode, gradient, and high-contrast token packs.

---

## License & attribution

This project is licensed under the **GNU Affero General Public License v3.0** — see [`LICENSE`](LICENSE).

It is a derivative work of **[OpenMontage](https://github.com/calesthio/OpenMontage)** by Calesthio AI Labs, which is also AGPLv3. All original OpenMontage code, documentation, and license notices are preserved in this repository. The `saas-pack` component library, the config-driven scene engine, and the `projects/templates/saas-promo` template are additions distributed under the same AGPLv3 terms.

If you run a modified version of this software as a network service, the AGPL requires you to offer the corresponding source to its users.
