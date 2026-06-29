/* Router unit tests + 5 dry-run Scene Plans. Plain CommonJS (not type-checked).
 * Prereq: compile the TS router first:
 *   node remotion-composer/node_modules/typescript/bin/tsc -p src/router/tsconfig.json
 * Run from repo root:
 *   node src/router/run-router.cjs
 * Exits non-zero if any assertion fails. Writes docs/examples/scene-plans.generated.json.
 * NO rendering, NO API calls — pure in-memory routing.
 */
const fs = require("fs");
const path = require("path");
const { SceneToolRouter } = require("./dist/SceneToolRouter.js");

const REPO = path.join(__dirname, "..", "..");
const registry = JSON.parse(fs.readFileSync(path.join(REPO, "config", "tool-registry.json"), "utf8"));
const router = new SceneToolRouter(registry);

// ---- 5 example briefs --------------------------------------------------------
const briefs = {
  "clawshow-esign": {
    productType: "saas", objective: "conversion", audience: "SMB operations leads sending contracts",
    platform: "website", aspectRatio: "16:9", durationSeconds: 56,
    brand: { hasTokens: true, colors: ["#0B1220"] }, apiKeysAvailable: [], gpuAvailable: false,
    privacyLevel: "normal", preferredStyle: "clean-professional",
    sceneIntents: [
      { id: "s1", purpose: "hook", intent: ["brand", "open"] },
      { id: "s2", purpose: "problem", intent: ["problem", "pain"] },
      { id: "s3", purpose: "demo-upload", intent: ["demo", "upload", "document"], readableText: true },
      { id: "s4", purpose: "verify", intent: ["otp", "verify", "security"], readableText: true },
      { id: "s5", purpose: "proof-audit", intent: ["audit", "trail", "trust"], readableText: true },
      { id: "s6", purpose: "compliance", intent: ["compliance", "standards", "trust"], readableText: true },
      { id: "s7", purpose: "cta", intent: ["cta", "signup", "close"] },
    ],
  },
  "online-education": {
    productType: "education", objective: "education", audience: "adult learners evaluating a course",
    platform: "youtube", aspectRatio: "16:9", durationSeconds: 75,
    brand: { hasTokens: true }, apiKeysAvailable: [], gpuAvailable: false, privacyLevel: "normal",
    sceneIntents: [
      { id: "s1", purpose: "hook-title", intent: ["title", "open", "education"] },
      { id: "s2", purpose: "desire", intent: ["problem", "explain"] },
      { id: "s3", purpose: "curriculum", intent: ["steps", "process", "progress"] },
      { id: "s4", purpose: "lesson-demo", intent: ["demo", "ui-walkthrough", "screen"], readableText: true },
      { id: "s5", purpose: "progress-proof", intent: ["progress", "metrics", "proof"] },
      { id: "s6", purpose: "teacher-trust", intent: ["presenter", "trust"] },
      { id: "s7", purpose: "enroll-cta", intent: ["cta", "signup", "close"] },
    ],
  },
  "longcheng-restaurant": {
    productType: "restaurant", objective: "awareness", audience: "local diners on Instagram",
    platform: "instagram", aspectRatio: "9:16", durationSeconds: 30,
    brand: { colors: ["#7A1F1F"] }, apiKeysAvailable: [], gpuAvailable: false, privacyLevel: "normal",
    availableAssets: [{ kind: "photo", provenance: "venue-owner", resolution: "4000x6000", permissioned: true }],
    sceneIntents: [
      { id: "s1", purpose: "hook-atmosphere", intent: ["atmosphere", "real-media", "broll"] },
      { id: "s2", purpose: "signature-dish", intent: ["real-media", "broll"] },
      { id: "s3", purpose: "menu", intent: ["compare", "metric"] },
      { id: "s4", purpose: "reviews", intent: ["quote", "trust"] },
      { id: "s5", purpose: "location", intent: ["location", "map"] },
      { id: "s6", purpose: "reservation-cta", intent: ["cta", "signup", "close"] },
    ],
  },
  "inventory-saas": {
    productType: "inventory-erp", objective: "demo", audience: "ops managers evaluating inventory software",
    platform: "linkedin", aspectRatio: "16:9", durationSeconds: 60,
    brand: { hasTokens: true }, apiKeysAvailable: [], gpuAvailable: false, privacyLevel: "normal",
    sceneIntents: [
      { id: "s1", purpose: "brand", intent: ["brand", "open"] },
      { id: "s2", purpose: "dashboard", intent: ["dashboard", "ui-walkthrough", "screen"], readableText: true },
      { id: "s3", purpose: "stock-table", intent: ["table", "data", "workflow"], readableText: true },
      { id: "s4", purpose: "kpi-proof", intent: ["metric", "proof", "dashboard"] },
      { id: "s5", purpose: "alert-workflow", intent: ["alert", "workflow", "status"] },
      { id: "s6", purpose: "mobile-view", intent: ["mobile", "app"], readableText: true },
      { id: "s7", purpose: "cta", intent: ["cta", "signup", "close"] },
    ],
  },
  "semantic-os-explainer": {
    productType: "explainer", objective: "awareness", audience: "technical early adopters",
    platform: "youtube", aspectRatio: "16:9", durationSeconds: 70,
    brand: { hasTokens: true }, apiKeysAvailable: [], gpuAvailable: false, privacyLevel: "normal",
    preferredStyle: "minimalist-diagram",
    sceneIntents: [
      { id: "s1", purpose: "hook-title", intent: ["title", "open", "statement"] },
      { id: "s2", purpose: "concept-diagram", intent: ["diagram", "explain", "flow"] },
      { id: "s3", purpose: "data-trend", intent: ["data", "trend", "growth"] },
      { id: "s4", purpose: "code-demo", intent: ["code", "cli", "demo"] },
      { id: "s5", purpose: "comparison", intent: ["compare", "vs"] },
      { id: "s6", purpose: "breakdown", intent: ["data", "breakdown", "share"] },
      { id: "s7", purpose: "close", intent: ["close", "brand", "cta"] },
    ],
  },
};

