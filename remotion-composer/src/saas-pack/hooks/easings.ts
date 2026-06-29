// Shared motion presets. The named curve vocabulary (tokens.motion.curve) is the
// reusable motion grammar of the whole pack — one curve per intent. springCalm is
// for the few genuinely physical motions.
import { Easing } from "remotion";
import { tokens } from "../tokens";

const bezier = (c: [number, number, number, number]) => Easing.bezier(c[0], c[1], c[2], c[3]);

export const easeEntrance = bezier(tokens.motion.curve.entrance);
export const easePointer = bezier(tokens.motion.curve.pointer);
export const easePress = bezier(tokens.motion.curve.press);
export const easeCamera = bezier(tokens.motion.curve.camera);
export const easeExit = bezier(tokens.motion.curve.exit);
export const easeSignature = bezier(tokens.motion.curve.signature);

// Back-compat alias: the original "settle" curve is the entrance curve. Existing
// imports across the pack keep working while new code uses the named vocabulary.
export const easeSettle = easeEntrance;

export const springCalm = tokens.motion.spring;
