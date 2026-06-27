// The data-driven scene graph. A SaasPromo video is just an ordered list of
// SceneSpecs. `type` selects a reusable scene template; `props` carries the
// content (always from JSON/config — never hardcoded in a component).
export interface SceneSpec {
  id: string;
  type: string;
  durationSeconds: number;
  props?: Record<string, unknown>;
}
