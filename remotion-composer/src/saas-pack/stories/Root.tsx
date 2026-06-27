// Isolated root for M1 component stories. Registered via its OWN entry
// (./index.tsx); the MVP entry and the M0 saas-pack entry are untouched.
import { Composition } from "remotion";
import {
  StoryBrowserWindow,
  StoryPhoneMockup,
  StoryPDFViewer,
  StoryCursor,
  StoryMouseClick,
  StoryToast,
  StoryCTAHero,
} from "./Story";
import {
  StorySignatureStroke,
  StoryOTPInput,
  StoryVerificationBadge,
  StoryTimeline,
  StoryAuditTrail,
  StoryEmailFlow,
  StoryMotionLines,
  StoryFloatingCards,
} from "./StoryM2";

const base = { fps: 30, width: 1920, height: 1080, durationInFrames: 150 } as const;

export const StoriesRoot: React.FC = () => (
  <>
    <Composition id="s-BrowserWindow" component={StoryBrowserWindow} {...base} />
    <Composition id="s-PhoneMockup" component={StoryPhoneMockup} {...base} />
    <Composition id="s-PDFViewer" component={StoryPDFViewer} {...base} />
    <Composition id="s-Cursor" component={StoryCursor} {...base} />
    <Composition id="s-MouseClick" component={StoryMouseClick} {...base} />
    <Composition id="s-Toast" component={StoryToast} {...base} />
    <Composition id="s-CTAHero" component={StoryCTAHero} {...base} />

    <Composition id="s-SignatureStroke" component={StorySignatureStroke} {...base} />
    <Composition id="s-OTPInput" component={StoryOTPInput} {...base} />
    <Composition id="s-VerificationBadge" component={StoryVerificationBadge} {...base} />
    <Composition id="s-Timeline" component={StoryTimeline} {...base} />
    <Composition id="s-AuditTrail" component={StoryAuditTrail} {...base} />
    <Composition id="s-EmailFlow" component={StoryEmailFlow} {...base} />
    <Composition id="s-MotionLines" component={StoryMotionLines} {...base} />
    <Composition id="s-FloatingCards" component={StoryFloatingCards} {...base} />
  </>
);
