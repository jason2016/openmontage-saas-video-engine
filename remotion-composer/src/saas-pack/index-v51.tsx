// Separate render entry for the v5.1 anti-shimmer DIAGNOSTIC only. Additive: the
// approved v5 entry (src/saas-pack/index.tsx → SaasPromo) is untouched. This entry
// exposes two compositions, DiagOriginal and DiagFixed, for the comparison clips.
import { registerRoot } from "remotion";
import { RootV51 } from "./v51/RootV51";

registerRoot(RootV51);
