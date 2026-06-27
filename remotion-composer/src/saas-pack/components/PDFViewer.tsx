// A believable document page (light "paper" on the dark canvas). Fills its
// positioned parent, so it drops into a BrowserWindow body or a PhoneMockup
// screen. `fill` makes it occupy the whole screen (mobile doc-app look).
// Deterministic text-line layout; optional signature slot for a SignatureStroke
// (M2). No product-specific text baked in — all via props.
import { tokens as baseTokens, Tokens } from "../tokens";
import { useEntrance } from "../hooks/useEntrance";

interface PDFViewerProps {
  theme?: Tokens;
  title?: string;
  lines?: number;
  signatureSlot?: boolean;
  signatureLabel?: string;
  signed?: React.ReactNode; // e.g. a <SignatureStroke /> (M2)
  delaySeconds?: number;
  paper?: string;
  compact?: boolean;
  fill?: boolean; // stretch to fill the container (mobile full-screen doc)
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  theme = baseTokens,
  title = "Document.pdf",
  lines = 9,
  signatureSlot = true,
  signatureLabel = "Signature",
  signed,
  delaySeconds = 0,
  paper = "#F7F8FA",
  compact = false,
  fill = false,
}) => {
  const enter = useEntrance({ delaySeconds, durationSeconds: theme.motion.duration.entrance, distance: 16 });
  // deterministic line widths (no Math.random)
  const widths = Array.from({ length: lines }, (_, i) => 52 + ((i * 37) % 44));

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: fill ? "stretch" : "flex-start",
        padding: fill ? 0 : compact ? 16 : 44,
        opacity: enter.opacity,
        transform: enter.transform,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: fill ? "none" : 900,
          height: fill ? "100%" : undefined,
          background: paper,
          borderRadius: fill ? 0 : 10,
          boxShadow: fill ? "none" : "0 20px 60px rgba(0,0,0,0.35)",
          padding: fill ? "62px 26px 26px" : compact ? "26px 24px" : "54px 60px",
          display: "flex",
          flexDirection: "column",
          gap: compact ? 11 : 17,
          color: "#0F172A",
          fontFamily: theme.type.family,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div style={{ fontWeight: 700, fontSize: compact ? 19 : 27 }}>{title}</div>
          <div style={{ fontSize: 13, color: "#94A3B8", fontWeight: 700, letterSpacing: "0.08em" }}>PDF</div>
        </div>
        <div style={{ height: 1, background: "#E2E8F0" }} />
        {widths.map((w, i) => (
          <div key={i} style={{ height: compact ? 9 : 12, width: `${w}%`, borderRadius: 4, background: "#E5E9F0" }} />
        ))}
        {fill && <div style={{ flex: 1 }} />}
        {signatureSlot && (
          <div style={{ marginTop: fill ? 0 : compact ? 12 : 26, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {signatureLabel}
            </div>
            <div
              style={{
                height: compact ? 54 : 84,
                borderRadius: 8,
                border: "1.5px dashed #CBD5E1",
                background: "#FBFCFE",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              {signed}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
