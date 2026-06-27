// Shared motion presets. The "settle" curve (design brief §2) is used for
// ~90% of entrances; springCalm is for the few physical motions.
import { Easing } from "remotion";
import { tokens } from "../tokens";

const [x1, y1, x2, y2] = tokens.motion.easeSettle;

export const easeSettle = Easing.bezier(x1, y1, x2, y2);

export const springCalm = tokens.motion.spring;
