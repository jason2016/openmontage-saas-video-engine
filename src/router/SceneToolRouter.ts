// SceneToolRouter — turns a brief into a Scene Plan by selecting the best available
// registry item per scene intent, with hard exclusions, weighted scoring, and fallbacks.
// Never returns a silent failure: an excluded preferred item yields a fallback + warning.
// Dependency-free (no node imports) so it type-checks under strict tsc and runs anywhere.
import type {
  Registry, RegistryItem, RouterInput, SceneIntent, RoutingDecision, ScenePlan, CostCategory, ScoreBreakdown,
} from "./types";
import { hardExclusions, scoreItem, tieBreak, type Exclusion } from "./scoring";
import { profileFor, type IndustryProfile } from "./industryProfiles";

const CANDIDATE_TYPES = new Set(["scene", "overlay", "composition", "component", "tool", "pipeline"]);

/** Deterministic zero-key floors by coarse intent family — the terminal fallback. */
const FLOORS: Array<{ test: RegExp; id: string }> = [
  { test: /(data|kpi|metric|chart|compare|trend|table)/, id: "scene.om.kpi_grid" },
  { test: /(ui|demo|product|dashboard|workflow|screen|browser)/, id: "scene.om.screenshot_scene" },
  { test: /(footage|broll|real-media|atmosphere|mood|cinematic)/, id: "tool.direct_clip_search" },
  { test: /(code|cli|terminal|install)/, id: "scene.om.terminal_scene" },
  { test: /(cta|signup|close|convert)/, id: "scene.saas.cta" },
];
const DEFAULT_FLOOR = "scene.om.text_card";

export class SceneToolRouter {
  private byId = new Map<string, RegistryItem>();
  constructor(private registry: Registry) {
    for (const it of registry.items) this.byId.set(it.id, it);
  }

  static fromItems(items: RegistryItem[]): SceneToolRouter {
    return new SceneToolRouter({ meta: {}, items });
  }

  item(id: string): RegistryItem | undefined { return this.byId.get(id); }

  /** Plan an entire brief. */
  route(input: RouterInput): ScenePlan {
    const profile = profileFor(input.productType);
    // Track selections so the scorer can softly demote repeats (diversity, Gate C).
    const used = new Map<string, number>();
    const decisions = input.sceneIntents.map((si) => {
      const d = this.routeIntent(input, si, profile, used);
      if (d.preferred) used.set(d.preferred, (used.get(d.preferred) ?? 0) + 1);
      return d;
    });
    const planWarnings: string[] = [];

    const n = decisions.length;
    if (n < profile.sceneCount.min) planWarnings.push(`Scene count ${n} below profile floor ${profile.sceneCount.min} (Gate C).`);
    if (n > profile.sceneCount.max) planWarnings.push(`Scene count ${n} above profile ceiling ${profile.sceneCount.max} (Gate C: trim to ~6-10).`);

    // diversity: no same preferred id on adjacent beats; cap repeats at 2
    const counts = new Map<string, number>();
    for (let i = 0; i < decisions.length; i++) {
      const id = decisions[i].preferred;
      if (!id) continue;
      counts.set(id, (counts.get(id) ?? 0) + 1);
      if (i > 0 && decisions[i - 1].preferred === id)
        decisions[i].professionalWarnings.push(`Diversity: same scene '${id}' on adjacent beats (Gate C).`);
    }
    for (const [id, c] of counts) if (c > 2) planWarnings.push(`Diversity: '${id}' used ${c}× (cap ~2 per video, Gate C).`);

    if (!decisions.some((d) => d.intent.some((t) => /cta|signup|close|convert/.test(t))))
      planWarnings.push("No CTA beat detected (Gate A/B: every video needs one clear CTA).");

    return {
      productType: input.productType, platform: input.platform, aspectRatio: input.aspectRatio,
      objective: input.objective, profile: profile.productType,
      preferredStyle: input.preferredStyle || profile.preferredStyle, decisions, planWarnings,
    };
  }

