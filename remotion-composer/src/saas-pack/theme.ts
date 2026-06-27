// Brand merge — the only place a product's colors/font enter the pack.
// Structural tokens stay constant; brand overrides a small set of values.
import { tokens as baseTokens, Tokens } from "./tokens";

export interface BrandOverrides {
  primary?: string;
  primaryBright?: string;
  success?: string;
  successBright?: string;
  canvas?: string;
  surface?: string;
  fontFamily?: string;
}

export function mergeBrand(overrides: BrandOverrides = {}, base: Tokens = baseTokens): Tokens {
  return {
    ...base,
    color: {
      ...base.color,
      primary: overrides.primary ?? base.color.primary,
      primaryBright: overrides.primaryBright ?? base.color.primaryBright,
      success: overrides.success ?? base.color.success,
      successBright: overrides.successBright ?? base.color.successBright,
      canvas: overrides.canvas ?? base.color.canvas,
      surface: overrides.surface ?? base.color.surface,
    },
    type: {
      ...base.type,
      family: overrides.fontFamily ?? base.type.family,
    },
  };
}
