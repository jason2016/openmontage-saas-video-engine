// Render entry for the v5.1.2 ANTI-SHIMMER PRODUCTION MASTER. Additive: the approved v5
// entry (index.tsx -> SaasPromo), the v5.1 entry (index-v51.tsx -> RootV51) and the v5.1.1
// entry (index-v511.tsx -> RootV511) are untouched. This entry exposes one composition,
// SaasPromoV512, the full nine-scene film with every verified anti-shimmer scene fix.
import { registerRoot } from "remotion";
import { RootV512 } from "./v512/RootV512";

registerRoot(RootV512);
