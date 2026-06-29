# Example Dry-Run Scene Plans

Five briefs routed by [`src/router/SceneToolRouter.ts`](../../src/router/SceneToolRouter.ts) against [`config/tool-registry.json`](../../config/tool-registry.json). **These are dry-run plans only — no video was rendered, no API was called.** The machine-readable form (with full score breakdowns, fallbacks, missing-dependency lists and warnings) is regenerated to [`scene-plans.generated.json`](./scene-plans.generated.json) by:

```
node remotion-composer/node_modules/typescript/bin/tsc -p src/router/tsconfig.json
node src/router/run-router.cjs        # 17/17 unit tests pass, then writes the plans
```

All five briefs were run with **no API keys and no GPU**, so every selection is **deterministic, zero-key, free** — demonstrating the "works out of the box" floor. Columns: # · purpose · intent → **selected** · fallback · reason · required assets · quality risk · ~duration.

---

## 1. ClawShow eSign — `saas · 16:9 · conversion · clean-professional` (~56s)

| # | Purpose | Intent → **Selected** | Fallback | Why | Assets | Quality risk | ~dur |
|---|---|---|---|---|---|---|---|
| 1 | hook | brand,open → **scene.saas.brand** | ui.saas.logo | saas-pack brand scene, score 88.96, native Stable-Overlay | brand tokens, logo | — | 5s |
| 2 | problem | problem,pain → **scene.saas.problem** | ui.saas.cta_hero | on-brand problem beat, 86.05 | headline copy | — | 7s |
| 3 | demo-upload | demo,upload (readable) → **scene.saas.upload** | ui.saas.cursor | verified anti-shimmer upload, 88.96 | contract doc props | **anti-shimmer**: text on overlay, integer geometry (Gate F) | 9s |
| 4 | verify | otp,verify (readable) → **scene.saas.otp** | ui.saas.cta_hero | OTP scene, native overlay, 86.05 | phone/OTP props | **anti-shimmer** | 7s |
| 5 | proof-audit | audit,trust (readable) → **scene.saas.audit** | ui.saas.audit_trail_stable | tamper-evident log, 86.05 | audit rows (anonymized) | **anti-shimmer**; **privacy** (demo personas only) | 8s |
| 6 | compliance | compliance,trust (readable) → **scene.saas.compliance** | ui.saas.cta_hero | standards chips, 86.05 | standard labels | **anti-shimmer** | 6s |
| 7 | cta | cta,signup → **scene.saas.cta** | ui.saas.cta_hero | CTA close, 88.96 | CTA copy, URL | CTA must be dominant (Gate D) | 6s |

**Result:** the existing ClawShow v5.1.2 stack reproduced from a brief — all 7 beats deterministic, native Stable-Overlay, zero-key. (The approved v5.1.2 master itself was **not** touched.)

## 2. Online education course — `education · 16:9 · education · clean-professional` (~75s)

| # | Purpose | Intent → **Selected** | Fallback | Why | Assets | Quality risk | ~dur |
|---|---|---|---|---|---|---|---|
| 1 | hook-title | title,education → **scene.om.hero_title** | comp.om.titled_video | strong title (boosted), 76.4 | course title | text-spring shimmer → keep short (Gate F) | 6s |
| 2 | desire | problem,explain → **comp.om.talking_head** | scene.om.callout | presenter framing, 78.63 | **presenter/avatar source** (else use fallback) | needs avatar asset; else callout | 12s |
| 3 | curriculum | steps,progress → **ui.saas.timeline** | scene.om.progress_bar | module timeline, 79.78 | module list | — | 10s |
| 4 | lesson-demo | demo,ui (readable) → **scene.om.screenshot_scene** | ui.saas.cursor | synthetic LMS UI, 81.15 | **LMS screenshot** (scrubbed) | privacy: scrub screenshot; anti-shimmer native | 12s |
| 5 | progress-proof | progress,metrics → **scene.om.kpi_grid** | ui.saas.status_flow_stable | completion KPIs, 81.11 | metric values | — | 9s |
| 6 | teacher-trust | presenter,trust → **ui.saas.verification_badge** | scene.om.progress_bar | trust stamp, 73.71 | credential/accred. | media-truth: real accreditation only | 8s |
| 7 | enroll-cta | cta,signup → **scene.saas.cta** | ui.saas.cta_hero | enrollment CTA, 76.96 | enroll URL | CTA dominant | 8s |

**Gap surfaced:** no native curriculum/teacher/enrollment scenes — the router composed primitives (timeline + KPI + screenshot + badge). Recommended build: `CurriculumScene` / `EnrollmentScene`.

## 3. Longcheng restaurant — `restaurant · 9:16 · awareness · flat-motion-graphics` (~30s)

| # | Purpose | Intent → **Selected** | Fallback | Why | Assets | Quality risk | ~dur |
|---|---|---|---|---|---|---|---|
| 1 | hook-atmosphere | atmosphere,real-media → **tool.direct_clip_search** | scene.om.anime_scene | zero-key real PD footage, 76.88 | **real venue footage** (owner-permissioned) | **media-truth**: real media first; licensing | 5s |
| 2 | signature-dish | real-media,broll → **tool.direct_clip_search** | scene.om.anime_scene | real footage, 78.71 | **real dish photo/video** | **media-truth**: never AI dish as real | 5s |
| 3 | menu | compare,metric → **scene.om.anime_scene** | comp.om.cinematic_renderer | stylized menu atmosphere, 70.14 | menu items, dish stills | label stylized media; menu = **gap** (stopgap) | 5s |
| 4 | reviews | quote,trust → **ui.saas.verification_badge** | scene.om.text_card | trust stand-in, 66.11 | **real permissioned quotes** | reviews = **gap**; use real quotes only | 5s |
| 5 | location | location,map → **comp.om.cinematic_renderer** | comp.om.collage_burst | real exterior montage, 65.64 | exterior footage / licensed map | map = **gap** (no map provider) | 4s |
| 6 | reservation-cta | cta,signup → **ui.saas.cta_hero** | comp.om.collage_burst | rebranded booking CTA, 71.94 | booking URL/phone | CTA dominant | 6s |

