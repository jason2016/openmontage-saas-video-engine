# 04 · Architecture Review & Target Structure

**Author:** Claude Design (engineering pass — last, on purpose)
**Goal:** the cleanest reusable structure: no duplicated code, isolated components, configurable templates — fully compatible with the existing MVP, no GPU, no paid APIs.

---

## 1. Current state (what we have)

```
remotion-composer/src/
  index.tsx           registerRoot(Root)                     ← core entry
  Root.tsx            <Composition> registry + THEMES + resolveTheme()
  Explainer.tsx       composition: reads {cuts, overlays, themeConfig}
  components/         StatCard, HeroTitle, SectionTitle, charts… (style hardcoded)
projects/templates/saas-promo/
  scene-config.json · theme.json · animation.json · build.py · *-template.md
projects/<name>/config.json   → build.py → demo-props/<name>.json → render
```

**Strengths:** the template engine (config → props → existing composition) already proves the "config-only project" goal; v1/v2 render reliably; zero-key, no GPU.

**Limitations (what blocks "premium"):**
1. **Tokens don't flow.** Components hardcode colors, fonts, sizes (e.g. HeroTitle's cyan/purple, StatCard's fixed Inter/128px). A brand can only re-skin the *background*, not the type.
2. **No product-UI vocabulary.** Only text/stat/chart cards exist — no BrowserWindow, PDFViewer, Cursor, etc. So every video looks like captioned slides.
3. **Hard cuts.** No shared transition/camera layer.
4. **No shared motion primitives.** Each component re-implements its own springs.

The fix is **not** to edit those components — it's to add a clean, parallel pack with a single token source.

## 2. Design rules for the target

- **One source of truth for tokens.** Structural tokens (type scale, motion, spacing, neutral palette) live once; brand overrides (primary/success/canvas) come from config. No component hardcodes a brand value.
- **Components are isolated.** One file per component. Allowed imports: `tokens`, `primitives/`, `hooks/`. No component imports another product-UI component except via children. No cross-talk.
- **Templates stay configurable.** Story/timing/colors/copy are JSON. Code never names a product.
- **Composition is data-driven.** Like `Explainer`, the new composition renders a scene graph from props — scenes come from the engine, not from bespoke React per video.
- **Additive only = "no core change."** We never edit existing `index.tsx` / `Root.tsx` / `Explainer.tsx` / `components/`. The pack is new files + its **own entry**, so the MVP is untouched and keeps rendering.

## 3. Target structure (additive)

```
remotion-composer/src/
  index.tsx                 ← UNCHANGED (existing MVP entry: Explainer etc.)
  Root.tsx, Explainer.tsx   ← UNCHANGED
  components/               ← UNCHANGED (legacy cards still work)

  saas-pack/                ← NEW, isolated, self-contained
    index.tsx               registerRoot(SaasPackRoot)        ← NEW entry (own bundle)
    Root.tsx                <Composition id="SaasPromo" …> + calculateMetadata
    tokens.ts               SINGLE source of structural tokens (brief §9)
    theme.ts                mergeBrand(tokens, configOverrides) → resolved theme
    hooks/
      useEntrance.ts        settle/spring entrance from frame+delay
      useStagger.ts         indexed delays
      easings.ts            ease.settle, spring.calm presets
    primitives/
      AnimatedBackground.tsx  GradientMesh + Particles + grid
      GradientMesh.tsx · Particles.tsx · MotionLines.tsx · GlassCard.tsx
    components/             one file each (doc 03)
      BrowserWindow.tsx · PhoneMockup.tsx · LaptopMockup.tsx
      PDFViewer.tsx · Dashboard.tsx · NotificationToast.tsx
      VerificationBadge.tsx · Timeline.tsx · AuditTrail.tsx
      APIFlow.tsx · EmailFlow.tsx · Cursor.tsx · MouseClick.tsx
      SignatureStroke.tsx · OTPInput.tsx · FloatingCards.tsx · CTAHero.tsx
    scenes/
      SceneRenderer.tsx     maps a scene-spec {type, props, timing} → components
      SaasPromo.tsx         composition: background + <Sequence> per scene + transitions
    transitions/
      transition.ts         crossfade / soft-push / match-cut helpers
    stories/                still-frame fixtures per component (for review)
```

**Why a second entry (`saas-pack/index.tsx`) instead of editing `Root.tsx`:** Remotion renders from any entry that calls `registerRoot`. A new entry adds the `SaasPromo` composition **without touching** the MVP's `index.tsx`/`Root.tsx`. Render with:
```
npx remotion render src/saas-pack/index.tsx SaasPromo <out>.mp4 --props=<props>.json --codec h264
```

## 4. Data flow (engine v2)

```
projects/<name>/config.json   (brand + copy + which scenes)
        +
saas-pack scene-config + tokens defaults
        │  build.py  (extended: --engine saas-pack)
        ▼
demo-props/<name>.saas.json     scene graph: [{type, props, in, out, transition}], brandOverrides
        │  npx remotion render src/saas-pack/index.tsx SaasPromo …
        ▼
SaasPromo → SceneRenderer → pack components (tokens ← brandOverrides)
        ▼
projects/<name>/renders/<name>.mp4
```

- The **existing** `Explainer` path (build.py default) stays for backward compatibility (v1/v2).
- The **new** `saas-pack` path is opt-in via `--engine saas-pack`. Same config schema, richer output.
- **Token sync:** structural tokens live in `tokens.ts` (typed, imported by components). The build engine only needs brand overrides (primary/success/canvas) + copy — it never duplicates the token table.

## 5. Reuse & isolation guarantees

- **No duplication:** springs/easings in `hooks/`; surfaces in `primitives/`; colors/type in `tokens.ts`. Components compose these, never re-declare them.
- **Isolation:** each component is independently renderable as a still (`stories/`), depends only on tokens/primitives/hooks, and is unaware of any product.
- **Configurable templates:** `scene-config.json` chooses which components a scene uses and their order; `config.json` supplies brand + copy. Changing the *story* = editing JSON, not React.

## 6. Compatibility & constraints

- **Existing MVP:** untouched. `Explainer`, v1, v2 keep working; legacy `components/` unaffected.
- **No GPU / no paid APIs:** pure React/SVG/CSS in Remotion; fonts via `@remotion/google-fonts` (Inter, free); rendering is CPU (the proven zero-key path).
- **Transitions:** prefer `@remotion/transitions` if already present; otherwise a tiny additive `transitions/transition.ts` (opacity/scale) — no new heavy deps.
- **Perf note:** running from `/mnt/c` is slower; optional future optimization is moving the repo into WSL ext4 (orthogonal to this design).

## 7. Open decisions for review
1. **Entry strategy:** new entry `saas-pack/index.tsx` (recommended, zero core edits) vs. adding one `<Composition>` to `Root.tsx` (1-line core edit, simpler tooling). Default: **new entry**.
2. **Scene model:** generic data-driven `SceneRenderer` (recommended, config-first) vs. one React scene component per beat (more control, less reusable). Default: **SceneRenderer**.
3. **v3 coexistence:** keep v1/v2 (`Explainer`) and ship v3 via `saas-pack` in parallel (recommended) vs. cut over. Default: **parallel**.
