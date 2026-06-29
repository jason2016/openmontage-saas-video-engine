// A believable dark SaaS workspace (Linear / Notion grade): a left nav and a
// "Contracts" list of already-completed documents, with a primary "New document"
// action top-right. Used as the opening phase of the upload beat so the product
// reads as a real application, not a bare upload box. Content is deterministic;
// rows stagger in on the settle curve. The "New document" button is the cursor
// target the UploadScene clicks to open the contract preview.
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { tokens as baseTokens, Tokens } from "../tokens";
import { useEntrance } from "../hooks/useEntrance";
import { easeSettle } from "../hooks/easings";

interface DocRow {
  name: string;
  kind: string;
  recipients: string;
  when: string;
}

// Four completed documents (the user's list: NDA, Employment, Supplier, Service).
const ROWS: DocRow[] = [
  { name: "NDA.pdf", kind: "Non-disclosure", recipients: "2 signers", when: "2d ago" },
  { name: "Employment Agreement.pdf", kind: "Employment", recipients: "1 signer", when: "1d ago" },
  { name: "Supplier Contract.pdf", kind: "Supplier", recipients: "2 signers", when: "5h ago" },
  { name: "Service Agreement.pdf", kind: "Prestation de services", recipients: "2 signers", when: "1h ago" },
];

const DocIcon: React.FC<{ color: string; size?: number }> = ({ color, size = 18 }) => (
  <svg width={size} height={size * (30 / 26)} viewBox="0 0 26 30" fill="none">
    <path d="M3 2 h12 l8 8 v18 a2 2 0 0 1 -2 2 H3 a2 2 0 0 1 -2 -2 V4 a2 2 0 0 1 2 -2 Z" fill={`${color}1f`} stroke={`${color}80`} strokeWidth="1.6" />
    <path d="M15 2 v8 h8" stroke={`${color}80`} strokeWidth="1.6" fill="none" />
  </svg>
);

const NavIcon: React.FC<{ name: string; color: string }> = ({ name, color }) => {
  const c = { width: 19, height: 19, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 1.9, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "docs") return <svg {...c}><path d="M7 3h7l4 4v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" /><path d="M14 3v4h4" /></svg>;
  if (name === "templates") return <svg {...c}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>;
  if (name === "recipients") return <svg {...c}><circle cx="9" cy="8" r="3.2" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0" /><path d="M16 5.2a3.2 3.2 0 0 1 0 5.9" /><path d="M17.5 19a5.5 5.5 0 0 0-2.3-4.5" /></svg>;
  if (name === "audit") return <svg {...c}><path d="M12 3l8 3v5c0 5-3.4 8.2-8 10-4.6-1.8-8-5-8-10V6l8-3Z" /><path d="M9 12l2 2 4-4" /></svg>;
  return <svg {...c}><circle cx="12" cy="12" r="3.2" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" /></svg>;
};

const NavItem: React.FC<{ theme: Tokens; icon: string; label: string; active?: boolean }> = ({ theme, icon, label, active }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "10px 12px",
      borderRadius: 9,
      background: active ? `${theme.color.primary}1f` : "transparent",
      color: active ? theme.color.textPrimary : theme.color.textMuted,
      fontSize: 16,
      fontWeight: active ? 600 : 500,
    }}
  >
    <NavIcon name={icon} color={active ? theme.color.primaryBright : theme.color.textMuted} />
    {label}
  </div>
);

const SignedPill: React.FC<{ theme: Tokens }> = ({ theme }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 7,
      padding: "5px 11px",
      borderRadius: 999,
      background: `${theme.color.success}1c`,
      border: `1px solid ${theme.color.success}44`,
      color: theme.color.successBright,
      fontSize: 14,
      fontWeight: 600,
    }}
  >
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={theme.color.successBright} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 L9 17 L4 12" />
    </svg>
    Signed
  </div>
);

