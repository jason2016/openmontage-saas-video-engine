// Industry routing profiles. A profile is a PRIOR that biases candidate retrieval and
// scoring weights per product type — not a hard cage. Any registry item can still win if
// it scores highest and passes the gates. See docs/TOOL_ROUTING_RULES.md.
import type { ProductType, ScoreBreakdown } from "./types";

export interface IndustryProfile {
  productType: ProductType;
  preferredStyle: string;
  /** scene-count window for a 45-75s video (Quality Gate C) */
  sceneCount: { min: number; max: number };
  /** items whose intentTags/industryTags include these get an intent-fit bonus */
  boostTags: string[];
  /** items with these tags are demoted (soft) */
  demoteTags: string[];
  /** per-dimension weight overrides (defaults summed to 100 in scoring.ts) */
  weightOverrides: Partial<Record<keyof Omit<ScoreBreakdown, "total">, number>>;
  /** ordered default stack of registry ids the planner reaches for first */
  defaultStack: string[];
  /** media-truth: real media outranks generated media for these verticals */
  realMediaFirst: boolean;
  notes: string;
}

const base = {
  intent: 20, controllability: 15, visualQuality: 15, brand: 15, realism: 10,
  stability: 10, reuse: 5, speed: 5, cost: 3, privacy: 2,
} as const;

