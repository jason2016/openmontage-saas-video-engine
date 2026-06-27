// Own render entry for the SaaS Motion Pack. Additive: the existing MVP entry
// (src/index.tsx) is unchanged. Render with:
//   npx remotion render src/saas-pack/index.tsx SaasPromo <out>.mp4 --codec h264
//   npx remotion still  src/saas-pack/index.tsx SaasPromo <out>.png --frame=70
import { registerRoot } from "remotion";
import { SaasPackRoot } from "./Root";

registerRoot(SaasPackRoot);