const WorkspaceRow: React.FC<{ theme: Tokens; row: DocRow; index: number; last: boolean }> = ({ theme, row, index, last }) => {
  const e = useEntrance({ delaySeconds: 0.55 + index * 0.09, distance: 12 });
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        padding: "0 22px",
        height: 64,
        borderBottom: last ? "none" : `1px solid ${theme.color.hairline}`,
        opacity: e.opacity,
        transform: `translateY(${e.translateY}px)`,
      }}
    >
      <div style={{ flex: "0 0 44%", display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
        <div style={{ width: 38, height: 38, borderRadius: 9, background: theme.color.glassFill, border: `1px solid ${theme.color.hairline}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <DocIcon color={theme.color.primaryBright} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ color: theme.color.textPrimary, fontSize: 17, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.name}</div>
          <div style={{ color: theme.color.textMuted, fontSize: 13.5, marginTop: 2 }}>{row.kind}</div>
        </div>
      </div>
      <div style={{ flex: "0 0 22%", color: theme.color.textSecondary, fontSize: 15 }}>{row.recipients}</div>
      <div style={{ flex: "0 0 20%" }}><SignedPill theme={theme} /></div>
      <div style={{ flex: "0 0 14%", color: theme.color.textMuted, fontSize: 14.5, textAlign: "right" }}>{row.when}</div>
    </div>
  );
};

export const ContractsWorkspace: React.FC<{ theme?: Tokens; primaryHoverAtSeconds?: number }> = ({ theme = baseTokens, primaryHoverAtSeconds }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const header = useEntrance({ delaySeconds: 0.35, distance: 10 });
  const btn = useEntrance({ delaySeconds: 0.45, distance: 10 });
  // Believable hover: as the cursor arrives, the primary action lifts and brightens
  // — a real button responding to the pointer, just before the press.
  const hover =
    primaryHoverAtSeconds == null
      ? 0
      : interpolate(t, [primaryHoverAtSeconds, primaryHoverAtSeconds + 0.28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: easeSettle });

  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", background: theme.color.canvas, fontFamily: theme.type.family }}>
      {/* left nav */}
      <div style={{ width: 236, flexShrink: 0, borderRight: `1px solid ${theme.color.hairline}`, background: "rgba(255,255,255,0.015)", display: "flex", flexDirection: "column", padding: "20px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "4px 8px 18px" }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(150deg, ${theme.color.primaryBright}, ${theme.color.primary})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 18px ${theme.color.primary}55` }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14c4-1 6-9 9-9s2 6 4 6 2-2 3-2" /></svg>
          </div>
          <div style={{ color: theme.color.textPrimary, fontSize: 16, fontWeight: 700, letterSpacing: "-0.01em" }}>ClawShow</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <NavItem theme={theme} icon="docs" label="Documents" active />
          <NavItem theme={theme} icon="templates" label="Templates" />
          <NavItem theme={theme} icon="recipients" label="Recipients" />
          <NavItem theme={theme} icon="audit" label="Audit log" />
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 11, padding: "10px 8px", borderTop: `1px solid ${theme.color.hairline}` }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", background: `linear-gradient(150deg, #5B6CFF, #8B5BD6)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 13, fontWeight: 700 }}>SM</div>
          <div style={{ minWidth: 0 }}>
            <div style={{ color: theme.color.textSecondary, fontSize: 14, fontWeight: 600 }}>Studio Méridien</div>
            <div style={{ color: theme.color.textMuted, fontSize: 12 }}>Business plan</div>
          </div>
        </div>
      </div>

      {/* main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: "26px 28px 18px" }}>
          <div style={{ opacity: header.opacity, transform: `translateY(${header.translateY}px)` }}>
            <div style={{ color: theme.color.textPrimary, fontSize: 27, fontWeight: 700, letterSpacing: "-0.02em" }}>Contracts</div>
            <div style={{ color: theme.color.textMuted, fontSize: 15, marginTop: 4 }}>4 documents · all signed</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, opacity: btn.opacity, transform: `translateY(${btn.translateY}px)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, height: 42, padding: "0 14px", borderRadius: 10, background: theme.color.glassFill, border: `1px solid ${theme.color.hairline}`, color: theme.color.textMuted, fontSize: 15 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={theme.color.textMuted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.2-3.2" /></svg>
              Search
            </div>
            {/* primary action — cursor target; lifts + brightens on hover */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                height: 42,
                padding: "0 18px",
                borderRadius: 10,
                background: theme.color.primary,
                color: "#fff",
                fontSize: 16,
                fontWeight: 600,
                transform: `translateY(${-2 * hover}px)`,
                filter: `brightness(${1 + 0.1 * hover})`,
                boxShadow: `0 ${10 + 8 * hover}px ${26 + 14 * hover}px ${theme.color.primary}55`,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>
              New document
            </div>
          </div>
        </div>

        {/* table */}
        <div style={{ margin: "0 28px", borderRadius: 14, border: `1px solid ${theme.color.hairline}`, background: "rgba(255,255,255,0.018)", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", padding: "0 22px", height: 42, borderBottom: `1px solid ${theme.color.hairline}`, color: theme.color.textMuted, fontSize: 12.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            <div style={{ flex: "0 0 44%" }}>Document</div>
            <div style={{ flex: "0 0 22%" }}>Recipients</div>
            <div style={{ flex: "0 0 20%" }}>Status</div>
            <div style={{ flex: "0 0 14%", textAlign: "right" }}>Updated</div>
          </div>
          {ROWS.map((row, i) => (
            <WorkspaceRow key={row.name} theme={theme} row={row} index={i} last={i === ROWS.length - 1} />
          ))}
        </div>
      </div>
    </div>
  );
};