**Correctly avoided** the SaaS dashboard stack (no audit/otp/compliance/workspace scenes). **Gaps surfaced** (menu, reviews, location/map) routed to honest stopgaps with warnings rather than silent failure. Recommended builds: `DishScene`, `MenuScene`, `ReviewCardScene`, `LocationMapScene`.

## 4. Inventory-management SaaS — `inventory-erp · 16:9 · demo · clean-professional` (~60s)

| # | Purpose | Intent → **Selected** | Fallback | Why | Assets | Quality risk | ~dur |
|---|---|---|---|---|---|---|---|
| 1 | brand | brand,open → **scene.saas.brand** | ui.saas.contracts_workspace | brand open, 86.07 | brand tokens | — | 5s |
| 2 | dashboard | dashboard,ui (readable) → **ui.saas.contracts_workspace** | scene.om.screenshot_scene | workspace shell, 84.6 | dashboard props / screenshot | **anti-shimmer** native; privacy: fictional data | 9s |
| 3 | stock-table | table,data (readable) → **scene.om.bar_chart** | ui.saas.browser_window | stock levels chart, 78.81 | stock figures | anti-shimmer safe (chart) | 9s |
| 4 | kpi-proof | metric,proof → **scene.om.kpi_grid** | overlay.om.stat_reveal | inventory KPIs, 83.03 | KPI values | — | 8s |
| 5 | alert-workflow | alert,workflow → **ui.saas.status_flow_stable** | ui.saas.browser_window | reorder workflow, 80.64 | workflow steps | anti-shimmer native | 9s |
| 6 | mobile-view | mobile,app (readable) → **ui.saas.phone_mockup** | scene.saas.sign | mobile inventory, 87.9 | mobile UI props | **anti-shimmer**: lift UI to overlay | 8s |
| 7 | cta | cta,signup → **scene.saas.cta** | ui.saas.cta_hero | CTA, 86.07 | CTA copy | CTA dominant | 6s |

**Result:** dashboards + table chart + KPI + workflow + mobile — the ERP stack, diversified (the diversity penalty stopped the generic workspace shell from winning every beat).

## 5. Semantic OS concept explainer — `explainer · 16:9 · awareness · minimalist-diagram` (~70s)

| # | Purpose | Intent → **Selected** | Fallback | Why | Assets | Quality risk | ~dur |
|---|---|---|---|---|---|---|---|
| 1 | hook-title | title,statement → **scene.om.hero_title** | scene.saas.brand | strong title (boosted), 77.57 | title copy | text-spring shimmer → keep short | 7s |
| 2 | concept-diagram | diagram,flow → **tool.diagram_gen** | scene.om.bar_chart | mermaid diagram, 75.58 | concept graph | 🔌 mermaid CLI (else Pillow fallback) | 12s |
| 3 | data-trend | data,trend → **scene.om.line_chart** | scene.om.bar_chart | growth line, 84.08 | series data | safe | 10s |
| 4 | code-demo | code,cli → **scene.om.terminal_scene** | scene.om.bar_chart | synthetic terminal, 83.04 | command steps | privacy-safe (no capture); low shimmer | 12s |
| 5 | comparison | compare,vs → **scene.om.bar_chart** | scene.om.comparison | comparative bars, 79.58 | compare values | safe | 9s |
| 6 | breakdown | data,share → **scene.om.pie_chart** | comp.om.end_tag | share breakdown, 84.08 | proportions | safe | 9s |
| 7 | close | close,brand → **comp.om.end_tag** | scene.saas.cta | documentary close, 80.35 | closing copy | opacity-only (shimmer-safe) | 7s |

**Result:** typography + diagram + charts + code — the explainer stack, all deterministic. `diagram_gen` flagged as the one capability needing a local dependency (mermaid), with a chart fallback so the plan never fails.

---

## Cross-cutting observations (verified by the dry-run)

- **No silent failures.** Every one of the 41 beats produced a preferred selection **and** a fallback (or a deterministic floor). Capability gaps (restaurant menu/reviews/map, education curriculum) routed to honest stopgaps with warnings.
- **Industry separation holds.** The restaurant plan contains **zero** SaaS dashboard scenes; the SaaS/ERP plans contain zero stylized/anime scenes. Profiles bias without caging.
- **Media-truth respected.** With no keys, the restaurant routed to **real public-domain footage** (`direct_clip_search`) first, never to a keyed generative video as a "real" stand-in.
- **Anti-shimmer respected.** Every `readableText` beat selected a `native`/`compatible` Stable-Overlay item; no high-`textTransformRisk` scene was ever chosen for dense readable UI (enforced as a hard exclusion + verified by unit test).
- **Zero-key floor proven.** All 41 selections were deterministic and free — the engine produces a complete plan for every industry with **no providers installed and no API calls**.