export const PROFILES: Record<ProductType, IndustryProfile> = {
  saas: {
    productType: "saas",
    preferredStyle: "clean-professional",
    sceneCount: { min: 6, max: 10 },
    boostTags: ["product", "demo", "ui-walkthrough", "dashboard", "metric", "cta", "brand"],
    demoteTags: ["restaurant", "lyrics", "anime"],
    weightOverrides: { controllability: 18, brand: 18, realism: 5, stability: 12 },
    defaultStack: [
      "scene.saas.brand", "scene.saas.problem", "scene.saas.upload", "scene.saas.otp",
      "scene.om.kpi_grid", "scene.saas.audit", "scene.saas.compliance", "scene.saas.cta",
    ],
    realMediaFirst: false,
    notes: "Deterministic product-UI + saas-pack first; charts for proof; never generative-as-real UI.",
  },
  education: {
    productType: "education",
    preferredStyle: "clean-professional",
    sceneCount: { min: 6, max: 10 },
    boostTags: ["education", "explain", "progress", "steps", "title", "demo", "ui-walkthrough", "metrics"],
    demoteTags: ["anime", "lyrics"],
    weightOverrides: { visualQuality: 14, brand: 12, realism: 8, reuse: 7 },
    defaultStack: [
      "scene.om.hero_title", "scene.om.callout", "ui.saas.timeline", "scene.om.progress_bar",
      "scene.om.kpi_grid", "scene.om.screenshot_scene", "comp.om.talking_head", "scene.saas.cta",
    ],
    realMediaFirst: false,
    notes: "Explainer/animation pipeline; curriculum via timeline/KPI/progress; optional avatar presenter; enrollment CTA. GAP: no native curriculum/teacher/enrollment scenes — compose primitives.",
  },
  restaurant: {
    productType: "restaurant",
    preferredStyle: "flat-motion-graphics",
    sceneCount: { min: 6, max: 9 },
    boostTags: ["real-media", "broll", "stock-footage", "atmosphere", "cta", "quote"],
    demoteTags: ["dashboard", "audit", "otp", "compliance", "kpi", "code"],
    weightOverrides: { realism: 22, visualQuality: 16, brand: 12, controllability: 8, stability: 7 },
    defaultStack: [
      "tool.pexels_video", "tool.direct_clip_search", "scene.om.text_card", "scene.om.callout",
      "ui.saas.phone_mockup", "scene.saas.cta",
    ],
    realMediaFirst: true,
    notes: "Real photos/video FIRST; menu (KPI/comparison stopgap), reviews (callout quote), location (static map — GAP), reservation CTA. Never the SaaS dashboard stack; never AI dishes as real.",
  },
  service: {
    productType: "service",
    preferredStyle: "clean-professional",
    sceneCount: { min: 6, max: 9 },
    boostTags: ["service", "presenter", "proof", "trust", "cta", "real-media"],
    demoteTags: ["anime", "lyrics"],
    weightOverrides: { realism: 14, brand: 16, visualQuality: 14 },
    defaultStack: [
      "scene.om.hero_title", "tool.pexels_video", "scene.om.stat_card", "scene.om.comparison",
      "ui.saas.verification_badge", "scene.saas.cta",
    ],
    realMediaFirst: true,
    notes: "Professional-service: real footage + presenter + proof; trust stamp; clear CTA.",
  },
  explainer: {
    productType: "explainer",
    preferredStyle: "minimalist-diagram",
    sceneCount: { min: 6, max: 10 },
    boostTags: ["explain", "data", "diagram", "code", "trend", "compare", "statement", "title", "open", "close"],
    demoteTags: ["otp", "audit", "compliance"],
    weightOverrides: { visualQuality: 16, controllability: 16, realism: 6, reuse: 7 },
    defaultStack: [
      "scene.om.hero_title", "scene.om.callout", "scene.om.bar_chart", "scene.om.line_chart",
      "tool.diagram_gen", "scene.om.terminal_scene", "scene.om.kpi_grid", "comp.om.end_tag",
    ],
    realMediaFirst: false,
    notes: "Typography + diagrams + charts + code + data-viz; generated imagery only where key/GPU configured, labeled via provider_chip.",
  },
  "inventory-erp": {
    productType: "inventory-erp",
    preferredStyle: "clean-professional",
    sceneCount: { min: 6, max: 10 },
    boostTags: ["dashboard", "metric", "table", "workflow", "alert", "ui-walkthrough", "proof"],
    demoteTags: ["restaurant", "anime", "lyrics"],
    weightOverrides: { controllability: 18, brand: 16, realism: 5, stability: 12 },
    defaultStack: [
      "scene.saas.brand", "scene.om.screenshot_scene", "ui.saas.contracts_workspace",
      "scene.om.kpi_grid", "scene.om.bar_chart", "ui.saas.status_flow_stable",
      "ui.saas.notification_toast", "scene.saas.cta",
    ],
    realMediaFirst: false,
    notes: "saas-pack dashboards + tables + KPI cards + alerts/workflows + browser/mobile views.",
  },
  social: {
    productType: "social",
    preferredStyle: "flat-motion-graphics",
    sceneCount: { min: 4, max: 8 },
    boostTags: ["social", "captions", "energy", "hook", "montage"],
    demoteTags: ["audit", "compliance", "otp"],
    weightOverrides: { visualQuality: 16, speed: 8, realism: 8, brand: 12 },
    defaultStack: [
      "scene.om.hero_title", "comp.om.collage_burst", "comp.om.caption_overlay",
      "scene.om.stat_card", "scene.saas.cta",
    ],
    realMediaFirst: false,
    notes: "9:16/1:1; captions + bursts; fast pacing.",
  },
  cinematic: {
    productType: "cinematic",
    preferredStyle: "anime-ghibli",
    sceneCount: { min: 5, max: 9 },
    boostTags: ["cinematic", "mood", "montage", "real-media", "atmosphere"],
    demoteTags: ["dashboard", "otp", "audit", "kpi", "code"],
    weightOverrides: { realism: 18, visualQuality: 18, controllability: 8, brand: 10 },
    defaultStack: [
      "tool.direct_clip_search", "tool.pexels_video", "comp.om.cinematic_renderer",
      "scene.om.anime_scene", "comp.om.end_tag",
    ],
    realMediaFirst: true,
    notes: "Footage-first; generative video second (labeled). Mood-led montage.",
  },
};

export const DEFAULT_WEIGHTS = base;
export function profileFor(p: ProductType): IndustryProfile {
  return PROFILES[p] ?? PROFILES.saas;
}
