// A secure message leaving an app and arriving in an inbox: a drawn connector,
// an envelope travelling along it (lock if secure), and an inbox row that lands.
// Labels/subject are props.
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { tokens as baseTokens, Tokens } from "../tokens";
import { easeSettle } from "../hooks/easings";
import { useEntrance } from "../hooks/useEntrance";

interface EmailFlowProps {
  theme?: Tokens;
  fromLabel?: string;
  toLabel?: string;
  subject?: string;
  secure?: boolean;
  delaySeconds?: number;
  travelSeconds?: number;
  accent?: string;
  width?: number;
  height?: number;
}

const MailGlyph: React.FC<{ color: string; size?: number }> = ({ color, size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7 l9 6 l9 -6" />
  </svg>
);

export const EmailFlow: React.FC<EmailFlowProps> = ({
  theme = baseTokens,
  fromLabel = "Your app",
  toLabel = "Signer inbox",
  subject = "Please sign: Service Agreement",
  secure = true,
  delaySeconds = 0.4,
  travelSeconds = 2.8,
  accent,
  width = 1160,
  height = 300,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const acc = accent ?? theme.color.primary;

  const progress = interpolate(t, [delaySeconds, delaySeconds + travelSeconds], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: easeSettle,
  });
  const inboxRow = interpolate(t, [delaySeconds + travelSeconds * 0.6, delaySeconds + travelSeconds * 0.95], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const enter = useEntrance({ delaySeconds: 0 });

  const lineX0 = 250;
  const lineX1 = width - 400;
  const lineY = height / 2;
  const envX = lineX0 + (lineX1 - lineX0) * progress;

  const nodeCard: React.CSSProperties = {
    background: theme.color.glassFill,
    border: `1px solid ${theme.color.hairline}`,
    borderRadius: 16,
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    boxShadow: "0 18px 48px rgba(0,0,0,0.4)",
    position: "absolute",
  };

  return (
    <div style={{ position: "relative", width, height, opacity: enter.opacity, transform: enter.transform, fontFamily: theme.type.family }}>
      {/* connector */}
      <svg width={width} height={height} style={{ position: "absolute", inset: 0 }}>
        <line
          x1={lineX0}
          y1={lineY}
          x2={lineX1}
          y2={lineY}
          stroke={acc}
          strokeOpacity={0.5}
          strokeWidth={2}
          strokeDasharray="2 8"
          strokeLinecap="round"
          pathLength={1}
          strokeDashoffset={0}
        />
      </svg>

      {/* left node */}
      <div style={{ ...nodeCard, left: 0, top: lineY - 60, width: 210, height: 120, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 12 }}>
        <div style={{ width: 46, height: 46, borderRadius: 12, background: `${acc}1f`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <MailGlyph color={theme.color.primaryBright} size={24} />
        </div>
        <div style={{ color: theme.color.textSecondary, fontSize: 17, fontWeight: 500 }}>{fromLabel}</div>
      </div>

      {/* travelling envelope */}
      <div
        style={{
          position: "absolute",
          left: envX,
          top: lineY,
          transform: "translate(-50%, -50%)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 14px",
          borderRadius: 12,
          background: theme.color.surface,
          border: `1px solid ${acc}66`,
          boxShadow: `0 10px 30px ${acc}33`,
        }}
      >
        <MailGlyph color={theme.color.primaryBright} size={20} />
        {secure && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={theme.color.successBright} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="11" width="14" height="9" rx="2" />
            <path d="M8 11 V7 a4 4 0 0 1 8 0 v4" />
          </svg>
        )}
      </div>

      {/* inbox node */}
      <div style={{ ...nodeCard, right: 0, top: lineY - 90, width: 360, height: 180, padding: 22 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ color: theme.color.textPrimary, fontSize: 18, fontWeight: 600 }}>{toLabel}</div>
          <div style={{ color: theme.color.textMuted, fontSize: 13 }}>now</div>
        </div>
        <div style={{ height: 1, background: theme.color.hairline, marginBottom: 16 }} />
        <div style={{ opacity: inboxRow, transform: `translateX(${(1 - inboxRow) * 14}px)`, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 9, height: 9, borderRadius: "50%", background: acc, flexShrink: 0 }} />
          <div style={{ color: theme.color.textSecondary, fontSize: 17, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{subject}</div>
        </div>
      </div>
    </div>
  );
};
