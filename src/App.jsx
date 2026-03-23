import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
// DESIGN SYSTEM
// ═══════════════════════════════════════════════════════════════
const T = {
  bg: "#F6F2EB", bgCard: "#FFFFFF", bgInput: "#F0ECE4",
  primary: "#3A6B3E", primaryLight: "#4E8E53", primaryDark: "#2C5530",
  accent: "#C9963B", accentLight: "#F5E6C4",
  text: "#1F2420", textSec: "#6B7C6E", textMuted: "#9CA89E",
  border: "#E2DDD4", borderFocus: "#3A6B3E",
  danger: "#C0392B", dangerBg: "#FDE8E6",
  success: "#27AE60", successBg: "#E8F8EF",
  white: "#FFFFFF",
  shadow: "0 2px 12px rgba(0,0,0,0.06)",
  shadowLg: "0 8px 32px rgba(0,0,0,0.10)",
  radius: 14, radiusSm: 10, radiusLg: 20,
  font: "'Source Sans 3', 'DM Sans', sans-serif",
  fontDisplay: "'Playfair Display', Georgia, serif",
};

const FONTS_URL = "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;500;600;700&display=swap";

const REGLEMENT = `RÈGLEMENT DE COPROPRIÉTÉ - RÉSIDENCE LES TILLEULS
Article 1 - Parties communes: halls, escaliers, ascenseurs, couloirs, jardins, parking, local poubelles, toiture, façades.
Article 2 - Nuisances sonores: Travaux bruyants autorisés lun-ven 8h30-19h, sam 9h-12h. Interdits dim et fériés. Musique tolérée jusqu'à 22h.
Article 3 - Animaux: Autorisés si pas de nuisances. Chiens en laisse dans parties communes. Propriétaires responsables nettoyage.
Article 4 - Stationnement: Place numérotée par lot. Visiteurs limité 48h. Véhicules hors d'usage retirés sous 30j.
Article 5 - Balcons: Pas modifier aspect extérieur. Linge visible interdit. Barbecue charbon interdit, plancha électrique tolérée.
Article 6 - Entretien: Ne pas encombrer parties communes. Poubelles dans local prévu. Tri sélectif obligatoire.
Article 7 - Charges: Trimestrielles. Retard >30j = pénalités 1%/mois.
Article 8 - AG: Au moins 1/an. Convocations 21j avant. Majorité simple sauf travaux importants (2/3).
Article 9 - Travaux: Modif parties communes/aspect extérieur = vote AG. Travaux privatifs ne doivent pas porter atteinte à solidité.
Article 10 - Médiation: Médiation amiable obligatoire avant justice. Syndic peut être médiateur.`;

const STYLES_MSG = [
  { id: "diplomatique", label: "Diplomatique", icon: "🤝", desc: "Poli et orienté solution", color: "#3A6B3E" },
  { id: "chaleureux", label: "Chaleureux", icon: "☀️", desc: "Amical et bienveillant", color: "#C9963B" },
  { id: "factuel", label: "Factuel", icon: "📋", desc: "Précis et référencé", color: "#2980B9" },
];

const MOCK_USERS = [
  { id: 1, name: "Marie Dupont", apt: "3B", avatar: "MD", color: "#3A6B3E", role: "member" },
  { id: 2, name: "Thomas Renard", apt: "5A", avatar: "TR", color: "#2980B9", role: "conseil" },
  { id: 3, name: "Sophie Lambert", apt: "2C", avatar: "SL", color: "#8E44AD", role: "member" },
  { id: 4, name: "Pierre Martin", apt: "1A", avatar: "PM", color: "#C0392B", role: "president" },
  { id: 5, name: "Claire Moreau", apt: "4B", avatar: "CM", color: "#E67E22", role: "member" },
  { id: 6, name: "Lucas Bernard", apt: "6A", avatar: "LB", color: "#16A085", role: "member" },
  { id: 7, name: "Emma Petit", apt: "3A", avatar: "EP", color: "#E84393", role: "member" },
  { id: 8, name: "Hugo Roux", apt: "5B", avatar: "HR", color: "#6C5CE7", role: "member" },
];

const ME = { id: 99, name: "Vous", apt: "4A", avatar: "VA", color: "#C9963B", role: "member" };

const MOCK_MESSAGES = [
  { id: 1, userId: 1, text: "Bonjour à tous ! Le local poubelles a besoin d'un nettoyage. Les bacs de tri sont mélangés depuis la semaine dernière. Pourrait-on organiser un planning collectif ?", time: "14:32", style: "diplomatique", reactions: { "👍": [2,3], "💚": [4] }, replies: 2 },
  { id: 2, userId: 2, text: "Bonne idée Marie ! Je me porte volontaire pour cette semaine. Je prévois aussi de petits travaux de peinture samedi matin, dans le respect des horaires du règlement (art. 2 : 9h-12h). N'hésitez pas à me contacter si le bruit vous gêne.", time: "15:01", style: "chaleureux", reactions: { "❤️": [1,3,5] }, replies: 0 },
  { id: 3, userId: 3, text: "Merci Thomas pour la prévenance ! Est-ce que quelqu'un sait quand est prévue la prochaine AG ? J'ai plusieurs points à soumettre concernant l'entretien du jardin.", time: "15:45", style: "factuel", reactions: { "👍": [1] }, replies: 1 },
  { id: 4, userId: 4, text: "L'AG est prévue le 15 avril à 18h30 en salle polyvalente. La convocation sera envoyée 21 jours avant conformément à l'article 8. Sophie, tu peux m'envoyer tes points par email, je les ajouterai à l'ordre du jour.", time: "16:12", style: "diplomatique", reactions: { "👍": [1,2,3,5,6] }, replies: 0 },
  { id: 5, userId: 5, text: "Super pour le planning de nettoyage ! Je peux prendre la semaine prochaine. Petite question : est-ce qu'on pourrait aussi commander de nouveaux bacs de tri ? Les actuels sont vraiment abîmés.", time: "17:30", style: "chaleureux", reactions: { "👍": [1,2] }, replies: 0 },
];

const EVENT_TYPES = {
  ag: { label: "Assemblée Générale", icon: "🏛️", color: "#8B5CF6" },
  travaux: { label: "Travaux", icon: "🔧", color: "#D97706" },
  social: { label: "Événement", icon: "🎉", color: "#EC4899" },
  admin: { label: "Échéance", icon: "📋", color: "#2980B9" },
  entretien: { label: "Entretien", icon: "🧹", color: "#27AE60" },
};

const MOCK_EVENTS = [
  { id: 1, title: "Apéro des voisins", type: "social", date: "2026-03-28", time: "18:00", location: "Jardin commun", desc: "Chacun apporte un plat ou une boisson à partager !", rsvp: { yes: [1,2,3,5], maybe: [4], no: [] }, important: false },
  { id: 2, title: "Appel de charges T2", type: "admin", date: "2026-04-01", time: null, location: null, desc: "Paiement avant le 30 avril.", important: false },
  { id: 3, title: "Installation fibre optique", type: "travaux", date: "2026-04-08", time: "08:30", location: "Parties communes", desc: "Confirmez votre créneau auprès du syndic avant le 1er avril.", important: true },
  { id: 4, title: "AG Ordinaire annuelle", type: "ag", date: "2026-04-15", time: "18:30", location: "Salle polyvalente RDC", desc: "Approbation comptes 2025, budget 2026, vote ravalement façade.", important: true },
  { id: 5, title: "Entretien chaudière", type: "entretien", date: "2026-04-22", time: "09:00", location: "Local technique", desc: "Coupure eau chaude 9h-12h.", important: false },
  { id: 6, title: "Début ravalement façade", type: "travaux", date: "2026-05-04", time: "07:00", location: "Façade sud + ouest", desc: "Durée estimée 8 semaines. Fermer fenêtres côté sud.", important: true },
  { id: 7, title: "Fête des voisins", type: "social", date: "2026-05-29", time: "19:00", location: "Jardin commun", desc: "Grande fête annuelle !", rsvp: { yes: [1,2], maybe: [3], no: [] }, important: false },
];

const DOC_CATS = [
  { id: "reglement", icon: "📜", label: "Règlement", color: "#8B5CF6", docs: [
    { name: "Règlement de copropriété", date: "2018-06-12", size: "2.4 Mo", type: "pdf" },
    { name: "État descriptif de division", date: "2018-06-12", size: "1.1 Mo", type: "pdf" },
    { name: "Modificatif n°1 — Balcons", date: "2021-03-20", size: "340 Ko", type: "pdf" },
  ]},
  { id: "ag", icon: "🏛️", label: "Assemblées Générales", color: "#3A6B3E", docs: [
    { name: "PV AG — 12 mars 2025", date: "2025-03-18", size: "890 Ko", type: "pdf" },
    { name: "PV AG — 8 avril 2024", date: "2024-04-15", size: "780 Ko", type: "pdf" },
    { name: "Convocation AG 15 avril 2026", date: "2026-03-25", size: "410 Ko", type: "pdf", isNew: true },
  ]},
  { id: "finances", icon: "💰", label: "Finances & Charges", color: "#D97706", docs: [
    { name: "Budget prévisionnel 2026", date: "2026-01-15", size: "620 Ko", type: "xlsx" },
    { name: "Comptes annuels 2025", date: "2026-02-28", size: "1.8 Mo", type: "pdf" },
    { name: "Appel de fonds travaux façade", date: "2026-03-01", size: "310 Ko", type: "pdf", isNew: true },
  ]},
  { id: "travaux", icon: "🔧", label: "Travaux & Devis", color: "#EC4899", docs: [
    { name: "Devis ravalement — Ent. Durand", date: "2025-11-20", size: "3.2 Mo", type: "pdf" },
    { name: "Contrat retenu — Ent. Durand", date: "2026-01-10", size: "1.5 Mo", type: "pdf" },
    { name: "Planning travaux façade", date: "2026-02-15", size: "890 Ko", type: "pdf" },
  ]},
  { id: "contrats", icon: "📑", label: "Contrats", color: "#2980B9", docs: [
    { name: "Contrat syndic 2024-2027", date: "2024-04-01", size: "1.2 Mo", type: "pdf" },
    { name: "Assurance copropriété", date: "2025-01-01", size: "980 Ko", type: "pdf" },
    { name: "Contrat entretien ascenseur", date: "2023-09-01", size: "670 Ko", type: "pdf" },
  ]},
];

