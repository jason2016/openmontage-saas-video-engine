// A faithful, ANONYMIZED recreation of the ClawShow eSign demo service contract
// (ClawShow_eSign_Demo_Contrat_Prestataire.pdf) used as the on-screen document in
// the upload / sign beats. The source PDF self-declares as a demonstration specimen
// with fictitious data; the original customer letterhead/identity has been
// replaced here with a clearly-fictitious demo brand
// ("Studio Méridien · société de démonstration").
// All other content (title, reference, articles, pricing table, signatory personas,
// example.com emails, "adresse fictive" addresses, demo amounts) is reproduced
// verbatim from the source, which states it is fictif et sans valeur contractuelle.
//
// Built as a component (not a screenshot) so it stays crisp at desktop + phone
// scale and so the redaction is clean rather than a blur box. Light "paper" styling,
// independent of the dark theme tokens.
import { tokens as baseTokens, Tokens } from "../tokens";

interface ContractDocumentProps {
  theme?: Tokens;
  variant?: "desktop" | "mobile";
  signed?: React.ReactNode; // a <SignatureStroke /> dropped into the signature field
  signatureLabel?: string;
  // Opt-in (v5, mobile): when provided, render the full tall first page and scroll
  // it by `scroll` px (a real PDF that auto-scrolls to the signature area). The
  // signature block then flows at the end of the page rather than being pinned.
  scroll?: number;
  scrollFrac?: number; // 0..1, drives the scroll indicator thumb
  stamp?: React.ReactNode; // a "Signé" stamp dropped at the signature header
}

// Document palette (mirrors the real specimen: navy letterhead, gold accents).
const DOC = {
  ink: "#1F2430",
  inkSoft: "#3D4452",
  muted: "#8A93A3",
  faint: "#B7BECB",
  gold: "#B6904F",
  goldSoft: "#C8A96A",
  navy: "#1B2335",
  section: "#F1F3F7",
  sectionEdge: "#E3E7EF",
  rule: "#E6E9F0",
  serif: "Georgia, 'Times New Roman', serif",
};

const PARTIES = {
  client: {
    label: "LE CLIENT",
    raison: "Studio Méridien (société de démonstration)",
    adresse: "12 rue de la Démonstration, 75000 Paris (adresse fictive)",
    repr: "M. Marc Delorme, en qualité de Directeur",
    email: "demo-client@example.com",
  },
  prestataire: {
    label: "LE PRESTATAIRE",
    raison: "NumériServices SAS (société de démonstration)",
    adresse: "8 avenue de l'Exemple, 69000 Lyon (adresse fictive)",
    repr: "Mme Camille Durand, en qualité de Gérante",
    email: "demo-prestataire@example.com",
  },
};

const PRICING = [
  ["Maintenance infrastructure", "Continue", "950,00 €"],
  ["Support utilisateurs", "Jours ouvrés", "600,00 €"],
  ["Sauvegarde & sécurité", "Quotidienne", "450,00 €"],
];

