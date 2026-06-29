// SaaS Motion Pack — design tokens (single source of truth).
// See projects/templates/saas-promo/design/01_design_brief.md §9.
// No pack component hardcodes a value that lives here.

export type Plane = "fg" | "mg" | "bg";

export interface Tokens {
  color: {
    canvas: string;
    canvasDeep: string;
    surface: string;
    glassFill: string;
    hairline: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    primary: string;
    primaryBright: string;
    success: string;
    successBright: string;
  };
  type: {
    family: string;
    mono: string;
    size: { display: number; h1: number; h2: number; body: number; eyebrow: number; caption: number; mono: number };
    weight: { display: number; heading: number; medium: number; body: number; label: number };
    tracking: { display: string; heading: string; body: string; eyebrow: string };
    lineHeight: { display: number; heading: number; body: number };
  };
  motion: {
    easeSettle: [number, number, number, number];
    // Named cinematic curve vocabulary — the reusable motion grammar every
    // primitive consumes. One curve per *intent*, not one curve for everything:
    //   entrance  calm reveal (expo-out)
    //   pointer   human cursor — accelerate from rest, decelerate into target
    //   press     quick, controlled button press
    //   camera    gentle move that reaches rest early, then holds
    //   exit      soft, slightly held fade-out
    //   signature pen accelerates from rest and settles into the flourish
    curve: {
      entrance: [number, number, number, number];
      pointer: [number, number, number, number];
      press: [number, number, number, number];
      camera: [number, number, number, number];
      exit: [number, number, number, number];
      signature: [number, number, number, number];
    };
    spring: { damping: number; stiffness: number; mass: number };
    duration: { micro: number; standard: number; entrance: number; ambient: number };
    // Pointer physics — how a synthetic cursor arrives, dwells and presses.
    pointer: { dwellSeconds: number; pressDepth: number; pressSeconds: number };
    // Camera — the fraction of a scene over which a move completes before holding.
    camera: { settleFraction: number };
    stagger: number;
  };
  space: { safeInset: number; radiusCard: number; radiusChip: number; hairline: number };
  depth: Record<Plane, { opacity: number; blur: number; scale: number }>;
}

export const tokens: Tokens = {
  color: {
    canvas: "#0A0E1A",
    canvasDeep: "#070A12",
    surface: "#0F1629",
    glassFill: "rgba(255,255,255,0.04)",
    hairline: "rgba(255,255,255,0.08)",
    textPrimary: "#F8FAFC",
    textSecondary: "#94A3B8",
    textMuted: "#64748B",
    primary: "#3B82F6",
    primaryBright: "#60A5FA",
    success: "#22C55E",
    successBright: "#4ADE80",
  },
  type: {
    family: "Inter, system-ui, sans-serif",
    mono: "'JetBrains Mono', ui-monospace, monospace",
    size: { display: 132, h1: 90, h2: 52, body: 30, eyebrow: 21, caption: 20, mono: 24 },
    weight: { display: 700, heading: 600, medium: 500, body: 400, label: 600 },
    tracking: { display: "-0.02em", heading: "-0.015em", body: "0em", eyebrow: "0.12em" },
    lineHeight: { display: 1.05, heading: 1.15, body: 1.5 },
  },
  motion: {
    easeSettle: [0.16, 1, 0.3, 1],
    curve: {
      entrance: [0.16, 1, 0.3, 1], // expo-out — calm reveal, the default
      pointer: [0.5, 0, 0.16, 1], // accelerate from rest, decelerate into target
      press: [0.3, 0, 0.2, 1], // quick, controlled
      camera: [0.22, 1, 0.34, 1], // settles early, then holds
      exit: [0.4, 0, 0.7, 1], // soft, slightly held
      signature: [0.4, 0, 0.28, 1], // pen from rest into the flourish
    },
    spring: { damping: 24, stiffness: 120, mass: 1 },
    duration: { micro: 0.18, standard: 0.36, entrance: 0.6, ambient: 14 },
    pointer: { dwellSeconds: 0.22, pressDepth: 0.86, pressSeconds: 0.16 },
    camera: { settleFraction: 0.46 },
    stagger: 0.06,
  },
  space: { safeInset: 96, radiusCard: 20, radiusChip: 999, hairline: 1 },
  depth: {
    fg: { opacity: 1, blur: 0, scale: 1 },
    mg: { opacity: 0.9, blur: 1, scale: 0.99 },
    bg: { opacity: 0.5, blur: 2, scale: 1.02 },
  },
};