const MOCK_NOTIFS = [
  { id: 1, type: "message", text: "Pierre Martin a publié dans le forum", time: "Il y a 2h", read: false, icon: "💬" },
  { id: 2, type: "event", text: "Rappel : Apéro des voisins samedi 28 mars", time: "Il y a 5h", read: false, icon: "📅" },
  { id: 3, type: "doc", text: "Nouveau document : Convocation AG 15 avril", time: "Hier", read: false, icon: "📄" },
  { id: 4, type: "syndic", text: "Le syndic virtuel a une mise à jour sur votre question", time: "Hier", read: true, icon: "⚖️" },
  { id: 5, type: "message", text: "Claire Moreau a réagi à votre message", time: "Il y a 2j", read: true, icon: "❤️" },
];

// ═══════════════════════════════════════════════════════════════
// SHARED COMPONENTS
// ═══════════════════════════════════════════════════════════════
function Btn({ children, variant = "primary", full, small, disabled, onClick, style: s }) {
  const base = { fontFamily: T.font, fontWeight: 600, border: "none", cursor: disabled ? "not-allowed" : "pointer", borderRadius: T.radius, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.2s", opacity: disabled ? 0.5 : 1, width: full ? "100%" : "auto", fontSize: small ? 12 : 14, padding: small ? "8px 14px" : "13px 20px" };
  const variants = {
    primary: { background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`, color: T.white },
    secondary: { background: T.white, color: T.primary, border: `2px solid ${T.border}` },
    accent: { background: `linear-gradient(135deg, ${T.accent}, #B8862F)`, color: T.white },
    ghost: { background: "transparent", color: T.textSec, padding: small ? "6px 10px" : "10px 16px" },
    danger: { background: T.dangerBg, color: T.danger },
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...s }}>{children}</button>;
}

function Input({ label, icon, value, onChange, placeholder, type = "text", multiline, rows = 3 }) {
  const [focused, setFocused] = useState(false);
  const shared = { width: "100%", padding: icon ? "11px 12px 11px 38px" : "11px 12px", borderRadius: T.radiusSm, border: `2px solid ${focused ? T.borderFocus : T.border}`, background: T.white, fontSize: 14, fontFamily: T.font, outline: "none", boxSizing: "border-box", transition: "border-color 0.2s", color: T.text, resize: multiline ? "vertical" : "none" };
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ fontSize: 11, fontWeight: 600, color: T.textSec, textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: 5 }}>{label}</label>}
      <div style={{ position: "relative" }}>
        {icon && <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, opacity: 0.4 }}>{icon}</span>}
        {multiline
          ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={shared} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
          : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={shared} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
        }
      </div>
    </div>
  );
}

function Avatar({ name, color, size = 36, style: s }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return <div style={{ width: size, height: size, borderRadius: "50%", background: color || T.primary, color: T.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.35, fontWeight: 700, fontFamily: T.font, flexShrink: 0, ...s }}>{initials}</div>;
}

function Badge({ count, color = T.danger }) {
  if (!count) return null;
  return <span style={{ background: color, color: T.white, fontSize: 9, fontWeight: 700, borderRadius: 10, padding: "1px 5px", minWidth: 16, display: "inline-flex", alignItems: "center", justifyContent: "center", position: "absolute", top: -4, right: -4 }}>{count}</span>;
}

function TopBar({ title, subtitle, onBack, right, transparent }) {
  return (
    <div style={{ padding: "14px 16px 10px", display: "flex", alignItems: "center", gap: 10, background: transparent ? "transparent" : T.white, borderBottom: transparent ? "none" : `1px solid ${T.border}`, position: "sticky", top: 0, zIndex: 100 }}>
      {onBack && <button onClick={onBack} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: T.text, padding: "4px" }}>←</button>}
      <div style={{ flex: 1 }}>
        <h2 style={{ margin: 0, fontFamily: T.fontDisplay, fontSize: 18, color: T.text, fontWeight: 600 }}>{title}</h2>
        {subtitle && <p style={{ margin: 0, fontSize: 11, color: T.textMuted }}>{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

function BottomNav({ active, onChange, unreadNotifs }) {
  const tabs = [
    { id: "forum", icon: "💬", label: "Forum" },
    { id: "agenda", icon: "📅", label: "Agenda" },
    { id: "docs", icon: "📁", label: "Documents" },
    { id: "syndic", icon: "⚖️", label: "Syndic" },
    { id: "more", icon: "☰", label: "Plus" },
  ];
  return (
    <div style={{ display: "flex", background: T.white, borderTop: `1px solid ${T.border}`, position: "sticky", bottom: 0, zIndex: 100, paddingBottom: "env(safe-area-inset-bottom, 0)" }}>
      {tabs.map(tab => (
        <button key={tab.id} onClick={() => onChange(tab.id)} style={{
          flex: 1, padding: "8px 0 6px", border: "none", background: "none", cursor: "pointer",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
          color: active === tab.id ? T.primary : T.textMuted,
          fontFamily: T.font, fontSize: 10, fontWeight: active === tab.id ? 700 : 500,
          transition: "all 0.15s", position: "relative",
        }}>
          <span style={{ fontSize: 18, position: "relative" }}>
            {tab.icon}
            {tab.id === "more" && unreadNotifs > 0 && <Badge count={unreadNotifs} />}
          </span>
          {tab.label}
          {active === tab.id && <div style={{ position: "absolute", top: 0, left: "25%", right: "25%", height: 2.5, borderRadius: 2, background: T.primary }} />}
        </button>
      ))}
    </div>
  );
}

function EmptyState({ icon, title, desc, action, onAction }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 24px" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
      <h3 style={{ fontFamily: T.fontDisplay, fontSize: 18, color: T.text, margin: "0 0 6px" }}>{title}</h3>
      <p style={{ fontSize: 13, color: T.textSec, lineHeight: 1.5, maxWidth: 260, margin: "0 auto 16px" }}>{desc}</p>
      {action && <Btn onClick={onAction}>{action}</Btn>}
    </div>
  );
}

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "4px 0" }}>
      {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: T.textMuted, animation: `bounce 1.2s ease-in-out ${i*0.15}s infinite` }} />)}
    </div>
  );
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: T.bg, width: "100%", maxWidth: 480, maxHeight: "92vh", borderRadius: "20px 20px 0 0", overflow: "auto", animation: "slideUp 0.3s ease" }}>
        <div style={{ padding: "14px 18px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: T.bg, zIndex: 1 }}>
          <h3 style={{ margin: 0, fontFamily: T.fontDisplay, fontSize: 17, color: T.text }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: T.textMuted }}>×</button>
        </div>
        <div style={{ padding: "14px 18px" }}>{children}</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// AUTH SCREENS
// ═══════════════════════════════════════════════════════════════
function WelcomeScreen({ onLogin, onRegister }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: `linear-gradient(160deg, ${T.primaryDark} 0%, ${T.primary} 40%, ${T.primaryLight} 100%)`, color: T.white, padding: "0 24px" }}>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, marginBottom: 20, backdropFilter: "blur(10px)" }}>🏡</div>
        <h1 style={{ fontFamily: T.fontDisplay, fontSize: 34, margin: "0 0 8px", fontWeight: 700 }}>VoisinSerein</h1>
        <p style={{ fontSize: 15, opacity: 0.85, lineHeight: 1.5, maxWidth: 280, margin: "0 0 8px" }}>La communication de copropriété réinventée par l'Intelligence Artificielle</p>
        <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap", justifyContent: "center" }}>
          {["Forum IA", "Syndic Virtuel", "Agenda", "Documents"].map(f => (
            <span key={f} style={{ fontSize: 11, padding: "4px 12px", borderRadius: 20, background: "rgba(255,255,255,0.15)", fontWeight: 500 }}>{f}</span>
          ))}
        </div>
      </div>
      <div style={{ paddingBottom: 40 }}>
        <Btn full variant="accent" onClick={onLogin} style={{ marginBottom: 10, padding: "15px", fontSize: 15 }}>Se connecter</Btn>
        <Btn full variant="ghost" onClick={onRegister} style={{ color: "rgba(255,255,255,0.85)", fontSize: 14 }}>Créer un compte</Btn>
      </div>
    </div>
  );
}

function LoginScreen({ onBack, onLogin, onForgot, onRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <div style={{ minHeight: "100vh", background: T.bg, padding: "0 20px" }}>
      <TopBar title="" onBack={onBack} transparent />
      <div style={{ paddingTop: 20 }}>
        <h1 style={{ fontFamily: T.fontDisplay, fontSize: 28, color: T.text, margin: "0 0 4px" }}>Bon retour !</h1>
        <p style={{ color: T.textSec, fontSize: 14, margin: "0 0 28px" }}>Connectez-vous à votre copropriété</p>
        <Input label="Email" icon="✉️" value={email} onChange={setEmail} placeholder="votre@email.com" type="email" />
        <Input label="Mot de passe" icon="🔒" value={password} onChange={setPassword} placeholder="••••••••" type="password" />
        <button onClick={onForgot} style={{ background: "none", border: "none", color: T.primary, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: T.font, marginBottom: 20, padding: 0 }}>Mot de passe oublié ?</button>
        <Btn full onClick={onLogin} style={{ padding: "14px", fontSize: 15 }}>Se connecter</Btn>
        <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: T.textSec }}>Pas encore de compte ? <button onClick={onRegister} style={{ background: "none", border: "none", color: T.primary, fontWeight: 600, cursor: "pointer", fontFamily: T.font, fontSize: 13, padding: 0 }}>S'inscrire</button></p>
      </div>
    </div>
  );
}

