// Problem beat: drifting document clutter (one stuck) behind a focused headline.
import { AbsoluteFill } from "remotion";
import { Tokens } from "../../tokens";
import { FloatingCards } from "../../components/FloatingCards";
import { useEntrance } from "../../hooks/useEntrance";

interface FloatingCardSpec {
  label?: string;
  tone?: "primary" | "success" | "neutral";
}

interface ProblemSceneProps {
  theme: Tokens;
  headline?: string;
  subtitle?: string;
  cards?: FloatingCardSpec[];
  stalledIndex?: number;
}

export const ProblemScene: React.FC<ProblemSceneProps> = ({ theme, headline, subtitle, cards, stalledIndex = 0 }) => {
  const head = useEntrance({ delaySeconds: 0.4 });
  const sub = useEntrance({ delaySeconds: 0.55 });

  return (
    <AbsoluteFill>
      <FloatingCards theme={theme} cards={cards} stalledIndex={stalledIndex} />
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse 62% 52% at center, rgba(10,14,26,0.93) 0%, rgba(10,14,26,0.6) 40%, transparent 72%)",
        }}
      />
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 120 }}>
        <div style={{ textAlign: "center", maxWidth: 1180, fontFamily: theme.type.family }}>
          {headline && (
            <div
              style={{
                opacity: head.opacity,
                transform: head.transform,
                color: theme.color.textPrimary,
                fontSize: theme.type.size.h1,
                fontWeight: theme.type.weight.display,
                letterSpacing: theme.type.tracking.display,
                lineHeight: 1.1,
              }}
            >
              {headline}
            </div>
          )}
          {subtitle && (
            <div
              style={{
                opacity: sub.opacity,
                transform: sub.transform,
                color: theme.color.textSecondary,
                fontSize: theme.type.size.body,
                fontWeight: theme.type.weight.body,
                marginTop: 24,
                lineHeight: 1.4,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
