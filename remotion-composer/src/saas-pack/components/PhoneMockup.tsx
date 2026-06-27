// Mobile device frame — the signer / end-user context. Token-driven, rises and
// settles. Hosts any children in its screen.
import { tokens as baseTokens, Tokens } from "../tokens";
import { useEntrance } from "../hooks/useEntrance";

interface PhoneMockupProps {
  theme?: Tokens;
  children?: React.ReactNode;
  width?: number;
  delaySeconds?: number;
  screenBackground?: string;
  island?: boolean;
}

export const PhoneMockup: React.FC<PhoneMockupProps> = ({
  theme = baseTokens,
  children,
  width = 440,
  delaySeconds = 0,
  screenBackground,
  island = true,
}) => {
  const enter = useEntrance({
    delaySeconds,
    durationSeconds: theme.motion.duration.entrance,
    distance: 28,
    fromScale: 0.96,
  });
  const height = Math.round(width * 2.06);
  const bezel = 14;
  const radius = 56;

  return (
    <div
      style={{
        width,
        height,
        opacity: enter.opacity,
        transform: enter.transform,
        borderRadius: radius,
        padding: bezel,
        background: "linear-gradient(160deg, #1b2233, #0c111c)",
        border: `1px solid ${theme.color.hairline}`,
        boxShadow: "0 50px 130px rgba(0,0,0,0.6)",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: radius - bezel,
          overflow: "hidden",
          background: screenBackground ?? theme.color.surface,
          position: "relative",
        }}
      >
        {island && (
          <div
            style={{
              position: "absolute",
              top: 14,
              left: "50%",
              transform: "translateX(-50%)",
              width: 112,
              height: 30,
              borderRadius: 999,
              background: "#05070c",
              zIndex: 5,
            }}
          />
        )}
        {children}
      </div>
    </div>
  );
};
