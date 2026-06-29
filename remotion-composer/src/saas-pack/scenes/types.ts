// The data-driven scene graph. A SaasPromo video is just an ordered list of
// SceneSpecs. `type` selects a reusable scene template; `props` carries the
// content (always from JSON/config — never hardcoded in a component). `camera`
// is an optional per-beat camera move applied by the SceneFrame.
import type { CameraMove } from "./SceneFrame";

export interface SceneSpec {
  id: string;
  type: string;
  durationSeconds: number;
  camera?: CameraMove;
  props?: Record<string, unknown>;
}
