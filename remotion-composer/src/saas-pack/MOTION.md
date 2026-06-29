# SaaS Motion Pack — Product Marketing Library

A reusable cinematic motion system for premium SaaS launch films. Built for
ClawShow eSign, but designed to carry **any** product story — CRM, ERP, AI Agent,
Inventory, Analytics, Dashboard, Mobile — without one-off effects.

The rule: **one curve per intent, never one curve for everything.** Motion that
all shares a single ease reads as a template. A named vocabulary reads as a product.

---

## 1. The curve vocabulary (`tokens.motion.curve`)

Source of truth: [`tokens.ts`](./tokens.ts). Consumed as named easings from
[`hooks/easings.ts`](./hooks/easings.ts). Pick by **what the motion means**, not by
how it looks.

| Curve | Intent | Feel |
|-------|--------|------|
| `entrance` | Content reveals (text, cards, rows) | Calm expo-out; arrives and settles. The default. |
| `pointer` | Synthetic cursor travel | Accelerates from rest, decelerates into target — a human hand. |
| `press` | Button press dip | Quick, controlled down/up. |
| `camera` | Scene camera moves | Reaches rest early, then holds. |
| `exit` | Scene fade-out | Soft, slightly held. |
| `signature` | Pen draw-on | Accelerates from rest into the flourish. |

`easeSettle` remains exported as a back-compat alias of `easeEntrance`.

## 2. Timing & physics tokens

- `tokens.motion.pointer` — `dwellSeconds`, `pressDepth`, `pressSeconds`: how a
  cursor arrives, waits, and presses with weight (its shadow tightens on contact).
- `tokens.motion.camera.settleFraction` — the fraction of a scene over which a
  camera move completes **before holding dead still**. Typography carries the rest.
- `tokens.motion.duration` / `stagger` — entrance timing + list cascade.

## 3. Cinematic building blocks

Reusable across products. Drive them with timing props, not hardcoded effects.

- **`SceneFrame`** — per-scene cross-dissolve + directional camera that settles and
  holds (`push / pull / pan / tilt / rise / still`).
- **`Cursor` + `MouseClick`** — human pointer physics: accel→decel travel, arrival
  dwell, real press depth. Positions are % of parent.
- **`useEntrance`** — the calm reveal hook (opacity + small rise + small scale).
- **`StatusFlow`** — vertical stepper for any async process (invite, onboarding,
  deploy, sync): pending → active → done, with a terminal "awaiting" hold.
- **`NotificationToast`**, **`VerificationBadge`**, **`FloatingCards`** (peripheral
  constellation that frames type, never crosses it), **`BrowserWindow`**,
  **`PhoneMockup`**, **`SignatureStroke`** (organic velocity).
- **Hover-on-arrival** — a primary action lifts + brightens as the cursor arrives
  (`ContractsWorkspace primaryHoverAtSeconds`); the reusable pattern for believable
  click targets.

## 4. Principles (the review bar)

1. Every scene answers "what business story is this telling?" — not "what UI moves?"
2. Camera moves, then **holds**. Small movements beat large ones.
3. Typography is the hero; motion never overpowers it.
4. The product looks real — real PDFs, real scrolling, believable hover/press.
5. Less motion is better than unnecessary motion.
6. Before shipping a scene: *Would Apple approve? Would Stripe publish this?* If not
   an obvious yes, iterate.
