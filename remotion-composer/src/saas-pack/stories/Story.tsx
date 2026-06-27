// Isolated story scenes — one per M1 component — used for still-frame review.
// Generic sample data (Acme) proves the components are NOT product-specific.
import { AbsoluteFill } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";
import { tokens } from "../tokens";
import { AnimatedBackground } from "../primitives/AnimatedBackground";
import { BrowserWindow } from "../components/BrowserWindow";
import { PhoneMockup } from "../components/PhoneMockup";
import { PDFViewer } from "../components/PDFViewer";
import { Cursor } from "../components/Cursor";
import { MouseClick } from "../components/MouseClick";
import { NotificationToast } from "../components/NotificationToast";
import { CTAHero } from "../components/CTAHero";

const { fontFamily } = loadFont("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });

export const Stage: React.FC<{ children: React.ReactNode; center?: boolean }> = ({ children, center = true }) => (
  <AbsoluteFill style={{ fontFamily: `${fontFamily}, ${tokens.type.family}`, background: tokens.color.canvas }}>
    <AnimatedBackground theme={tokens} />
    <AbsoluteFill style={center ? { justifyContent: "center", alignItems: "center", padding: 80 } : {}}>
      {children}
    </AbsoluteFill>
  </AbsoluteFill>
);

const FauxButton: React.FC<{ label: string }> = ({ label }) => (
  <div
    style={{
      padding: "18px 40px",
      borderRadius: 14,
      background: tokens.color.primary,
      color: "#fff",
      fontSize: 24,
      fontWeight: 600,
      boxShadow: `0 16px 40px ${tokens.color.primary}44`,
    }}
  >
    {label}
  </div>
);

export const StoryBrowserWindow: React.FC = () => (
  <Stage>
    <BrowserWindow theme={tokens} url="app.acme.com/sign" width={1280} height={680}>
      <PDFViewer theme={tokens} title="Service Agreement.pdf" lines={9} />
    </BrowserWindow>
  </Stage>
);

export const StoryPhoneMockup: React.FC = () => (
  <Stage>
    <PhoneMockup theme={tokens} width={470}>
      <PDFViewer theme={tokens} title="Agreement" lines={7} compact fill signatureLabel="Sign here" />
    </PhoneMockup>
  </Stage>
);

export const StoryPDFViewer: React.FC = () => (
  <Stage>
    <div style={{ position: "relative", width: 1040, height: 680 }}>
      <PDFViewer theme={tokens} title="Service Agreement.pdf" lines={10} />
    </div>
  </Stage>
);

export const StoryCursor: React.FC = () => (
  <Stage center={false}>
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <FauxButton label="Send for signature" />
    </AbsoluteFill>
    <Cursor theme={tokens} from={{ x: 32, y: 74 }} to={{ x: 52, y: 52 }} startSeconds={0.4} durationSeconds={1.1} />
  </Stage>
);

export const StoryMouseClick: React.FC = () => (
  <Stage center={false}>
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <FauxButton label="Send for signature" />
    </AbsoluteFill>
    <MouseClick theme={tokens} x={50} y={50} startSeconds={2.7} size={210} tone="primary" />
    <Cursor theme={tokens} x={52} y={52} pressed />
  </Stage>
);

export const StoryToast: React.FC = () => (
  <Stage center={false}>
    <NotificationToast theme={tokens} text="Secure link sent" icon="mail" tone="primary" position="top-right" delaySeconds={0.3} holdSeconds={9} />
    <NotificationToast theme={tokens} text="Document signed & sealed" icon="check" tone="success" position="bottom-right" delaySeconds={0.6} holdSeconds={9} />
  </Stage>
);

export const StoryCTAHero: React.FC = () => (
  <Stage>
    <CTAHero
      theme={tokens}
      eyebrow="E-SIGNATURES, HANDLED"
      productName="Acme Sign"
      badge="AES eIDAS compliant"
      tagline="Send. Sign. Done."
      buttonLabel="Start free"
      url="acme.com/sign"
    />
  </Stage>
);