function RegisterScreen({ onBack, onRegister }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <div style={{ minHeight: "100vh", background: T.bg, padding: "0 20px" }}>
      <TopBar title="" onBack={onBack} transparent />
      <div style={{ paddingTop: 20 }}>
        <h1 style={{ fontFamily: T.fontDisplay, fontSize: 28, color: T.text, margin: "0 0 4px" }}>Bienvenue !</h1>
        <p style={{ color: T.textSec, fontSize: 14, margin: "0 0 28px" }}>Créez votre compte pour rejoindre votre copropriété</p>
        <Input label="Nom complet" icon="👤" value={name} onChange={setName} placeholder="Marie Dupont" />
        <Input label="Email" icon="✉️" value={email} onChange={setEmail} placeholder="votre@email.com" type="email" />
        <Input label="Mot de passe" icon="🔒" value={password} onChange={setPassword} placeholder="Min. 8 caractères" type="password" />
        <Btn full onClick={onRegister} style={{ padding: "14px", fontSize: 15, marginTop: 8 }}>Créer mon compte</Btn>
        <p style={{ textAlign: "center", fontSize: 11, color: T.textMuted, marginTop: 16, lineHeight: 1.5 }}>En créant un compte, vous acceptez les CGU et la politique de confidentialité</p>
      </div>
    </div>
  );
}

function ForgotScreen({ onBack }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <div style={{ minHeight: "100vh", background: T.bg, padding: "0 20px" }}>
      <TopBar title="" onBack={onBack} transparent />
      <div style={{ paddingTop: 20 }}>
        <h1 style={{ fontFamily: T.fontDisplay, fontSize: 28, color: T.text, margin: "0 0 4px" }}>Mot de passe oublié</h1>
        <p style={{ color: T.textSec, fontSize: 14, margin: "0 0 28px" }}>Entrez votre email, nous vous enverrons un lien de réinitialisation</p>
        {sent ? (
          <div style={{ background: T.successBg, borderRadius: T.radius, padding: 20, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>✉️</div>
            <p style={{ color: T.success, fontWeight: 600, margin: "0 0 6px" }}>Email envoyé !</p>
            <p style={{ color: T.textSec, fontSize: 13, margin: 0 }}>Vérifiez votre boîte mail et suivez le lien.</p>
          </div>
        ) : (
          <>
            <Input label="Email" icon="✉️" value={email} onChange={setEmail} placeholder="votre@email.com" type="email" />
            <Btn full onClick={() => setSent(true)} style={{ padding: "14px", fontSize: 15, marginTop: 8 }}>Envoyer le lien</Btn>
          </>
        )}
      </div>
    </div>
  );
}

function OnboardingScreen({ onCreateCopro, onJoinCopro }) {
  return (
    <div style={{ minHeight: "100vh", background: T.bg, padding: "24px 20px" }}>
      <div style={{ textAlign: "center", paddingTop: 40, marginBottom: 36 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🏡</div>
        <h1 style={{ fontFamily: T.fontDisplay, fontSize: 24, color: T.text, margin: "0 0 6px" }}>Rejoignez votre copropriété</h1>
        <p style={{ color: T.textSec, fontSize: 14 }}>Comment souhaitez-vous commencer ?</p>
      </div>
      <div onClick={onJoinCopro} style={{ background: T.white, borderRadius: T.radiusLg, padding: 20, marginBottom: 12, boxShadow: T.shadow, cursor: "pointer", border: `2px solid ${T.border}`, transition: "border-color 0.2s" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 50, height: 50, borderRadius: 14, background: `${T.primary}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🔑</div>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: T.text }}>J'ai un code d'invitation</h3>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: T.textSec }}>Un voisin ou mon syndic m'a partagé un code</p>
          </div>
        </div>
      </div>
      <div onClick={onCreateCopro} style={{ background: T.white, borderRadius: T.radiusLg, padding: 20, boxShadow: T.shadow, cursor: "pointer", border: `2px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 50, height: 50, borderRadius: 14, background: `${T.accent}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🏗️</div>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: T.text }}>Créer ma copropriété</h3>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: T.textSec }}>Je suis syndic ou président du conseil syndical</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function JoinCoproScreen({ onBack, onJoin }) {
  const [code, setCode] = useState("");
  const [apt, setApt] = useState("");
  return (
    <div style={{ minHeight: "100vh", background: T.bg, padding: "0 20px" }}>
      <TopBar title="Rejoindre" onBack={onBack} transparent />
      <div style={{ paddingTop: 20 }}>
        <h2 style={{ fontFamily: T.fontDisplay, fontSize: 22, color: T.text, margin: "0 0 4px" }}>Entrez votre code</h2>
        <p style={{ color: T.textSec, fontSize: 13, margin: "0 0 24px" }}>Le code d'invitation vous a été fourni par votre syndic ou un voisin.</p>
        <Input label="Code d'invitation" icon="🔑" value={code} onChange={setCode} placeholder="TILLEULS-2026" />
        <Input label="Votre appartement" icon="🏠" value={apt} onChange={setApt} placeholder="Ex: 4A, RDC gauche..." />
        <Btn full onClick={onJoin} style={{ marginTop: 8 }}>Rejoindre la copropriété</Btn>
      </div>
    </div>
  );
}

function CreateCoproScreen({ onBack, onCreate }) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [lots, setLots] = useState("");
  return (
    <div style={{ minHeight: "100vh", background: T.bg, padding: "0 20px" }}>
      <TopBar title="Créer" onBack={onBack} transparent />
      <div style={{ paddingTop: 20 }}>
        <h2 style={{ fontFamily: T.fontDisplay, fontSize: 22, color: T.text, margin: "0 0 4px" }}>Nouvelle copropriété</h2>
        <p style={{ color: T.textSec, fontSize: 13, margin: "0 0 24px" }}>Créez l'espace de votre copropriété et invitez vos voisins.</p>
        <Input label="Nom de la résidence" icon="🏠" value={name} onChange={setName} placeholder="Résidence Les Tilleuls" />
        <Input label="Adresse" icon="📍" value={address} onChange={setAddress} placeholder="12 rue des Tilleuls, 75011 Paris" />
        <Input label="Nombre de lots" icon="🔢" value={lots} onChange={setLots} placeholder="30" type="number" />
        <Btn full onClick={onCreate} style={{ marginTop: 8 }}>Créer et obtenir le code d'invitation</Btn>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// FORUM
// ═══════════════════════════════════════════════════════════════
function ForumView({ onCompose }) {
  const [messages] = useState(MOCK_MESSAGES);
  const endRef = useRef(null);

  const getUser = id => id === 99 ? ME : MOCK_USERS.find(u => u.id === id);

  return (
    <div style={{ padding: "10px 14px 90px" }}>
      {/* Welcome */}
      <div style={{ background: `linear-gradient(135deg, ${T.primary}10, ${T.primary}05)`, border: `1px solid ${T.primary}25`, borderRadius: T.radius, padding: "12px 14px", marginBottom: 14 }}>
        <p style={{ margin: 0, fontSize: 12.5, color: T.primaryDark, lineHeight: 1.5 }}>
          <strong>🌿 Forum de la Résidence Les Tilleuls</strong><br/>
          Chaque message est reformulé par l'IA pour favoriser des échanges respectueux.
        </p>
      </div>

      {messages.map(msg => {
        const user = getUser(msg.userId);
        const styleInfo = STYLES_MSG.find(s => s.id === msg.style);
        return (
          <div key={msg.id} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
              <Avatar name={user.name} color={user.color} size={34} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3, flexWrap: "wrap" }}>
                  <span style={{ fontWeight: 600, fontSize: 12.5, color: T.text }}>{user.name}</span>
                  <span style={{ fontSize: 10, color: T.textMuted }}>Apt {user.apt} · {msg.time}</span>
                  {styleInfo && <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 20, background: `${styleInfo.color}12`, color: styleInfo.color, fontWeight: 600 }}>{styleInfo.icon} {styleInfo.label}</span>}
                </div>
                <div style={{ background: T.white, borderRadius: "4px 13px 13px 13px", padding: "10px 12px", fontSize: 13, lineHeight: 1.55, color: T.text, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                  {msg.text}
                </div>
                {/* Reactions */}
                <div style={{ display: "flex", gap: 5, marginTop: 5, flexWrap: "wrap", alignItems: "center" }}>
                  {Object.entries(msg.reactions || {}).map(([emoji, users]) => (
                    <button key={emoji} style={{ display: "flex", alignItems: "center", gap: 3, padding: "3px 8px", borderRadius: 20, border: `1px solid ${T.border}`, background: T.white, cursor: "pointer", fontSize: 12 }}>
                      {emoji} <span style={{ fontSize: 11, color: T.textSec, fontWeight: 500 }}>{users.length}</span>
                    </button>
                  ))}
                  {msg.replies > 0 && (
                    <span style={{ fontSize: 11, color: T.primary, fontWeight: 600, cursor: "pointer", marginLeft: 4 }}>
                      💬 {msg.replies} réponse{msg.replies > 1 ? "s" : ""}
                    </span>
                  )}
                  <button style={{ fontSize: 14, background: "none", border: "none", cursor: "pointer", opacity: 0.3, padding: "2px 4px" }}>+</button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={endRef} />

      {/* FAB */}
      <button onClick={onCompose} style={{
        position: "fixed", bottom: 70, right: "calc(50% - 210px)",
        width: 52, height: 52, borderRadius: "50%", border: "none",
        background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`, color: T.white,
        fontSize: 22, cursor: "pointer", boxShadow: `0 4px 16px ${T.primary}60`,
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50,
      }}>✏️</button>
    </div>
  );
}

function ComposeModal({ open, onClose, onSend }) {
  const [draft, setDraft] = useState("");
  const [reformulations, setReformulations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  const reformulate = async () => {
    if (!draft.trim()) return;
    setLoading(true); setReformulations(null);
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          system: `Tu reformules des messages de copropriété en 3 styles. Règlement:\n${REGLEMENT}\n\nRéponds UNIQUEMENT en JSON: {"diplomatique":"...","chaleureux":"...","factuel":"..."}`,
          messages: [{ role: "user", content: draft }],
        }),
      });
      const data = await r.json();
      const text = data.content.filter(b => b.type === "text").map(b => b.text).join("");
      setReformulations(JSON.parse(text.replace(/```json|```/g, "").trim()));
    } catch { setReformulations({ diplomatique: "Chers voisins, " + draft, chaleureux: "Bonjour ! " + draft, factuel: draft }); }
    setLoading(false);
  };

  const handleSend = () => { if (selected && reformulations) { onSend(reformulations[selected], selected); setDraft(""); setReformulations(null); setSelected(null); } };

  return (
    <Modal open={open} onClose={() => { onClose(); setDraft(""); setReformulations(null); setSelected(null); }} title="Nouveau message">
      {/* Original */}
      <Input label="Votre message (brut)" value={draft} onChange={v => { setDraft(v); setReformulations(null); setSelected(null); }} placeholder="Écrivez librement, l'IA reformulera..." multiline rows={3} />

      {!reformulations && (
        <Btn full onClick={reformulate} disabled={loading || !draft.trim()}>
          {loading ? <><TypingDots /> Reformulation...</> : "✨ Reformuler avec l'IA"}
        </Btn>
      )}

      {reformulations && (
        <>
          <p style={{ fontSize: 10, fontWeight: 600, color: T.textSec, textTransform: "uppercase", letterSpacing: "0.04em", margin: "12px 0 8px" }}>Choisissez un style</p>

          {/* Original comparison */}
          <div style={{ background: T.dangerBg, borderRadius: T.radiusSm, padding: "8px 10px", marginBottom: 10, fontSize: 11.5, color: T.danger }}>
            <strong>Votre texte original :</strong> {draft}
          </div>

          {STYLES_MSG.map(style => (
            <div key={style.id} onClick={() => setSelected(style.id)} style={{
              background: selected === style.id ? `${T.primary}08` : T.white,
              border: `2px solid ${selected === style.id ? T.primary : T.border}`,
              borderRadius: T.radius, padding: "11px 13px", marginBottom: 8, cursor: "pointer", transition: "all 0.15s",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
                <span style={{ fontSize: 16 }}>{style.icon}</span>
                <span style={{ fontWeight: 600, fontSize: 12.5, color: T.text }}>{style.label}</span>
                <span style={{ fontSize: 10, color: T.textSec }}>— {style.desc}</span>
                {selected === style.id && <span style={{ marginLeft: "auto", color: T.primary, fontWeight: 700 }}>✓</span>}
              </div>
              <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.5, color: T.text }}>{reformulations[style.id]}</p>
            </div>
          ))}

          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <Btn variant="secondary" onClick={() => { setReformulations(null); setSelected(null); }} style={{ flex: 1 }}>↻ Reformuler</Btn>
            <Btn onClick={handleSend} disabled={!selected} style={{ flex: 2 }}>Envoyer →</Btn>
          </div>
        </>
      )}
    </Modal>
  );
}