const Letterhead: React.FC<{ s: number; fam: string }> = ({ s, fam }) => (
  <div
    style={{
      background: DOC.navy,
      borderBottom: `${2 * s}px solid ${DOC.gold}`,
      padding: `${10 * s}px ${18 * s}px`,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      fontFamily: fam,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 9 * s }}>
      <div
        style={{
          width: 22 * s,
          height: 22 * s,
          borderRadius: 5 * s,
          border: `${1.5 * s}px solid ${DOC.goldSoft}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: DOC.goldSoft,
          fontFamily: DOC.serif,
          fontWeight: 700,
          fontSize: 12 * s,
        }}
      >
        SM
      </div>
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
        <span style={{ color: "#FFFFFF", fontWeight: 700, fontSize: 12.5 * s, letterSpacing: 0.3 * s }}>
          Studio Méridien
        </span>
        <span style={{ color: "#9FB0CC", fontSize: 8.5 * s }}>Société de démonstration</span>
      </div>
    </div>
    <span style={{ color: DOC.goldSoft, fontSize: 9.5 * s, fontStyle: "italic" }}>Document de démonstration</span>
  </div>
);

const PartyCard: React.FC<{ s: number; fam: string; p: typeof PARTIES.client }> = ({ s, fam, p }) => (
  <div
    style={{
      background: DOC.section,
      border: `${1 * s}px solid ${DOC.sectionEdge}`,
      borderRadius: 4 * s,
      padding: `${10 * s}px ${13 * s}px`,
      fontFamily: fam,
    }}
  >
    <div style={{ color: DOC.gold, fontWeight: 800, fontSize: 10.5 * s, letterSpacing: 0.8 * s, marginBottom: 8 * s }}>
      {p.label}
    </div>
    {[
      ["Raison sociale", p.raison],
      ["Adresse", p.adresse],
      ["Représentée par", p.repr],
      ["Email", p.email],
    ].map(([k, v]) => (
      <div key={k} style={{ display: "flex", gap: 10 * s, marginBottom: 4 * s }}>
        <span style={{ color: DOC.inkSoft, fontWeight: 700, fontSize: 9.5 * s, width: 92 * s, flexShrink: 0 }}>{k}</span>
        <span style={{ color: DOC.ink, fontSize: 9.5 * s }}>{v}</span>
      </div>
    ))}
  </div>
);

const ArticleHeading: React.FC<{ s: number; children: React.ReactNode }> = ({ s, children }) => (
  <div style={{ color: DOC.ink, fontFamily: DOC.serif, fontWeight: 700, fontSize: 13 * s, marginTop: 13 * s, marginBottom: 5 * s }}>
    {children}
  </div>
);

const Body: React.FC<{ s: number; fam: string; children: React.ReactNode }> = ({ s, fam, children }) => (
  <div style={{ color: DOC.inkSoft, fontSize: 9.5 * s, lineHeight: 1.5, fontFamily: fam, textAlign: "justify" }}>{children}</div>
);

const PricingTable: React.FC<{ s: number; fam: string }> = ({ s, fam }) => (
  <div style={{ marginTop: 10 * s, border: `${1 * s}px solid ${DOC.sectionEdge}`, borderRadius: 4 * s, overflow: "hidden", fontFamily: fam }}>
    <div style={{ display: "flex", background: DOC.navy, color: "#C7D0E0", fontSize: 8.5 * s, fontWeight: 700, letterSpacing: 0.4 * s }}>
      <span style={{ flex: 1, padding: `${6 * s}px ${11 * s}px` }}>Prestation</span>
      <span style={{ width: 92 * s, padding: `${6 * s}px ${11 * s}px` }}>Fréquence</span>
      <span style={{ width: 110 * s, padding: `${6 * s}px ${11 * s}px`, textAlign: "right" }}>Tarif mensuel (HT)</span>
    </div>
    {PRICING.map((row, i) => (
      <div key={row[0]} style={{ display: "flex", fontSize: 9.5 * s, color: DOC.ink, background: "#FFFFFF", borderTop: i ? `${1 * s}px solid ${DOC.rule}` : "none" }}>
        <span style={{ flex: 1, padding: `${7 * s}px ${11 * s}px` }}>{row[0]}</span>
        <span style={{ width: 92 * s, padding: `${7 * s}px ${11 * s}px`, color: DOC.inkSoft }}>{row[1]}</span>
        <span style={{ width: 110 * s, padding: `${7 * s}px ${11 * s}px`, textAlign: "right" }}>{row[2]}</span>
      </div>
    ))}
    <div style={{ display: "flex", fontSize: 9.5 * s, fontWeight: 800, color: DOC.ink, background: "#F6EFE1", borderTop: `${1 * s}px solid ${DOC.goldSoft}` }}>
      <span style={{ flex: 1, padding: `${7 * s}px ${11 * s}px` }}>Total mensuel (HT)</span>
      <span style={{ width: 92 * s, padding: `${7 * s}px ${11 * s}px` }} />
      <span style={{ width: 110 * s, padding: `${7 * s}px ${11 * s}px`, textAlign: "right" }}>2 000,00 €</span>
    </div>
  </div>
);

export const ContractDocument: React.FC<ContractDocumentProps> = ({
  theme = baseTokens,
  variant = "desktop",
  signed,
  signatureLabel = "Signature et date",
  scroll,
  scrollFrac = 0,
  stamp,
}) => {
  const fam = theme.type.family;

  // v5 mobile — the full first page as a real, auto-scrolling PDF.
  if (variant === "mobile" && scroll != null) {
    const s = 1.12;
    const SigField = (
      <div style={{ marginTop: 12 * s }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ color: DOC.muted, fontWeight: 700, fontSize: 10.5 * s, textTransform: "uppercase", letterSpacing: 1 }}>{signatureLabel}</div>
          {stamp}
        </div>
        <div style={{ height: 70, borderRadius: 8, border: `1.5px dashed ${DOC.faint}`, background: "#FBFCFE", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          {signed}
        </div>
        <div style={{ color: DOC.muted, fontSize: 10.5 * s, marginTop: 8 }}>M. Marc Delorme · Directeur · Studio Méridien</div>
      </div>
    );

    return (
      <div style={{ position: "absolute", inset: 0, background: "#FFFFFF", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* app bar — clears the dynamic island */}
        <div style={{ paddingTop: 50, paddingBottom: 12, paddingLeft: 18, paddingRight: 18, display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${DOC.rule}`, background: "#FFFFFF", fontFamily: fam, zIndex: 3 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={DOC.inkSoft} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          <span style={{ flex: 1, color: DOC.ink, fontWeight: 700, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Contrat de prestation…</span>
          <span style={{ color: DOC.muted, fontWeight: 800, fontSize: 11, letterSpacing: 1 }}>PDF</span>
        </div>

        {/* scroll viewport */}
        <div style={{ flex: 1, position: "relative", overflow: "hidden", background: "#F4F5F8" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, minHeight: 1140, transform: `translateY(${-scroll}px)`, padding: `${14 * s}px ${15 * s}px ${18 * s}px`, display: "flex", flexDirection: "column", gap: 9 * s }}>
            <Letterhead s={s * 0.92} fam={fam} />
            <div style={{ textAlign: "center", marginTop: 4 * s }}>
              <div style={{ fontFamily: DOC.serif, fontWeight: 700, color: DOC.ink, fontSize: 15 * s, letterSpacing: 0.2 }}>CONTRAT DE PRESTATION DE SERVICES</div>
              <div style={{ color: DOC.gold, fontSize: 9.5 * s, fontFamily: fam, marginTop: 2 }}>Services informatiques et numériques</div>
            </div>
            <div style={{ height: 1.5, background: DOC.gold, opacity: 0.5 }} />
            <div style={{ color: DOC.muted, fontSize: 8.5 * s, textAlign: "center", fontFamily: fam }}>Réf. DEMO-SRV-2026-001 · Établi le 20 juin 2026</div>
            <div style={{ color: DOC.ink, fontFamily: DOC.serif, fontWeight: 700, fontSize: 11.5 * s, marginTop: 2 * s }}>Entre les soussignés</div>
            <PartyCard s={s} fam={fam} p={PARTIES.client} />
            <PartyCard s={s} fam={fam} p={PARTIES.prestataire} />
            <div style={{ color: DOC.gold, fontStyle: "italic", fontSize: 8 * s, lineHeight: 1.45, fontFamily: fam }}>
              Spécimen de démonstration — parties et montants fictifs, sans valeur contractuelle.
            </div>
            <ArticleHeading s={s}>Article 1 — Objet du contrat</ArticleHeading>
            <Body s={s} fam={fam}>
              Le Prestataire s'engage à fournir au Client des prestations de services informatiques comprenant la maintenance de l'infrastructure
              numérique, le support technique des utilisateurs et l'accompagnement à la transformation digitale de l'établissement.
            </Body>
            <ArticleHeading s={s}>Article 2 — Description des prestations</ArticleHeading>
            <Body s={s} fam={fam}>
              Les prestations couvrent : (a) la maintenance préventive et corrective des serveurs et postes de travail ; (b) l'assistance aux
              utilisateurs du lundi au vendredi, de 9h à 18h ; (c) la sauvegarde quotidienne des données et la supervision de la sécurité.
            </Body>
            <PricingTable s={s} fam={fam} />
            {/* push the signature + footer to the bottom of the page */}
            <div style={{ flexGrow: 1, minHeight: 14 }} />
            {SigField}
            {/* page footer — reads as a real first-page end */}
            <div style={{ marginTop: 6 }}>
              <div style={{ height: 1, background: DOC.rule, marginBottom: 8 }} />
              <div style={{ display: "flex", justifyContent: "space-between", color: DOC.muted, fontSize: 9 * s, fontFamily: fam }}>
                <span>Fait à Paris · le 20 juin 2026</span>
                <span>Page 1 / 2</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, color: DOC.faint, fontSize: 8 * s, marginTop: 5, fontFamily: fam }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={DOC.faint} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11 V7 a4 4 0 0 1 8 0 v4" /></svg>
                Document sécurisé · ClawShow eSign
              </div>
            </div>
          </div>

          {/* edge fades for depth */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 18, background: "linear-gradient(#F4F5F8, rgba(244,245,248,0))", pointerEvents: "none" }} />
          {/* scroll indicator */}
          <div style={{ position: "absolute", top: 8, bottom: 8, right: 4, width: 3, borderRadius: 999, background: "rgba(15,23,42,0.05)" }}>
            <div style={{ position: "absolute", left: 0, width: 3, height: "26%", borderRadius: 999, background: "rgba(15,23,42,0.22)", top: `${scrollFrac * 74}%` }} />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "mobile") {
    const s = 1.18; // phone scale
    return (
      <div style={{ position: "absolute", inset: 0, background: "#FFFFFF", display: "flex", flexDirection: "column" }}>
        {/* mobile app bar — clears the dynamic island */}
        <div
          style={{
            paddingTop: 50,
            paddingBottom: 12,
            paddingLeft: 18,
            paddingRight: 18,
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderBottom: `1px solid ${DOC.rule}`,
            background: "#FFFFFF",
            fontFamily: fam,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={DOC.inkSoft} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          <span style={{ flex: 1, color: DOC.ink, fontWeight: 700, fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            Contrat de prestation…
          </span>
          <span style={{ color: DOC.muted, fontWeight: 800, fontSize: 11, letterSpacing: 1 }}>PDF</span>
        </div>

        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", gap: 9 * s, padding: `${13 * s}px ${15 * s}px 0` }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontFamily: DOC.serif, fontWeight: 700, color: DOC.ink, fontSize: 15 * s, letterSpacing: 0.2 }}>
              CONTRAT DE PRESTATION
            </div>
            <div style={{ color: DOC.gold, fontSize: 9.5 * s, fontFamily: fam, marginTop: 2 }}>Services informatiques et numériques</div>
          </div>
          <div style={{ color: DOC.muted, fontSize: 8.5 * s, textAlign: "center", fontFamily: fam }}>
            Réf. DEMO-SRV-2026-001 · 20 juin 2026
          </div>
          <PartyCard s={s} fam={fam} p={PARTIES.client} />
          <PartyCard s={s} fam={fam} p={PARTIES.prestataire} />
          <div style={{ color: DOC.gold, fontStyle: "italic", fontSize: 8 * s, lineHeight: 1.4, fontFamily: fam }}>
            Spécimen de démonstration — parties et montants fictifs, sans valeur contractuelle.
          </div>
        </div>

        {/* signature field pinned to the bottom — hosts the drawn stroke */}
        <div style={{ padding: `12px 18px 22px`, borderTop: `1px solid ${DOC.rule}`, background: "#FFFFFF", fontFamily: fam }}>
          <div style={{ color: DOC.muted, fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 7 }}>
            {signatureLabel}
          </div>
          <div
            style={{
              height: 64,
              borderRadius: 8,
              border: `1.5px dashed ${DOC.faint}`,
              background: "#FBFCFE",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {signed}
          </div>
          <div style={{ color: DOC.muted, fontSize: 11, marginTop: 7 }}>M. Marc Delorme · Directeur · Studio Méridien</div>
        </div>
      </div>
    );
  }

  // desktop — full page 1
  const s = 1.55;
  return (
    <div style={{ width: "100%", background: "#FFFFFF", overflow: "hidden" }}>
      <Letterhead s={s} fam={fam} />
      <div style={{ padding: `${16 * s}px ${22 * s}px ${22 * s}px` }}>
        <div style={{ textAlign: "center", marginBottom: 4 * s }}>
          <div style={{ fontFamily: DOC.serif, fontWeight: 700, color: DOC.ink, fontSize: 20 * s, letterSpacing: 0.3 * s }}>
            CONTRAT DE PRESTATION DE SERVICES
          </div>
          <div style={{ color: DOC.gold, fontSize: 11 * s, fontFamily: fam, marginTop: 3 * s }}>Services informatiques et numériques</div>
        </div>
        <div style={{ height: 1.5 * s, background: DOC.gold, opacity: 0.5, margin: `${8 * s}px 0` }} />
        <div style={{ color: DOC.muted, fontSize: 9 * s, fontFamily: fam, marginBottom: 11 * s }}>
          Référence : DEMO-SRV-2026-001 · Établi le 20 juin 2026
        </div>
        <div style={{ color: DOC.ink, fontFamily: DOC.serif, fontWeight: 700, fontSize: 12.5 * s, marginBottom: 9 * s }}>Entre les soussignés</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 * s }}>
          <PartyCard s={s} fam={fam} p={PARTIES.client} />
          <PartyCard s={s} fam={fam} p={PARTIES.prestataire} />
        </div>
        <div style={{ color: DOC.gold, fontStyle: "italic", fontSize: 8.5 * s, lineHeight: 1.5, fontFamily: fam, marginTop: 10 * s }}>
          Il a été convenu et arrêté ce qui suit. Le présent document est un spécimen de démonstration destiné à illustrer le service de
          signature électronique ClawShow eSign. Les parties, montants et informations y figurant sont fictifs et sans valeur contractuelle.
        </div>
        <ArticleHeading s={s}>Article 1 — Objet du contrat</ArticleHeading>
        <Body s={s} fam={fam}>
          Le Prestataire s'engage à fournir au Client des prestations de services informatiques comprenant la maintenance de l'infrastructure
          numérique, le support technique des utilisateurs et l'accompagnement à la transformation digitale de l'établissement.
        </Body>
        <ArticleHeading s={s}>Article 2 — Description des prestations</ArticleHeading>
        <Body s={s} fam={fam}>
          Les prestations couvrent : (a) la maintenance préventive et corrective des serveurs et postes de travail ; (b) l'assistance aux
          utilisateurs du lundi au vendredi, de 9h à 18h ; (c) la sauvegarde quotidienne des données et la supervision de la sécurité.
        </Body>
        <PricingTable s={s} fam={fam} />
      </div>
    </div>
  );
};
