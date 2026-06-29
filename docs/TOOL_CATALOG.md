# OpenMontage — Tool & Scene Catalog

**Human-readable companion to [`config/tool-registry.json`](../config/tool-registry.json).** Every capability below is verified against actual source files. **Source presence is never treated as proof a tool is operational** — readiness is stated explicitly.

> Counting discipline (see also the registry `meta`): this repo does **not** contain "52 distinct verified scenes." That promotional figure is a non-authoritative sum of the OpenMontage core (~19 scene-like entries) plus saas-pack **version-fork files** (V51/V511/V512 ≈ 33). Separate, verified per-layer counts are in [§ Verified counts](#verified-counts-per-layer).

## Readiness legend

| Tag | Meaning |
|---|---|
| ✅ **READY** | Deterministic, zero API key, no GPU. Works given FFmpeg/Node on PATH. |
| 🔌 **DEPS** | Local/zero-key but needs a binary or Python/Node lib installed (piper, manim, mermaid, whisper, Node≥22…). |
| 🔑 **KEY** | Requires an API key (env var). 🔑*free* = free-tier key (Pexels/Pixabay/Freesound). |
| 🖥️ **GPU** | Needs a local GPU (LOCAL_GPU, `vram_mb>0`). |
| 🧪 stability | `production` / `beta` / `experimental` / `deprecated` as declared in source. Only **3** tools are `production` (all FFprobe QA). |

`det` = deterministic (same input → same output). `gen` = generative (model output varies). **Anti-shimmer** flags whether readable text can ride an animated camera transform — see [`PROFESSIONAL_VIDEO_QUALITY_GATES.md` Gate F](./PROFESSIONAL_VIDEO_QUALITY_GATES.md).

---

## common

Shared infrastructure that other categories build on.

- **`comp.om.explainer_engine` — Explainer** · `remotion-composer/src/Explainer.tsx` · ✅ det. The data-driven sequencer that dispatches all 13 `cut.type` scenes + 4 overlays + narration/music from an `edit_decisions` JSON. **Use** to assemble any multi-scene timeline. **Don't** use for a single static beat. Fallback: render one component composition directly.
- **`arch.saas.stable_scene_frame` — StableSceneFrame** · `…/saas-pack/v51/StableSceneFrame.tsx` · ✅ det, `production`. The Camera-Stage + Stable-Overlay split (the anti-shimmer mechanism). **Use** whenever a scene has both camera motion and readable UI. **Required config:** put readable text on the overlay child, decorative content on the stage child.
- **`arch.saas.snap` — useSnapEntrance** vs **`arch.saas.use_entrance` — useEntrance**: snap = shimmer-**safe** (opacity + integer-pixel Y, scale 1); useEntrance = shimmer-**unsafe** for text (fractional scale). **Rule:** readable text → `useSnapEntrance`; decorative stage mockups → `useEntrance`.
- **`ui.saas.animated_background` — AnimatedBackground**, **`ui.saas.glass_card` — GlassCard**: ambient/background and container primitives. ✅ det.
- **Character tools** (`tool.character_spec_generator`, `tool.svg_rig_builder`, `tool.pose_library_builder`, `tool.action_timeline_compiler`, `tool.character_rig_renderer`, `tool.character_animation_reviewer`) · `tools/character/character_animation.py` · ✅ det `beta`, zero-key (rig→MP4 needs Playwright+ffmpeg, then 🔌).

## typography

Large-text statement beats. **All carry anti-shimmer risk** (text rides a scale/translate spring) — keep durations short and let them settle; never hold dense paragraphs on these.

| Capability | ID | Where | Ready | Anti-shimmer | Use / Avoid |
|---|---|---|---|---|---|
| TextCard | `scene.om.text_card` | `components/TextCard.tsx` | ✅ | ⚠ high | Big statements, hooks / dense paragraphs |
| HeroTitle | `scene.om.hero_title` | `components/HeroTitle.tsx` | ✅ | ⚠ high | Title/end cards / mid-scene text |
| CalloutBox | `scene.om.callout` | `components/CalloutBox.tsx` | ✅ | ⚠ high | Info/warning/tip/quote / primary CTA |
| SectionTitle (overlay) | `overlay.om.section_title` | `components/SectionTitle.tsx` | ✅ | low | Corner labels / primary message |

**Brandable, low-shimmer alternative for SaaS:** the saas-pack scenes (below) put readable text on the static overlay — prefer them when the brief allows.

## brand

- **`arch.saas.tokens` — tokens / mergeBrand** · `…/saas-pack/tokens.ts` · ✅. Color/type/radius/spacing system; `mergeBrand()` rebrands any saas-pack scene. **Brandability 100.**
- **`ui.saas.cta_hero` — CTAHero** · ✅ generic CTA hero with dominant button.
- **`ui.saas.verification_badge` — VerificationBadge** · ✅ generic trust stamp.
- **`comp.om.end_tag` — EndTag** · ✅ opacity-only closing card (shimmer-safe by design).
- **`comp.om.product_reveal` — ProductReveal** · ✅ Apple-style hero reveal (⚠ per-char shimmer on the product name — keep it short).
- **`overlay.om.provider_chip` — ProviderChip** · ✅ rotating "generated with X" badge — **use this to label AI-generated media** (Media-Truth Gate E).
- **`ui.saas.logo` — Logo** · ClawShow brand mark; **replace the asset for other brands.**

## product-ui

The saas-pack scene system — premium, brandable, anti-shimmer-native SaaS/product UI. **Built 16:9.** All `available` + VERIFIED (rendered in the approved ClawShow v5.1.2 master or its diagnostics).

| Scene | ID | Camera | Stable-Overlay | Notes |
|---|---|---|---|---|
| Brand open | `scene.saas.brand` | push | native | Logo reveal |
| Problem | `scene.saas.problem` | props | native | Clutter/pain beat |
| Upload | `scene.saas.upload` | pan-right | native | Browser walkthrough (cursor/dissolve/toast) |
| Invite | `scene.saas.invite` | pan-left | native | Status-flow stepper |
| OTP / 2FA | `scene.saas.otp` | push | native | Phone + code-input |
| Sign | `scene.saas.sign` | pan-right | native | Mobile signature, integer PDF scroll |
| Audit | `scene.saas.audit` | push | native | Tamper-evident log |
| Compliance | `scene.saas.compliance` | pull | native | Standards chip row (serves `aes` + `compliance`) |
| CTA | `scene.saas.cta` | props | native | Signup close |

**Reusable building blocks** (compose your own product scenes): `ui.saas.browser_window`, `ui.saas.otp_input_stable`, `ui.saas.status_flow_stable`, `ui.saas.audit_trail_stable`, `ui.saas.notification_toast`, `ui.saas.cursor`, `ui.saas.timeline`, `ui.saas.contracts_workspace`, `ui.saas.email_flow`. **Use** the `*Stable` twins (not the superseded `AuditTrail`/`OTPInput`/`StatusFlow` v51 originals, which shimmer). **Avoid** for non-SaaS verticals (don't turn a restaurant film into a dashboard).

## browser

- **`scene.om.screenshot_scene` — ScreenshotScene** · ✅ det, anti-shimmer **native**. Drop any screenshot, animate scripted overlays (cursor/click/type/highlight) on top. **Best** privacy-safe synthetic UI demo. **Privacy:** scrub the screenshot of real data first.
- **`ui.saas.browser_window` — BrowserWindow** · ✅ generic browser chrome host.
- **`tool.screen_recorder` — ScreenRecorder** · ✅ real OS/app capture. **Avoid** for privacy-sensitive UIs → use synthetic ScreenshotScene/TerminalScene instead. **`tool.cap_recorder`** 🔌 (needs Cap app); **`tool.screen_capture_selector`** routes between them.

## mobile

- **`ui.saas.phone_mockup` — PhoneMockup** · ✅ generic phone frame. **Required:** lift readable content to the overlay (the v5.1.2 Sign/OTP pattern) so text doesn't ride the camera.
- `scene.saas.otp` and `scene.saas.sign` are the verified mobile reference scenes.

## PDF and document

- **`ui.saas.pdf_viewer` — PDFViewer** · ✅ generic document page host. Integer scroll for dense text.
- **`ui.saas.contract_document` — ContractDocument** · ✅ anonymized demo contract; reuse the layout, replace the content. **Privacy:** keep demo personas (example.com / fictitious companies).
- **`ui.saas.signature_stroke` — SignatureStroke** · ✅ hand-signature draw.

## education

> **GAP — no dedicated education scenes/pipeline exist** (verified: no `education/course/curriculum/teacher/enrollment` source). Build education videos by **composing existing primitives**:

- Course intro/title → `scene.om.hero_title` or `scene.saas.brand`
- Curriculum/modules → `scene.om.kpi_grid`, `ui.saas.timeline`, `scene.om.progress_bar`
- Lesson UI/LMS → `scene.om.screenshot_scene` (LMS screenshot) or `ui.saas.browser_window`
- Teacher/presenter → `comp.om.talking_head` (🖥️/🔑 needs avatar source) or `pipeline.avatar_spokesperson`
- Progress/enrollment → `scene.om.progress_bar`, `scene.om.stat_card`, `scene.saas.cta`
- Pipeline: **`pipeline.animated_explainer`** (production) or **`pipeline.animation`**.
- **Recommended new build:** a `CurriculumScene` / `EnrollmentScene` on the Stable-Overlay architecture (see capability gaps in routing rules).

## restaurant and local business

> **GAP — no dedicated restaurant/menu/dish scenes exist.** **Media-Truth rule (Gate E): use the real venue's photos/video first; never present AI-generated dishes as real.** Compose with:

- Hero dish/venue → **real media first** via `tool.pexels_video`/`tool.pexels_image` (🔑*free*) for ambience b-roll, or the customer's own assets; `scene.om.anime_scene` only for stylized non-claim atmosphere.
- Menu → `scene.om.kpi_grid` / `scene.om.comparison` as a stopgap menu card (label clearly).
- Reviews/testimonials → **GAP** (no review-card scene) → stopgap `scene.om.callout` (`callout_type: "quote"`).
- Location/map → **GAP** (no map scene; no map provider) → stopgap still image of a map (with license) + `overlay.om.section_title`.
- Opening hours → `scene.om.kpi_grid` or `scene.om.text_card`.
- Reservation CTA → `scene.saas.cta` / `ui.saas.cta_hero` (rebranded) + `ui.saas.phone_mockup` for a booking screen.
- Pipeline: **`pipeline.cinematic`** or **`pipeline.hybrid`** (real footage + designed overlays). **Do not** route to the SaaS dashboard stack.

## charts and KPI

| Capability | ID | Where | Ready | Use |
|---|---|---|---|---|
| StatCard | `scene.om.stat_card` | `components/StatCard.tsx` | ✅ | One hero number |
| KPIGrid | `scene.om.kpi_grid` | `components/charts/KPIGrid.tsx` | ✅ | 2–4 KPIs, dashboards (anti-shimmer safe) |
| ComparisonCard | `scene.om.comparison` | `components/ComparisonCard.tsx` | ✅ | Before/after, us-vs-them |
| StatReveal (overlay) | `overlay.om.stat_reveal` | `components/StatReveal.tsx` | ✅ | Corner stat badge |

## code

- **`scene.om.terminal_scene` — TerminalScene** · ✅ det, anti-shimmer low. Synthetic typed terminal — **no real capture**, privacy-safe. Best for CLI/install walkthroughs.
- **`tool.code_snippet` — CodeSnippet** · 🔌 (pygments+PIL) syntax-highlighted code stills. Fallback: TerminalScene.

## data visualization

- **`scene.om.bar_chart` / `scene.om.line_chart` / `scene.om.pie_chart`** · ✅ det, anti-shimmer **safe** (geometry animates, labels static). Bars=categorical, line=time series, pie=share-of-total.
- **`tool.diagram_gen` — DiagramGen** · 🔌 (mermaid CLI / Pillow fallback) flow/architecture diagrams.
- **`tool.math_animate` — MathAnimate** · 🔌 (manim) 3b1b-style math animation.

## maps and locations

> **GAP — no map scene and no map/geocoding provider in the repo.** Recommended stopgap: licensed static map image as an `Img` cut + `overlay.om.section_title` label. **Recommended new build:** a `LocationMapScene` (static tiles + pin) on the Stable-Overlay architecture. Do not fabricate a location.

## reviews and testimonials

> **GAP — no review/testimonial card scene.** Stopgap: `scene.om.callout` with `callout_type: "quote"`, or a `ui.saas.glass_card` composed manually. **Media-Truth:** only use real, permissioned quotes; attribute honestly. **Recommended new build:** `ReviewCardScene` (star rating + quote + avatar).

## process and timeline

- **`ui.saas.timeline` — Timeline** · ✅ generic process timeline.
- **`ui.saas.status_flow_stable` — StatusFlowStable** · ✅ anti-shimmer vertical stepper (spinner/pulse are intentional live-status motion).
- **`scene.om.progress_bar` — ProgressBar** · ✅ progress/completion.

## social content

- **`comp.om.caption_overlay` — CaptionOverlay/WordCaption** · ✅ word-by-word captions (9:16/1:1). **`comp.om.collage_burst`** ✅ fast image-collage bursts. **`comp.om.lyric_overlay`** ✅ music/lyric overlays.
- **`tool.auto_reframe`** ✅ 16:9→9:16/1:1 reframe; **`tool.silence_cutter`** ✅ jump-cuts; **`tool.remotion_caption_burn`** ✅ caption burn-in.
- Pipelines: **`pipeline.clip_factory`** (beta), **`pipeline.podcast_repurpose`** (beta).

## image

- **Stock (real, media-truth friendly):** `tool.pexels_image` / `tool.pixabay_image` · 🔑*free* det. *(Mis-bucketed as `image_generation` in source, but they search/download — treat as real media.)*
- **`tool.bg_remove` — BgRemove** · 🔌 (rembg) product cutouts.
- **`tool.image_selector`** ✅ routes to best available image provider.

## real video footage

- **`tool.direct_clip_search` — DirectClipSearch** · ✅ **zero-key** for public-domain sources (archive.org / NASA / Wikimedia); 🔑*free* for Pexels/Unsplash. **The zero-key real-footage backbone.**
- **`tool.pexels_video` / `tool.pixabay_video`** · 🔑*free* det stock b-roll. *(Mis-bucketed as `video_generation`.)*
- **`tool.video_downloader`** 🔌 (yt-dlp, network) — source/reference footage; **respect licensing.**
- **`tool.clip_search`** 🔌 (CLIP corpus), **`tool.corpus_builder`** 🔌, **`tool.video_selector`** ✅ router.

## generative image

> **All require a key or GPU — none are zero-key. Media-Truth: never present generated images of a real business/product as real.**

- **`tool.flux_image`** 🔑 (FAL_KEY) — highest quality; **`tool.recraft_image`** 🔑 (FAL_KEY) vector/brand; **`tool.openai_image`** 🔑; **`tool.google_imagen`** 🔑; **`tool.grok_image`** 🔑.
- **`tool.local_diffusion`** 🖥️ — zero-key but needs GPU. **`tool.image_gen_deprecated`** — deprecated, use the selector.
- **Fallbacks if no key/GPU:** stock photo (`tool.pexels_image`) → deterministic scene (`scene.om.*`).

## generative video

> **All require a key or GPU. Forbidden as a silent substitute for real-business footage. Always label with `provider_chip`.**

- **API (FAL_KEY):** `tool.veo_video`, `tool.kling_video`, `tool.minimax_video`, `tool.seedance_video`. **Other keys:** `tool.seedance_replicate` (Replicate), `tool.grok_video` (xAI), `tool.runway_video`, `tool.higgsfield_video`, `tool.ltx_video_modal` (self-host), `tool.heygen_video` (avatar).
- **GPU local (zero-key):** `tool.cogvideo_video`, `tool.wan_video`, `tool.ltx_video_local`, `tool.hunyuan_video` (6–14 GB VRAM).
- **Fallback chain:** generative video → real stock (`tool.pexels_video`/`tool.direct_clip_search`) → deterministic Remotion scenes.

## narration

- **TTS:** `tool.piper_tts` 🔌 (local, privacy-safe), `tool.elevenlabs_tts` 🔑 (premium), `tool.openai_tts` 🔑, `tool.google_tts` 🔑, `tool.doubao_tts` 🔑; **`tool.tts_selector`** ✅ routes. **No TTS works zero-key without installing piper** — flag this at proposal.
- **Speech-to-text/subtitles:** `tool.transcriber` 🔌 (whisperx), `tool.transcript_fetcher` 🔌, `tool.subtitle_gen` ✅ (pure stdlib SRT).
- **Avatar/lip-sync:** `comp.om.talking_head` (Remotion layout), `tool.talking_head_avatar` 🖥️ (SadTalker), `tool.lip_sync` 🖥️ (wav2lip), `tool.heygen_video` 🔑.

## music and sound

- **`tool.pixabay_music`** ✅ **zero-key** royalty-free music (web scraper — verify at runtime; may break). **`tool.freesound_music`** 🔑*free*. **`tool.music_gen`** 🔑 (ElevenLabs), **`tool.suno_music`** 🔑.
- **`tool.audio_enhance`** ✅ denoise/normalize, **`tool.audio_mixer`** ✅ mix narration+music with ducking.

## transition

- Handled inside `comp.om.explainer_engine` and `arch.saas.stable_scene_frame` (opacity cross-dissolves — shimmer-safe). **`comp.om.cinematic_renderer`** ✅ mood-led montage transitions. **Limit decorative transitions** (Gate C).

## export

The **zero-key FFmpeg backbone** — the production-safe core. All ✅ det.

- **`tool.video_compose`** — compose/render (FFmpeg always-on; routes Remotion/HyperFrames). **`tool.video_stitch`** concat · **`tool.video_trimmer`** trim · **`tool.silence_cutter`** · **`tool.auto_reframe`** · **`tool.green_screen_composite`** / **`tool.green_screen_processor`** · **`tool.showcase_card`** · **`tool.remotion_caption_burn`** · **`tool.color_grade`** · **`tool.subtitle_gen`**.
- **`tool.hyperframes_compose`** 🔌 (Node≥22) — alternate HTML/CSS/GSAP composition runtime.

## quality assurance

The only **`production`-stability** tools in the repo (FFprobe-based) + supporting QA. All ✅ det. Drive [Gate H](./PROFESSIONAL_VIDEO_QUALITY_GATES.md).

- **`tool.composition_validator`** ★prod — pre-render asset/duration/resolution validation. **`tool.audio_probe`** ★prod — audio levels. **`tool.audio_energy`** ★prod — energy/beat.
- **`tool.frame_sampler`** ✅ representative stills (Gate I). **`tool.visual_qa`** ✅ blank/incomplete-frame detection. **`tool.scene_detect`** ✅. **`tool.face_tracker`** ✅. **`tool.video_understand`** 🖥️ (VLM).

---

## Verified counts per layer

| Layer | Verified count | Note |
|---|---:|---|
| Registered compositions (main `Root.tsx`) | **13** | Explainer, CinematicRenderer, SignalFromTomorrow, TalkingHead, TitledVideo, HeroTitle, ProductReveal[+Vertical], CaptionOverlayOnly, CollageBurst, LyricOverlay, EndTag[+Overlay] |
| Explainer `cut.type` scene types | **13** | +2 implicit media renderers (image/video) + 1 text fallback |
| `overlay.type` types | **4** | `hero_title` shared with cut dispatch |
| Standalone scene components (own compositions) | **9** | EndTag, ProductReveal, CaptionOverlay, CollageBurst, LyricOverlay, TitledVideo, CinematicRenderer, TalkingHead, HeroTitle |
| saas-pack canonical scenes (v5.1.2) | **9** | brand, problem, upload, invite, otp, sign, audit, compliance/aes, cta |
| saas-pack product-UI components | **~27** | ~22 generic/semi-generic |
| saas-pack roots / diagnostic entrypoints | **8** | NOT scenes (roots + AntiShimmerDiagRoot + StoriesRoot) |
| Tools (`class X(BaseTool)`) | **85** | re-grep finds 85; one audit pass said 86 |
| Pipelines | **13** | 6 production, 7 beta |
| Style playbooks | **4** | clean-professional, flat-motion-graphics, minimalist-diagram, anime-ghibli |
| Schemas | **24** | 21 artifacts + manifest + checkpoint + playbook + video_stitch |
| Demo-props | **9** | no test/scratch props present |
| Project templates | **1** | `projects/templates/saas-promo` |
| Skills (OpenMontage dirs) | **150** | 103 pipeline director + 8 meta + 6 core + 33 creative |
| Skills (Layer-3 vendor) | **69** | composition/animation/character/image/video/audio/avatar/capture/viz |

**Registry total:** 158 catalogued items (scenes, overlays, compositions, components, architecture, 85 tools, pipelines, styles).

### Why this differs from "52 scenes"

"~52" is a **promotional sum across two libraries**, not a count of distinct verified scenes:

- OpenMontage core ≈ **19** scene-like entries (13 cut types + 4 overlays + ~2 headline standalone comps you'd call "scenes").
- saas-pack **version-fork files** ≈ **33** (templates ~10 + `v51` ~10 + `v511` ~4 + `v512` ~9).
- 19 + 33 ≈ 52.

The saas-pack forks are **iterations of the same ~9–11 beats** (V51→V511→V512 are anti-shimmer rewrites), not distinct scenes. Diagnostic roots, aliases, and fallback routes are also excluded from the verified counts above. **There are not 52 independently designed, verified scenes.**

## Major capability gaps (no source today)

| Gap | Status | Recommended fallback / build |
|---|---|---|
| Education (curriculum/teacher/enrollment scenes) | greenfield | compose KPIGrid+Timeline+ProgressBar+ScreenshotScene; build `CurriculumScene`/`EnrollmentScene` |
| Restaurant/local (dish/menu) | greenfield | real media first (Pexels/customer); build `DishScene`/`MenuScene` |
| Reviews/testimonials | greenfield | `callout` quote stopgap; build `ReviewCardScene` |
| Maps/locations | greenfield (no map provider) | licensed static map `Img`; build `LocationMapScene` |
| Zero-key TTS | partial | piper needs install; flag at proposal |
| Industry pipelines | none | all coverage is horizontal/format; verticals route via profiles in `industryProfiles.ts` |
