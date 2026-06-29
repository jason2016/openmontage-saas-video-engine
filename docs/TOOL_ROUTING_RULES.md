# OpenMontage — Tool & Scene Routing Rules

How an AI planner turns a project brief into a **Scene Plan** by selecting the best available scenes and tools for the product type — without forcing every video into a SaaS style. These rules are implemented by [`src/router/`](../src/router/) and scored against [`config/tool-registry.json`](../config/tool-registry.json). They are subordinate to the [Professional Video Quality Gates](./PROFESSIONAL_VIDEO_QUALITY_GATES.md).

## Routing pipeline

```
Project brief
 → 1. Product & audience classification   (productType, audience)
 → 2. Video objective                      (awareness | conversion | demo | education)
 → 3. Target platform & aspect ratio       (website/youtube/linkedin/instagram/tiktok → 16:9 | 9:16 | 1:1)
 → 4. Narrative structure                   (hook → problem → solution → proof → trust → CTA)
 → 5. Scene intents                         (one intent per narrative beat)
 → 6. Candidate scene retrieval             (registry items matching intent ∪ industry tags)
 → 7. Hard exclusions                       (drop ineligible candidates — see below)
 → 8. Scoring                               (100-pt weighted model — see scoring.ts)
 → 9. Diversity check                       (avoid repeating the same scene/visual style)
 → 10. Dependency check                     (keys / GPU / libs available? else fallback)
 → 11. Quality preflight                    (apply the relevant Quality Gates)
 → 12. Final Scene Plan                      (ordered scenes + fallbacks + warnings)
```

The router **never returns a silent failure**: if the preferred capability is excluded, it returns its best **fallback** with a reason and a warning, or a deterministic zero-key scene as the floor.

## Step 1 — Product & audience classification

`productType ∈ {saas, education, restaurant, service, explainer, inventory-erp, social, cinematic}` selects an **industry profile** (`src/router/industryProfiles.ts`) that biases candidate retrieval and the diversity/style rules. The profile is a *prior*, not a cage — any registry item can still be selected if it scores highest and passes the gates.

## Step 6 — Candidate retrieval

A registry item is a candidate for a scene intent when **either** its `intentTags` overlaps the beat's intent **or** its `industryTags` includes the brief's `productType` (or `"any"`). Architecture/hook/selector/style items are infrastructure and are not retrieved as scene candidates.

## Step 7 — Hard exclusions (override score)

A candidate is removed (not just down-scored) if **any** holds:

1. **Unavailable / broken** — `status: "deprecated"`, or `verified: false` with no satisfiable dependency path.
2. **Missing mandatory dependency** — required binary/lib not available and no fallback (`dependencies` unmet).
3. **Missing required API key** — `apiKeyRequired` set and that key is not in `apiKeysAvailable`.
4. **GPU required, none available** — `gpuRequired: true` and `gpuAvailable: false`.
5. **Incompatible aspect ratio** — brief `aspectRatio` ∉ `supportedAspectRatios` (e.g. saas-pack 16:9-only scene in a 9:16 brief).
6. **Unacceptable privacy risk** — `privacyLevel: "sensitive"` and item `privacyRiskScore` above the profile threshold, or the item sends data to a third party.
7. **Low-resolution / unusable media input** — supplied asset fails the media-truth resolution floor (Gate E).
8. **Unsupported output type** — item `outputTypes` can't satisfy the beat.
9. **Unapproved real-customer data** — real names/credentials present and not explicitly approved (Gate G).
10. **Fails a professional quality gate** — e.g. dense readable text on a high `textTransformRisk` scene with camera motion (Gate F).

Exclusions are recorded on the result as `missingDependencies` / `professionalWarnings` so the planner can offer setup help.

## Step 8 — Scoring (100-point weighted model)

Each surviving candidate is scored; weights total 100 (see [`scoring.ts`](../src/router/scoring.ts)):

| Dimension | Weight | Registry field(s) |
|---|---:|---|
| Intent & message fit | 20 | intentTags / industryTags match strength |
| Controllability | 15 | `controllabilityScore` |
| Visual quality | 15 | `visualQualityScore` |
| Brand consistency | 15 | `brandabilityScore` (× brand-token availability) |
| Realism / factual fidelity | 10 | `realismScore` (weighted up for restaurant/cinematic, down for SaaS UI) |
| Rendering stability | 10 | anti-shimmer: `textTransformRisk` + `stableOverlaySupport` |
| Reuse value | 5 | `reuseScore` |
| Speed | 5 | `renderSpeedScore` |
| Cost | 3 | `costScore` |
| Privacy / compliance | 2 | `100 − privacyRiskScore` |

Industry profiles adjust the **intent-fit** and **realism** contributions (e.g. restaurant boosts realism + real-media intents; SaaS boosts controllability + brand). Ties break toward: higher stability → deterministic over generative → zero-key over keyed → higher reuse.

## Step 9 — Diversity check

- Do **not** select the same scene id for two adjacent beats.
- Cap repeats of any one scene to ~2 across a 6–10 scene plan.
- Avoid mixing incompatible visual styles (e.g. anime-ghibli + clean-professional saas UI in one film) — keep one `preferredStyle` per video.
- Prefer one chart *type* family per video unless contrast is the point.

