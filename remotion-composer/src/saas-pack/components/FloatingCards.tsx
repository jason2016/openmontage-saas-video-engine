// A constellation of document cards drifting in parallax — atmosphere for
// "problem / clutter" or "works with everything" scenes. One card can stall+dim
// (the "stuck" beat). Cards + count are props; positions are deterministic.
import { useCurrentFrame, useVideoConfig } from "remotion";
import { tokens as baseTokens, Tokens } from "../tokens";
import { useEntrance } from "../hooks/useEntrance";

interface FloatingCardSpec {
  label?: string;
  tone?: "primary" | "success" | "neutral";
}

interface FloatingCardsProps {
  theme?: Tokens;
  cards?: FloatingCardSpec[];
  driftAmplitude?: number; // in % of canvas
  delaySeconds?: number;
  stepSeconds?: number;
  stalledIndex?: number;
}

const DEFAULT_CARDS: FloatingCardSpec[] = [
  { label: "Contract.pdf", tone: "neutral" },
  { label: "NDA.pdf", tone: "primary" },
  { label: "Invoice.pdf", tone: "neutral" },
  { label: "Agreement.pdf", tone: "success" },
  { label: "Offer.pdf", tone: "neutral" },
];

// Peripheral anchors only: the cards frame the central headline + subtitle band
// (roughly x 22–78, y 40–64) as a deliberate constellation and never cross the
// type. Apple-grade composition ships zero text/object overlaps.
const ANCHORS = [
  { x: 18, y: 30 },
  { x: 77, y: 24 },
  { x: 13, y: 62 },
  { x: 85, y: 56 },
  { x: 27, y: 82 },
  { x: 71, y: 80 },
];

const DocGlyph: React.FC<{ color: string }> = ({ color }) => (
  <svg width="26" height="30" viewBox="0 0 26 30" fill="none">
    <path d="M3 2 h12 l8 8 v18 a2 2 0 0 1 -2 2 H3 a2 2 0 0 1 -2 -2 V4 a2 2 0 0 1 2 -2 Z" fill={`${color}26`} stroke={`${color}99`} strokeWidth="1.5" />
    <path d="M15 2 v8 h8" stroke={`${color}99`} strokeWidth="1.5" fill="none" />
  </svg>
);

const FloatingCard: React.FC<{
  theme: Tokens;
  spec: FloatingCardSpec;
  index: number;
  delay: number;
  amp: number;
  stalled: boolean;
}> = ({ theme, spec, index, delay, amp, stalled }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = useEntrance({ delaySeconds: delay, distance: 18 });
  const t = frame / fps;
  const anchor = ANCHORS[index % ANCHORS.length];
  const phase = index * 1.7;
  const dx = stalled ? 0 : Math.sin(t / (5 + index) + phase) * amp;
  const dy = stalled ? 0 : Math.cos(t / (6 + index * 0.7) + phase) * amp;
  const tone =
    spec.tone === "primary" ? theme.color.primary : spec.tone === "success" ? theme.color.success : theme.color.textSecondary;
  const glyphColor = stalled ? theme.color.textMuted : tone;
  const cardOpacity = (stalled ? 0.34 : 1) * e.opacity;

  return (
    <div
      style={{
        position: "absolute",
        left: `${anchor.x + dx}%`,
        top: `${anchor.y + dy}%`,
        transform: `translate(-50%, -50%) translateY(${e.translateY}px) scale(${e.scale})`,
        opacity: cardOpacity,
      }}
    >
      <div
        style={{
          width: 236,
          padding: 22,
          borderRadius: 16,
          background: theme.color.glassFill,
          border: `1px solid ${theme.color.hairline}`,
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          boxShadow: "0 18px 50px rgba(0,0,0,0.4)",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          fontFamily: theme.type.family,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <DocGlyph color={glyphColor} />
          <div style={{ color: stalled ? theme.color.textMuted : theme.color.textPrimary, fontSize: 18, fontWeight: 500 }}>{spec.label}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ height: 7, width: "85%", borderRadius: 4, background: theme.color.hairline }} />
          <div style={{ height: 7, width: "60%", borderRadius: 4, background: theme.color.hairline }} />
        </div>
        {stalled && (
          <div style={{ color: theme.color.textMuted, fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Awaiting signature
          </div>
        )}
      </div>
    </div>
  );
};

export const FloatingCards: React.FC<FloatingCardsProps> = ({
  theme = baseTokens,
  cards = DEFAULT_CARDS,
  driftAmplitude = 1.0,
  delaySeconds = 0,
  stepSeconds = 0.12,
  stalledIndex,
}) => {
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {cards.map((spec, i) => (
        <FloatingCard
          key={i}
          theme={theme}
          spec={spec}
          index={i}
          delay={delaySeconds + i * stepSeconds}
          amp={driftAmplitude}
          stalled={stalledIndex === i}
        />
      ))}
    </div>
  );
};
