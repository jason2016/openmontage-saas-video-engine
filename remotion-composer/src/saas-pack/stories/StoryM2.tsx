// M2 trust-layer story scenes (still-frame verification). Generic sample data.
import { tokens } from "../tokens";
import { Stage } from "./Story";
import { GlassCard } from "../primitives/GlassCard";
import { SignatureStroke } from "../components/SignatureStroke";
import { OTPInput } from "../components/OTPInput";
import { VerificationBadge } from "../components/VerificationBadge";
import { Timeline } from "../components/Timeline";
import { AuditTrail } from "../components/AuditTrail";
import { EmailFlow } from "../components/EmailFlow";
import { MotionLines } from "../components/MotionLines";
import { FloatingCards } from "../components/FloatingCards";

export const StorySignatureStroke: React.FC = () => (
  <Stage>
    <div
      style={{
        width: 640,
        background: "#F7F8FA",
        borderRadius: 18,
        boxShadow: "0 24px 70px rgba(0,0,0,0.45)",
        padding: "34px 40px 26px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
      }}
    >
      <div style={{ fontSize: 13, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
        Sign here
      </div>
      <div style={{ position: "relative", height: 150, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <SignatureStroke theme={tokens} delaySeconds={0.2} />
        <div style={{ position: "absolute", left: 24, right: 24, bottom: 22, height: 1, background: "#CBD5E1" }} />
      </div>
    </div>
  </Stage>
);

export const StoryOTPInput: React.FC = () => (
  <Stage>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30, fontFamily: tokens.type.family }}>
      <div style={{ color: tokens.color.textSecondary, fontSize: 24, fontWeight: 500 }}>Enter the 6-digit code we sent</div>
      <OTPInput theme={tokens} />
    </div>
  </Stage>
);

export const StoryVerificationBadge: React.FC = () => (
  <Stage>
    <VerificationBadge theme={tokens} label="AES eIDAS" sublabel="Advanced Electronic Signature" size={132} />
  </Stage>
);

export const StoryTimeline: React.FC = () => (
  <Stage>
    <GlassCard theme={tokens} padding={52} style={{ minWidth: 440 }}>
      <Timeline theme={tokens} />
    </GlassCard>
  </Stage>
);

export const StoryAuditTrail: React.FC = () => (
  <Stage>
    <AuditTrail theme={tokens} />
  </Stage>
);

export const StoryEmailFlow: React.FC = () => (
  <Stage>
    <EmailFlow theme={tokens} fromLabel="Acme Sign" toLabel="Signer inbox" subject="Please sign: Service Agreement" />
  </Stage>
);

export const StoryMotionLines: React.FC = () => (
  <Stage>
    <MotionLines theme={tokens} />
  </Stage>
);

export const StoryFloatingCards: React.FC = () => (
  <Stage center={false}>
    <FloatingCards theme={tokens} stalledIndex={0} />
  </Stage>
);