## Step 10 — Dependency & fallback resolution

If the top candidate is excluded at step 7 for a **fixable** reason (missing key/GPU/lib), the router walks its `fallbackIds` in order and selects the first eligible one, attaching a `professionalWarning`. The terminal fallback is always a **deterministic, zero-key** scene (`scene.om.text_card` for typography, `scene.om.kpi_grid` for data, `scene.om.screenshot_scene` for UI, `tool.direct_clip_search`/`tool.pexels_video` for footage). **No silent failure.**

---

## Routing examples (decision → selection)

| # | Brief signal | Hard rules applied | Selected | Fallback |
|---|---|---|---|---|
| 1 | **Real SaaS user interface** | controllability+brand boost; det preferred | `scene.saas.*` (product-ui) or a Remotion `scene.om.screenshot_scene` | `scene.om.screenshot_scene` |
| 2 | **Dashboard / table / workflow** | deterministic product-UI; 16:9 ok | `scene.saas.audit`/`ui.saas.contracts_workspace` + `scene.om.kpi_grid` | `scene.om.kpi_grid` |
| 3 | **PDF / contract / signing** | document components; integer scroll (Gate F) | `ui.saas.pdf_viewer` + `ui.saas.contract_document` + `scene.saas.sign` | `scene.om.screenshot_scene` |
| 4 | **KPI / comparison** | data-viz; anti-shimmer safe | `scene.om.kpi_grid` / `scene.om.comparison` / `scene.om.bar_chart` | `scene.om.stat_card` |
| 5 | **Code demonstration** | privacy-safe synthetic; no capture | `scene.om.terminal_scene` | `tool.code_snippet` → `scene.om.text_card` |
| 6 | **Course introduction** | education profile; explainer pipeline | `scene.om.hero_title` + `ui.saas.timeline` + `scene.om.progress_bar` + `scene.om.kpi_grid` | `scene.om.text_card` |
| 7 | **Restaurant dish promotion** | media-truth: real media first | customer media / `tool.pexels_video` (🔑free) / `tool.direct_clip_search` (zero-key) | `scene.om.anime_scene` (stylized, labeled) |
| 8 | **Restaurant booking / map / reviews** | real-media + booking CTA | `ui.saas.phone_mockup` (booking) + `scene.saas.cta` (rebranded) + `callout` quote (reviews gap) + static map `Img` (map gap) | `scene.om.cta` |
| 9 | **Cinematic real-world footage** | realism boost; footage-first | `tool.direct_clip_search` / `tool.pexels_video` → `comp.om.cinematic_renderer`; generative video **second** | `tool.pexels_video` |
| 10 | **No API key available** | exclude keyed items (rule 3) | deterministic zero-key scenes only (`scene.om.*`, saas-pack, ffmpeg export) | always available |
| 11 | **Privacy-sensitive product** | exclude third-party send (rule 6); local renderer | `scene.om.screenshot_scene`/`scene.om.terminal_scene` (synthetic), local Remotion | deterministic local |
| 12 | **Unsupported / excluded scene** | rule 10 | best `fallbackIds` entry, with warning | deterministic floor |

### Per-industry default routing (summary; full priors in `industryProfiles.ts`)

- **SaaS** → deterministic product-UI + saas-pack **first**; charts for proof; never generative-as-real UI.
- **Education** → explainer/animation pipeline; hero title + curriculum (timeline/KPI/progress) + LMS screenshot + (optional) avatar presenter + enrollment CTA.
- **Restaurant / local** → **real photos/video first**; then menu (KPI/comparison stopgap), reviews (callout quote), location (static map), reservation CTA. **Never** the SaaS dashboard stack; **never** AI dishes presented as real.
- **AI explainer** → typography + diagrams + charts + code + data-visualization; generated imagery only where a key/GPU is configured, labeled via `provider_chip`.
- **Inventory / ERP** → saas-pack dashboards + tables + KPI cards + alerts/workflows + browser/mobile views.

## Media-truth routing rule (hard)

For a **real business** (restaurant, local service, named product): real, permissioned media outranks any generated media regardless of score. Generated stand-ins are allowed only as clearly-labeled illustration (`overlay.om.provider_chip`) and never to depict a specific real dish/room/person/feature. For **SaaS**, reproduce the real UI (screenshot/Remotion); do not show features that don't exist; fictional demo data must read as fictional (example.com, fictitious companies).

## Anti-shimmer routing rule (hard)

Any beat with **readable UI/text** must route to a Stable-Overlay-capable rendering (`stableOverlaySupport: native|compatible`) and follow [Gate F](./PROFESSIONAL_VIDEO_QUALITY_GATES.md): final scale exactly 1, integer geometry, opacity-only entrances for dense text, camera motion confined to decorative stage content. High `textTransformRisk` scenes (`text_card`, `hero_title`, `callout`, `comparison`, `product_reveal`) are allowed only for **short, settled** statements — not for dense or small text under camera motion.