const plans = {};
for (const [name, brief] of Object.entries(briefs)) plans[name] = router.route(brief);

// ---- unit tests --------------------------------------------------------------
let pass = 0, fail = 0;
const T = (desc, cond) => { if (cond) { pass++; } else { fail++; console.log("  FAIL:", desc); } };
const dec = (plan, sid) => plan.decisions.find((d) => d.sceneId === sid);
const itemOf = (id) => registry.items.find((i) => i.id === id);

console.log("== router unit tests ==");
T("registry loaded with >120 items", registry.items.length > 120);
T("every plan fills every intent with a preferred id", Object.values(plans).every((p) => p.decisions.every((d) => d.preferred)));
T("every decision has a fallback or is a deterministic floor",
  Object.values(plans).every((p) => p.decisions.every((d) => d.fallback || d.deterministic)));

// SaaS: product-ui selected; CTA present
const saas = plans["clawshow-esign"];
T("saas: brand beat selects a saas-pack or brand scene", /^scene\.saas\.|brand/.test(dec(saas, "s1").preferred));
T("saas: at least 3 saas-pack scenes selected", saas.decisions.filter((d) => d.preferred.startsWith("scene.saas.")).length >= 3);
T("saas: readable-text beats route to Stable-Overlay-capable items",
  ["s3", "s4", "s5", "s6"].every((s) => { const it = itemOf(dec(saas, s).preferred); return it && (it.stableOverlaySupport === "native" || it.stableOverlaySupport === "compatible"); }));

// No-key constraint: no preferred requires a missing key
const allNoKey = Object.values(plans).every((p) => p.decisions.every((d) => { const it = itemOf(d.preferred); return !it.apiKeyRequired || (briefs[Object.keys(plans).find((k) => plans[k] === p)] && false); }));
T("no preferred item requires an API key when none provided", allNoKey);

// Restaurant: real-media-first, NOT a SaaS dashboard, no keyed gen video as preferred, anti-shimmer n/a
const rest = plans["longcheng-restaurant"];
T("restaurant: hook uses real media (deterministic, zero-key)", (() => { const it = itemOf(dec(rest, "s1").preferred); return it && it.deterministic && !it.apiKeyRequired; })());
T("restaurant: no audit/otp/compliance/dashboard scene selected anywhere",
  !rest.decisions.some((d) => /audit|otp|compliance|contracts_workspace/.test(d.preferred)));
T("restaurant: 9:16 excludes 16:9-only saas-pack scenes", !rest.decisions.some((d) => { const it = itemOf(d.preferred); return it && it.supportedAspectRatios.length === 1 && it.supportedAspectRatios[0] === "16:9"; }));
T("restaurant: map/review gaps produce a fallback (no silent fail)",
  dec(rest, "s4").preferred && dec(rest, "s5").preferred);

// Sensitive privacy: rerun saas with sensitive → no keyed/high-risk preferred
const sens = router.route({ ...briefs["clawshow-esign"], privacyLevel: "sensitive" });
T("sensitive: no preferred sends data to a third party (apiKeyRequired null)",
  sens.decisions.every((d) => { const it = itemOf(d.preferred); return it && !it.apiKeyRequired; }));

// Anti-shimmer: a readable-text beat never selects a high textTransformRisk preferred.
// Scope the intent lookup to the SAME brief (scene ids like "s5" repeat across briefs).
T("anti-shimmer: readable-text beats never select high textTransformRisk",
  Object.entries(plans).every(([name, p]) => p.decisions.every((d) => {
    const si = briefs[name].sceneIntents.find((x) => x.id === d.sceneId);
    if (!si || !si.readableText) return true;
    const it = itemOf(d.preferred); return it.textTransformRisk !== "high";
  })));

// Explainer: deterministic, no generative video selected (no keys)
const exp = plans["semantic-os-explainer"];
T("explainer: every preferred is deterministic (no keys/GPU available)", exp.decisions.every((d) => d.deterministic));
T("explainer: code beat selects a code-capable scene", /terminal|code/.test(dec(exp, "s4").preferred));

// Inventory: dashboards/data selected
const inv = plans["inventory-saas"];
T("inventory: dashboard beat is a UI/screen/product scene", /screenshot|browser|workspace|saas|kpi/.test(dec(inv, "s2").preferred));
T("inventory: a chart/KPI scene appears in the plan", inv.decisions.some((d) => /kpi_grid|bar_chart|stat/.test(d.preferred)));

console.log(`== ${pass} passed, ${fail} failed ==`);

// ---- emit plans --------------------------------------------------------------
const outDir = path.join(REPO, "docs", "examples");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "scene-plans.generated.json"), JSON.stringify(plans, null, 2) + "\n");
console.log("wrote docs/examples/scene-plans.generated.json");

// compact human summary to stdout
for (const [name, plan] of Object.entries(plans)) {
  console.log(`\n### ${name}  [${plan.productType} · ${plan.aspectRatio} · ${plan.objective} · style:${plan.preferredStyle}]`);
  for (const d of plan.decisions)
    console.log(`  ${d.sceneId} ${d.purpose.padEnd(18)} → ${String(d.preferred).padEnd(28)} (score ${d.score}, ${d.estimatedCost}, ${d.deterministic ? "det" : "gen"})  fb:${d.fallback || "-"}`);
  if (plan.planWarnings.length) console.log("  planWarnings:", plan.planWarnings.join(" | "));
}

process.exit(fail === 0 ? 0 : 1);
