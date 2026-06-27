// Ordered events on a vertical rail; rows reveal top-down with a connector.
// done = success check, active = accent ring, pending = hairline. Events are props.
import { tokens as baseTokens, Tokens } from "../tokens";
import { useEntrance } from "../hooks/useEntrance";

export interface TimelineEvent {
  label: string;
  time?: string;
  state?: "done" | "active" | "pending";
}

interface TimelineProps {
  theme?: Tokens;
  events?: TimelineEvent[];
  delaySeconds?: number;
  stepSeconds?: number;
  accent?: string;
}

const DEFAULT_EVENTS: TimelineEvent[] = [
  { label: "Created", time: "09:41", state: "done" },
  { label: "Sent", time: "09:42", state: "done" },
  { label: "Opened", time: "09:55", state: "done" },
  { label: "Signed", time: "10:03", state: "active" },
];

const Row: React.FC<{ theme: Tokens; event: TimelineEvent; delay: number; last: boolean; accent: string }> = ({
  theme,
  event,
  delay,
  last,
  accent,
}) => {
  const e = useEntrance({ delaySeconds: delay, distance: 14 });
  const done = event.state === "done";
  const active = event.state === "active";
  const dotColor = done ? theme.color.success : active ? accent : theme.color.hairline;

  return (
    <div style={{ display: "flex", gap: 22, opacity: e.opacity, transform: e.transform }}>
      <div style={{ position: "relative", width: 24, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: done ? theme.color.success : "transparent",
            border: `2px solid ${dotColor}`,
            boxShadow: active ? `0 0 0 5px ${accent}22` : undefined,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2,
          }}
        >
          {done && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 L9 17 L4 12" />
            </svg>
          )}
        </div>
        {!last && <div style={{ flex: 1, width: 2, background: theme.color.hairline, marginTop: 2 }} />}
      </div>
      <div style={{ paddingBottom: last ? 0 : 30 }}>
        <div style={{ color: theme.color.textPrimary, fontSize: 24, fontWeight: 600 }}>{event.label}</div>
        {event.time && (
          <div style={{ color: theme.color.textMuted, fontSize: 16, marginTop: 4, fontFamily: theme.type.mono }}>{event.time}</div>
        )}
      </div>
    </div>
  );
};

export const Timeline: React.FC<TimelineProps> = ({
  theme = baseTokens,
  events = DEFAULT_EVENTS,
  delaySeconds = 0,
  stepSeconds = 0.18,
  accent,
}) => {
  const acc = accent ?? theme.color.primary;
  return (
    <div style={{ fontFamily: theme.type.family }}>
      {events.map((ev, i) => (
        <Row key={i} theme={theme} event={ev} delay={delaySeconds + i * stepSeconds} last={i === events.length - 1} accent={acc} />
      ))}
    </div>
  );
};
