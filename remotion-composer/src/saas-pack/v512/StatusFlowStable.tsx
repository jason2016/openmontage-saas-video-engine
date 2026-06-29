// v5.1.2 anti-shimmer status flow — the stable twin of StatusFlow (Invite beat).
//
// Root cause it removes (see StatusFlow + InviteSceneV51): the card lived in the camera
// STAGE (camera "pan-left" — changing translate until the settle) AND entered through
// useEntrance (translateY(18→0) + an implicit fractional settle). The readable card text
// — "Invitation", "In progress", the document title, and the four step labels/subs —
// rode the camera's changing transform => the small text jittered.
//
// This component is built to live on the STATIC overlay (scale exactly 1, no camera) and
// removes the card's entrance transform: the card now reveals with OPACITY ONLY; its
// geometry is final from frame 0. Everything that is INTENTIONAL live-status motion is
// preserved verbatim — the processing spinner, the connector fill, the per-step phase
// changes, the terminal "awaiting" pulse — because those are the point of the card, are
// decorative (not readable copy), and were never the shimmer complaint. The readable
// text column carries no transform and is static once revealed.
//
// Geometry, copy, colors and step cadence are byte-identical to the v5.1 StatusFlow.
// Deterministic on useCurrentFrame(): no CSS transition/animation, no rAF, no Date.now().
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { tokens as baseTokens, Tokens } from "../tokens";
import { easeSettle } from "../hooks/easings";

export interface FlowStep {
  label: string;
  sub?: string;
  icon?: "spark" | "mail" | "inbox" | "clock";
}

interface StatusFlowStableProps {
  theme?: Tokens;
  steps: FlowStep[];
  startSeconds?: number;
  stepSeconds?: number; // cadence between steps activating
  processSeconds?: number; // processing time before a step settles to done
  docTitle?: string;
  fadeSeconds?: number; // card opacity-in duration
}

const StepGlyph: React.FC<{ name: FlowStep["icon"]; color: string; size?: number }> = ({ name, color, size = 16 }) => {
  const c = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "mail") return <svg {...c}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></svg>;
  if (name === "inbox") return <svg {...c}><path d="M3 12h5l2 3h4l2-3h5" /><path d="M5 12V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6" /><path d="M3 12v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5" /></svg>;
  if (name === "clock") return <svg {...c}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
  return <svg {...c}><path d="M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2L12 3Z" /></svg>;
};

const Node: React.FC<{ theme: Tokens; phase: "pending" | "active" | "done"; terminal: boolean; spin: number; icon: FlowStep["icon"] }> = ({ theme, phase, terminal, spin, icon }) => {
  const size = 40;
  const done = phase === "done";
  const active = phase === "active";
  // terminal "awaiting" step keeps an amber pulse instead of resolving to green
  const amber = "#F59E0B";
  const ringColor = done ? theme.color.success : active ? (terminal ? amber : theme.color.primary) : theme.color.hairline;
  const fillBg = done ? `${theme.color.success}1c` : active ? (terminal ? `${amber}1f` : `${theme.color.primary}1a`) : "rgba(255,255,255,0.03)";

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: fillBg, border: `1.5px solid ${ringColor}66`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {done ? (
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={theme.color.successBright} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 L9 17 L4 12" /></svg>
        ) : active && terminal ? (
          <StepGlyph name="clock" color={amber} size={18} />
        ) : (
          <StepGlyph name={icon} color={active ? theme.color.primaryBright : theme.color.textMuted} size={17} />
        )}
      </div>
      {/* processing spinner arc for an active, non-terminal step (intentional motion) */}
      {active && !terminal && (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ position: "absolute", inset: 0, transform: `rotate(${spin}deg)` }}>
          <circle cx={size / 2} cy={size / 2} r={size / 2 - 2} fill="none" stroke={theme.color.primaryBright} strokeWidth={2.4} strokeLinecap="round" pathLength={1} strokeDasharray="0.28 0.72" />
        </svg>
      )}
      {/* soft pulse halo on the terminal awaiting step (intentional live-state motion) */}
      {active && terminal && (
        <div style={{ position: "absolute", inset: -4, borderRadius: "50%", border: `2px solid ${amber}`, opacity: 0.18 + 0.18 * (0.5 + 0.5 * Math.sin(spin / 28)) }} />
      )}
    </div>
  );
};

export const StatusFlowStable: React.FC<StatusFlowStableProps> = ({
  theme = baseTokens,
  steps,
  startSeconds = 0.6,
  stepSeconds = 0.95,
  processSeconds = 0.75,
  docTitle,
  fadeSeconds = 0.5,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  // Card: OPACITY-ONLY entrance (was useEntrance translateY+settle). Geometry final from frame 0.
  const cardOpacity = interpolate(t, [0.2, 0.2 + fadeSeconds], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const spin = frame * 7; // degrees — intentional spinner/pulse drive

  const lastIndex = steps.length - 1;

  return (
    <div
      style={{
        width: 540,
        boxSizing: "border-box",
        borderRadius: 22,
        background: theme.color.glassFill,
        border: `1px solid ${theme.color.hairline}`,
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
        padding: "26px 30px 30px",
        opacity: cardOpacity,
        fontFamily: theme.type.family,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <div style={{ color: theme.color.textPrimary, fontSize: 20, fontWeight: 700 }}>Invitation</div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 12px", borderRadius: 999, background: `${theme.color.primary}1a`, border: `1px solid ${theme.color.primary}40`, color: theme.color.primaryBright, fontSize: 13, fontWeight: 600 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: theme.color.primaryBright }} />
          In progress
        </div>
      </div>
      {docTitle && (
        <div style={{ color: theme.color.textMuted, fontSize: 14.5, marginBottom: 22, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{docTitle}</div>
      )}

      <div style={{ display: "flex", flexDirection: "column" }}>
        {steps.map((step, i) => {
          const activeAt = startSeconds + i * stepSeconds;
          const doneAt = activeAt + processSeconds;
          const terminal = i === lastIndex;
          const phase: "pending" | "active" | "done" = t < activeAt ? "pending" : terminal ? "active" : t < doneAt ? "active" : "done";
          // connector below this node fills once this step is done (intentional)
          const fill = interpolate(t, [doneAt, doneAt + 0.4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeSettle });
          // step row reveals with OPACITY only — never translated/scaled after visible
          const rowOpacity = interpolate(t, [activeAt - 0.25, activeAt + 0.1], [0.4, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const isLast = i === lastIndex;

          return (
            <div key={step.label} style={{ display: "flex", gap: 18, opacity: rowOpacity }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Node theme={theme} phase={phase} terminal={terminal} spin={spin} icon={step.icon} />
                {!isLast && (
                  <div style={{ width: 2, flex: 1, minHeight: 26, background: theme.color.hairline, position: "relative", margin: "4px 0" }}>
                    <div style={{ position: "absolute", inset: 0, transformOrigin: "top", transform: `scaleY(${fill})`, background: theme.color.success }} />
                  </div>
                )}
              </div>
              <div style={{ paddingBottom: isLast ? 0 : 14, paddingTop: 7 }}>
                <div style={{ color: phase === "pending" ? theme.color.textMuted : theme.color.textPrimary, fontSize: 18, fontWeight: 600 }}>{step.label}</div>
                {step.sub && <div style={{ color: theme.color.textMuted, fontSize: 14.5, marginTop: 3 }}>{step.sub}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
