# 05 · Implementation Plan — Component Pack v1

**Author:** Claude Design
**Gate:** Do not start until docs 01–04 are approved. v1's job is to make the `02_storyboard.md` film renderable at the `01_design_brief.md` quality bar — nothing more.

---

## 1. v1 scope

**In:** the foundations + exactly the components the ClawShow storyboard needs, plus the data-driven composition to assemble them, ending in a rendered **ClawShow v3**.

**Out (deferred to v1.1+):** LaptopMockup, Dashboard, APIFlow, light theme, narration/TTS, advanced match-cut camera. Listed in §6.

**Acceptance for v1:** ClawShow v3 renders from `config.json` through the `saas-pack` `SaasPromo` composition; muted + at 0.5× it reads calm/premium/legible; **no edits to existing core files; no GPU; zero-key.**

## 2. Milestones

### M0 — Foundations
- `tokens.ts`, `theme.ts` (brand merge), `hooks/easings.ts`, `hooks/useEntrance.ts`, `hooks/useStagger.ts`.
- `primitives/`: `AnimatedBackground`, `GradientMesh`, `Particles`, `GlassCard`.
- `saas-pack/index.tsx` + `Root.tsx` with a throwaway `SaasPromo` that renders background + one GlassCard.
- **DoD:** `npx remotion still src/saas-pack/index.tsx SaasPromo out.png` shows mesh + glass card on canvas tokens. Determinism verified (same frame ⇒ same png).

### M1 — Chrome & core workflow components
- `BrowserWindow`, `PhoneMockup`, `PDFViewer`, `Cursor`, `MouseClick`, `NotificationToast`, `CTAHero`.
- **DoD:** hero-frame stills for Upload (S3), Send (S4), Brand/CTA (S2/S7) look correct in isolation (`stories/`).

### M2 — Trust & signature components
- `SignatureStroke`, `OTPInput`, `VerificationBadge`, `Timeline`, `AuditTrail`, `EmailFlow`, `MotionLines`, `FloatingCards`.
- **DoD:** hero stills for Sign+OTP (S5), Trust/Audit (S6), Cold open (S1).

### M3 — Composition + engine integration (the payoff)
- `scenes/SceneRenderer.tsx` (scene-spec → components) + `scenes/SaasPromo.tsx` (background + `<Sequence>` per scene + `transitions/`).
- Extend `build.py` with `--engine saas-pack`: emit the scene-graph props (`demo-props/<name>.saas.json`) from the same `config.json`.
- Map `scene-config.json` beats → component recipes (Problem→FloatingCards, Upload→BrowserWindow+PDFViewer+Cursor, …).
- **DoD:** `python3 build.py clawshow-esign --engine saas-pack --out clawshow-esign-v3` → render → `renders/clawshow-esign-v3.mp4`. Side-by-side with v2 shows clear premium lift.

### M4 — Polish & breadth (v1.1, optional)
LaptopMockup · Dashboard · APIFlow · crossfade/match-cut camera helpers · light theme · Piper narration · second tenant (e.g. `semantic-os`) as a generalization proof.

## 3. Testing strategy (no GPU, fast)
- **Stills over renders during build.** `npx remotion still <entry> <comp> out.png --frame=<heroFrame> --props=stories/<component>.json` — instant visual check per component, no encode.
- **Story fixtures.** Each component ships a `stories/<name>.json` exercising its props at its hero frame.
- **Determinism check.** Render the same still twice; bytes must match (seed all randomness).
- **Full render only at M3** (and per scene as needed).
- **Quality lens (brief §10):** muted, 0.5×, "can I point to anything that exists only to look cool?" → if yes, cut it.

## 4. Risks & mitigations
| Risk | Mitigation |
|---|---|
| Fonts not loading in render | `@remotion/google-fonts/Inter` (already used by MVP); preload weights. |
| Non-determinism (particles) | Seeded RNG helper; no `Math.random()` in render path. |
| Transition dep weight | Use `@remotion/transitions` if present; else tiny opacity/scale helper. No heavy deps. |
| `/mnt/c` render slowness | Accept for now; optional later move to WSL ext4. Orthogonal. |
| Scope creep | v1 = storyboard components only; §6 list is explicitly deferred. |
| "Premium" subjectivity | The brief's acceptance lens (§10) + still review at each hero frame. |

## 5. Sequencing & effort (relative)
M0 (foundations) → M1 (chrome) → M2 (trust) → M3 (compose+engine). M0–M2 are parallelizable by component since each is isolated; M3 depends on all. Rough weight: M0 ~15% · M1 ~25% · M2 ~30% · M3 ~30%.

## 6. Explicitly deferred (so v1 stays simple)
LaptopMockup · Dashboard · APIFlow · light/warm theme variants · narration (Piper TTS) · advanced camera (dolly/match-cut beyond basic) · additional product tenants. None block ClawShow v3.

## 7. What I will NOT do
- Modify `index.tsx`, `Root.tsx`, `Explainer.tsx`, or legacy `components/`.
- Add paid APIs or GPU dependencies.
- Break v1/v2 (they remain the `Explainer` baseline).
- Start coding before docs 01–05 are approved.

---

## Review checklist (please confirm before I implement)
1. **Approach** — additive `saas-pack` with its own entry, parallel to the MVP? (architecture §7.1)
2. **Scene model** — data-driven `SceneRenderer` from JSON? (architecture §7.2)
3. **Scope** — v1 = foundations + storyboard components + ClawShow **v3**, deferring §6?
4. **Quality bar** — the brief §10 acceptance lens is the standard?
5. **Anything to change** in the brief, storyboard, or component pack before code?

On approval, I start at **M0**.
