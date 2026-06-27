// A believable desktop browser frame to host product UI — the #1 trust device.
// Token-driven, calm scale-in entrance. Hosts any children in its viewport.
import { tokens as baseTokens, Tokens } from "../tokens";
import { useEntrance } from "../hooks/useEntrance";

interface BrowserWindowProps {
  theme?: Tokens;
  url?: string;
  children?: React.ReactNode;
  width?: number;
  height?: number; // viewport height (excludes title bar)
  variant?: "mac" | "win";
  secure?: boolean;
  delaySeconds?: number;
  bodyBackground?: string;
}

export const BrowserWindow: React.FC<BrowserWindowProps> = ({
  theme = baseTokens,
  url = "app.example.com",
  children,
  width = 1280,
  height = 720,
  variant = "mac",
  secure = true,
  delaySeconds = 0,
  bodyBackground,
}) => {
  const enter = useEntrance({
    delaySeconds,
    durationSeconds: theme.motion.duration.entrance,
    distance: 18,
    fromScale: 0.965,
  });
  const lights = ["#FF5F57", "#FEBC2E", "#28C840"];

  return (
    <div
      style={{
        width,
        opacity: enter.opacity,
        transform: enter.transform,
        borderRadius: 16,
        overflow: "hidden",
        border: `1px solid ${theme.color.hairline}`,
        background: theme.color.surface,
        boxShadow: "0 40px 120px rgba(0,0,0,0.55)",
        fontFamily: theme.type.family,
      }}
    >
      <div
        style={{
          height: 52,
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "0 20px",
          background: "rgba(255,255,255,0.03)",
          borderBottom: `1px solid ${theme.color.hairline}`,
        }}
      >
        <div style={{ display: "flex", gap: 9 }}>
          {lights.map((c, i) => (
            <div
              key={i}
              style={{
                width: 13,
                height: 13,
                borderRadius: "50%",
                background: variant === "mac" ? c : theme.color.textMuted,
              }}
            />
          ))}
        </div>
        <div
          style={{
            flex: 1,
            height: 30,
            maxWidth: 560,
            margin: "0 auto",
            background: "rgba(255,255,255,0.05)",
            borderRadius: 999,
            border: `1px solid ${theme.color.hairline}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 9,
            color: theme.color.textMuted,
            fontSize: 16,
          }}
        >
          {secure && (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={theme.color.success} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="11" width="14" height="9" rx="2" />
              <path d="M8 11 V7 a4 4 0 0 1 8 0 v4" />
            </svg>
          )}
          {url}
        </div>
        <div style={{ width: 60 }} />
      </div>
      <div
        style={{
          height,
          background: bodyBackground ?? theme.color.canvas,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {children}
      </div>
    </div>
  );
};
