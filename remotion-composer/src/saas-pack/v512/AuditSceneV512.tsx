// v5.1.2 anti-shimmer fix for the AUDIT beat.
//
// Root cause (see AuditSceneV51): the AuditTrail card lived in the camera STAGE, so
// the whole evidentiary card — "Audit trail", "TAMPER-EVIDENT", the four event rows,
// the email addresses, timestamps, OTP phone suffix, signer name, "Sealed", the
// SHA-256 fingerprint, the check/lock icons, the row separators and the card border —
// inherited the "push" camera scale() (changing until the ~2.76 s settle) AND each row
// rode its own useEntrance scale(0.98→1)+translateY. Small monospace text on a
// continuously re-rasterized surface => jitter.
//
// The fix mirrors the OTP/sign fixes: the visible card is rendered in the static
// OVERLAY (AuditTrailStable, opacity-only card + rows, integer geometry, static glow,
// SHA on the overlay). The STAGE keeps only an opacity-0 parity card so the centered
// flex column keeps the exact v5.1 geometry. Headline/subtitle stay on the overlay
// (already stable since v5.1). Copy, colors, timing and layout are preserved.
import { AbsoluteFill } from "remotion";
import { Tokens } from "../tokens";
import { AuditTrailStable, AuditEntry } from "./AuditTrailStable";
import { useSnapEntrance } from "../v51/snap";

type Layer = "stage" | "overlay";

interface Props {
  theme: Tokens;
  layer: Layer;
  headline?: string;
  subtitle?: string;
  fingerprint?: string;
  auditEntries?: AuditEntry[];
}

export const AuditSceneV512: React.FC<Props> = ({ theme, layer, headline = "Every step, recorded.", subtitle, fingerprint, auditEntries }) => {
  const head = useSnapEntrance({ delaySeconds: 0.35 });
  const sub = useSnapEntrance({ delaySeconds: 0.5 });
  const isStage = layer === "stage";

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", padding: 80 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40, fontFamily: theme.type.family }}>
        <div style={{ textAlign: "center", maxWidth: 900 }}>
          <div
            style={{
              opacity: isStage ? 0 : head.opacity,
              transform: head.transform,
              color: theme.color.textPrimary,
              fontSize: theme.type.size.h1,
              fontWeight: theme.type.weight.display,
              letterSpacing: theme.type.tracking.display,
              lineHeight: 1.08,
            }}
          >
            {headline}
          </div>
          {subtitle && (
            <div style={{ opacity: isStage ? 0 : sub.opacity, transform: sub.transform, color: theme.color.textSecondary, fontSize: theme.type.size.body, marginTop: 18, lineHeight: 1.4 }}>
              {subtitle}
            </div>
          )}
        </div>
        {/* Visible card lives on the overlay (no camera); the stage keeps an opacity-0
            parity card so the column geometry is byte-identical to v5.1. */}
        <div style={{ opacity: isStage ? 0 : 1 }}>
          <AuditTrailStable theme={theme} width={840} fingerprint={fingerprint} entries={auditEntries} delaySeconds={0.7} stepSeconds={0.2} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
