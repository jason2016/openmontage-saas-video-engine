# Professional Video Quality Gates

These gates prevent the router from producing a **technically valid but visually weak** video. They apply to every industry profile. Each gate lists checks and, where automatable, the **zero-key tool** that enforces it. Gates F–H are partly machine-checkable today; A–E and I are largely judgment gates the planner must apply before and after rendering.

Severity: **MUST** (blocks the plan/render) · **SHOULD** (warn and proceed) · **REVIEW** (human sign-off).

---

## A. Strategy gate — MUST

- One clear **target audience**.
- One primary **call to action**.
- One core **promise** (the single thing the viewer should remember).
- **No unsupported business claims** (see Gate E media-truth + Gate G).
- Duration suitable for platform: website/LinkedIn 30–75s · YouTube 60–180s · TikTok/Reels/Shorts 15–45s.
- Aspect ratio matches platform: website/YouTube **16:9** · TikTok/Reels/Shorts **9:16** · feed **1:1**.

*Fail →* the brief is underspecified; ask the user before planning scenes.

## B. Narrative gate — SHOULD

A coherent arc is required; the canonical arc is **hook → problem/desire → solution → proof/demonstration → trust → CTA**. Not every video must use all six beats, but:

- The video must open with a hook within the first ~3s.
- Every beat must advance the single core promise.
- It must close with the one CTA from Gate A.
- No orphan beats (a scene that serves no narrative purpose → cut it, Gate C).

## C. Scene-selection gate — MUST

- **Do not use all available scenes.** A 45–75s video uses **~6–10 primary scenes**.
- Every scene serves a distinct communication purpose.
- **Avoid visually repetitive scenes** (no same-scene back-to-back; cap any scene to ~2 uses — enforced by the router diversity check).
- **Avoid mixing incompatible styles** — one `preferredStyle`/playbook per video.
- **Limit decorative transitions** — prefer opacity cross-dissolves (shimmer-safe); avoid gratuitous wipes/spins.
- **Use industry-appropriate scenes** (restaurant ≠ SaaS dashboard).

*Router enforcement:* scene count window + diversity check (steps 9) + industry profile.

## D. Brand gate — SHOULD

- Consistent logo use; consistent color **tokens**, typography, corner-radius and spacing system (`arch.saas.tokens` / style playbooks).
- Defined visual hierarchy; **CTA visually dominant**.
- **Minimum readable font size** (≥ ~28px at 1080p for body; titles larger).
- Sufficient contrast (WCAG-ish; light text on the dark gradient bg passes).
- **No unapproved third-party branding** (swap `ui.saas.logo`; don't ship ClawShow's mark on another brand).

## E. Media-truth gate — MUST

**For real businesses (restaurant, local service, named product):**

- **Prioritize real, permissioned customer photos/footage** (customer assets, then `tool.pexels_*`/`tool.direct_clip_search`).
- **Do not generate fictional dishes/rooms/people and present them as real.** Generated media is allowed only as clearly-labeled illustration (`overlay.om.provider_chip`), never depicting a specific real subject.
- Preserve **provenance & licensing** for every asset (source, license, permission).
- **Reject low-resolution assets** (below the brief's resolution floor) rather than upscaling a real claim into existence.

**For SaaS / product:**

- Reproduce **accurate, real UI** (screenshot/Remotion); do not show features that don't exist.
- Fictional demo data must read as fictional (example.com addresses, fictitious companies, masked numbers).

## F. Anti-shimmer & rendering gate — MUST

The global form of the ClawShow v5.1.2 lessons. Applies to any **readable** typography/UI:

1. Readable text/UI **must not inherit an animated fractional scale**.
2. Readable UI **renders on the Stable Overlay** where possible (`arch.saas.stable_scene_frame`; `stableOverlaySupport: native|compatible`).
3. **Final readable scale is exactly 1**; **integer-pixel** final X/Y geometry.
4. **Integer scrolling** for dense document text (no sub-pixel scroll).
5. No scale, blur, or spring **overshoot** on small readable text.
6. No animated **border width**; no continuous **glow pulse** around small UI (use discrete state steps).
7. **Opacity-only entrances** for dense text (`arch.saas.snap` / `useSnapEntrance`); camera motion belongs to decorative, non-readable **stage** content.
8. **Test** small UI, timestamps, table rows, chips, and thin borders specifically.
9. **Detect duplicate/ghost overlay elements** (the parity-twin must be `opacity:0` on the stage).

*Routing enforcement:* high `textTransformRisk` scenes are excluded for dense/small text under camera motion; preferred path is a Stable-Overlay scene. *Verification:* adjacent lossless-PNG PSNR on readable-text crops for high-risk moving text (Gate I).

## G. Privacy & compliance gate — MUST

- Scan source **and** visible output for real customer data.
- **Reject real names** unless explicitly approved; reject credentials, tokens, private URLs.
- Use `example.com` addresses and **fictitious** company/contact data in demos.
- **Protect earlier frozen masters** — never overwrite or alter an approved/released render (e.g. ClawShow eSign v5.1.2).
- Document media licenses and user permissions (ties to Gate E).

*Automatable pre-commit check:* grep source/props for forbidden strings (real names, keys, internal hostnames) before any publish.

## H. Technical gate — MUST (machine-checkable today)

| Check | Tool (zero-key) |
|---|---|
| Validate composition (props/schema, assets present) | `tool.composition_validator` ★prod |
| Validate resolution & FPS | `tool.composition_validator` / ffprobe |
| Validate **exact frame count** | `tool.composition_validator` / ffprobe |
| Clean full decode (no corrupt frames) | `tool.visual_qa` / ffprobe |
| Detect blank or incomplete frames | `tool.visual_qa` |
| ffprobe verification (container/streams) | `tool.audio_probe` + ffprobe |
| Output-path collision protection | router/render script guard (don't overwrite masters) |
| Verify fonts & assets resolve | `tool.composition_validator` |
| Preserve intended CTA hold (tail duration) | `tool.composition_validator` (duration check) |
| Verify audio levels when audio present | `tool.audio_probe` ★prod |

## I. Visual review gate — REVIEW

Require representative **stills** (`tool.frame_sampler`) for:

- opening · product demonstration · dense small text · mobile view · proof/trust scene · CTA · final frame.

For **high-risk moving text**, require an **adjacent lossless-PNG comparison** (PSNR on the readable-text crop): `inf` (byte-identical at settled beats) on opaque surfaces; a documented background-bleed floor (~62–66 dB) on translucent surfaces is acceptable and imperceptible. This is exactly the method used to clear the ClawShow v5.1.2 scenes.

---

## How the router applies the gates

- **Pre-plan:** Gate A (else ask the user), Gate C scene-count window.
- **During scoring/selection:** Gate F (anti-shimmer exclusions + Stable-Overlay preference), Gate E (media-truth ranking), Gate D (brand-token availability into `brandabilityScore`), Gate G (privacy exclusions), Gate C diversity.
- **Pre-render preflight:** Gate H via `composition_validator`/`audio_probe`.
- **Post-render:** Gate H decode/blank-frame, Gate I stills + PSNR for high-risk text.

A scene plan that fails any **MUST** gate is returned with the failure and a fallback — never rendered silently.
