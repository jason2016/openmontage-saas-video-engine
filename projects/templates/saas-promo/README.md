# SaaS Promo Template

A reusable marketing-video engine for OpenMontage. Drop in a small config for any
SaaS product and get a polished ~45s dark-SaaS promo (Stripe / Linear / Apple
feel) — **no duplicated code, no OpenMontage core changes, GPU-free, zero-key.**

## The idea

Every product promo shares the same 6-beat story. So the *story, motion, and
look* live once in this template; each product supplies only *its words and
colors*.

```
TEMPLATE (write once, product-agnostic)        PROJECT (per product, config only)
projects/templates/saas-promo/                 projects/<name>/
  scene-config.json   6-scene skeleton           config.json   ← the ONLY required file
  theme.json          default colors / fonts
  animation.json      pacing / motion contract
  script-template.md  ─┐ filled per project
  storyboard-template.md┘
  build.py            the generator
        │
        ▼  python3 build.py <name>
remotion-composer/public/demo-props/<name>.json     (Explainer props — generated)
        │
        ▼  npx remotion render … Explainer … (existing composition, UNMODIFIED)
projects/<name>/renders/<name>.mp4
```

## The 6 scenes

| # | Scene | Accent | Purpose |
|---|-------|--------|---------|
| 1 | Problem | primary (blue) | Name the pain |
| 2 | Solution | primary | Introduce the product |
| 3 | Workflow | primary | How it works, in a line |
| 4 | Security / Trust | success (green) | Compliance, safety |
| 5 | Benefits | success | Why teams choose it |
| 6 | CTA | success | Brand close + website |

Blue carries the workflow; the palette shifts to green for trust + the close.

## Create a new project (the whole workflow)

1. `mkdir -p projects/<name>/renders`
2. Write `projects/<name>/config.json` (schema below).
3. Generate + render:
   ```bash
   # from the openmontage/ root:
   python3 projects/templates/saas-promo/build.py <name>
   # then, from remotion-composer/ (the command build.py prints):
   npx remotion render src/index.tsx Explainer ../projects/<name>/renders/<name>.mp4 \
     --props=public/demo-props/<name>.json --codec h264
   ```

That's it. `projects/inventory-ai/`, `projects/semantic-os/`,
`projects/interior-ai/`, `projects/esign/` each need **only** a `config.json`.

## config.json schema

```jsonc
{
  "productName": "ClawShow eSign",     // required
  "website": "clawshow.ai/esign",      // required — shown in the CTA
  "logo": "",                          // optional asset path (reserved; see Roadmap)
  "primaryColor": "#3B82F6",           // required — drives blue accents + background
  "successColor": "#22C55E",           // optional — defaults to template green
  "backgroundColor": "#0A0E1A",        // optional — defaults to template dark
  "features": ["…", "…", "…"],         // optional — fills Solution/Workflow/Benefits if copy omitted

  // Optional per-scene copy. Omit any scene to use a sensible fallback built
  // from productName + features. Provide them for a polished result.
  "scenes": {
    "problem":  { "headline": "…", "subtitle": "…" },
    "solution": { "headline": "…", "subtitle": "…" },
    "workflow": { "headline": "…", "subtitle": "…" },
    "security": { "headline": "…", "subtitle": "…" },
    "benefits": { "headline": "…", "subtitle": "…" }
  },

  "cta": {
    "tagline": "Send. Sign. Done.",    // subtitle on the close scene
    "badge": "AES eIDAS compliant"     // bottom-left lower-third (website shown beneath)
  }
}
```

**Minimum viable config:** `productName`, `website`, `primaryColor`, `features`,
`cta`. Everything else has defaults.

## What each template file controls

- **scene-config.json** — the narrative skeleton: scene order, which Explainer
  component each scene uses, accent role (primary/success), and per-scene
  duration. Change the *story shape* here, once, for all products.
- **theme.json** — default colors and fonts. Products override `primaryColor`
  (and optionally success/background). Mapped onto the composition's `themeConfig`.
- **animation.json** — pacing and the motion contract (calm: fade / slide /
  scale / subtle drift). Controls scene durations and CTA overlay timing.
- **build.py** — the generator. Merges template + config into the Explainer
  props file and fills the script/storyboard docs. The only code; ~150 lines,
  stdlib-only.

## Design principles

- **Config over code.** A new product is data, not a new component.
- **No core changes.** The engine only *generates input* for the existing
  `Explainer` composition. Nothing under `remotion-composer/src/` is edited.
- **Reuse the component library.** Scenes map to existing components
  (`StatCard`, `SectionTitle`) + the animated background.
- **Calm by default.** Motion is limited to fade / slide / scale / subtle drift.

## Roadmap (intentionally not built yet — keep it simple)

- `logo` rendering (needs a logo-aware component; would touch the composition).
- Per-scene component variety (e.g. `kpi_grid` for Benefits) — already
  expressible via `scene-config.json` once those mappings are added to `build.py`.
- Optional Piper TTS narration via the zero-key audio path.