// ═══════════════════════════════════════════════════════════════
// AGENDA
// ═══════════════════════════════════════════════════════════════
function AgendaView() {
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const now = new Date("2026-03-23");

  const sorted = [...MOCK_EVENTS].sort((a,b) => new Date(a.date) - new Date(b.date));
  const filtered = filter === "all" ? sorted : sorted.filter(e => e.type === filter);
  const upcoming = filtered.filter(e => new Date(e.date) >= now);
  const past = filtered.filter(e => new Date(e.date) < now);

  const daysUntil = d => { const diff = Math.ceil((new Date(d)-now)/864e5); return diff===0?"Aujourd'hui":diff===1?"Demain":diff<0?`Passé`:diff<=7?`Dans ${diff}j`:diff<=30?`Dans ${Math.ceil(diff/7)} sem.`:`Dans ${Math.ceil(diff/30)} mois`; };

  // Calendar
  const [calMonth, setCalMonth] = useState(2);
  const [calYear, setCalYear] = useState(2026);
  const monthNames = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
  const daysInMonth = new Date(calYear, calMonth+1, 0).getDate();
  const firstDay = (new Date(calYear, calMonth, 1).getDay()+6)%7;
  const cells = [...Array(firstDay).fill(null), ...Array.from({length: daysInMonth}, (_,i) => i+1)];
  const eventsOnDay = d => d ? MOCK_EVENTS.filter(e => { const ed = new Date(e.date); return ed.getDate()===d && ed.getMonth()===calMonth && ed.getFullYear()===calYear; }) : [];

  return (
    <div style={{ padding: "10px 14px 20px" }}>
      {/* Toggle */}
      <div style={{ display: "flex", gap: 3, background: T.border, borderRadius: T.radiusSm, padding: 3, marginBottom: 12 }}>
        {[{id:"list",l:"Liste"},{id:"cal",l:"Calendrier"}].map(m => (
          <button key={m.id} onClick={() => setViewMode(m.id)} style={{ flex: 1, padding: "7px 0", borderRadius: 8, border: "none", background: viewMode===m.id?T.white:"transparent", color: viewMode===m.id?T.text:T.textSec, fontSize: 12, fontWeight: 600, fontFamily: T.font, cursor: "pointer", boxShadow: viewMode===m.id?T.shadow:"none" }}>{m.l}</button>
        ))}
      </div>

      {viewMode === "cal" && (
        <div style={{ background: T.white, borderRadius: T.radius, padding: 14, marginBottom: 14, boxShadow: T.shadow }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <button onClick={() => calMonth===0?(setCalMonth(11),setCalYear(calYear-1)):setCalMonth(calMonth-1)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: T.primary }}>‹</button>
            <span style={{ fontFamily: T.fontDisplay, fontSize: 15, color: T.text }}>{monthNames[calMonth]} {calYear}</span>
            <button onClick={() => calMonth===11?(setCalMonth(0),setCalYear(calYear+1)):setCalMonth(calMonth+1)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: T.primary }}>›</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, textAlign: "center" }}>
            {["L","M","M","J","V","S","D"].map((d,i) => <div key={i} style={{ fontSize: 10, fontWeight: 600, color: T.textMuted, padding: "4px 0" }}>{d}</div>)}
            {cells.map((day,i) => {
              const evts = eventsOnDay(day);
              const isToday = day===23 && calMonth===2 && calYear===2026;
              return (
                <div key={i} style={{ padding: "3px 0", minHeight: 34, display: "flex", flexDirection: "column", alignItems: "center", borderRadius: 8, background: isToday?`${T.primary}10`:"transparent", border: isToday?`1px solid ${T.primary}30`:"1px solid transparent" }}>
                  {day && (<>
                    <span style={{ fontSize: 12, fontWeight: isToday?700:400, color: isToday?T.primary:T.text }}>{day}</span>
                    {evts.length > 0 && <div style={{ display: "flex", gap: 2, marginTop: 1 }}>{evts.slice(0,3).map((e,j) => <div key={j} style={{ width: 4, height: 4, borderRadius: "50%", background: EVENT_TYPES[e.type]?.color }} />)}</div>}
                  </>)}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {viewMode === "list" && (
        <div style={{ display: "flex", gap: 5, overflowX: "auto", paddingBottom: 8, marginBottom: 6 }}>
          {[{id:"all",l:"Tout",i:"📅"}, ...Object.entries(EVENT_TYPES).map(([id,v])=>({id,...v,l:v.label,i:v.icon}))].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{ padding: "5px 10px", borderRadius: 20, border: "none", background: filter===f.id?T.primary:T.white, color: filter===f.id?T.white:T.textSec, fontSize: 10.5, fontWeight: 600, fontFamily: T.font, cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0, boxShadow: filter===f.id?`0 2px 8px ${T.primary}40`:T.shadow }}>{f.i} {f.l}</button>
          ))}
        </div>
      )}

      {(viewMode === "list" ? [...(upcoming.length?[{type:"header",label:`À venir (${upcoming.length})`},...upcoming]:[])] : MOCK_EVENTS.filter(e => { const d=new Date(e.date); return d.getMonth()===calMonth && d.getFullYear()===calYear; }).sort((a,b)=>new Date(a.date)-new Date(b.date))).map((evt,i) => {
        if (evt.type === "header") return <div key={i} style={{ fontSize: 10, fontWeight: 600, color: T.textSec, textTransform: "uppercase", letterSpacing: "0.04em", margin: "8px 0" }}>{evt.label}</div>;
        const t = EVENT_TYPES[evt.type];
        const isExp = expanded === evt.id;
        return (
          <div key={evt.id} onClick={() => setExpanded(isExp?null:evt.id)} style={{ background: T.white, borderRadius: T.radius, marginBottom: 8, border: evt.important?`2px solid ${t.color}30`:`1px solid ${T.border}`, overflow: "hidden", cursor: "pointer", boxShadow: isExp?T.shadowLg:T.shadow, transition: "all 0.2s" }}>
            <div style={{ padding: "10px 12px", display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ minWidth: 44, textAlign: "center", padding: "4px 0", borderRadius: 10, background: `${t.color}10`, flexShrink: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: t.color }}>{new Date(evt.date+"T00:00:00").getDate()}</div>
                <div style={{ fontSize: 9, color: t.color, fontWeight: 600, textTransform: "uppercase" }}>{new Date(evt.date+"T00:00:00").toLocaleDateString("fr-FR",{month:"short"})}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: T.text }}>{evt.title}</span>
                  {evt.important && <span style={{ fontSize: 8, fontWeight: 700, background: t.color, color: T.white, padding: "1px 5px", borderRadius: 8 }}>IMPORTANT</span>}
                </div>
                <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 20, background: `${t.color}10`, color: t.color, fontWeight: 600 }}>{t.icon} {t.label}</span>
                  <span style={{ fontSize: 10, color: T.textMuted }}>{daysUntil(evt.date)}</span>
                  {evt.time && <span style={{ fontSize: 10, color: T.textMuted }}>⏰ {evt.time}</span>}
                </div>
              </div>
            </div>
            {isExp && (
              <div style={{ padding: "0 12px 12px", borderTop: `1px solid ${T.border}`, paddingTop: 10 }}>
                <p style={{ margin: "0 0 6px", fontSize: 12.5, lineHeight: 1.5, color: T.text }}>{evt.desc}</p>
                {evt.location && <div style={{ fontSize: 11, color: T.textSec, marginBottom: 8 }}>📍 {evt.location}</div>}
                {evt.rsvp && (
                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    {[{l:"Présent",e:"✅",k:"yes"},{l:"Peut-être",e:"🤔",k:"maybe"},{l:"Absent",e:"❌",k:"no"}].map(r => (
                      <button key={r.k} style={{ flex: 1, padding: "8px", borderRadius: T.radiusSm, border: `1px solid ${T.border}`, background: T.white, cursor: "pointer", fontFamily: T.font, fontSize: 11, fontWeight: 500, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                        <span>{r.e}</span> {r.l}
                        <span style={{ fontSize: 10, color: T.textMuted }}>{evt.rsvp[r.k].length}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DOCUMENTS
// ═══════════════════════════════════════════════════════════════
function DocsView() {
  const [openCat, setOpenCat] = useState(null);
  const [search, setSearch] = useState("");
  const totalNew = DOC_CATS.reduce((s,c) => s + c.docs.filter(d => d.isNew).length, 0);
  const filtered = search.trim() ? DOC_CATS.map(c => ({...c, docs: c.docs.filter(d => d.name.toLowerCase().includes(search.toLowerCase()))})).filter(c => c.docs.length) : DOC_CATS;
  const typeIcon = t => t==="pdf"?"📄":t==="xlsx"?"📊":"📎";

  return (
    <div style={{ padding: "10px 14px 20px" }}>
      <div style={{ position: "relative", marginBottom: 12 }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, opacity: 0.4 }}>🔍</span>
        <input value={search} onChange={e => {setSearch(e.target.value);setOpenCat(null);}} placeholder="Rechercher un document..." style={{ width: "100%", padding: "9px 12px 9px 34px", borderRadius: T.radiusSm, border: `2px solid ${T.border}`, background: T.white, fontSize: 13, fontFamily: T.font, outline: "none", boxSizing: "border-box" }} />
      </div>

      {!search && (
        <div style={{ display: "flex", gap: 7, marginBottom: 12 }}>
          {[{n:DOC_CATS.reduce((s,c)=>s+c.docs.length,0),l:"Documents",i:"📁"},{n:DOC_CATS.length,l:"Catégories",i:"🗂️"},{n:totalNew,l:"Nouveaux",i:"🆕"}].map((s,i) => (
            <div key={i} style={{ flex: 1, background: T.white, borderRadius: T.radius, padding: "8px", textAlign: "center", boxShadow: T.shadow }}>
              <div style={{ fontSize: 16 }}>{s.i}</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: T.text }}>{s.n}</div>
              <div style={{ fontSize: 9, color: T.textSec }}>{s.l}</div>
            </div>
          ))}
        </div>
      )}

      {filtered.map(cat => {
        const isOpen = openCat===cat.id || !!search;
        const newC = cat.docs.filter(d => d.isNew).length;
        return (
          <div key={cat.id} style={{ background: T.white, borderRadius: T.radius, marginBottom: 8, overflow: "hidden", boxShadow: T.shadow, border: isOpen?`1px solid ${cat.color}25`:`1px solid ${T.border}` }}>
            <div onClick={() => !search && setOpenCat(isOpen?null:cat.id)} style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: 10, cursor: search?"default":"pointer" }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${cat.color}10`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>{cat.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 12.5, color: T.text, display: "flex", alignItems: "center", gap: 4 }}>
                  {cat.label}
                  {newC > 0 && <span style={{ fontSize: 8, fontWeight: 700, background: cat.color, color: T.white, padding: "1px 5px", borderRadius: 8 }}>{newC}</span>}
                </div>
                <div style={{ fontSize: 10.5, color: T.textSec }}>{cat.docs.length} document{cat.docs.length>1?"s":""}</div>
              </div>
              {!search && <span style={{ fontSize: 11, color: T.textMuted, transition: "transform 0.2s", transform: isOpen?"rotate(180deg)":"rotate(0)" }}>▼</span>}
            </div>
            {isOpen && (
              <div style={{ borderTop: `1px solid ${T.border}` }}>
                {cat.docs.map((doc,i) => (
                  <div key={i} style={{ padding: "8px 12px 8px 58px", display: "flex", alignItems: "center", gap: 8, borderBottom: i<cat.docs.length-1?`1px solid ${T.bg}`:"none", cursor: "pointer" }}>
                    <span style={{ fontSize: 15 }}>{typeIcon(doc.type)}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: T.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "flex", alignItems: "center", gap: 5 }}>
                        {doc.name}
                        {doc.isNew && <span style={{ fontSize: 8, background: "#EC4899", color: T.white, padding: "1px 4px", borderRadius: 6, fontWeight: 700 }}>NEW</span>}
                      </div>
                      <div style={{ fontSize: 9.5, color: T.textMuted }}>{new Date(doc.date).toLocaleDateString("fr-FR")} · {doc.size}</div>
                    </div>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: T.textSec }}>↓</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SYNDIC VIRTUEL
// ═══════════════════════════════════════════════════════════════
function SyndicView() {
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [history]);

  const ask = async () => {
    if (!query.trim()) return;
    const q = query; setHistory(h => [...h, { role: "user", text: q }]); setQuery(""); setLoading(true);
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          system: `Tu es le Syndic Virtuel de la Résidence Les Tilleuls. Règlement:\n${REGLEMENT}\n\nRéponds avec bienveillance, cite les articles, suggère la médiation, rappelle que c'est informatif.`,
          messages: history.concat([{role:"user",text:q}]).map(m => ({role:m.role==="user"?"user":"assistant",content:m.text})),
        }),
      });
      const data = await r.json();
      setHistory(h => [...h, { role: "assistant", text: data.content.filter(b=>b.type==="text").map(b=>b.text).join("") }]);
    } catch { setHistory(h => [...h, { role: "assistant", text: "Désolé, problème technique." }]); }
    setLoading(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 110px)" }}>
      <div style={{ flex: 1, overflow: "auto", padding: "12px 14px" }}>
        {history.length === 0 && (
          <div style={{ textAlign: "center", padding: "28px 20px" }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>⚖️</div>
            <h3 style={{ fontFamily: T.fontDisplay, fontSize: 18, color: T.text, margin: "0 0 4px" }}>Syndic Virtuel</h3>
            <p style={{ fontSize: 12, color: T.textSec, lineHeight: 1.5, maxWidth: 260, margin: "0 auto 16px" }}>Questions sur le règlement ou la loi ? Réponse immédiate et bienveillante.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {["Mon voisin fait des travaux le dimanche, c'est autorisé ?", "Puis-je installer un barbecue sur mon balcon ?", "Comment contester une décision d'AG ?", "Quelles sont les règles pour les animaux ?"].map((q,i) => (
                <button key={i} onClick={() => setQuery(q)} style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: T.radiusSm, padding: "8px 12px", fontSize: 12, color: T.text, cursor: "pointer", fontFamily: T.font, textAlign: "left", lineHeight: 1.4 }}>💡 {q}</button>
              ))}
            </div>
            <p style={{ fontSize: 9, color: T.textMuted, marginTop: 14 }}>ℹ️ Informatif uniquement. Ne remplace pas un avis juridique professionnel.</p>
          </div>
        )}

        {history.map((msg,i) => (
          <div key={i} style={{ display: "flex", justifyContent: msg.role==="user"?"flex-end":"flex-start", marginBottom: 10 }}>
            {msg.role !== "user" && <Avatar name="SV" color={T.primary} size={28} style={{ marginRight: 7, marginTop: 2 }} />}
            <div style={{ maxWidth: "80%", background: msg.role==="user"?T.primary:T.white, color: msg.role==="user"?T.white:T.text, borderRadius: msg.role==="user"?"13px 13px 4px 13px":"4px 13px 13px 13px", padding: "10px 12px", fontSize: 12.5, lineHeight: 1.6, boxShadow: T.shadow, whiteSpace: "pre-wrap" }}>{msg.text}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
            <Avatar name="SV" color={T.primary} size={28} />
            <div style={{ background: T.white, borderRadius: "4px 13px 13px 13px", padding: "10px 12px", boxShadow: T.shadow }}><TypingDots /></div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div style={{ padding: "8px 14px 10px", background: T.white, borderTop: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", gap: 7 }}>
          <textarea value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); ask(); } }} placeholder="Posez votre question..." rows={1} style={{ flex: 1, padding: "9px 12px", borderRadius: T.radiusSm, border: `2px solid ${T.border}`, background: T.bg, fontSize: 13, fontFamily: T.font, resize: "none", outline: "none", maxHeight: 80 }} />
          <button onClick={ask} disabled={loading || !query.trim()} style={{ width: 38, height: 38, borderRadius: "50%", border: "none", background: query.trim()?`linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`:T.border, color: T.white, fontSize: 16, cursor: query.trim()?"pointer":"not-allowed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>↑</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MORE MENU / PROFILE / MEMBERS / NOTIFICATIONS / SETTINGS
// ═══════════════════════════════════════════════════════════════
function MoreMenu({ onNavigate, unread }) {
  const items = [
    { id: "mediation", icon: "🕊️", label: "Médiation CNV", desc: "Résoudre un différend avec un voisin", highlight: true },
    { id: "profile", icon: "👤", label: "Mon profil", desc: "Modifier vos informations" },
    { id: "members", icon: "👥", label: "Annuaire des résidents", desc: `${MOCK_USERS.length} copropriétaires` },
    { id: "notifications", icon: "🔔", label: "Notifications", desc: unread > 0 ? `${unread} non lues` : "Tout est lu", badge: unread },
    { id: "reglement", icon: "📜", label: "Règlement", desc: "Consulter le règlement complet" },
    { id: "settings", icon: "⚙️", label: "Paramètres", desc: "Notifications, langue, apparence" },
    { id: "help", icon: "❓", label: "Aide & Contact", desc: "FAQ, support technique" },
  ];

  return (
    <div style={{ padding: "10px 14px 20px" }}>
      {/* Copro info */}
      <div style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`, borderRadius: T.radiusLg, padding: "16px", marginBottom: 16, color: T.white }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🏡</div>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontFamily: T.fontDisplay }}>Résidence Les Tilleuls</h3>
            <p style={{ margin: "2px 0 0", fontSize: 11, opacity: 0.8 }}>12 rue des Tilleuls · 30 lots</p>
            <p style={{ margin: "2px 0 0", fontSize: 10, opacity: 0.6 }}>Code : TILLEULS-2026</p>
          </div>
        </div>
      </div>

      {/* Menu items */}
      {items.map(item => (
        <div key={item.id} onClick={() => onNavigate(item.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: `1px solid ${T.border}`, cursor: "pointer", ...(item.highlight ? { background: `linear-gradient(135deg, ${T.accent}08, ${T.accent}03)`, margin: "0 -14px", padding: "12px 14px", borderRadius: T.radius, border: `1px solid ${T.accent}25`, marginBottom: 4 } : {}) }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: item.highlight ? `${T.accent}18` : T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>{item.icon}</div>
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: item.highlight ? T.accent : T.text }}>{item.label}</span>
            <p style={{ margin: 0, fontSize: 11, color: T.textSec }}>{item.desc}</p>
          </div>
          {item.badge > 0 && <span style={{ background: T.danger, color: T.white, fontSize: 10, fontWeight: 700, borderRadius: 10, padding: "2px 7px" }}>{item.badge}</span>}
          <span style={{ color: T.textMuted, fontSize: 14 }}>›</span>
        </div>
      ))}

      <button onClick={() => onNavigate("logout")} style={{ width: "100%", marginTop: 20, padding: "12px", borderRadius: T.radius, border: `1px solid ${T.danger}30`, background: T.dangerBg, color: T.danger, fontSize: 13, fontWeight: 600, fontFamily: T.font, cursor: "pointer" }}>Se déconnecter</button>
    </div>
  );
}

function ProfileView({ onBack }) {
  return (
    <div style={{ minHeight: "100vh", background: T.bg }}>
      <TopBar title="Mon profil" onBack={onBack} />
      <div style={{ padding: "20px 16px" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Avatar name={ME.name} color={ME.color} size={72} style={{ margin: "0 auto 10px" }} />
          <h2 style={{ fontFamily: T.fontDisplay, fontSize: 20, margin: "0 0 2px" }}>Vous</h2>
          <p style={{ color: T.textSec, fontSize: 13, margin: 0 }}>Appartement {ME.apt} · Copropriétaire</p>
        </div>
        <div style={{ background: T.white, borderRadius: T.radius, padding: 16, boxShadow: T.shadow }}>
          {[{l:"Nom",v:"(à compléter)"},{l:"Email",v:"vous@email.com"},{l:"Téléphone",v:"(optionnel)"},{l:"Appartement",v:"4A"},{l:"Étage",v:"4ème"},{l:"Lot n°",v:"42"}].map((f,i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: i<5?`1px solid ${T.bg}`:"none" }}>
              <span style={{ fontSize: 13, color: T.textSec }}>{f.l}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{f.v}</span>
            </div>
          ))}
        </div>
        <Btn full variant="secondary" style={{ marginTop: 14 }}>✏️ Modifier mon profil</Btn>
      </div>
    </div>
  );
}

function MembersView({ onBack }) {
  const roles = { president: "Président CS", conseil: "Conseil syndical", member: "Copropriétaire" };
  return (
    <div style={{ minHeight: "100vh", background: T.bg }}>
      <TopBar title="Annuaire" subtitle={`${MOCK_USERS.length} résidents`} onBack={onBack} />
      <div style={{ padding: "10px 14px" }}>
        {MOCK_USERS.map(u => (
          <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${T.border}` }}>
            <Avatar name={u.name} color={u.color} size={40} />
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{u.name}</span>
              <p style={{ margin: 0, fontSize: 11, color: T.textSec }}>Apt {u.apt} · {roles[u.role]}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotificationsView({ onBack }) {
  const [notifs, setNotifs] = useState(MOCK_NOTIFS);
  return (
    <div style={{ minHeight: "100vh", background: T.bg }}>
      <TopBar title="Notifications" onBack={onBack} right={<button onClick={() => setNotifs(n => n.map(x => ({...x, read: true})))} style={{ background: "none", border: "none", color: T.primary, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: T.font }}>Tout lire</button>} />
      <div style={{ padding: "6px 14px" }}>
        {notifs.map(n => (
          <div key={n.id} style={{ display: "flex", gap: 10, padding: "12px 0", borderBottom: `1px solid ${T.border}`, opacity: n.read ? 0.6 : 1 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: n.read ? T.bg : `${T.primary}10`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{n.icon}</div>
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 13, color: T.text, fontWeight: n.read ? 400 : 600, lineHeight: 1.4 }}>{n.text}</p>
              <span style={{ fontSize: 11, color: T.textMuted }}>{n.time}</span>
            </div>
            {!n.read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.primary, marginTop: 6, flexShrink: 0 }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsView({ onBack }) {
  const [notifForum, setNotifForum] = useState(true);
  const [notifEvents, setNotifEvents] = useState(true);
  const [notifDocs, setNotifDocs] = useState(true);

  const Toggle = ({ on, onToggle }) => (
    <div onClick={onToggle} style={{ width: 44, height: 24, borderRadius: 12, background: on ? T.primary : T.border, cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
      <div style={{ width: 20, height: 20, borderRadius: "50%", background: T.white, position: "absolute", top: 2, left: on ? 22 : 2, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: T.bg }}>
      <TopBar title="Paramètres" onBack={onBack} />
      <div style={{ padding: "14px 16px" }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: T.textSec, textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 8px" }}>Notifications</p>
        <div style={{ background: T.white, borderRadius: T.radius, overflow: "hidden", boxShadow: T.shadow }}>
          {[{l:"Messages du forum",on:notifForum,set:()=>setNotifForum(!notifForum)},{l:"Événements agenda",on:notifEvents,set:()=>setNotifEvents(!notifEvents)},{l:"Nouveaux documents",on:notifDocs,set:()=>setNotifDocs(!notifDocs)}].map((s,i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderBottom: i<2?`1px solid ${T.bg}`:"none" }}>
              <span style={{ fontSize: 13, color: T.text }}>{s.l}</span>
              <Toggle on={s.on} onToggle={s.set} />
            </div>
          ))}
        </div>

        <p style={{ fontSize: 11, fontWeight: 600, color: T.textSec, textTransform: "uppercase", letterSpacing: "0.04em", margin: "20px 0 8px" }}>À propos</p>
        <div style={{ background: T.white, borderRadius: T.radius, overflow: "hidden", boxShadow: T.shadow }}>
          {["Conditions d'utilisation","Politique de confidentialité","Licences open source","Version 1.0.0"].map((l,i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px", borderBottom: i<3?`1px solid ${T.bg}`:"none", cursor: "pointer" }}>
              <span style={{ fontSize: 13, color: T.text }}>{l}</span>
              <span style={{ color: T.textMuted }}>›</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReglementView({ onBack }) {
  return (
    <div style={{ minHeight: "100vh", background: T.bg }}>
      <TopBar title="Règlement" onBack={onBack} />
      <div style={{ padding: "14px 16px" }}>
        {REGLEMENT.split("\n").filter(l => l.trim()).map((line, i) => {
          const isTitle = line.startsWith("RÈGLEMENT");
          const isArticle = line.startsWith("Article");
          return (
            <p key={i} style={{
              margin: isTitle ? "0 0 16px" : isArticle ? "14px 0 4px" : "0 0 8px",
              fontSize: isTitle ? 15 : isArticle ? 13 : 12.5,
              fontWeight: isTitle || isArticle ? 700 : 400,
              fontFamily: isTitle ? T.fontDisplay : T.font,
              color: isTitle ? T.primary : isArticle ? T.primaryDark : T.text,
              lineHeight: 1.55,
            }}>{line}</p>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MÉDIATION CNV (Communication Non Violente)
// ═══════════════════════════════════════════════════════════════
const CNV_STEPS = [
  { id: "observation", icon: "👁️", label: "Observation", color: "#2980B9", desc: "Les faits, sans jugement" },
  { id: "sentiment", icon: "💚", label: "Sentiment", color: "#27AE60", desc: "Ce que je ressens" },
  { id: "besoin", icon: "🌱", label: "Besoin", color: "#E67E22", desc: "Mon besoin non satisfait" },
  { id: "demande", icon: "🤲", label: "Demande", color: "#8E44AD", desc: "Ma demande concrète" },
];

const MOCK_MEDIATIONS = [
  { id: 1, withUser: 2, subject: "Bruit de travaux le samedi matin", status: "active", lastMessage: "Il y a 2h", unread: 1, created: "20 mars 2026" },
  { id: 2, withUser: 5, subject: "Place de parking occupée", status: "resolved", lastMessage: "Il y a 5j", unread: 0, created: "12 mars 2026" },
];

function MediationListView({ onBack, onNewMediation, onOpenMediation }) {
  return (
    <div style={{ minHeight: "100vh", background: T.bg }}>
      <TopBar title="Médiation CNV" subtitle="Résolution bienveillante des conflits" onBack={onBack} />
      <div style={{ padding: "14px 16px" }}>

        {/* CNV Explainer */}
        <div style={{ background: `linear-gradient(135deg, ${T.accent}12, ${T.accent}05)`, border: `1px solid ${T.accent}25`, borderRadius: T.radiusLg, padding: "16px", marginBottom: 16 }}>
          <h4 style={{ margin: "0 0 8px", fontSize: 14, color: T.accent, fontFamily: T.fontDisplay }}>🕊️ Comment fonctionne la médiation ?</h4>
          <p style={{ margin: "0 0 10px", fontSize: 12, color: T.text, lineHeight: 1.55 }}>
            Chaque message passe par un interpréteur de Communication Non Violente (CNV). L'IA restructure vos propos selon 4 étapes pour favoriser l'écoute et la compréhension mutuelle.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {CNV_STEPS.map(s => (
              <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 8px", borderRadius: 8, background: T.white }}>
                <span style={{ fontSize: 14 }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: s.color }}>{s.label}</div>
                  <div style={{ fontSize: 9.5, color: T.textSec }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Btn full variant="accent" onClick={onNewMediation} style={{ marginBottom: 16 }}>🕊️ Demander une médiation</Btn>

        {/* Active mediations */}
        {MOCK_MEDIATIONS.filter(m => m.status === "active").length > 0 && (
          <>
            <p style={{ fontSize: 10, fontWeight: 600, color: T.textSec, textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 8px" }}>Médiations en cours</p>
            {MOCK_MEDIATIONS.filter(m => m.status === "active").map(med => {
              const other = MOCK_USERS.find(u => u.id === med.withUser);
              return (
                <div key={med.id} onClick={() => onOpenMediation(med)} style={{ background: T.white, borderRadius: T.radius, padding: "12px 14px", marginBottom: 8, boxShadow: T.shadow, cursor: "pointer", border: `1px solid ${T.accent}20` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar name={other.name} color={other.color} size={40} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{other.name}</span>
                        <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 10, background: `${T.accent}15`, color: T.accent, fontWeight: 600 }}>En cours</span>
                        {med.unread > 0 && <span style={{ marginLeft: "auto", width: 18, height: 18, borderRadius: "50%", background: T.accent, color: T.white, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{med.unread}</span>}
                      </div>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: T.textSec }}>{med.subject}</p>
                      <span style={{ fontSize: 10, color: T.textMuted }}>{med.lastMessage}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {/* Resolved */}
        {MOCK_MEDIATIONS.filter(m => m.status === "resolved").length > 0 && (
          <>
            <p style={{ fontSize: 10, fontWeight: 600, color: T.textSec, textTransform: "uppercase", letterSpacing: "0.04em", margin: "16px 0 8px" }}>Résolues</p>
            {MOCK_MEDIATIONS.filter(m => m.status === "resolved").map(med => {
              const other = MOCK_USERS.find(u => u.id === med.withUser);
              return (
                <div key={med.id} style={{ background: T.white, borderRadius: T.radius, padding: "12px 14px", marginBottom: 8, boxShadow: T.shadow, opacity: 0.6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar name={other.name} color={other.color} size={40} />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{other.name}</span>
                        <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 10, background: T.successBg, color: T.success, fontWeight: 600 }}>✓ Résolue</span>
                      </div>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: T.textSec }}>{med.subject}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}

function NewMediationView({ onBack, onCreate }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div style={{ minHeight: "100vh", background: T.bg }}>
      <TopBar title="Nouvelle médiation" onBack={onBack} />
      <div style={{ padding: "14px 16px" }}>
        <div style={{ background: `${T.primary}08`, border: `1px solid ${T.primary}20`, borderRadius: T.radius, padding: "12px 14px", marginBottom: 16 }}>
          <p style={{ margin: 0, fontSize: 12, color: T.primaryDark, lineHeight: 1.5 }}>
            <strong>🕊️ La médiation est confidentielle.</strong> Seuls vous, votre voisin et le médiateur IA ont accès à la conversation. Chaque message est reformulé en CNV avant d'être transmis.
          </p>
        </div>

        <p style={{ fontSize: 10, fontWeight: 600, color: T.textSec, textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 8px" }}>Avec qui souhaitez-vous médier ?</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
          {MOCK_USERS.map(u => (
            <div key={u.id} onClick={() => setSelectedUser(u.id)} style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
              borderRadius: T.radiusSm, cursor: "pointer",
              background: selectedUser === u.id ? `${T.primary}08` : T.white,
              border: `2px solid ${selectedUser === u.id ? T.primary : T.border}`,
              transition: "all 0.15s",
            }}>
              <Avatar name={u.name} color={u.color} size={34} />
              <div>
                <span style={{ fontSize: 13, fontWeight: 500, color: T.text }}>{u.name}</span>
                <span style={{ fontSize: 11, color: T.textSec, marginLeft: 6 }}>Apt {u.apt}</span>
              </div>
              {selectedUser === u.id && <span style={{ marginLeft: "auto", color: T.primary, fontWeight: 700 }}>✓</span>}
            </div>
          ))}
        </div>

        <Input label="Sujet de la médiation" value={subject} onChange={setSubject} placeholder="Ex: Bruit le week-end, place de parking..." />
        <Input label="Décrivez la situation (confidentiel)" value={description} onChange={setDescription} placeholder="Expliquez ce qui s'est passé, depuis quand, comment ça vous affecte..." multiline rows={4} />

        <Btn full variant="accent" onClick={() => onCreate && onCreate({ userId: selectedUser, subject, description })} disabled={!selectedUser || !subject.trim()} style={{ marginTop: 8 }}>
          🕊️ Envoyer la demande de médiation
        </Btn>

        <p style={{ textAlign: "center", fontSize: 10, color: T.textMuted, marginTop: 12, lineHeight: 1.5 }}>
          Votre voisin recevra une invitation à participer à la médiation. Il pourra accepter ou décliner.
        </p>
      </div>
    </div>
  );
}

function MediationChatView({ onBack, mediation }) {
  const other = MOCK_USERS.find(u => u.id === mediation.withUser);
  const [input, setInput] = useState("");
  const [cnvResult, setCnvResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState([
    { id: 0, role: "mediator", text: `Bienvenue dans cet espace de médiation entre vous et ${other.name}.\n\nJe suis votre médiateur IA. Mon rôle est de faciliter le dialogue en traduisant chaque message en Communication Non Violente (CNV).\n\n🔒 Cet espace est confidentiel.\n📝 Chaque message sera reformulé selon les 4 étapes de la CNV avant d'être transmis.\n✅ Vous devez valider la reformulation avant envoi.\n\nSujet : "${mediation.subject}"\n\nQuand vous êtes prêt(e), exprimez ce que vous ressentez concernant cette situation.` },
  ]);
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, cnvResult]);

  const processCNV = async () => {
    if (!input.trim()) return;
    setIsProcessing(true); setCnvResult(null);
    const original = input;
    setInput("");
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          system: `Tu es un médiateur expert en Communication Non Violente (CNV) de Marshall Rosenberg. Tu interviens dans un conflit de voisinage en copropriété.

Contexte du conflit : "${mediation.subject}"

L'utilisateur va t'envoyer un message brut destiné à son voisin ${other.name} (Apt ${other.apt}).

Tu dois reformuler ce message en suivant STRICTEMENT les 4 étapes de la CNV :
1. OBSERVATION : les faits concrets, sans jugement ni interprétation
2. SENTIMENT : l'émotion ressentie (pas "je me sens jugé" qui est une interprétation, mais "je me sens triste/frustré/inquiet")
3. BESOIN : le besoin fondamental non satisfait (tranquillité, respect, coopération, harmonie...)
4. DEMANDE : une demande concrète, positive, réalisable, négociable

Règles :
- Préserve le fond du message original
- Élimine tout jugement, accusation, généralisation ("toujours", "jamais")
- Transforme les "tu" accusateurs en "je" expressifs
- La demande doit être formulée positivement (ce que la personne veut, pas ce qu'elle ne veut pas)

IMPORTANT: Réponds UNIQUEMENT en JSON valide sans backticks :
{"observation":"...","sentiment":"...","besoin":"...","demande":"...","complet":"Le message complet reformulé en un seul paragraphe fluide intégrant les 4 étapes"}`,
          messages: [{ role: "user", content: original }],
        }),
      });
      const data = await r.json();
      const text = data.content.filter(b => b.type === "text").map(b => b.text).join("");
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setCnvResult({ original, ...parsed });
    } catch {
      setCnvResult({
        original,
        observation: "Quand j'observe cette situation...",
        sentiment: "Je me sens préoccupé(e)...",
        besoin: "Car j'ai besoin de tranquillité...",
        demande: "Serait-il possible d'en discuter ensemble ?",
        complet: "Quand j'observe cette situation, je me sens préoccupé(e), car j'ai besoin de tranquillité. Serait-il possible d'en discuter ensemble ?",
      });
    }
    setIsProcessing(false);
  };

  const sendCNV = () => {
    if (!cnvResult) return;
    setMessages(m => [...m,
      { id: m.length, role: "user", text: cnvResult.complet, original: cnvResult.original, cnv: cnvResult },
    ]);
    setCnvResult(null);
    // Simulate mediator follow-up
    setTimeout(() => {
      setMessages(m => [...m,
        { id: m.length, role: "mediator", text: `Merci pour cette expression. Votre message a été transmis à ${other.name} dans sa forme CNV.\n\nJe note que votre besoin principal est lié à : ${cnvResult.besoin.toLowerCase()}\n\nAttendons la réponse de ${other.name} pour continuer le dialogue.` },
      ]);
    }, 1500);
  };

  const rejectCNV = () => {
    setInput(cnvResult.original);
    setCnvResult(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ background: T.white, borderBottom: `1px solid ${T.border}`, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, position: "sticky", top: 0, zIndex: 100 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: T.text }}>←</button>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${T.accent}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🕊️</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Médiation avec {other.name}</div>
          <div style={{ fontSize: 10, color: T.accent, fontWeight: 500 }}>🔒 Confidentiel · Filtre CNV actif</div>
        </div>
        <Avatar name={other.name} color={other.color} size={30} />
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: "auto", padding: "12px 14px" }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ marginBottom: 14 }}>
            {msg.role === "mediator" ? (
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, marginTop: 2 }}>🕊️</div>
                <div style={{ background: `${T.accent}08`, border: `1px solid ${T.accent}18`, borderRadius: "4px 14px 14px 14px", padding: "10px 12px", maxWidth: "85%", fontSize: 12.5, lineHeight: 1.6, color: T.text, whiteSpace: "pre-wrap" }}>{msg.text}</div>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <div style={{ maxWidth: "85%" }}>
                    <div style={{ background: T.primary, color: T.white, borderRadius: "14px 14px 4px 14px", padding: "10px 12px", fontSize: 12.5, lineHeight: 1.6 }}>{msg.text}</div>
                    {msg.cnv && (
                      <div style={{ marginTop: 4, padding: "6px 10px", background: `${T.primary}06`, borderRadius: 8, border: `1px dashed ${T.primary}20` }}>
                        <div style={{ fontSize: 9, color: T.textMuted, marginBottom: 3 }}>Votre message original :</div>
                        <div style={{ fontSize: 11, color: T.textSec, fontStyle: "italic" }}>« {msg.original} »</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {isProcessing && (
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: T.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>🕊️</div>
            <div style={{ background: `${T.accent}08`, border: `1px solid ${T.accent}18`, borderRadius: "4px 14px 14px 14px", padding: "10px 12px" }}>
              <div style={{ fontSize: 11, color: T.accent, fontWeight: 600, marginBottom: 4 }}>Reformulation CNV en cours...</div>
              <TypingDots />
            </div>
          </div>
        )}

        {/* CNV Preview Card */}
        {cnvResult && (
          <div style={{ background: T.white, borderRadius: T.radiusLg, boxShadow: T.shadowLg, overflow: "hidden", marginBottom: 14, border: `2px solid ${T.accent}30` }}>
            <div style={{ background: `linear-gradient(135deg, ${T.accent}15, ${T.accent}08)`, padding: "10px 14px", borderBottom: `1px solid ${T.accent}20` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.accent }}>🕊️ Reformulation CNV de votre message</div>
              <div style={{ fontSize: 10, color: T.textSec, marginTop: 2 }}>Vérifiez et validez avant envoi à {other.name}</div>
            </div>

            {/* Original */}
            <div style={{ padding: "10px 14px", background: `${T.danger}05`, borderBottom: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 9, fontWeight: 600, color: T.danger, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 3 }}>Votre message original</div>
              <div style={{ fontSize: 12, color: T.text, fontStyle: "italic" }}>« {cnvResult.original} »</div>
            </div>

            {/* 4 CNV Steps */}
            <div style={{ padding: "10px 14px" }}>
              {CNV_STEPS.map(step => (
                <div key={step.id} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: `${step.color}12`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>{step.icon}</div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: step.color, textTransform: "uppercase", letterSpacing: "0.03em" }}>{step.label}</div>
                    <div style={{ fontSize: 12, color: T.text, lineHeight: 1.5 }}>{cnvResult[step.id]}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Final message */}
            <div style={{ padding: "10px 14px", background: `${T.success}06`, borderTop: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 9, fontWeight: 600, color: T.success, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 3 }}>Message qui sera transmis</div>
              <div style={{ fontSize: 13, color: T.text, lineHeight: 1.55, fontWeight: 500 }}>{cnvResult.complet}</div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 8, padding: "10px 14px" }}>
              <Btn variant="secondary" small onClick={rejectCNV} style={{ flex: 1 }}>✏️ Modifier</Btn>
              <Btn variant="accent" small onClick={sendCNV} style={{ flex: 2 }}>✓ Valider et envoyer</Btn>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      {/* Input */}
      {!cnvResult && (
        <div style={{ padding: "8px 14px 10px", background: T.white, borderTop: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 10, color: T.accent, fontWeight: 500, marginBottom: 5, textAlign: "center" }}>🕊️ Votre message sera reformulé en CNV avant envoi</div>
          <div style={{ display: "flex", gap: 7 }}>
            <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); processCNV(); } }} placeholder="Exprimez-vous librement..." rows={1} style={{ flex: 1, padding: "9px 12px", borderRadius: T.radiusSm, border: `2px solid ${T.border}`, background: T.bg, fontSize: 13, fontFamily: T.font, resize: "none", outline: "none", maxHeight: 80 }} />
            <button onClick={processCNV} disabled={isProcessing || !input.trim()} style={{ width: 38, height: 38, borderRadius: "50%", border: "none", background: input.trim() ? `linear-gradient(135deg, ${T.accent}, #B8862F)` : T.border, color: T.white, fontSize: 16, cursor: input.trim() ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>↑</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
export default function VoisinSerein() {
  const [screen, setScreen] = useState("welcome");
  const [tab, setTab] = useState("forum");
  const [composerOpen, setComposerOpen] = useState(false);
  const [activeMediation, setActiveMediation] = useState(null);
  const unread = MOCK_NOTIFS.filter(n => !n.read).length;

  const goMain = () => setScreen("main");

  // Subpages from More menu
  const handleMoreNav = id => {
    if (id === "logout") setScreen("welcome");
    else if (id === "mediation") setScreen("mediationList");
    else if (["profile","members","notifications","settings","reglement","help"].includes(id)) setScreen(id);
  };

  return (
    <div style={{ fontFamily: T.font, background: T.bg, minHeight: "100vh", maxWidth: 480, margin: "0 auto", position: "relative" }}>
      <link href={FONTS_URL} rel="stylesheet" />

      {screen === "welcome" && <WelcomeScreen onLogin={() => setScreen("login")} onRegister={() => setScreen("register")} />}
      {screen === "login" && <LoginScreen onBack={() => setScreen("welcome")} onLogin={goMain} onForgot={() => setScreen("forgot")} onRegister={() => setScreen("register")} />}
      {screen === "register" && <RegisterScreen onBack={() => setScreen("welcome")} onRegister={() => setScreen("onboarding")} />}
      {screen === "forgot" && <ForgotScreen onBack={() => setScreen("login")} />}
      {screen === "onboarding" && <OnboardingScreen onJoinCopro={() => setScreen("joinCopro")} onCreateCopro={() => setScreen("createCopro")} />}
      {screen === "joinCopro" && <JoinCoproScreen onBack={() => setScreen("onboarding")} onJoin={goMain} />}
      {screen === "createCopro" && <CreateCoproScreen onBack={() => setScreen("onboarding")} onCreate={goMain} />}

      {screen === "profile" && <ProfileView onBack={() => setScreen("main")} />}
      {screen === "members" && <MembersView onBack={() => setScreen("main")} />}
      {screen === "notifications" && <NotificationsView onBack={() => setScreen("main")} />}
      {screen === "settings" && <SettingsView onBack={() => setScreen("main")} />}
      {screen === "reglement" && <ReglementView onBack={() => setScreen("main")} />}

      {screen === "mediationList" && <MediationListView onBack={() => setScreen("main")} onNewMediation={() => setScreen("newMediation")} onOpenMediation={id => { setActiveMediation(id); setScreen("mediationChat"); }} />}
      {screen === "newMediation" && <NewMediationView onBack={() => setScreen("mediationList")} onCreate={() => { setActiveMediation(1); setScreen("mediationChat"); }} />}
      {screen === "mediationChat" && activeMediation && <MediationConversation mediationId={activeMediation} onBack={() => setScreen("mediationList")} />}

      {screen === "main" && (
        <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          {/* Header */}
          <div style={{ background: `linear-gradient(135deg, ${T.primary}, ${T.primaryDark})`, padding: "14px 16px 10px", color: T.white, position: "sticky", top: 0, zIndex: 100, boxShadow: `0 4px 20px ${T.primary}30` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h1 style={{ fontFamily: T.fontDisplay, fontSize: 19, margin: 0 }}>VoisinSerein</h1>
                <p style={{ margin: "1px 0 0", fontSize: 10.5, opacity: 0.8 }}>Résidence Les Tilleuls</p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setScreen("notifications")} style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, cursor: "pointer", position: "relative" }}>
                  🔔
                  {unread > 0 && <span style={{ position: "absolute", top: -2, right: -2, width: 16, height: 16, borderRadius: "50%", background: T.danger, color: T.white, fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{unread}</span>}
                </button>
                <button onClick={() => setScreen("profile")} style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,0.15)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                  <Avatar name={ME.name} color={ME.color} size={28} />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div style={{ flex: 1 }}>
            {tab === "forum" && <ForumView onCompose={() => setComposerOpen(true)} />}
            {tab === "agenda" && <AgendaView />}
            {tab === "docs" && <DocsView />}
            {tab === "syndic" && <SyndicView />}
            {tab === "more" && <MoreMenu onNavigate={handleMoreNav} unread={unread} />}
          </div>

          <BottomNav active={tab} onChange={setTab} unreadNotifs={unread} />
          <ComposeModal open={composerOpen} onClose={() => setComposerOpen(false)} onSend={() => setComposerOpen(false)} />
        </div>
      )}

      <style>{`
        @keyframes bounce { 0%,60%,100%{transform:translateY(0);opacity:.4} 30%{transform:translateY(-6px);opacity:1} }
        @keyframes slideUp { from{transform:translateY(100%)} to{transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        input::placeholder, textarea::placeholder { color: ${T.textMuted}; }
        ::-webkit-scrollbar { width: 0; }
      `}</style>
    </div>
  );
}
