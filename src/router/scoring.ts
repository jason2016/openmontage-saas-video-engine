// Scoring + hard exclusions for the Scene Tool Router.
// Weighted model totals 100 (see docs/TOOL_ROUTING_RULES.md Step 8). Hard exclusions
// override scores entirely. Privacy is scored as (100 - privacyRiskScore).
import type { RegistryItem, RouterInput, SceneIntent, ScoreBreakdown, TextTransformRisk, StableOverlaySupport } from "./types";
import { DEFAULT_WEIGHTS, type IndustryProfile } from "./industryProfiles";

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const norm = (s: number) => clamp01((s ?? 0) / 100);

const RISK_SCORE: Record<TextTransformRisk, number> = { none: 1, low: 0.8, medium: 0.5, high: 0.2, "n/a": 0.9 };
const OVERLAY_SCORE: Record<StableOverlaySupport, number> = { native: 1, compatible: 0.85, "n/a": 0.7, incompatible: 0.3 };

/** Items that are infrastructure, not selectable scene/tool outputs for a beat. */
const NON_CANDIDATE_TYPES = new Set(["architecture", "style-playbook"]);

export interface Exclusion { rule: string; detail: string; fixable: boolean }

/** Returns the list of hard-exclusion reasons; empty array = eligible. */
export function hardExclusions(item: RegistryItem, input: RouterInput, intent: SceneIntent): Exclusion[] {
  const out: Exclusion[] = [];
  const keys = input.apiKeysAvailable ?? [];

  if (NON_CANDIDATE_TYPES.has(item.type)) out.push({ rule: "not-a-candidate", detail: `${item.type} is infrastructure`, fixable: false });
  if (item.status === "deprecated") out.push({ rule: "deprecated", detail: item.id, fixable: false });

  // 3. API key
  if (item.apiKeyRequired && item.apiKeyRequired !== "REQUIRED" && !keys.includes(item.apiKeyRequired))
    out.push({ rule: "missing-api-key", detail: item.apiKeyRequired, fixable: true });
  if (item.apiKeyRequired === "REQUIRED" && keys.length === 0)
    out.push({ rule: "missing-api-key", detail: "an API key", fixable: true });

  // 4. GPU
  if (item.gpuRequired && !input.gpuAvailable)
    out.push({ rule: "gpu-required", detail: "no GPU available", fixable: true });

  // 5. Aspect ratio
  const ars = item.supportedAspectRatios ?? [];
  if (!ars.includes("any") && ars.length > 0 && !ars.includes(input.aspectRatio))
    out.push({ rule: "aspect-ratio", detail: `${item.id} supports ${ars.join("/")}, brief is ${input.aspectRatio}`, fixable: false });

  // 6. Privacy — sensitive briefs exclude third-party-send (keyed/generative) and high-risk items
  if (input.privacyLevel === "sensitive") {
    if (item.apiKeyRequired) out.push({ rule: "privacy", detail: "sends data to a third-party provider", fixable: false });
    if (item.privacyRiskScore >= 50) out.push({ rule: "privacy", detail: `privacyRiskScore=${item.privacyRiskScore}`, fixable: false });
  }

  // 8. Output type
  if (intent.requireOutput && (item.outputTypes ?? []).length > 0 && !item.outputTypes.includes(intent.requireOutput))
    out.push({ rule: "output-type", detail: `needs ${intent.requireOutput}`, fixable: false });

  // 10. Anti-shimmer gate (Gate F): dense readable text on a high-risk / stage-only scene.
  if (intent.readableText && (item.textTransformRisk === "high" || item.stableOverlaySupport === "incompatible"))
    out.push({ rule: "anti-shimmer", detail: `readable text on textTransformRisk=${item.textTransformRisk}/overlay=${item.stableOverlaySupport}`, fixable: false });

  return out;
}

export function intentFit(item: RegistryItem, intent: SceneIntent, input: RouterInput, profile: IndustryProfile): number {
  const itags = new Set((item.intentTags ?? []).map((t) => t.toLowerCase()));
  const want = (intent.intent ?? []).map((t) => t.toLowerCase());
  const overlap = want.length ? want.filter((t) => itags.has(t)).length / want.length : 0;
  const industryMatch = (item.industryTags ?? []).some((t) => t === input.productType || t === "any") ? 1 : 0;
  const boost = (item.intentTags ?? []).some((t) => profile.boostTags.includes(t)) ? 0.2 : 0;
  const demote = (item.intentTags ?? []).some((t) => profile.demoteTags.includes(t)) ||
    (item.industryTags ?? []).some((t) => profile.demoteTags.includes(t)) ? -0.25 : 0;
  return clamp01(0.55 * overlap + 0.3 * industryMatch + boost + demote);
}

export function stability(item: RegistryItem): number {
  const r = RISK_SCORE[item.textTransformRisk] ?? 0.7;
  const o = OVERLAY_SCORE[item.stableOverlaySupport] ?? 0.7;
  return clamp01(0.6 * r + 0.4 * o);
}

export function scoreItem(item: RegistryItem, input: RouterInput, intent: SceneIntent, profile: IndustryProfile): ScoreBreakdown {
  // Normalize weights to sum exactly 100 regardless of per-profile overrides.
  const raw = { ...DEFAULT_WEIGHTS, ...profile.weightOverrides };
  const sum = (Object.values(raw) as number[]).reduce((a, b) => a + b, 0) || 100;
  const k = 100 / sum;
  const w = {
    intent: raw.intent * k, controllability: raw.controllability * k, visualQuality: raw.visualQuality * k,
    brand: raw.brand * k, realism: raw.realism * k, stability: raw.stability * k, reuse: raw.reuse * k,
    speed: raw.speed * k, cost: raw.cost * k, privacy: raw.privacy * k,
  };
  const brandTokens = input.brand?.hasTokens || (input.brand?.colors?.length ?? 0) > 0;
  const sub = {
    intent: intentFit(item, intent, input, profile),
    controllability: norm(item.controllabilityScore),
    visualQuality: norm(item.visualQualityScore),
    brand: norm(item.brandabilityScore) * (brandTokens ? 1 : 0.7),
    realism: norm(item.realismScore),
    stability: stability(item),
    reuse: norm(item.reuseScore),
    speed: norm(item.renderSpeedScore),
    cost: norm(item.costScore),
    privacy: clamp01((100 - item.privacyRiskScore) / 100),
  };
  const total =
    w.intent * sub.intent + w.controllability * sub.controllability + w.visualQuality * sub.visualQuality +
    w.brand * sub.brand + w.realism * sub.realism + w.stability * sub.stability + w.reuse * sub.reuse +
    w.speed * sub.speed + w.cost * sub.cost + w.privacy * sub.privacy;
  return {
    intent: round(w.intent * sub.intent), controllability: round(w.controllability * sub.controllability),
    visualQuality: round(w.visualQuality * sub.visualQuality), brand: round(w.brand * sub.brand),
    realism: round(w.realism * sub.realism), stability: round(w.stability * sub.stability),
    reuse: round(w.reuse * sub.reuse), speed: round(w.speed * sub.speed), cost: round(w.cost * sub.cost),
    privacy: round(w.privacy * sub.privacy), total: round(total),
  };
}

/** Tie-break key: higher is better. stability > deterministic > zero-key > reuse. */
export function tieBreak(item: RegistryItem): number {
  return stability(item) * 4 + (item.deterministic ? 2 : 0) + (item.apiKeyRequired ? 0 : 1) + norm(item.reuseScore) * 0.5;
}

const round = (n: number) => Math.round(n * 100) / 100;
