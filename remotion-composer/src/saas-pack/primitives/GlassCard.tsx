// Frosted surface for grouping content with depth. Hairline border, soft shadow,
// calm entrance. The default container for stats, features, CTA, audit panels.
import { tokens as baseTokens, Tokens } from "../tokens";
import { useEntrance } from "../hooks/useEntrance";

interface GlassCardProps {
  theme?: Tokens;
  children?: React.ReactNode;
  padding?: number;
  radius?: number;
  border?: boolean;
  delaySeconds?: number;
  maxWidth?: number;
  blurStrength?: number;
  style?: React.CSSProperties;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  theme = baseTokens,
  children,
  padding = 48,
  radius = baseTokens.space.radiusCard,
  border = true,
  delaySeconds = 0,
  maxWidth,
  blurStrength = 12,
  style,
}) => {
  const enter = useEntrance({ delaySeconds, durationSeconds: theme.motion.duration.entrance });
  return (
    <div
      style={{
        opacity: enter.opacity,
        transform: enter.transform,
        background: theme.color.glassFill,
        border: border ? `${theme.space.hairline}px solid ${theme.color.hairline}` : undefined,
        borderRadius: radius,
        padding,
        maxWidth,
        backdropFilter: `blur(${blurStrength}px)`,
        WebkitBackdropFilter: `blur(${blurStrength}px)`,
        boxShadow: "0 24px 80px rgba(0,0,0,0.45)",
        ...style,
      }}
    >
      {children}
    </div>
  );
};
