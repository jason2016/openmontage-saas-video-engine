// Own entry for the M1 story compositions (still-frame verification).
//   npx remotion still src/saas-pack/stories/index.tsx s-BrowserWindow out.png --frame=90
import { registerRoot } from "remotion";
import { StoriesRoot } from "./Root";

registerRoot(StoriesRoot);
