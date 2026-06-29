// Scene Tool Router — shared types. Dependency-free; no Remotion/Node-only imports here
// so the file type-checks and runs under plain `tsc`/`node` (CommonJS).

export type ProductType =
  | "saas" | "education" | "restaurant" | "service" | "explainer" | "inventory-erp" | "social" | "cinematic";
export type Objective = "awareness" | "conversion" | "demo" | "education";
export type Platform = "website" | "youtube" | "linkedin" | "instagram" | "tiktok";
export type AspectRatio = "16:9" | "9:16" | "1:1";
export type PrivacyLevel = "normal" | "sensitive";
export type TextTransformRisk = "none" | "low" | "medium" | "high" | "n/a";
export type StableOverlaySupport = "native" | "compatible" | "incompatible" | "n/a";
export type ItemStatus = "production" | "beta" | "experimental" | "available" | "deprecated";

/** One entry in config/tool-registry.json. */
export interface RegistryItem {
  id: string;
  name: string;
  type: string; // scene | overlay | composition | component | architecture | tool | pipeline | style-playbook
  source: string;
  path: string;
  category: string;
  intentTags: string[];
  industryTags: string[];
  status: ItemStatus;
  verified: boolean;
  deterministic: boolean;
  apiKeyRequired: string | null;
  gpuRequired: boolean;
  dependencies: string[];
  supportedAspectRatios: string[];
  recommendedDuration: string;
  inputTypes: string[];
  outputTypes: string[];
  brandabilityScore: number;
  controllabilityScore: number;
  visualQualityScore: number;
  realismScore: number;
  renderSpeedScore: number;
  costScore: number;
  reuseScore: number;
  privacyRiskScore: number; // 0 = safe, 100 = high risk
  textTransformRisk: TextTransformRisk;
  stableOverlaySupport: StableOverlaySupport;
  bestFor: string[];
  avoidFor: string[];
  fallbackIds: string[];
  notes: string;
  // optional extras present on some items
  camera?: string;
  [k: string]: unknown;
}

export interface Registry {
  meta: Record<string, unknown>;
  items: RegistryItem[];
}

/** A single narrative beat the planner wants to fill. */
export interface SceneIntent {
  /** stable id within the plan, e.g. "s1" */
  id: string;
  /** narrative purpose, human readable, e.g. "hook" */
  purpose: string;
  /** intent tags to match against item.intentTags, e.g. ["demo","upload"] */
  intent: string[];
  /** does this beat carry dense/small readable UI text? (triggers anti-shimmer exclusion) */
  readableText?: boolean;
  /** optional required output type, e.g. "remotion-frames" */
  requireOutput?: string;
  /** free-text note */
  note?: string;
}

export interface RouterInput {
  productType: ProductType;
  objective: Objective;
  audience: string;
  platform: Platform;
  aspectRatio: AspectRatio;
  durationSeconds: number;
  brand?: { logo?: string; colors?: string[]; font?: string; hasTokens?: boolean };
  availableAssets?: Array<{ kind: string; provenance?: string; resolution?: string; permissioned?: boolean }>;
  apiKeysAvailable?: string[];
  gpuAvailable?: boolean;
  privacyLevel?: PrivacyLevel;
  preferredStyle?: string;
  sceneIntents: SceneIntent[];
}

export type CostCategory = "free" | "low" | "medium" | "high";

export interface ScoreBreakdown {
  intent: number;
  controllability: number;
  visualQuality: number;
  brand: number;
  realism: number;
  stability: number;
  reuse: number;
  speed: number;
  cost: number;
  privacy: number;
  total: number; // 0..100
}

/** The router's decision for one scene intent. */
export interface RoutingDecision {
  sceneId: string;
  purpose: string;
  intent: string[];
  preferred: string | null; // registry id
  preferredName: string | null;
  fallback: string | null; // registry id
  fallbackName: string | null;
  score: number; // 0..100 of the preferred item
  breakdown: ScoreBreakdown | null;
  reason: string;
  requiredInputs: string[];
  missingDependencies: string[];
  estimatedCost: CostCategory;
  deterministic: boolean;
  privacyRisk: number; // 0..100 of the preferred item
  professionalWarnings: string[];
}

export interface ScenePlan {
  productType: ProductType;
  platform: Platform;
  aspectRatio: AspectRatio;
  objective: Objective;
  profile: string;
  preferredStyle: string;
  decisions: RoutingDecision[];
  planWarnings: string[];
}
