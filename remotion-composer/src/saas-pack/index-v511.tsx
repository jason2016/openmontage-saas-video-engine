// Render entry for the v5.1.1 ANTI-SHIMMER PRODUCTION MASTER. Additive: the approved
// v5 entry (index.tsx -> SaasPromo) and the v5.1 entry (index-v51.tsx -> RootV51) are
// untouched. This entry exposes one composition, SaasPromoV511, the full nine-scene
// film with the verified mobile-document sign-scene fix.
import { registerRoot } from "remotion";
import { RootV511 } from "./v511/RootV511";

registerRoot(RootV511);
