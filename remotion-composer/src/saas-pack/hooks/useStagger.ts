// Indexed entrance: each sibling enters `stepSeconds` after the previous one.
// Use inside a child component per item to respect the rules of hooks.
import { useEntrance, Entrance, EntranceOptions } from "./useEntrance";

export function useStaggeredEntrance(
  index: number,
  options: EntranceOptions & { stepSeconds?: number } = {}
): Entrance {
  const { stepSeconds = 0.06, delaySeconds = 0, ...rest } = options;
  return useEntrance({ ...rest, delaySeconds: delaySeconds + index * stepSeconds });
}

export function staggerDelay(index: number, baseSeconds = 0, stepSeconds = 0.06): number {
  return baseSeconds + index * stepSeconds;
}