  /** Plan a single scene intent. `used` enables a soft diversity penalty across a plan. */
  routeIntent(input: RouterInput, intent: SceneIntent, profile?: IndustryProfile, used?: Map<string, number>): RoutingDecision {
    const prof = profile ?? profileFor(input.productType);
    const usedC = used ?? new Map<string, number>();
    const DIVERSITY_PENALTY = 8; // points subtracted per prior use, for ranking only

    // 6. candidate retrieval
    const candidates = this.registry.items.filter((it) => CANDIDATE_TYPES.has(it.type) && this.isRelevant(it, intent, input));

    // 7. hard exclusions
    const eligible: RegistryItem[] = [];
    const excluded: Array<{ item: RegistryItem; reasons: Exclusion[] }> = [];
    for (const it of candidates) {
      const reasons = hardExclusions(it, input, intent);
      if (reasons.length === 0) eligible.push(it); else excluded.push({ item: it, reasons });
    }

    // 8. scoring
    const adj = (x: { it: RegistryItem; sb: ScoreBreakdown }) => x.sb.total - DIVERSITY_PENALTY * (usedC.get(x.it.id) ?? 0);
    const scored = eligible
      .map((it) => ({ it, sb: scoreItem(it, input, intent, prof) }))
      .sort((a, b) => adj(b) - adj(a) || tieBreak(b.it) - tieBreak(a.it));

    const warnings: string[] = [];
    let preferred: RegistryItem | null = scored[0]?.it ?? null;
    let breakdown: import("./types").ScoreBreakdown | null = scored[0]?.sb ?? null;

    // If nothing eligible, try profile defaultStack, then the deterministic floor.
    if (!preferred) {
      const fromStack = prof.defaultStack.map((id) => this.byId.get(id)).find((it) => it && hardExclusions(it, input, intent).length === 0);
      preferred = fromStack ?? this.floorFor(intent, input);
      if (preferred) {
        breakdown = scoreItem(preferred, input, intent, prof);
        const top = excluded.slice().sort((a, b) => a.reasons.length - b.reasons.length)[0];
        if (top) warnings.push(`No eligible candidate scored; fell back to '${preferred.id}'. Closest excluded: '${top.item.id}' (${top.reasons.map((r) => r.rule).join(",")}).`);
        else warnings.push(`No candidate matched intent; deterministic floor '${preferred.id}'.`);
      }
    }

    // fallback: next eligible, else the preferred item's declared fallbackIds, else floor
    let fallback: RegistryItem | null = scored[1]?.it ?? null;
    if (!fallback && preferred) {
      fallback = (preferred.fallbackIds ?? []).map((id) => this.byId.get(id)).find((it) => it && hardExclusions(it, input, intent).length === 0) ?? null;
    }
    if (!fallback && preferred) {
      const floor = this.floorFor(intent, input);
      fallback = floor && floor.id !== preferred.id ? floor : null;
    }

    // missing deps: from any fixable exclusion of higher-quality items we couldn't use
    const missing = new Set<string>();
    for (const e of excluded) for (const r of e.reasons) if (r.fixable) missing.add(`${r.rule}:${r.detail}`);

    // anti-shimmer note for readable text beats
    if (intent.readableText && preferred) {
      if (preferred.stableOverlaySupport === "native" || preferred.stableOverlaySupport === "compatible")
        warnings.push(`Readable text → Stable Overlay (${preferred.stableOverlaySupport}); enforce Gate F (scale=1, integer geometry, opacity entrance).`);
    }
    // media-truth note
    if (prof.realMediaFirst && preferred && !preferred.deterministic && preferred.apiKeyRequired && /image|video/.test(preferred.category))
      warnings.push("Media-truth (Gate E): real/permissioned media must outrank generated media for this vertical; label generated media via provider_chip.");

    return {
      sceneId: intent.id, purpose: intent.purpose, intent: intent.intent,
      preferred: preferred?.id ?? null, preferredName: preferred?.name ?? null,
      fallback: fallback?.id ?? null, fallbackName: fallback?.name ?? null,
      score: breakdown?.total ?? 0, breakdown,
      reason: this.reason(preferred, intent, prof, breakdown?.total ?? 0),
      requiredInputs: preferred?.inputTypes ?? [],
      missingDependencies: [...missing],
      estimatedCost: this.cost(preferred), deterministic: preferred?.deterministic ?? true,
      privacyRisk: preferred?.privacyRiskScore ?? 0,
      professionalWarnings: warnings,
    };
  }

  private isRelevant(it: RegistryItem, intent: SceneIntent, input: RouterInput): boolean {
    const itags = new Set((it.intentTags ?? []).map((t) => t.toLowerCase()));
    const intentHit = (intent.intent ?? []).some((t) => itags.has(t.toLowerCase()));
    const industryHit = (it.industryTags ?? []).some((t) => t === input.productType || t === "any");
    return intentHit || industryHit;
  }

  private floorFor(intent: SceneIntent, input: RouterInput): RegistryItem {
    const hay = `${intent.purpose} ${intent.intent.join(" ")}`.toLowerCase();
    for (const f of FLOORS) {
      if (f.test.test(hay)) { const it = this.byId.get(f.id); if (it) return it; }
    }
    return this.byId.get(DEFAULT_FLOOR)!;
  }

  private cost(it: RegistryItem | null): CostCategory {
    if (!it) return "free";
    const c = it.costScore ?? 100;
    if (c >= 95) return "free";
    if (c >= 70) return "low";
    if (c >= 40) return "medium";
    return "high";
  }

  private reason(it: RegistryItem | null, intent: SceneIntent, prof: IndustryProfile, total: number): string {
    if (!it) return `No capability available for intent [${intent.intent.join(", ")}].`;
    const bits = [
      `${it.name} (${it.id}) scored ${total}/100 for '${intent.purpose}'`,
      it.deterministic ? "deterministic" : "generative",
      it.apiKeyRequired ? `needs ${it.apiKeyRequired}` : "zero-key",
      `stability:${it.textTransformRisk}/${it.stableOverlaySupport}`,
      `profile:${prof.productType}`,
    ];
    return bits.join(" · ");
  }
}
