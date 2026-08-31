import React, { useState, useRef, useEffect } from "react";
import {
  Home, Calendar, FileText, MessageCircle, Lock, Plus, Send,
  ChevronLeft, ChevronDown, LogOut, Shield, User, X, Check,
  ScrollText, Gavel, Users, Radio, Paperclip, File as FileIcon, Download
} from "lucide-react";
import {
  onAuthStateChanged, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signOut, updateProfile,
} from "firebase/auth";
import {
  doc, setDoc, getDoc, collection, addDoc, query, orderBy,
  onSnapshot, serverTimestamp, limit,
} from "firebase/firestore";
import { auth, db, BACKEND_URL } from "./firebase.js";

/* ------------------------------------------------------------------ */
/*  BRAND TOKENS                                                       */
/* ------------------------------------------------------------------ */
const C = {
  navy: "#011E4A",
  navyDeep: "#010F28",
  navyCard: "#0B2C5C",
  navyCardSoft: "#0E356E",
  orange: "#FC9601",
  aqua: "#16A2C5",
  royal: "#2B6B99",
  green: "#8FCF3C",
  yellow: "#FFE11A",
  gray: "#9D9D9B",
  line: "rgba(255,255,255,0.08)",
};

/* ------------------------------------------------------------------ */
/*  CONTENT — Règlement Intérieur                                      */
/* ------------------------------------------------------------------ */
const REGLEMENT = [
  { n: "Préambule", t: "Le présent règlement intérieur définit les règles de fonctionnement du club et est complémentaire au code électoral. Il s’appuie sur les valeurs fondamentales d’innovation, de passion et d’excellence. Chaque membre est tenu de respecter les principes et actions contribuant au bon déroulement des activités de l’association. Il est conforme au règlement intérieur de la JET, à sa norme qualité et à la charte déontologique." },
  { n: "Article 1 — Mission", t: "La Junior Entreprise veille à mener des projets dans les domaines de compétences de l’ENSTAB." },
  { n: "Article 2 — Création, Dénomination", t: "Il est formé par le présent règlement un club étudiant à but non lucratif qui fait partie du mouvement Junior Entreprise, dénommé « Energetic Technologies Consulting » (ETC JE). Le présent règlement est transmis à l’ensemble des membres ainsi qu’à chaque nouvel adhérent." },
  { n: "Article 3 — Siège", t: "ETC JE est une Junior Entreprise fondée au sein de l’ENSTAB le 31 août 2018, et ne pourra être transférée en tout autre lieu." },
  { n: "Article 4 — Composition du Bureau", t: "Pôle Présidentiel — Président : convoque et coordonne les débats du Bureau et les travaux des assemblées, assure l’exécution des décisions, le maintien des activités et représente la JE en externe.\nVice-Président : collabore avec le président et le supplée en cas d’indisponibilité, supervise les pôles, représente l’ETC JE, veille sur l’innovation et remplace les responsables absents.\nQuartet (Président, Vice-Président, Secrétaire Général, Trésorier).\nSecrétaire Général : gère les courriers et communications, prépare ordres du jour et PV, organise les archives, standardise les documents.\nTrésorier : gère transactions, archives et justificatifs, budgets prévisionnels, rapports financiers, inventaire physique.\nResponsables : Qualité, Ressources Humaines & Formations, Projet, Marketing, Développement Commercial.\nAdjoints : RH & Formations, Projet, Marketing, Développement Commercial.\nCellule Qualité, membres juniors, seniors, alumni et fondateurs." },
  { n: "Article 5 — Mandat et élection", t: "Le mandat du bureau dure un an et débute après une élection organisée en fin de mandat précédent, qui doit impérativement avoir lieu entre le 30 avril et le 31 juillet." },
  { n: "Article 6 — Admission des nouveaux membres", t: "Être étudiant inscrit à l’ENSTAB, satisfaire la grille d’entretien, et payer la cotisation dans les délais fixés par le trésorier." },
  { n: "Article 7 — Conseil", t: "Convoqué par le secrétaire général, il réunit au minimum cinq participants selon le statut du conseillé. Le conseiller doit être invité 3 jours à l’avance. Le conseil peut être reporté sur excuse valable ≥ 24h avant. Absence le jour même = exclusion automatique. Objectif : décider en cas de démission, exclusion, désaccord ou sanction. Décision prise par vote." },
  { n: "Article 8 — Exclusion", t: "Est exclu tout membre : ne respectant pas les délais sans justificatif, ayant une évaluation très faible, ayant une mauvaise réputation prouvée, ou divulguant des informations internes. La décision est prise en conseil et communiquée à la JET. L’exclusion est définitive ; restitution des tâches sous 24h et révocation immédiate des accès." },
  { n: "Article 9 — Système de sanction", t: "Les modalités disciplinaires sont détaillées dans le document « Système de Sanctions », annexé et partie intégrante du présent règlement — voir l’onglet Sanctions." },
  { n: "Article 10 — Démission", t: "Le membre démissionnaire adresse sa décision par écrit au Président et au responsable RH. Un conseil disciplinaire évalue les raisons. Aucune restitution de cotisation. Impossible de réintégrer durant le même mandat. Tâches et accès restitués sous 24h." },
  { n: "Article 11 — Ordre des réunions", t: "Le bureau étendu se réunit au moins une fois par mois. PV communiqués sous 48h par le secrétaire général. Réunions de pôle au moins tous les 15 jours. Convocation ≥ 48h avant, ordre du jour ≥ 24h avant. Retard de 15 min sans justificatif non toléré." },
  { n: "Article 12 — Assemblée Générale Ordinaire", t: "Convoquée par le bureau exécutif ≥ 15 jours avant. Quartet présent obligatoirement. Quorum de 50 %+1 des membres actifs, sinon report automatique de 7 jours. Objectif : rapports, activités à venir, documents, budget prévisionnel et plans d’action." },
  { n: "Article 13 — Assemblée Générale Extraordinaire", t: "Convoquée ≥ 15 jours avant. Quorum de 2/3 des membres votants (avec deux attentes de 15 min), sinon 50 %+1, sinon report de 15 jours. Administrée par le président (modérateur), le vice-président (conseiller juridique) et le secrétaire général (reporteur). Amendements communiqués à l’avance ; tout vice de fond/forme entraîne rejet automatique. PV communiqué sous 15 jours." },
  { n: "Article 14 — Cotisation", t: "Chaque membre doit s’acquitter de sa cotisation, au plus tard 1 mois après la clôture du recrutement. Le montant est fixé par le trésorier. Les Alumni en sont exemptés. Le non-paiement peut entraîner une suspension provisoire." },
  { n: "Article 15 — Dissolution", t: "L’ETC JE peut être dissoute sur décision de l’école, de la JET, ou de l’AGE. La décision et le PV sont communiqués à la JET." },
  { n: "Article 16 — Membres votants", t: "Sont votants : les membres du bureau étendu, et les membres seniors/juniors actifs ayant ≥ 3 mois d’ancienneté, en règle, actifs, sans sanction en cours, et respectant impartialité et confidentialité." },
  { n: "Article 17 — Code électoral", t: "Le code électoral définit le rôle de chaque pôle et la procédure d’élection du bureau exécutif. Il ne peut être modifié qu’en Assemblée Générale Extraordinaire." },
  { n: "Article 18 — Modification du règlement intérieur", t: "Établi par le secrétaire général, il peut être modifié sur proposition du bureau exécutif ou de 50 %+1 des membres votants, via vote en AGE. Diffusion sous 15 jours suivant la modification." },
  { n: "Article 19 — Locaux et archivage physique", t: "Le local officiel se situe à l’ENSTAB, attribué chaque mandat par l’administration. L’accès nécessite un motif valable et l’autorisation d’un membre du quartet. Utilisation de l’inventaire physique soumise à autorisation du trésorier ; toute dégradation est passible de sanction." },
];

const REGLEMENT_ANNEXE = [
  { n: "Annexe — Responsables", t: "Qualité : SMQ ISO 9001, politique qualité, amélioration continue, audits, formation.\nRH & Formations : recrutement, intégration, formation, engagement des membres.\nProjet : coordination, faisabilité, objectifs et outils de gestion de projet.\nMarketing & Communication : plans de communication, ciblage, contenus, image de marque.\nDéveloppement Commercial : partenariats, sponsoring, prospection, propositions commerciales.\nCellule Qualité : suivi du SMQ, actions correctives et préventives, documentation." },
  { n: "Annexe — Membres", t: "Junior : recruté durant le mandat en cours, cotisation payée.\nSenior actif / expérimenté : mandat(s) complet(s) accomplis.\nActif : participation régulière, implication dans un projet, respect des engagements, présence aux AG.\nAlumni : ancien senior/responsable/adjoint ayant quitté l’école (hors démission/exclusion).\nFondateur : membre du tout premier bureau exécutif (2018)." },
  { n: "Annexe — Adjoints", t: "Rattachés directement au responsable du pôle, ils soutiennent la planification, la coordination et la mise en œuvre des activités : suivi des membres et formations (RH), gestion de projets et ressources (Projet), campagnes et contenu (Marketing), prospection et partenariats (DevCo)." },
  { n: "Annexe — Motion", t: "Une motion est une proposition à partir de laquelle un membre peut intervenir sous un amendement. Communiquée au conseil administratif sur papier durant l’assemblée générale." },
  { n: "Annexe — Bureau Étendu", t: "Composé du Quartet, des Responsables et des Adjoints." },
];

const SANCTIONS = [
  { n: "Barème des sanctions", t: "Par ordre de gravité croissante :\nAvertissement — observation écrite.\nBlâme — réprimande écrite.\nMise à pied disciplinaire — suspension de 1 à 10 jours.\nMutation disciplinaire — changement de poste.\nRétrogradation — perte de responsabilités.\nRenvoi — suspension définitive.\nToute décision importante est précédée d’une convocation à un conseil disciplinaire." },
  { n: "Procédure disciplinaire", t: "Sauf simple avertissement, toute sanction suit une procédure garantie : le membre est convoqué sous 1 semaine, les faits lui sont exposés, ses explications recueillies. Le verdict est envoyé entre 1 jour et 1 semaine après l’entretien, notifié par écrit et motivé." },
  { n: "Comportements sanctionnables", t: "Rixe, injure ou violence envers un membre.\nDétérioration volontaire de matériel.\nInsubordination et indiscipline.\nAbsences non justifiées (2 = avertissement, 3+ = blâme).\nManque de respect des deadlines.\nManque d’engagement.\nDivulgation d’informations sans en informer les responsables.\nManque de respect de la hiérarchie.\nManque de professionnalisme.\nMauvaise gestion du mailing.\n(Liste non limitative, donnée à titre d’exemple.)" },
  { n: "Chargés du jugement", t: "Selon le membre concerné, le jury est composé de combinaisons du Président/Vice-Président, du Secrétaire Général et du responsable RH & Formations." },
];

/* ------------------------------------------------------------------ */
/*  CONTENT — Code Électoral                                           */
/* ------------------------------------------------------------------ */
const ELECTORAL = [
  { n: "Préambule", t: "ETC s’engage à assurer le bon déroulement des élections du bureau exécutif : convocation du corps électoral, appel à candidatures, examen des candidatures, recours, publication de la liste officielle, organisation technique et logistique, diffusion de l’information. Ce code doit être conforme au règlement intérieur." },
  { n: "Article 1", t: "Le mandat du bureau ne dépasse pas un an, débutant après une élection organisée entre le 30 avril et le 31 juillet." },
  { n: "Article 2", t: "Le code électoral ne peut être amendé que lors d’une Assemblée Générale Extraordinaire." },
  { n: "Article 3", t: "Les élections se déroulent lors d’une Assemblée Générale Élective, convoquée 15 jours à l’avance par le Secrétaire Général, avec la liste des candidats. Quorum de 50 %+1 des membres votants, avec deux attentes de 15 min avant report de 15 jours." },
  { n: "Article 4", t: "Tous les membres votants doivent être invités à l’Assemblée Générale Élective." },
  { n: "Article 5", t: "Les candidatures concernent les postes du Quartet et des Responsables." },
  { n: "Article 6", t: "Les candidats communiquent leur candidature dans les délais et selon le processus requis ; tout vice de fond ou de forme entraîne un rejet automatique." },
  { n: "Article 7", t: "Toute candidature ne répondant pas aux critères des articles 5 et 6 est automatiquement rejetée." },
  { n: "Article 8", t: "Un comité d’élections présélectionne les candidatures et informe les candidats des résultats ; il organise les élections." },
  { n: "Article 9", t: "L’appel aux votes a lieu après la présentation des plans d’action de tous les candidats au même poste." },
  { n: "Article 10", t: "Chaque candidat présente son plan d’action dans un temps imparti, suivi d’une session Q/R chronométrée. Les candidats à un même poste n’assistent pas à la présentation des autres." },
  { n: "Article 11", t: "Chaque membre votant dispose d’un seul et unique droit de vote." },
  { n: "Article 12", t: "Trois options de vote pour chaque candidat : « Oui », « Non », « Abstention ». Toute case vide ou illisible est comptée comme abstention." },
  { n: "Article 13", t: "Un candidat est élu s’il obtient au moins 2/3 des voix favorables de sa base de calcul. En cas d’égalité entre plusieurs candidats atteignant ce seuil, un second vote incluant tous les membres est organisé ; le candidat avec le moins de votes négatifs est déclaré élu." },
  { n: "Article 14", t: "En cas de poste vacant : une deuxième AGE est organisée ; si le poste reste vacant, une réunion stratégique entre bureau exécutif et ancien bureau applique une procédure de restructuration." },
  { n: "Article 15", t: "À la clôture de l’AGE, le président annonce officiellement les membres élus." },
  { n: "Article 16", t: "Le bureau exécutif communique le procès-verbal sous 15 jours. La sélection des adjoints suit un appel à candidatures, un entretien et une présentation devant un comité de sélection, une évaluation par grille, puis délibération et annonce des résultats, avec justification transparente du choix final." },
];

const ELECTORAL_ANNEXE = [
  { n: "Annexe — Processus d’élections", t: "Les candidats à tout poste (hors président) doivent avoir le statut d’étudiant. Convocation ≥ 2 semaines avant. L’AGE peut se tenir en ligne si elle garantit anonymat, transparence et un seul vote par participant. En présentiel : enveloppes et bulletins par session. Le comptage est effectué publiquement par le Secrétaire Général." },
  { n: "Annexe — Comité d’élection", t: "Formé de 2 à 4 membres du bureau exécutif en cours, qui s’engagent à ne pas se représenter au mandat suivant. Il présélectionne les candidatures reçues à une adresse dédiée et veille au respect du processus." },
  { n: "Annexe — Options de vote", t: "« Oui » : voix pour le candidat.\n« Abstention » : voix non exprimée.\n« Non » : voix contre le candidat." },
];

/* ------------------------------------------------------------------ */
/*  SMALL UI PRIMITIVES                                                */
/* ------------------------------------------------------------------ */
function TopBar({ title, onBack, right }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "14px 16px", position: "sticky", top: 0, zIndex: 5,
      background: `linear-gradient(180deg, ${C.navy} 70%, rgba(1,30,74,0))`,
      backdropFilter: "blur(6px)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 32 }}>
        {onBack && (
          <button onClick={onBack} style={iconBtnStyle}>
            <ChevronLeft size={20} color="#fff" />
          </button>
        )}
      </div>
      <div style={{ color: "#fff", fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: 16, letterSpacing: 0.2 }}>
        {title}
      </div>
      <div style={{ minWidth: 32, display: "flex", justifyContent: "flex-end" }}>{right}</div>
    </div>
  );
}

const iconBtnStyle = {
  width: 32, height: 32, borderRadius: 9, border: "none",
  background: "rgba(255,255,255,0.08)", display: "flex",
  alignItems: "center", justifyContent: "center", cursor: "pointer",
};

function Accordion({ items }) {
  const [open, setOpen] = useState(null);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={i} style={{
            background: C.navyCard, borderRadius: 12,
            border: `1px solid ${C.line}`, overflow: "hidden",
          }}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              style={{
                width: "100%", display: "flex", alignItems: "center",
                justifyContent: "space-between", padding: "12px 14px",
                background: "transparent", border: "none", cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span style={{ color: "#fff", fontFamily: "Sora, sans-serif", fontSize: 13.5, fontWeight: 600 }}>
                {it.n}
              </span>
              <ChevronDown size={16} color={C.gray} style={{
                transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform .2s", flexShrink: 0, marginLeft: 8,
              }} />
            </button>
            {isOpen && (
              <div style={{
                padding: "0 14px 14px", color: "rgba(255,255,255,0.75)",
                fontFamily: "Inter, sans-serif", fontSize: 13, lineHeight: 1.6,
                whiteSpace: "pre-line",
              }}>
                {it.t}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  AUTH SCREEN                                                        */
/* ------------------------------------------------------------------ */
function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState("login"); // login | signup
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canSubmit = mode === "login"
    ? email.trim() && password.trim()
    : name.trim() && email.trim() && password.trim();

  const AUTH_ERRORS = {
    "auth/email-already-in-use": "Un compte existe déjà avec cet e-mail.",
    "auth/invalid-email": "Adresse e-mail invalide.",
    "auth/weak-password": "Le mot de passe doit contenir au moins 6 caractères.",
    "auth/invalid-credential": "E-mail ou mot de passe incorrect.",
    "auth/user-not-found": "Aucun compte ne correspond à cet e-mail.",
    "auth/wrong-password": "E-mail ou mot de passe incorrect.",
  };

  const submit = async () => {
    if (!canSubmit || loading) return;
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await onAuth.login(email.trim(), password);
      } else {
        await onAuth.signup(name.trim(), email.trim(), password);
      }
    } catch (e) {
      setError(AUTH_ERRORS[e.code] || "Une erreur est survenue, réessaie.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "40px 22px 24px" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 30 }}>
        <LogoMark width={168} />
        <div style={{ marginTop: 16, color: "#fff", fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: 18, letterSpacing: 0.5 }}>
          ETC JUNIOR ENTREPRISE
        </div>
      </div>

      <div style={{
        display: "flex", background: C.navyCard, borderRadius: 12, padding: 4, marginBottom: 22,
        border: `1px solid ${C.line}`,
      }}>
        {["login", "signup"].map((m) => (
          <button key={m} onClick={() => setMode(m)} style={{
            flex: 1, padding: "9px 0", borderRadius: 9, border: "none", cursor: "pointer",
            fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: 12.5,
            background: mode === m ? C.orange : "transparent",
            color: mode === m ? C.navyDeep : C.gray, transition: "all .15s",
          }}>
            {m === "login" ? "Connexion" : "Créer un compte"}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {mode === "signup" && (
          <Field label="Nom complet" value={name} onChange={setName} placeholder="foulen fouleni" />
        )}
        <Field label="Adresse e-mail" value={email} onChange={setEmail} placeholder="prenom.nom@gmail.com" />
        <Field label="Mot de passe" value={password} onChange={setPassword} placeholder="••••••••" type="password" />

        {mode === "signup" && (
          <div style={{ color: C.gray, fontSize: 10.5, fontFamily: "Inter, sans-serif", lineHeight: 1.5 }}>
            Ton compte est créé avec le statut « Membre ». Le passage au statut « Bureau exécutif » est fait manuellement par le Secrétaire Général.
          </div>
        )}

        {error && (
          <div style={{
            padding: "9px 12px", borderRadius: 10, background: "rgba(220,60,60,0.12)",
            border: "1px solid rgba(220,60,60,0.4)", color: "#ff9d9d",
            fontFamily: "Inter, sans-serif", fontSize: 12,
          }}>{error}</div>
        )}
      </div>

      <div style={{ flex: 1 }} />

      <button
        disabled={!canSubmit || loading}
        onClick={submit}
        style={{
          marginTop: 18, padding: "13px 0", borderRadius: 12, border: "none",
          background: canSubmit && !loading ? C.orange : "rgba(252,150,1,0.3)",
          color: C.navyDeep, fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: 14,
          cursor: canSubmit && !loading ? "pointer" : "not-allowed", transition: "background .15s",
        }}
      >
        {loading ? "Un instant…" : mode === "login" ? "Se connecter" : "Créer mon compte"}
      </button>
    </div>
  );
}

const labelStyle = { color: C.gray, fontFamily: "Inter, sans-serif", fontSize: 11.5, fontWeight: 500 };

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <div style={labelStyle}>{label}</div>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%", marginTop: 6, padding: "11px 12px", borderRadius: 10,
          border: `1px solid ${C.line}`, background: C.navyCard, color: "#fff",
          fontFamily: "Inter, sans-serif", fontSize: 13.5, outline: "none", boxSizing: "border-box",
        }}
        onFocus={(e) => (e.target.style.borderColor = C.aqua)}
        onBlur={(e) => (e.target.style.borderColor = C.line)}
      />
    </div>
  );
}

const LOGO_SRC = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMYAAABkCAIAAABSLdjvAABaaklEQVR4nO29d3wcx50nWqlzT88MZgaDDDCDURQpkqIilawsWZIl21pZ9gbHW3vX+96u73bv3d1+dp9vw929vbXX9np99rMtBzkpOUhWokiKogIpkmAGCRAZmJw6V3h/DAAOmERSpHT3br+fAtDo6emurvrVr371q1+AoPMO8E5A4pRTkEMxcx5yAAClzDD0pUuXEEIOHTiAEM7nskTWaEgBliEmCCEIoRCCc44Qqn/rfx5ACM/reiFObZT3E42tiRqOIUcAAAGY4AJywYUQgAIAECFCCEWR0ul0V3fX9le3Q4JoEAImAMIAYYDQbJsIIU5LA6d9PrlYr6RrmuBicnJS1TRKGeehGY3WqjaUZAgQgIKFHhACYAIhBOfXff+KdwHIAQAQQIAAghAKVu90AaEsywiBcrlMQyrLshf4IAyBpCKMACaCC3BBIwdeLC6FEGKUAcjT6fSV6zccOXJ49Zo1r2zZki+WwiAI/BAwBhACCEOMTrnd+4//1bmUaOBNsKFqUAAAef3tUMPxdTdskojkOPbY2Hg2my0XCwBjSZEFh0IIBgQAAIgT93wfuFQQhAAAwUPTND/6kY/87d/93datW13HkSSIoAQwpDTklALBBAPTvBkiACFgAsD3n8jEuZNUnZj+Z7senbheMDZzyIUAAHIAEYQQAjg7csZGR2s1+0tf+rMXXnjx+Reel1U1CHxG2UzXnOvDT8VF41KNaIpajuum25o//alPf+d7377tttufeurp0dFR3/MAZVCWVVV3PQ8AgDCSJdXzvAt/g3eNeivXuc658KrG68/3/hf7ejR7PW+8nnHdNIQQbrVMFIV6jmFG7Hw+kkr9wR/8wfbt2+++++7jx48//vjjmqYhhDK5AgCICzFNeLMQZx3qp+FSCLwbLiUg4KelNgCqtWo83nTN1dds2bo5k5l89tlf9czrzGTGDTNWKpVkSQqpCxEQHAIAwjBECL3v8whC58cpz/f6851Yz+36hsmugUupqiqE8H0fUMolrFtmU9yKRLT5C+b37Xv70OEDpql3d89bsGDBvn37FEU59Q7vBu9y4uP8lGogAAJKrVh0/YYN3/zm1xcsWNDS2nrHHXdks1O3337bL3/5y+NDg0FIBUUASZzVGTw8idVO01fjS/JLS3PnMfEBAM6fRBpx2nF4FpzayKfBDEfBGFMqGKWcA2wYjNq6bvzJ//GFp556at0VG1RVDcOwb1/fjTferKrqoSNHHC+AEJ/3O5wZFz7xAQCgOI0iQAiBoZAkCUIBIP/8H30hX8g9/fTThqG2d7StWL78F0/8vLNj3u63D9CAYyJxziGEYq449d6TFDjPMfp+ktTp56P6SY4AYL4PwgCbRjIRjcXVnq6O+fPnv/baa9Wq3drSfv/9H/r6179ZLJQ8L6Cce66DsAwAEBCAk97r/Ca+6YvPiUtNv9JcmQkJ0EgHs+QFIVQUFUJRrVZWr1kNBfr1089GIpEvf/mv3nrjdYxxW0vLB265cXRoNJctxeNmLluQFcULKJEIglAgCCEKAgpcF+hmw/POU49Vb44zzPen4tKv+GZrgoQ40VsQnP69RGPPnty1M595HlAUwICkqqEXYgIhhIQgAqEc1RRFevBDd4W0Vi4Xm9NNn/nMp37+01+8um2HYUR6urvHJ6coY2HIIZIanzWHjM5Dd4gAAPxdylIcnnG02bYjSYQoGuNAltREIvV7n/zED3/4+KtbX1m6dMnv//7v53K5L/zR5w4cOKRr5o9//OMgoIC7NIAQS4ps+AEFlELVaFwMA3Ge2tHT1O1sY+58ec75y34NT2/oNjH3wfVXPunkKe083Q6cSIBxWVUD34UIQoGECCWiLFgy/447PrB//+5N123Y/toWTrWvfvUfL1+97sEPPeR7zDSsVCq9ZdtrYUiFgBDCi8v/z2nim7n29HoIMP3O04wXCmDopu8HIQ01XQGUywp55OOPPPnUz66+csOay1eMT4y9um3bylWrOOc333TTt7/97aZE4tDBg2NjY7rZlJmsCShhhBkTQogTClzAwLniVMp7Z1H6PddL8Vm64fAEkZ1plEIA5r4XBwAoiuI4DghDI25xTmOWeeONm17Z8vJ/+Pd/8cqWFzEGo8NDnV3tnV09mhH5l29+58ZNtwweG37t9Z2KolVtWwgBED5prELQIFed5w7Hu+VSc+7VwLEEBLbjMMo0XeMMhL7/id99dPGChaamQwF27Hh9//69n/vsJzVVPXrsyBO/+NFlq3ozmakv/dmfPP3009dfd9N/+a/fcGq+QDCbyciKMksNQoh3mNrrmG6FufsTAkCIAUBCsFM+nfneefKp8yQpBMAso+X13/VKCAiQQBxyABASJ7hlI+uoqygbaj5dfxlJetzgnD/00IcMQwaQr1ixjPPq/r63yrmp3/md3xkYOvbiiy8d2H/oyo3XptPp8bGxG264Ye++Q4VCGSAIIT5lSr0IuGAuBcCZhxRq6B6CwOWXX5ZqTrQ0N61cteKr//jf7r7ndoLAr3/9y+XLl27YsMGMRLZt3bpgwaJqtQohtCJNr2577eGPPfKtb31r/vz5goPNmzffeOMtb775dirZOjk56Tpua1trJpNpb28fHhpua287evRoW1tbLpdLJpOVSgkhpGoy50EsHsvnipKkISAf7T8OIV68ZGG1VkylEsVCkUhEURTXdT3PkyU5pCGEUJIkiUiMM9/3CSYIo2q1qiiKoRuO6xiG4bmeLMuUUc/zImbE933GmSzL5XLZ0A0Ioes6mqYDAFzXSSSTAADXdWOxpsMHjxUKpWXLezkPNF3yAxsSgDHJ5krt7Z3DY6MQYIVIXAhZluyabeq6qqqu67a0tB49cmTNmtV9fX3XXXdNoVgYGxu56667nnzyyU987NF8ITs8fPzhhz/ywx89duXGK3bv3n3nHXcePHCAM/HTn/706muvXbRo0UuvbJEVbd26q5568ldN8dSu3XszU1kkKQBMc8fGeRZOr8BP7mtxDiPuYnKps4AxtnPnTkUmV23c0Ldndywa7V3S+9V//IeHHnqoOZnYt2/fyy+++KUvfenNN3b29vZ+77Hvf+5zn/PWLgu90ro1y/bvO/inf/p/7u9789abr46ZerlUffR3HvjVL3/5sY89+tOf/+zee+/9+S9+fv+9933ta1/71Kc/9dhjjz36sY+9/fbb0Wi0KRkdHz+2bv3617a/yQQ2jfjf/e1/F5zdfedtk1OD7R2t4+Pjpm70LlkyMjKCEE4mE/lCIZ1OS5JULBRSqdTk1BQNw66u7uHhoUqlsqS3d2RkxHO9WDzW1tqWyUxxznvmzTvafzTeFJckaV/fvq7uLoTQwQMHVq5cBQDo69vbu3Sp53nZbFZR9aGB49GIct+9t0uyWLy4e2pqLGBuV1fX3t1HepetOnjwICFYVbXsVKanp7uvb9/8+fNc18WYyLJ0pDu9ceNGz84/dP9d3/3e9z7zB58olQpNlrZgfseuna996MH7f/XLJ+f3dPqus/6KtY999zucoU3X3/iH/+aLX/3qVxYv7u3u6HziqWfy+crQ0PE3Xt+p6paiqiG7VCvoS74TghBCiISU33rrrRuvvuqRj3/81889u3DJYsTRjx770djw2L/703/3youvTI5NHj189M//7V+8+NsXO9s6n/3Vs5uuub5UKAweG7jlphsOHdjfu3jexPhAc0rnvMp5RdN5SEsA2KYJUk0KYFVNpskmlfrFdFK3DO752VgMNDWRlrRpGpBgD3AXAretLd7TnWxO6V2dTcmkFo2Snp5kW1u0KS63t1ptrVZTk9LREe9oj8Vi0rx5qdZWKxaTOjviiSYlFiOJJmX+/OZUSm9uNrq7Esmk2tkRb2u1Wlsjba1Wa0ukvT1mWciyUHt7LN1sJBNqLEpMAykyJZimUnoiobS1Wq2tRjTCuztj8ShKRqXutpilga7WKKKVhd2pammsvcXKZ453tFr5zPH165ZNThxduXxRuZRx7MKC+R2v79j2oQfu2b9vT1trct/e3fFo5Io1q5/99a+3bt66Yf3VV667+jvf/sHkRP6O2+/7h3/4yvLly1evXnPXnXc3p1oMwxJC+G5wCXv80t26Dt8JFdn0vODf/sW/f+aZX+3cufPYsWPr1q07dPjQvK7511193Ztv7ZqczP7u7/1epVJ57te/cVxXltRIJPLy5s1f/OIX33zzzSvWrn/11a3xRETViOc56ZaUJOGYpRMiUomICO22dJz7tbbmmKkiVRLJuAlF2NmSxlDIEsSQOU4ZY86Ely9MOE6Rcte2C35QzWRHXa8MUVgoTZYr2cmJocmJ45VyJjM14nvlcnEqnx2rlDNhUM3nxl2vDKCfL4yXyplSOZMvToyND1aquanM8MTkcSLz+nnbKdKwRsOa6xQ9t+QHthAhwcJxq5gASl1FQrVqDkNGAy+wbVNVmO+0NScgc1Nxk1E7nYp6tWJLMjo5NtjVlirkx5f2LsxnJ1YsX9J/9ODq1atef/21efO6e3q6nnvuN5etuuz44DEAwP/4H9/5vd/9A0LIvr4DjPKHH374l7/8zRVXrI1Fo6+/uXNiauqv/vqv+/v7/TAIghBcyh2wcyIpJAASAHF0ooiTBSko+GwBcKYARFTLdqksmUCQlStXf/jDH71sxWV2zdm9e49m6sNjo2MT4//mC3/4n/7yLxPJZEtLS++S3h/84Af33/ehfK6YzebDkEGAAUC1qrNs2YrBwaHLV6/t69u/+rLL977dt2LZyqGB4Y62Tgljy4yU8gVFkhHgfs1nPpJRpFbyPCf03UBRFEVRPM/zHLdcLJaKJcd1fNfLTmXymSwLKBJAMBZ6vue4gDG7Ug08v1Qo5DPZfCbr2fbk+Hh2KlMtV6vlSnYqE3q+a9u1SqWUL7o1r5grFXNF13YrxUq5MF2KuVKtXBsZGZ2YmMAIhdSvVEvZ3JREFOrz0EUyjri1oJAtYIADL6yWaxKSQ5+2NrcWc0VDNTDAbs2LW1EaBAsXze/bs2fR/HkDR490dHQ89dRTn/rkp470H6lWnfnzFra0tPziF7/o7e296uorX9n2MkTMNKUfPv7YPfd80LJid9x+Jw1DKjiHAGKCIlEIMYQYIAgQnAYSEIl6xwlYF554QzkXYuII8EtvAiAQEAQIBATa/fbev/+7/+J5QT5f+MBtt65YtWrfgf0333TzV7/y1fb29gXzF+zY8Trj7Jprr3np5ZcM0yjkC4mmxJtvvfnII4/09fVdddWVQ0ODhKBDhw5wISYmx5qisbHR4YiustCXCVIVCXKWTiV0VTZ1HXCgyJqiyKom+4HrB7aqkeZ0Mt2cbE4nW1LJlpZUKpWIN0Wj0Whs+lcsGo02Nzen0y3plnQ63dLa1tbW3t7W3t7R1p5sSiQSTdNl7t9EU1MikUg0JTra2ts7Wts7WtvbW7u6uro727u7Oru7ux3XFoLphpJIRBmnhEgKUTgTuqZJEo5EDFmWOzo6FEXJZDItrS25fG7BggWjo6Mrli7btm1rKpWanJhobm6OxqKFQtmyrDBkhWJhamrqoYceeuyxxzZu3NjS0nLo0KHh4eOrL1+1a/fOz37+s8VS3guD3bv3vvjSS+9G3X9euPQkdWLZDCbGJwcHhzddf+P4+GShVP7Bj36oGcbA0KDtOV/84hd/8dQTN996Sz6XL5VKjIVLliz67fPP3nb7B/bt2ytJWAhWLhcLxZxlGdmpCYKEUytHLE1AumDJ/ID7Cxb3EAIWLOyKxU0zona0p01daWluSrckJQkSCWIZSDKwLN20tKhpWFGzKWZZpqarikKQJGFJQpKEJAnLBMsSUogkE2KomqFquqIaqqZrmqFqhqobqq7pWr3omqZriqarmq5ouiIEmy6AEswxAYQIhDkmnKjIMGQrqsfjZktLIt2SiMXNiKVhIqKxiKrKpqWbUbNcLS1cvNC0rK6enqlcPhKLHzxwxLRir7762oJFS557/uVHHv346Mh4c0saEZIvFrdu33bbnbc/9/wLzS2tKy+7PJMrGBHz8JEjTz7xZLI5ZRqmaZhv7HgDY7k+sIFAl7TfLzVJ1emJ1v8RQvh+uGPHG5yDVZddtnrtmj/64z/KFYsPPfThv/mbv1myeMngwODbb799y823TE5M+L5/zz33vPrqqytWrMhkcn7gBwHlnCOMNV2XJKIoCoTQ9hwmRNWuRePxYqVcLJdrjj00MlJznEwmU6lUqpVKtVolBBNCyrVasVKeRalcLhZL2Ww2k8lkMlNTmcxUJpPJZEZGRoaHhoeGhoeHh8fGxkdHx8bGxkZHR3O5fC6Xz+VzM8hP/5o+l8nlstVauTqNmuu4vuO6tuM6LkJICO77vu3YxVLJcV3XdUulUhiGrusKLnzf9zzPsiyEpM7O7nyuMG/BopHR8SVLl49PTsWakuMTOUXRCJYnprKDQ8NXX33db37z6wceuL+/v3/v3r729vZDhw4XCvmurs5isfTHf/zHixYv6u6e399/dHR0NBaPh4ye0/bzu8aFkpRAQCAowGwBADWUmWsAAJACSOuTMYRwajLz3HPPL1ncu/nlLRDiL//fX8YIHTx4UDf0xQsX7u/r+6u//qvv/L/fWbd+/cjIiON4QCDLijmOt2rFmv7+YzfedOuunbsX9y7t23+4vaOnXHEw0VwvlBXD9VnZ9pCi226oqGbV9gCUao6PoExknQPCKOIMKrKBoSxrOsEyRMQPqW5GJFWLRROmYZmGFYs16bqZSKQsK9LS0joz0yUSiQRCSDd0AICiKKqqGboeiUQsyzIME2GEkGSaEcFh/T6CQ4zlMGQSkSnlCCqCQwAQC6EsqXbN4RxBICFEBMflmh1QXirZEMu5fNn1GeUgmy8FlE1lcol0G0QyluR0a3vVdhAi8aamI4cPX7Zi1e5db999x10tzc00CFcuWz4ydLyULw4PD7/++uuvvPKKY9tv7tw5PDbquC7noLF3xGm3rE6Az+wEz+3Tc8Al10udkOwgD8IAQuTYHiEKo/DKDVcdPXzkIw899JV/+MdPffpT3/vOdzdt2vTP3/hnhBFCqFKpXHvt9b/4+S8++vDvfO2fvvHggw+ODE3F4qlSxUvE4hhiSTVcX3CgSkqE8WJToo0xKkCmpW3BVKYsy7KuxaxIEiM9YqRkYsqKlIi3JxNt7Z092UylpbU7nUqPjeZi0XQ8HstOTTankwCAbDbb0dVVLhYlSW5ra3UcW1GUVCqVSqWi8VgsFu/p7qZhCAlJpVLlctmyLE3XOGeGbpiR6EQy05LuAgCkklMt6U7HcRHWiWoQrDGBW1t6TENuiqU1KWKqblOspa2VFgrF1nRXKjnkByCVaB8ZH0NYQ4qp6VFFs8azJd2MjU5kV62+Ytv2N1avXTM8MtLc3Kzpej6XCYPw5Zdfbm5uri8+brzxRs/zOrq74okUIMSKxYMwgJhAJFjIAbqYRixnwoWSFORgLpk3GrqIuvZ82pB+FtyyzGqtAgD/3ncf+51HPvrss7/t7V32ve9934yYzzzzVCweM02zZ15PT3dPoZxfumL5K1u37ty9p2//4VrN+/o3vpPL5ao2q1Qq69Y1Z6amlvYu7j80JhMrn/drNq9UWKFYrFTc40OZqalaIt5UUn3AVRpIjguCUK5V7InxUkQvCE7GR0sIZEo5f2qiEvqThWi1WJgolfIAgEqlIrjwPG9kZMQPg2w2W6lU4onE8eFh27GtWDTk9NixY7puCCEGBgdMw5RkOZ/L6YYuS3pmqnz44AgAIDNZO3RgOAjCXCGvmFHBFMBJLuv4dqigmmDcrgQZqVIuhMW8NzqSr1VoBpUURQl8MDFZnJgsKsp4plClYDKXKxw5ejybnXJd98kn8gDyB+774PHjx67ZePVLL79w3/33PfbYYzffdPOOHTuyuakwDCEmjrc3nkg9++xvqrZNOWcACoQFh7PsBjb045l2us5FY34a0ng39lJzwWd30RsXF7OqfSQAIQhwrukqRujP/s8/sZ3KimWLd7712mUrVxSyuZpdg4AMDA1yyCn1MSaVSu3goaP9RwZ9j8mS7vuhomi6rlerNVmWIKo/iBOZhCHVdd33fU2TLTNSKpWgAK3N6UqlJitauWZnsgU9EolGTAFCRZFc21ZVDSPk1GqapgsQAOgFvgsA0BVVkvBHPvrhUiHX1tYyPjFeqVQuv/zy/fv3CwCi0ej8+fOPHTum6RrG8m+e/W25Zgchq1Uqum4AQQIf6bIJAPC86a2bYrlsRqKTmQIAoLklFrN0KLhMSKVix2NN2Ww2DJmm6blCljEqy7Ib+JxxKjiWSH3GcZ2apCiMBXErwmmoKviOO29xqpVEMum6bt/e/Y8++uizzz7753/x5z/96eNXXXXVvgMHBZZDJh7/6RMDh44AJEFZhRALQGaoB03bHzSS1DkbAp0d72qPby74LOWddr0KT1yDAODdna2/+4lHhgYPx2PG5PiwTCS35nX1dO87eOC6Tdc/98JzjzzyyI9++HhLW+ePf/xzFmIIFABOeJZxOGM0hyCYsehCAvDpjeHZYYBmD6Z3XNEc/jprDYAARwJAAZDgybj1+T/8pG3nFi2ZNzo6Ok1S+/b7vq8oyoqVKw4cOBCLWFDS/sf3f3Lg6FAQCigQ5AJCCKF00qCfEYqnLTWmHYpOstuZqdgsUCPXF2L6jQHl1Ltx0zU3bLpqyZJF27ZsWdq7/Mc//vnll68eGDgmSaS5tZkxhogsadbWbTt37trLARIQACEAhBDiEyYPEJ6kbWrkSbPteV6Y/tb5femd7lgvp0XdjYNDxAECADmu73leuVLUda27p0uWyS233DgxOfnZz372wIF9H3rw/h1v7li2apnvu0zAwPM5nF79coB4XfMKEIMoBDCcXgLAEEAGydyCKKx/BXAIGAIMIgYRQ9OFIkQRYpAwIFOgMqBzoFZrgWHGWlrb4vGm5lmkZ0pzc3NzczzeFIlEAVECjrlQGNQ51ARUGCQhQo1l+okQMAgYRAwQBkgIG0r9MkBmrpwufKZMC8gCAYEkSYrGrGIxPzw8KMskpP4nPvZoUzT+0Y9+xLLMjRs3UMGtWNSxvcDnHBABCBAEAHzK7HapXHMvWDw/pUKzlCTmUNXpJ00BstnsoUOHPv7ox/b17axVqm3trb/+zW8iVuyxx77n+F7f3j7fdZuakqlUqr2lZXgkAwDgMwYook64l2xJzIDAGBNZUXWNyPJsYULUD2RZnvtGEEAIEbwAw7wzY8b/SAAA6r5QHAAguFi7dq1j56Ix68D+vlrNcaq+74Vv797Z2tH6wosvXLF+/eDxccuyDh05rCiK54dzGmpmqmm0tT+TDd479OMZcPFWfLO2PufW0xiSwcGhnTt3OnbOd515HV3Fzs41a64YHBpUDWXNFZdvf33HvJ4FL7/y2vwFC3IZ2wu5gADO0tO512tGmjt3YVPXtJpjQ9dhLF1pQH3iqx8jAaBkMMYwwlzAs6/I3w0EBOKE3ydqa+/kIU2n0xNjI5s2bXrr9Z13PvjgK5u3tne0ViolpSo5tj05OVmuBZxzysNLN/DOhAsmKQTmUi6H/FQJ5SxgnI+NjhqGoamgd8H8QwcPtjQns9mpoaHjLe0tTzz5ZK1aLZerdrUqQkEkAmkoBODT0j8E76BWeQec3TYWIaQbBoIQIWxoGgtDQ9MMTSMIKYpiaLqm6Yl43A0AQij0fUC0d1GXeoXONg3BujANIQCQBaHjOLnscDY3YVdrdq32g+9/b9XKyw4cOHDXXbfv6dtTLpcX9y55/CfPBGEABAZkhqG+Vxsy74Fe6vRQFKVULr/88ssdHYnx4SEkABIonkgihDs6OsQIS6VS3V09ECim1rxz18H3sm6SJBGMIcREIlIdRJKIxBmXyPQ/AABCiKIosqYG4SWv0qzd7OLFi8IwXNLbO/ri8ba2NoJlP8o559lsdseOHeNT4+PZHCTayNiYoqoBvahT8bnhffMcp2EoEcnzvE2bNl2xdm28KX7jjTeGlF6+ZhUPabFUTMTju3fvrpbKBCEWvqtOm9lXP9cZs1wu12e3cqk8XRpRKpfL5XwuVygUKpVK4Djvpm7nC8MwXdetVCpr1qyZmppauHChLOO29tZ77703Hm+67777rli7tru7JwyZX6kK16vLee8ZiwLvF5fiEGiqGni1t3fv271rfyEz1tHW+txzz+VyhVIp7/iO7dnDw8dz+WxbS3c+50AUAg6BwAAADuc4WSMBOJzeEWqYiHnDagFMuwRBAABodJE4E4gkEUlCUFJInT3VC2GcEYnU+RQAAGOsKIqkauG5e1pcEDBClDIBBIBc1yUAuBCiXC5PTUyqij42Pp7LFaNNViaXzZSyIRM7drzhui7SDM7eh4hL50RS0131Dh5e6LQfztG/zF4guO/7vkujkWR722Jdxh1t6Xnd844cPnL9jTfs2rMzZGG6JV0p1+Z1d7BwIJaQCtUgpEBRlCAIhBBhSDGWAABCQEEpAIAQhWACAOCUShKGUFBGgUAhZ1xwjCVBKRACEAzman1Orb9EiEQkhCQiSRjAmYIgF5qsCEoljCVZpgJxzkMaAiEDIAQXAAghxGnXAe+gLp7+lJ98on4hlISgVABJQh2dLW3paDQW6elpH2kaTqdb0+l2z/Pa29MDxweJokLJCF7cBiEmhIRwRsJF9TgLp4/uMnN44ukz7XOeTv0CgPdPlkKe6wEBEVBoAFpbOxYt6Orb3bdw/oLMxDgGQrfMXC4XjUYr1ZLrVxfOb/eFXCzZ0Vg0CAK7YiuKEoYUAGAaEcdxAACmptdqLkRQJtj3fVmVAABV2+EAqXrkcP8xQEOkqafv8LkQQoS+77nFTEapT4L1Gc9xHQBAfSbECCHZpJQihPgl5lKcs3qcN0kiQeiVSqxaK3Z0dLiOk5nKdHT0uK6NibCiuhcALnitZgsuhBAQoUvupX0K3jfxvKkp4bterWb39x9Jp0jglErFMsYEErVSqbTFTAkRyEU0YqXiias2bpg3b/HxoaG21vaQUs92WlpaisUiAKC7sz2XywMAksmEU7MhhFYsmslkIrEoJPLI+ATCyvHRiYnJ0bIIoWDwHNyMyuVyqVQK/EqlojcqEVzXQRDWj+Ox2KVuolmEIQWcIYkQSYpEIosWddZqVVmWiSQpipLLZUqlIh1wao6TzVV8hhzbPfHl6Vn+vSOsi0ZSSJyfusjzPCA4xCQM6aJFS9tb42NDowsWLBgaHVo4f8HipYv37jvQ1tbe0dbu2nZrS6tlWZXcVFsyGoY0z4LWRBSGjhCiM53A1AOQt7XEJ8dcBHEqHqkWJ6MGIZqUmQqJKhsqkhWkyCQI+bkwc13X4/E4hEpXVxenTNO1dEs6l8u5rhuNRlvSabtWM0yTCokQwvkll1dEGNZXbhIh7S1tsYjlu046mfJdTwi4cMHioaEhRYUMcIgm3AAIIThECJL6bHepq3cSLpSkBAJz1U8C8vPaEnJcB3LhCT+Xy0EEJ8bHhRClUqlQKEAIM5lMrVJRiDw1PmlXy45plIv5Yj5XaYp7jpuZGI+ZeiWfRxgNDQ6WSiWJSApWirkShFjGSimXV1VIAqVaKch+GHou5sCt2YjoCJ288T4dXqKh8pIkRSKRIKCWZZmGCSiP6GbEMGRCNFlpisUnNT0SiQikAgBOnfjOd2sMAHC6bdoTlCpHTBqGXIhYPF6za7UKKebzMiZOrWbXXEM1stkpyr2WtrZCqVSouLbn1pcg7KQYm+8Jdb0/E5+A0wGakEC5fA4hHFJes+1kMkkIgQjKhEiEyPXFFZEkSYpGo07NTiWSru7SIKh7XSKEk8kkwUSSSCKZ5IxBiJKppmK1qakpKilKKh4jSrRUDjRZ02QDIiU42yJo+qMgCGy7Wi5nJicjpVKxWq6USsVSqeT7vqd6xWKxWCxmC3k9kvB9X5Ik/5L5xM1pNCEAAK3N6ebmWBj6EctyPZeGVFEkRZIgY4qmyrJMaZUxhpAsBL+Em1ZnxkWzlzrvB0sECYA5KFWK7Z1tU+MBBrBnQY/j2hCJpnhTIl6KNcU1TY81JaJNCQCArGiyqlEOiKoRVcOaghEmmkQ8CUsE64joGEKENSypEkKIIEQgIZAAikSIGSWISACE4nSqagH5rJhFWShJUjwea2lN18oVAEAkaplRS/J9TVUjUSsStRRFQbJJJMIoBeC9MG2ru7Fomm6ahqqquqYlE0lN1ZLJpO+7TuCkUqlodHIqX2FMYIwoE0K8DzT1fonnHEEAhKgHrw7D0A89iJHt2EHoIQiDMAhCLwh9TEgQhGEQAAB83w/q/wRBEHphEDIc1o85kMLADwIfQkgDjwZe4BLAhe96jCucMs4p55zxoG7TVa/EyQqq6RU3Nwwdy8irBa7jMM7rpf5n9l8IUT0QHr/0wgrnrK5OQxB6nuc4TqFQiMViQRjU2yQIA7tW833fcexcLgchFO/5Qm8WFx5fClyg0DBzTyEQAAhDohA3dH3fhwD4vuuHgUQkhJAsyZZp6ppuRXTLNGp2LR6zFIlwSjRFgpwBEaiyoSCgIEiQkBFUEIQIShgqGBmSohDFkDFSsBVVoUQZdGRihAzOylIniAHyRuoKw8B2HIQxY8x23eniOb4fMCBs13VcFyPEfI4RPinexlwibdAzvQO7ONuiYZY+IISGoUsIR82IIsmGqjtVGwOoa3rVrkqSRIiEp+PLA9DQQfBUvde7qM+ZUKeT902JwDkXUAgoAQBa0mlAa0iglnRLpVKRJKkl3eK6rqEbmqYZuqEbBsKA09CKmpKEHce0LCsIPVPXLMtiIpSIZFlW4HoQQcuyrEjEisRkVTOtGNIiIlNGCGIsEIaCillSOkWNzgEEQHCMJUYDx68UygUhqBBC1PU8gtcPuBDFUgnLJqX0osdnOhVCTMdFghAahmmYqhmJRCKRuo1NKpWCBPrM13XdMPRYPA7q+nUh/peSpQAHJ9vTnB9dC1g3f+IC8kK5UCiXMAeFcr6+fCvGiqViyXMDTdOy2TwhCmNBsVTSTdNx7HyxqJtmvlh0fR8iUiyVJUnCkpItlSGEWFEz5arAmiKDbNEhLqIcUiEo44BxAODsAD0xUiHADZYUlAVEknQ91tqcdhyPAWhEIkYkQmRZ1VTDMiMRU5OVgBNJkt4DJcJ0NBUIIUKVSkVBQblcNk3T9/3ZXUfHdnK5Qi6Xd2s2EvU1aH2EvNfbuO8blwLgxExarVar1TISqFqtVatVSZKq1Vq1VoUQI0R8L/SCUAjhhzgIcRhKASU+Qz4jhEkulwImc4QDRnxGEIQ+lXyqeEwWnHhMkhgSgHBAACD1cJDvWC+EMGOs5tvFUqlUKlXKtVKpVF/xqZ5aKpZKpZInK5DolNHZWea9AWOUUcooZ5TWarVazanZtl1zBAeh54eeX2dpgFOECOMX5pHwrnDR7KXOFyIIGWCAqEuX9Oq6sXLFimP9A5YVaW9vp1TEk03laiViWkLAWCJ+6PCxwYFJu+bFYgMQIs9zd+8dpJQChKLRuOPYAABdN2bip0/7DHJYT5+CJqYyTi2AUAFiNvTV3LEr6j8c1E32mOCsLo0zQblg0yX0fAljBADGpG7CxBkXlAEknf4dG+M2idOfPzMaazg9WQdBoCiKqhqqqjYlUpSJMKDxRNLxXFkmbS2trW2tViL11K9+K6jAGDLOG8Pqnnd9Lihu5/vJpSDCBKFkMlEo5NV0lHM6NTVVrdZcxzctvVq1A5/LsnroyNFtW9/cvecwC7GkKvXcRpJEQsY4BBwgxigAAGNCyInFvOd6YGZqxkhinCmK5rkeItJpAmuL+r5F3bydCwgkWTUlnEqlazVfUbRUKpVKJXVN0w09lUwVCkWFEJ9hRVHONxTxhTYWFEI4tl0oFBVIq7WaY9vFQiGXy7V1dE1NZQ1dy2byhXxBjUR13QhClwsG34+0F+8bSUWicQg4o2HEMo8dO6aSnnK57NqOhJRcrkAUUi5XEXFURa9W7HK1QoGAKio7FSQRwYHEJUqZgABgIhGJQ+SFIff9uaIDmvYDC2pGPM4ZgJjUbWDOvndU17DKRMgzBneSNKN1nda8EkIkjrAkSQjjS71tDBGsRyq1HWdycoJwr1QsVioV23GIJAVhEIYhwsbw8BAEAAkQs8xK1aecI0TeexO895qkZvltNZNRY1YsYq5YvjybO0oUSVIlXTVikaYwZLFYTFGUQqmsmQZR5KrteIxpisxxoGi65wYUIgYFQFBwrhAJQMADH2ACwJxVw/TyWyDOgOt7hmm4jn9qrRpcJgEASJZkAIDrunXhd9YWr2bXaEjrJ2UsCawKIWRZ9tz3wiypzp4jkUg0GqOMpVKpbDbb3tZBMInH4j09PQENY01JjrCu6xjmuOAYY/qem0xdtPhSZ8ds6ITpWwEQSaYYC6Mxs60jzRgbHhpNJBJDQ0PRaBQgtGfPbklVDh/td30/FMATAEuaF3Is637AISaMA4iJQBhg4viB74cQz9g2IYARQFAgKOqZ5bCuBKGHMHAdl0POZ4PJwIa8EGKae3EIPC8IOSWSZOi6jCUZSzKZLUQhRMZS3VbY9VyvWm18U9FQ5pyHJ8r5QnBRz4kShmG5VM3k8pIsj09mStUaUeT+w/0EIc9zJyYmU6lEpVS+Ys1qTBCEENUbAoCZVj+H+sxGdzlpqXim8w1Apz7mUqNOhXXacl07lUpce+1V+/f3JRKJ40NDvu/XarWj/QMtLS21ml0qFQNKK7WqpKuuHzCIBJhxbROwfnzWCBCnC7c1K2Oetl9nouQgglVFN41IxLJmg/7U4/7MHjUlEpZlGbqBZnKwXFJMbwNTWigW6lY9E5MT5XI5m81ms1kI8J7dffFotFIqT06Op1IJCCHnHGFw6fz1zoT3Q5aCHABOQ88w9XXrr2DUbmpqUlXdcbxFixbVKnZbe7vtOYqmdXR1FsoVJqDrhwBgDt+7LHi2bZdzBZWIekShTCaTmcrU7JqhG/WQQflcDkqG7/uEkOASy1Kzxs2UMc65EKKltWX37j3JRBJCaNuOqqm2Y8eb4p7nmbqumk3pVGJ8suw6LsTvdRe/1yuCaZqAXJalVSuWLVw0H0JRrdpXbrjKsb3rrtsEAJBlef68+YyxNWvW+L4fBPR884+dQz3O8hGq2bbreTQMhRDBLMIgnD0KAoTw9KfvlTsDhFBAkC8Wi8UiEGhyYuKaa6/NTOXWrFkTBKEViS1evOTwkcMbN26sVqv333efhLFh6FAAhBHC6D1QydbxLuNLnSjv/CQBMCEQCUWRMAKJRHzd2stffvH55kRy+6vbfT8sl+y3d/VpmtF/5Fhzc/OxY8cCL8zni061JkkKAADPTlcIzi7d4VzvhlnAMwBDiKe/c6JgCGdFQw4BwZKh66lUqqOjqyXVPFs62zvm9/Qkm5paUs3JZMKyrJPdji8ZphWYAAwODrV3ducKBcOKHjh0OJPJWLH40MhYsilx6ODBeixGhERLunled48IGeSCQIzBe2cx/F5wqbpULoRglCKEaBgyzhct6EkkohFdK5fLum727d0XMeNDIxOKqg8eH0wkEpRSu1aTiHTs2GCtXJkONHJpnYemZU9ESBiyQrE0Pj7uzMJ2GjExOVmPYQfIezqzZLPZSCRyfOh4R0dHLpcDCOZyuTAIIpHIxMQUEKhQLOq6IQRfMK8bAyETCUMIOH/Pkh5eKElNx509Ud75GxAqigIE0o2IZcX+8POfHR07fu11V+/YsePWW2/fsePNyy9f8+q21xYtWpQvFrmAmmZUKrVUKp3N5lVVn63qu6aqE7FDzxQuty7bUj/0HDc3N4riLBzb8X2/nvnt3J5ajy/S8BRxNqfn2ZgljQUAENAwoCEHYuHiRflicUlv7/jkZCKZLJTKqqbJsnz06NGerq6x4aF77rlr/vweSUKCUcZChM8tLSVsDAh9DudPwSXnUvVogvVjFvqA+hiy/+svvvTUU08sXDj/8ccfv+HGG5555pePPvqJ7//gx48++olvfevbd91152M//EFP97xt217PZvLFQrmuCgezy9QzlDNiNrZE4zA9c9MIIVDdV12vY+avbhgzx4ZpqKp6rrlDTxEMZkNRnpsZw/TalgOUKxTe2rmTMe553tDQcUTw23t2S4q0ecsrHe1dO3e+fc3V17744osbN258+qknHnrwvoipcu4DzhSCwYUmVT8vXGJ7KYEAQxwALpiuEkCdeFy98/ZNmYljPV1tr27dGo3Gt7+6w9C0keExxnh/f3++WBwcGgl8Oj6WHRke0w2HBSHzKQYhJBINKcaY0xATifk+lCRZ0SCEbrUKIFQ03S+XgKpgWWa+B2QZBB6UZCIRRhl3fawoAgA4LTmhWf50Ur9CCBOJRESK9czr5BBUKpX58+e7rssoUzV1yZIljDGIkc+waZoYIdqopjjp9WdXAgwAFkAFM8ZkQgI7NMy447oYC8Z8oig0pABwRCTuh4BIkixzzgBACGGAYOh5kBAWUI97g0PHrVhkx5tvWPHYgUOH2rs6R8bHO9q73njrzVgs9tprr8Us6+CBA/G4WasUrtxw+a6de4dHRu2KB2RFVdWQ8VnJbHY/tLFXG17mPDNdXfT4UmcCRBAhARFrbUl0dbRcvXHt1MTIst6luVyhd8myyampzo7uw4eOrFixwvG9latWQoB7l6xgAFqxeC6fd1xX0xQJQ4K4hAXBXCJQ1wgkQldlTj3PqUgKBoBzFkimDgTDkEm6CgUnmiJ4GNZjjkdNjKd10PUgYGeqcBAEtVotl8+Nj41lGjCVmZqOOZzJ5POFarVKKZXObZWu6JpuWZxTggWnPkKcB74khIRhxNSQ4Loqa7pGENAjJiEw9F3BqGA0dGuhXUUYipAqmgYwOnjkMJJw396+1atX7969+8orrzx05PDqtWsPHz22avWa/v6BdLrtyKGDy5f2jk8O33D9VRs3rO7sbEaIA7dCGVUUifun2UK4WLhgkuIA8LomekYffTpALkDI/YqmS5wGDzz0wH/8j/9xxxtv3HvvfV/+8n/++CMff+yxx+6+657R0dGOjg6JSG++8damG2565le/vu6GG/f17V+/fsPkxERTzMKEKjLHKFBVJpEgHlOAcFua47JEFRk0xQ1Dx82pqKkTUyfpVEyTQCKiNscNGQlVwfFkk2ABQIKK6UFZJ6wTstRprdHrUc7ojDkJpax+SCmldFop2nj1zN/T8m7qB57nmLqqKdjUpGTc1CQQi8hRQyaIxy1VVaCKQcRUCaaWKRualE7F06moZspNqbimknhUk5CwLCtfLHhhCBA0dKOtra2/v7+3t/d/fOfbn/7Mp7/yT1/90r/7t889+9zdd909MjrU1tIMeKhq5E//9ItNCcuIx6hToYwBTmdSaZwqz/EzlHPFxVmtnGUGRJirmtre1vyJRx9+Y8e2+fPaPc/96U9/+ulPf+brX//GnXfes3nzZgzgqssue/bZZ2+88aaf/ORnixb19u3d57lBOpVasmjBrbfe+qOfPH7NNVdv3brlwx9+cMvWreuuWD8wMLB69eqBgeOapnV0dIwMj3V0dJTL1UqlMn9+z8DAgKkb0Xhs/76DVryp5vm/ePLpXKEoZsInnEn1UIcsy6ZpmrLW3t5eKpUggrFYNBaNUUZVVY1Go9Fo1IxEfQ4JJnTanYGDBiO+UyFhZJqxBx+8K2rIhqYYqlareLpmUOFPTU30LJg/MZHxAr+lpeXYsWOtre1T2WwymQAA5HLF5ubm/v4jzc3p/sP7l69cNHD0EIJw0eJFP/vZzzZu3Pjcc8/fcsstRCKvbt++atWqv/zLv7xp003P/PKZ7q4uQ1Of+PnP7vngvY//6PsPPXjfyETmxRe3AMS5qfHwRF1nBtjFwXmT1BnTWjacJ5gEYSDCUIsYjAfrNlweuE40ZsSboseOHRMIuY5dq9oAoMB185lsV3d3GAS+76eSrc88/Zt7P3jvwQP9zc3NlUoFQx6PmlFLXb504e63d8yf1/n6a2BeV0u1mGlNxUI3qSjK/K7WajGzvLdnYOB4Kq4vXtiFqJeIR+OxJh640XgqUyjLdR9OgSAEUKCzJ3QMaZjP58vcNnRcm4Vdq1arpmlWqzXHcSgHFOD6om/WQ0bA0yzi6k8KPZ8rcPmShVaEqAQampaZyLe2tJaqpWTS6OzspEFNN9LxRFO1kl22tIcg2tbemslM8ajS093i2AVDV7o6Wkxd6+7oFIwt7F26feurzc3NddvAhQsXDh0fWr169fZXdziuCwBwXDvw3KaYxUIfQZFqsgaOD65Y2TsyPpXN5DmjAEIiKRgh1rBuPRNlnTvJXURZ6sSqijIqESJrmhDMiup/8n/8YTRm7Nr1xjXXXPXDH/xg48aNy5Yt+8EPfvBHX/jCiy+9lG5puf7667/2ta/dftsde/bu6emed/nqtW+++cam668/1n940w3X2U75ynVrVAW3plO6Krc1pxLxWE9XRzIRn9fZlowbHa2Jns50Z2uis7Wpoy3e2drU2Rbvbk12tSa7W5rbW1OoIVX1WbSyfGYPNQzDgAUBCyhl09RUq9VqtZlpL6SUzrQeAhy+ozEuEkDwUMLQ1OVU3OrpTHe3J7s6m7q6UsmEmUxEmpNWc9JqaY4lY3oiqrc2x5qi2ore+Qrmy5fOrxYz3e3Npfzkdddu7Nvz9m233bZ7955UKmkYxr59+z7+8Y9v2bLlvg/ely/kxyfGP/mpT/74Rz96+KMfLRcKfX19n/nMJ595+snLV61sbWsZHx/94z/63NrLV1pRM2KZCGMa+uxia9UvrnjOAeAQCl1XJIWkUqn/9Jf/YcHCzq99/R/v/eCdO3e9+fTTT/71f/7rnz/x5Fu7dn/+C1/4yle/SghZtmzZf/7yl2+/4w5K2es7dqxcterJJ5/saGsvl8q73nxrXlf3m6+/1tnRPjE2HrfiA0cGVEkdODJQypcG+wer5eLQYH8uM1ouTmWmRjJTw9mpkczUcGZqJDc5nJscyU2O5iYnoOAIcHjWHEwz4WUBACAWtaLRaDQasaKmZVmWFbFOwZxGnBsF5XTjmWOCKPXLpdzUxEghN17Ijxdy4/nsWK1SqJZylXK+Ws57drmQzxQLU65dGR05VixMHu3fH/h23943NRUeObwvGjMmJkYnJscjEXPr1m3r11/5+utvGoYBIfzGP3/jzjvu3Lx588DAwB133vnlL3+5vaNj3fp1f/u3f7d+3fpY3PrmN7526y039e3Z3X94/+c+/QfLl/XKBAEaUt+7MJnpTLgwkuIAzNV9TZd6YF/alIhec80GAOmhw/vmze85evTIzp07Fyxe5NPw5ZdfAQBEIpGxsbF8Ltfd3Z3L5YQQixYtOnDgABci0dR09MiR+fPml0olSpkVNQcGB5OJZLFQ6mjvGB0ZicXi9ZiZNAhURQ9DHxOkKBImkBBU/02IwARgIrAECIEAAMgROtvG0RybjZCGYeiH1A9ZgGUJSwqWFIkolHFGBWMgZELAk1WX0y1zhpUKZ0BCsmlE4k1NpmlGIhErYkQsnWAuEUQQIAjIMoKCAc5UmWiqCgDQNS1uRYu5vGVZNKSh50ejMc5AS0v7oYOHu7u7x8YmqhXbsmIDAwPxeIIzMHDseMyKR6PRI4ePhkFAGT127Njg4HBra2u1XNmz6+2lSxZzGnies3r1qhWXrVRUPNtxZ6n/ueN87KWm1Ykz9AQ4dx3AGUEc8JDzgAVuczqZSMRbWhJ33nVbU9J4dfvLa1evTSZannv2+Wuvua6tteMXTz69fPnK5ctWfvUrX+vs7L5+043f/f4PepcuTyXTmzdvvvaaayrlYn//4RtvuKFvz562ttZSqerW3LgVHxoY7OrozmULqVQ6lyuk022OF0RiUUgkw4wIhBXVMKMxIquxWJOmmbKpyKYiG4qi64xyzwsU2UBQnpsXBQGABEQzlkPTZ3zfdxynUqkUisWxiYmxiamxicmxicmx8anR+sHEZK1me55HqTiNYHvyvgIXAkKIIZAQ1DBUZdUCgnAhq4quKgYGwjR1jKGiSggBXVckQiQsEaCW8rWoGfc9ISMDCJLLllrSHcPDIwsWLj58+GiyuaWlreOFl16+8eYPTE1mt2559XOf/cMdr72Rzxfvvvveza9sPTow9G/+8Is7d/e9tv31T/7BZ/fs3n3s2LFbb75lX9+efHZqzZrVl69ZFY9HFYKR4JxTxkIWhJwyiCDC581uLoK9VKQpCgBHCCMMMMG6Zd1046ZPffoPDh0++I//+F+/8IXPtre3feUr/xSPJ/7oj//ke999bPPmLX/6p1/y3OCf/unr69dtuOGGm//+v/y3iGk9+KEP//3f/11HR8cVV6z7zW9+s3LlSibovr59t9122+s7dqRb2z0vsG1P14xsNq/r5uDgkO+H/UeOOrZXKZTKxVK5UCwXi+VCsVJ3ainlC+VCvlwolEqlUh5hiBHCCJBzU3ZzxiWJRCJGItGUSjWnUul0Mp1KzZRkOpVKGxFLlmXOGXffOQMnh5xgTAWv2ZV8sZjNZjP5QjZfyGYLlUqlVK1UKpVKrcYZ93xHCOb7/kwAomqlUvEcu5DLdbS1TY6P9y7u3fziK8l4WtciO15769prrtu1a3e1Yt99973bXt1erdpXXXXNk8/8cmx86pGPf2JP34F//Oo//flf/F8hA3/2b/98w8Zr73/gwb/5m7/bvXv3F/7o88cG+p966olFixb87d/9Z1VVCcaSRABjglHq+2EQXtgy8F2RVLVSU1WdMkqw/B/+w7/v7up48aWXfvKTH993333z5y/8529+a3ho9Pbb7jQN63vf/f7evfuvvOqaw4f6n3/xZcOwFixY9PJLm4eHRi6/fO2e3XtzuWI8njh6dODg4UNtHe2H+48wIBTNGJ2YlBXtyNEB2/XzxbLt+gDhSs2uVO2QiZCGdrVql0tOueRWKm6l4lTKTmU2fVm1YpcrtbLj11y/4vkV36+cSVzgEExbewKuG7quG5phGroRjzQlIvGY1RSzmuJWfLpEmkw9YhoRUzMUw4AN4tSpyQTq6Tc5CjjyGKIc0YCHHgsC6oeMlmulUrVUp6qaXcvlcq4XFEuFMHBpWAv8SuBXw6BaKk5qEhgZOo4oLOWr+cmcrhr79u5LxJKAw0P7D3XPW5DNFd54a+f8RYsjVuzlLVvNSDSeSB3uH/z5E8/ccNMtWFJfeWXroSP9d997XxDQ73/vsUqx9Ief/Zxr29/6l29jJH3yk5/p6ZmHZAIAl1RZN9QL2069cJKCAhBJxghdd+0my7IK+SKlghCSSCQ1Vfe9cHRk3DSjhhHJ5UpH+4+vXLG6p3tB/7HB48eHl61YecX6K/f07W+KJ9ddsWFP3/4wEKtWrp6azNZq7tLlK/cdPBRpakqlW8fGs+2d84hqIFlNtbW5lDa3dVAAm9s7XEqTqdZoNB614tFoUzQarxcrGo9Gm6xowozHI9F4JBaDBEECIeFnDYdxQudZrVbz+eLo6Pjg4NDIyMjwyNDIyPGRkePDI0MjI0Mjo0Mjo8dHx8ey2WzNrvn+O4emFRBQQZEEdUu1ElEzalmxeCSWNKJNTem2VLotkUonmtMRK6bqRiyeNE2LSATLGMuSJEkLFy5kNOzu6XFdt729s1SsGrq1asWaXTv39sxfrKjmoSPH0s3tqZa2Q0eOzpu/MJFK7z1wGCn6tTfcDLA8ODK+8dpNy1dedmxgZM/b+9tau3p7Vw4ODo+NTWiaGYsl6iY/MpElSVm/fl1HVxcAwJlrAH3uOG+SgvU0fBwBgKJmtLtr3mc++ZmWVMs//Lf/PjY8dsuNt3769z/3m189+/bO3RhIX/g3fzw8NL75pa1Y0v7sz/6iUKge3Hc4Hkt96IEP/+jxn01mCsnmto6u+VtffV1WjHUbrnpl6/Zkc1vvslUHDh41zDiStal8qb17/pGBoVRrZwgwlnU35FDSGCSFqiOw7IXIZ5gjZSpfoUJiQK75vOZSKiQGVJ8inwMBUMW1GRCSqggIBEB11fEcY+r68gJwALmumfFYIhJNptIt0SbTbNJ0SyYqSKYtPSLrEdmwtEjEUHVdkTWCSd1popE/nWRBICDgNHQCfyKb84LQDbkXQtvjIcXlsse4BIkWMASQajsMIIkKFFDMhWxG4lP5km7Gqo4/f/GS/oHBaCIZjSeGxsbnLVwUcFGu1hYtWdp/7LhL6dJlKzL5wvHh0Ztuuy1k/Jvf+vbV117f1tl18NCR//6Vf7rrnvu7580vlivf+e73Hv7Yo2vXrS+Wq3/5V3+dam77489/UZHUf/7Gv+Qz+fvvf/C22+5UFA1LqmjAuVPIhWnPEQAcCKQoypLFi7/whS9UKhWC5XS6PQzE3/7t34+NTkmSNK9n0U8e/8Xu3bstKxGLxw8c7H/9tbfCQHR2tE2M58bHspyhWCz5q18+a9f8eCy1p+/g6GS2OZ3a/tqbU9lirCm1e8/+csWZmMoPHB9zHLv/6PFcoXzgUH+xbE9m8o4TDo5MjWUro5nK6FTVSoBi0cvli5Gm8kTe9UXBrPBMruYGpObTiBkvlasInMWh+4T6mwuum5GgUIaSRowIr3pANohmqaoGAKBYUYwoIRJAGqPiXIclJpKquT4bHss2WTEJScWSNzxWnMhUqrVyNN42NlWWlVy+5HEujo/mKx49MjBi+2IyWx7LluwQyQNjVZ/v3HegYLuTxQrFks/A6zv3VBzfB3DLq6+HANXc8JXtO5YvX46Jli9Wfvnr51TNAlgeHZva9faeaDwxNDKRK1S+8+3vNzc3u04IofT88y+Wi5WO9q7KoYOT45P/z3/7793dXQsWLNjz+htIu5AUAeeTPG1uci0ogCRJEEJCcK1m64ZuV10AgKxgNJNKMAgCTVYc15UkwijTNQ1BWC4Um1tbSuVy4Hm6Yaiq5ji2JMuMUiqoqqqGoRWKBdMwo9Ho2PhYPBZnnPm+G41GK5VKc3M6nyvohu65XjKZzGYmLcsMgoAQTKmQZZmGPgRAlomqa9lsXjMijhdUqjbjInQ8IGsn4pnMmIbyaRYFEEcQAFUiqaQFsZ9IxJwahUQVggsuOOdhGKZTqXIxBxGDEB8fyjFGvIACBDmazbR5CoRAkgRE0NLSFAZeRNUkpPqu0FW1ZpesqB4y5tg2liXHdQQXhmHkcrloxAqDwLAilUrF98NoPDaVyaRb20vFsqKpRJIyUxnLjHieF9g1K5FUFKVQyCOECCGe7WKCY9FotVoNKYUQ6ppGGXOLFSuVDIKQMqprWhCELAxVVQ18SgixnUokGq2Wy5GmJse25zKnc53QLpykAACAC84owkQIKHxftSzPcWRFoYxxxg3TcBzHULVapWJaluu6jDND1cMw5EBgjH3PU1QVY0wprVMnA8z3fU5DRdN83wWUIkWRCPFdF0mSRAgmRAjh+379JEDIME27UgNcqKbJOWOMAwAIApxzWZYdx5FVJaBccAgEA1iedisWJ0iKg+lZDwkABAK8zscoQJ4kSX6AWcABIRBCIpHQ8zTNCH0b4lBC2LEpAAqSlHckKcABUiQeuhgBwYCEJCAIDSnjHsYEQigQxBghhIXgjFMahoAxrCgQIxoEQEAgSYBzgBEQAmIs6t76mACMIEKCMhAEQJYBAFAA4fsAwrr3DsIIIRwGgQgCwABUFFA3M2Qc0JBoGql70gge+L5mGHV/a8/z5lqDXVSSakTD5sZcY66GCQU1ZlFqOBYzoSNPWhOd2GCCDZtNgjU+on4AT7mzECemntlPYWMlZ77OIZgbbn+unRCkAAAoEBAITdtZAFBv3YZI/GCaHHm9elAgMKOLEdP63hNLgMZl4Ayms/7N1nn2vWb96ep5K2dfnEMAhHjnACxn9qNv3BVGs1sIDabosOG7vO7XfBpL13eO9Pf+xJc6red4/YUFAEBAdsLcr+5zMPtuJ1IRzTTQNKuZvQ+apb+Td4WnsypyeKaIwny6z2Z6jsNZpZ04qdp8OnoCnKnnrG/gGfXODS7zDeYwcPYdTvUrRHxOHIxzkI55w0vPvbwhWA2aNZaAjTvcDVlDZ4bZhVtjnzdJzaWJmUY8EREFwLnhds4YFOTsN5+2h2wMYNqYO6Dx4jN15MmZCARs0P6fvnaobkrAATqRC+6smIlGzGefcqYvnd0CtrFVzx6o/GzteZ6KycbwWhcR727b+KKGwzqvsOnnjtmx+E5W3qc1D///Jy7pq52/vVTjfj7kM9ZnDb71Z7ZFmptG+wTqXz3dXA1Pf1y/viHVc50c51zdUJ86C+Xw5JmhQeRCjUN8lgvOZME7TaKomTMYgNkp72xEKc7AUyE8Udvp9pmdvU98951XXo2hDc7IEc/URzPNMXv8biKdXSw2cxF2sP+XwPnq/f43xLsXz98HSqpzlxk5s24ZMfeKd5qRz2cQojkioxANPoAzd5tZnM0M0TOsAC4GTjtnnY2pCDR3tKNL3WXvgqRmFzuQXzyh6pR5oZF6Zp97uma9gCiP9fRRp97pdDev6xQQ5BBAgepry1MZc4N24KRHQQFOH8L/9PkBz55C4jQz7Dt1wJyp+eTnXdQZ5gLspRoqwYVgnDsBp4xAhCDkXsjdQFV0IBALQxaGSHAZI02WMBCChkjwunUODQMAOOdUkjAGQiZYMMp8F3AmGGWBh6GAgLLAp47NaQgBJwhAwKHgkoQ5p5yGgLP6TCQhwhlXiCpjBQrEgkBTVRpSWZYRhJqmSUSirocBxEBAzhgNaeAJCqhPqe2LUNBqFXKIAaZOIDiUiIKhoqsWYJBTxlwbciF8v+5SwnyfM49AoMoSFJyxgLFAkjBzbRYEEEJVlRkNFYKZ62AgTF0lBApGTV0VjHJOmV2BgPPAgwJw1+PUxwQyFkIkGA0Y9VnocU7rto0QcCAYBFzCkDk1iIQQjLGQ+QGB05o27noEIgQgZxwhhBDiYcgpQxhxxiGYDjfKKTN1FQDOaMgCDzCqSgQDwXyPQKBKhGDC7ApBSMIYQThbzp1OLpBLTYeswBBChHRlWkbmAOkS49xxKxIhkqx6TlVRNYRQrVZhjEmSpKhqGIYAciIjRkMIoaJizw39wJZl2aNcVhCjVNI1BGG1XInGYvXY4m7gC4Co6yBFE0KYpkEpc10XYiRLslerqmYEYxCGgmAiG3Ld+5OGYeDaglMAQCQa5ZwiRDjnLPBlWWUhRYgokYjv+2o8JgSklEIJCMA8zwEEaVgiBAUhAApBGBBFDUMOACOKRKkrKQQj6NQ8w7J8LwwCDxBoWKZddYVgmq75rgeQkBWCIFJVRVGkaXtURo10S7lcIooiOMSqqpm667iYQM6prMqSROqhYjjjiqKEQVB3/3eqVSBLdY9FAIlpGQgSSZJc1xWW7JbLAGOiKAhhSkMkSTwMdUOza0yWkKJo5aILALCrNQiFohKMdQygECKklEiSqqlh4APIZcsKQzod8ez8cYEkNbM/zR/68H2mqfu+DyF89tlf9/R07969GwCk6/KGDRuOHD58z113B2FAQ5rP58fGxy5fvRYhxBh7c9fO/iNHYvH49ddfG41Gc7nctm2vxOPzNt1wXRAEjLEDBw5osrR02TIAUBgEk9nM8NBQuVz2/fCKNWu7u7tLldquXbv2HdgPILn+lpvmz5unKYrnBsVSqVwuL+1dGobMtmt9+/YO9B+9/vrrOzs7Q+pv27qtWq2u71338gsvKLoWMc0FCxZUKhXK2NGj/QSTNWsv6+8/BAC86QM3N6dayiX7yJEju/a8vnBRz/hQLgwdALiuq6lUy6233lqzbce2N7/0SuB6ren0FVesX7yot1wuv7x5MwI4kUz6gXvN1VeXSiVZU7dv3zY2NnHvvfeahpnNZrds3TI5MQEhMU2jta1lw/oN0Vj02LFjzz//vKIY1113XXd3t+M4fX37+vbsWbp0qWPbQ0FAA+/aq68aHxsDAN18882u6xcLxa3btl5//fW//e1vq9UqgPyKKy6fnJoSgk+MT0TMyEc+/CBGYRjyMIAvvbg5lYy6rm177ujIuK6qixYvmhifKJaKmzZdn25u9sJg165dR48eBQBQRt87kgIAQAEikYiiSE8//WQun4lGo7ZdufmWT3T3dDz11JOUgeuu3xBSt1TO/eQnP5FkiYZ8/fr1Bw/17d+/X1XVT3760z/6UfmWD3zgqaeeKuTzS3oXd3S0RaPRN9547cCBA5Ikl0olQ1Pe3r3zQw889MKLL1Sr1dWrVxua3tbeNjo6unXrVoDIypUrdFVzfW/b1q3HBwd/9+Of+PrXv16tVh9++OFf/fqZ8bExhDES4Lrrr1NV+bHHvsc533DllYwFixbO37ZNAoBbUXP5iqU1u9Le1v7d707WarWeea2l8tTGjRtGRkZ++9tn06mOTZuug5LX1dXjVmmlUgWQKor00Ic//MMfPuZ5XkdH15133Pny5s0PPHD/rl27vvWtb6qqumDBAtcLlixZ6Pv+9u3bR0aGStVKJGI+/PCHd7719vDIiKaqiabE5NgYwKCzs/Pq665++umny6XyZatXp1KpW2+9NZ8vPP7444qi3HrLB8qFwsKFC5ctW/bP3/ia55DLL1+NILzm2mu+9S/fchxnSe+SBQu6FyzoRphDxAxNWrZ0EWVepVLxnOoUoz9+/Ecrli9UFOXAvgFV1ZcsWTQ6Onz3xo3f+X+/U61We3sX+oF90803lEqln/38JxjjdRs2jo2N1UN/XwDO316qXgQAALAwNHUjcD1NVpxaScJodHgAQ7Zh3RURQ3ftGuABRAJCgSBg3Nd1FUDuunY2NyU43bDuit/86peTY6OuXTvQt3f/vr008AEXhqYqEiYIeF5QqzmMs1qtlssVFKJGI1Y8Fu/bu79cqtrV6pbNrwRBIBgDABSKxUqllC9kGQs8z/ZdmyCIBG9KxOJR6+WXXvBcGwK+5eUXi7k8gFzTFFUiuipHDJ3TsJjP3X7bBySMohFTkyUMxeHDB6EIB48fffynP1zSuyAIHT9wiQyaEtH77v/gT3704/GR8XKx3H/oMCZ40cKF+/f3vfXWW77vOm5tb99u33drdiWkfrVartkVwULPsXOZqcWLFsiyXKlUxifGAQBC0MtWr3rmqafdmq2p6p5db0uYtDa3bNuypZjNTY6OvfD88w8+cL+E4Vtv7LjrztsFYL7vUhYEgbdm7epY3Orr23P02BGEAecUYyhJOKS+LGFDUyESGLLAq3leVQhaKuQ4DYgEsCQmJsfu/+C9uqqw0I8YumD0V08+4Tk117W3bdlczE1Nm5O8U3zOU/FulAicEGTo+p133YkxDELnhRd/izF+/vnnH/rwQ5xTygJFkXrmdd1w4/WJRGLfvn2qRtZfeW13d3sylTp8eF+lUuHcD0LnnnvumTdvXiaTyWbzV111VWdnZxiGhw4eGhg4DkDdSw7FIhYNmWGanu35fsg4U5AiyzI7vZaI33bbByqVCmX07bd3O041CDzT1Go1G2Gsatry5cuvvfba1uZ0d09PPp/HiOzffyAWj95+x+0ESwijSqU2OTEhySqAwA/ciGVQSgGknFPbrkRjEc4pAMD3fYKJLMuxeOzo0SNB4F1xxfrLLrusqSmx5ZVXotGI67qbbriuVCwpivLSyy+99NJLK1euvu7a6zRdO3zo0CsvvQQhQhAKIWq2zX1f1nXP9aq1qu/7sqIAANzp/ABgdHTYMLS7774TQJ7LZ7773e8s6V2ydu3lbW1tu3btisUtxkLqOa4rRSIGRgBArqiS57qGqSMMPc+hNKDUozQIAu/4QL+uGVdfvZFImNOgVikQFS9fseyKdRsikej3fvDY1GS2npD8fHEBJHViwUkpLRaLLzz/Qs2u6BG9WK4GlGFZ+eGPf/KFz39ekmXXDwcHjr366lYAgOM6yVTTSy+9MDw0fN/997388ouLFi1av/6KoaHBbdu27Nz15k033oQQ2Lrt9b6+fbpuOI4NAAIA1j2i/IB5Ic0MDa9ftz6ZSNqOjSWJ0tBxXAAat2+nq/fbF54PgqBaq2iykkwnU+nk+MR4JGoyBoOQ5fPFrVtfdRxnyZIl69evD0IeMvHajjd+7/d+r7u7+7cvvNSUbE41tzmepxMSi5ujo8ej0bhEJE1XGHPffnvn5evWZvIFFULDNCMRY8eO7VddddXE5MSuXbuOHz9+5123V2vlWq1CKT1wYN/k5KRA2HO95ubmA4cOvrbjDU3Xbr7pJi0S4YzZjrNg/oJarRZibFlWPbNSSzo9MTkJAGhtaR0YHKAh1TX92d88e/sdt87rmfea8qph6rvf3sU4UxTlwQcfLJeL6XRqQtB0S8r3XYgEQiAMfVmWwyDwfZcYGBOICSYSkiRcq9X27u974IEHehctPnRof9e8zuZ08sCh/UePDd525z2cAYDgHHXXOeto3lVaIoSQpml33nU3DQM9Yjz99NO+JzyHu2744x898dCHPyQ4WrVqDSFqGIQhDSuVSqZcmJjIPv3Urx968OFnfvmMrluf+tTnPM9LJpLbXt1mGtYdt9952aorGOdH+4++tuNVLCAQBAiCsYKRJDjcum3rI488UigWXM+r1qq//vVzM5x5Tnn4dz42dHxI1eT+/iOvbX/9ow8/Mjw0FInUDeEHspmi7zHBMQ2B7zHb9jkDEtG++90ffPQjH61W7bfe3P2hBz9aLJUIhk2J+M+eePyGG26+9dbbPc8NqXPw4MHuzsWf/P3PDAwOdHZ2bXll+9DxMdPY/5EPP5zL5UzDzBfymmY4jmdZ1q233l7IFwSCBw8eZozdf/8DY6OTsXhsX98+RVEqlcqLL7xwzz33rF+/Lp8vxOKxJ5948ieP/+TWW2+1HQcAkEwk/+WbX1+7dq3jeiENt2zZtqS3FwC0csWqVCrleV5TU9P27ds9z7vnng9SRhVF+cWTT3Z3dd14w029vcvCkO3d8zYAgLHZSBAIQizLKmfgiV889dBDD9Vqzo4db3zwvgeqVRtLmkQ0L6SEKPyCcgSctwleY2Y3QmAsHlcUxff9arUKBGq0vKkrM2Kx+OyZ7NTU7LGmnjBCTafTuXyuVK0AAFLJNJhRB5dKJSimLYeE4GDarIVjQtrb2gEAY+NjYUOoeF03XNcBAGiarqsnomiWiiVVUw1dV1V1YnKybvpTj+46k0QKAQDqegcIIaO8XvPm5uZMLlur1QDkpmk2ihRuze3s6gIAjAwPB+GsRwNvb2/xPMd2HM/zlBljt4YmgQCAVCpl12r19FSyfCLGdTKZdD2vHl9PUaT29jYAwNjYeMNinsMTdk6opaWl7m/oOI4eMQ3dAADYjt0YQbRufVU/rlXt2dfE9YBpEAIANE0LgkCWZdOKMSbyxVIYUkRwEAQn7iPembxmdlrfBUkJwDilQAiIZYQIhBA1GGpBiITgvGFTrN4cpzWjo5QJwQDCsizVK1ennhO9PtPfQghBOcYAAECpOOHRX9+6phQAABUiYQghBAIDAHy7BmVZURRZkmynhhHBhJxktSjmNBnijCOMFEUJKGMhBQBgieDpUFIIAIABlCQJABCGIZtebHMAuKQQGvq+74MgJIbecP85M4cQgjMGhACQzDZIItEUBIHv+2FIhWD1aP2UMQBmGcx0DNz6qEAQccF5PaMpBPUUOpQyCGHD2J7WmwsuAORixppv7mYDYpxDjGRZ5gDRMEQS4YI3ph49d5J6F7IU5E2xRGtrm65rtu2ounGisTicJYXpJkDTxzMs58RvzgWloSzLACPOeMhpvQUBQhCK2aaZ1hELAQDQVDkMQwAAwlhwUGfP9bthggEAjDKIpivAOa9bD2OM6gpDz/N8L8QEE9JgUzWX0BHCnLMgCISAEpEAAIxzgjFCBAAAEeKMhZQCAAjG9U/rLaNpMuOUM9YwGBpMkyESYtoitL6k4lzUqzdbgXpkc01XGKX1yyCqM2s4nWCSz/Famc6Hy/lseqZTB+1JbX4SIMT1+C1+GOh6hAE+Njo6MTgItRNDYm7uxdPRxQwufMUnOMznC6VyGddD1SIJzQaOng2OIwQUJ15jjpFuwxQpuFA1NWS0VrOJIoOZiU9tmLz8GadeIThEot7NlAoA0Ox2QRAEumEAABzbnvGoABCi+vCdpWDOGQ05YFTWT0y+jW0d2jXVsjDGrutyKnTTAAA4NVtStJkKc4iQREj9oZpeb3ouhGAsAADUM4lyzrkQaDqJ1jR5IQgRgkJwylh9MMyQPmOcCy7q12BMJAkBAEJKxTR3b5wBpvmQ4IIxKoRQVdW2HQCAYej1YEBoNjEkRDPz+xyj7YbORLIsBzR0y2WoGYJzgCDQ9QvLh/7u3BnOoNZqfHncWK+G8KMnNRCYISMGTlhewgYaPPPIaOQ0jRPZ6TW/ou78O3184qa4YYt/btPPIf0T15zR1puDustNYxUFwGeyx+cQgNPl3G64Q+MW20mxPU4IFWfaaT6DT8CMjfn0NUJMvygHp+fcjW2FzvCsS2h73tj07BQD3+lrGqo4zT/q9UdnGknvvHNZF+HPHXNNAE6uz6nPPTMZvTPmEM0Z3EDO5bvnkvX0nO4z5x0vpgXYDEmd2lbvk51ZnRxnWMMJcf7Mhm/ne/7S2CP/74o5XFPUbWj/FZceHL5fI/QsuARdPz3xncOgbXQYQmeQohqpdcbQq24bPvM5aGAQAp02CPH0dD63SjNLFQBmONZcy8ZznexmZLUTMsRJ0etmMff+c5QLZ71/XYpqeFjjp43SwEl5i08HeIp3RyPnPulDJE71Mzvd/efkKhanNzYEJ95iju18w8Wni9V2AuT9GT6n86c7LT39K84FHL6r1OUXDQIACAiA/NTacHiRHaouFqYlqgtqvtml0b/iIqJx9Te94jstddddKM/O3874jP8Zhsu/4j1BnZ7met6C/w+wCc0X5v4QkQAAAABJRU5ErkJggg==";

function LogoMark({ width = 170 }) {
  return (
    <img
      src={LOGO_SRC}
      alt="ETC — Energetic Technologies Consulting"
      style={{ width, height: "auto", display: "block" }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  HOME SCREEN                                                        */
/* ------------------------------------------------------------------ */
function HomeScreen({ user, go }) {
  const isBureau = user.role === "bureau";
  const cards = [
    { id: "calendar", title: "Calendrier", desc: isBureau ? "Consulter et publier les événements" : "Consulter les événements du club", icon: Calendar, color: C.aqua },
    { id: "documents", title: "Règlement & Code Électoral", desc: "Règlement intérieur, sanctions, code électoral", icon: ScrollText, color: C.orange },
    { id: "chat-general", title: "Chat Général", desc: "Discussion ouverte à tous les membres", icon: MessageCircle, color: C.green },
    ...(isBureau ? [{ id: "chat-bureau", title: "Chat Bureau", desc: "Canal réservé au bureau exécutif", icon: Shield, color: C.royal }] : []),
  ];

  return (
    <div style={{ padding: "18px 16px 90px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <div>
          <div style={{ color: C.gray, fontFamily: "Inter, sans-serif", fontSize: 12 }}>Bienvenue,</div>
          <div style={{ color: "#fff", fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: 19 }}>{user.name}</div>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: 20,
          background: isBureau ? "rgba(43,107,153,0.25)" : "rgba(143,207,60,0.15)",
          border: `1px solid ${isBureau ? C.royal : C.green}`,
        }}>
          {isBureau ? <Shield size={12} color={C.aqua} /> : <User size={12} color={C.green} />}
          <span style={{ color: isBureau ? C.aqua : C.green, fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 600 }}>
            {isBureau ? "Bureau exécutif" : "Membre"}
          </span>
        </div>
      </div>

      <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 12 }}>
        {cards.map((c) => (
          <button
            key={c.id}
            onClick={() => !c.locked && go(c.id)}
            style={{
              display: "flex", alignItems: "center", gap: 14, padding: "16px",
              borderRadius: 16, border: `1px solid ${C.line}`,
              background: C.navyCard, cursor: c.locked ? "default" : "pointer",
              opacity: c.locked ? 0.55 : 1, textAlign: "left",
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: `${c.color}22`, display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <c.icon size={20} color={c.color} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#fff", fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: 14 }}>
                {c.title}
              </div>
              <div style={{ color: C.gray, fontFamily: "Inter, sans-serif", fontSize: 11.5, marginTop: 2 }}>
                {c.desc}
              </div>
            </div>
            {c.locked && <Lock size={16} color={C.gray} />}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CALENDAR SCREEN                                                    */
/* ------------------------------------------------------------------ */
function CalendarScreen({ user }) {
  const isBureau = user.role === "bureau";
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({ date: "", title: "", place: "", tag: "Réunion" });

  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsub;
  }, []);

  const addEvent = async () => {
    if (!draft.date.trim() || !draft.title.trim() || saving) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "events"), {
        ...draft,
        createdBy: user.uid,
        createdByName: user.name,
        createdAt: serverTimestamp(),
      });
      setDraft({ date: "", title: "", place: "", tag: "Réunion" });
      setShowForm(false);
    } catch (e) {
      alert("Impossible de publier l’événement : " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const tagColor = { "Réunion": C.aqua, "AG": C.orange, "Deadline": C.yellow, "Événement": C.green };

  return (
    <div style={{ padding: "0 16px 90px" }}>
      {!isBureau && (
        <div style={{
          margin: "14px 0", padding: "10px 12px", borderRadius: 10,
          background: "rgba(157,157,155,0.12)", display: "flex", alignItems: "center", gap: 8,
        }}>
          <Lock size={13} color={C.gray} />
          <span style={{ color: C.gray, fontFamily: "Inter, sans-serif", fontSize: 11.5 }}>
            Seul le bureau exécutif peut publier ou modifier des événements.
          </span>
        </div>
      )}

      {isBureau && (
        <button onClick={() => setShowForm(!showForm)} style={{
          margin: "14px 0", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          padding: "11px 0", borderRadius: 12, border: `1px dashed ${C.orange}`,
          background: showForm ? "rgba(252,150,1,0.12)" : "transparent", color: C.orange,
          fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer",
        }}>
          <Plus size={15} /> {showForm ? "Fermer" : "Publier un événement"}
        </button>
      )}

      {showForm && (
        <div style={{ background: C.navyCard, borderRadius: 14, padding: 14, marginBottom: 14, border: `1px solid ${C.line}`, display: "flex", flexDirection: "column", gap: 10 }}>
          <Field label="Date (ex : 12 AOÛT)" value={draft.date} onChange={(v) => setDraft({ ...draft, date: v })} placeholder="12 AOÛT" />
          <Field label="Titre" value={draft.title} onChange={(v) => setDraft({ ...draft, title: v })} placeholder="Réunion de pôle Marketing" />
          <Field label="Lieu" value={draft.place} onChange={(v) => setDraft({ ...draft, place: v })} placeholder="Local ETC — ENSTAB" />
          <div>
            <div style={labelStyle}>Type</div>
            <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
              {Object.keys(tagColor).map((tg) => (
                <button key={tg} onClick={() => setDraft({ ...draft, tag: tg })} style={{
                  padding: "6px 10px", borderRadius: 8, cursor: "pointer", fontSize: 11.5,
                  fontFamily: "Inter, sans-serif", fontWeight: 600,
                  border: `1px solid ${draft.tag === tg ? tagColor[tg] : C.line}`,
                  background: draft.tag === tg ? `${tagColor[tg]}22` : "transparent",
                  color: draft.tag === tg ? tagColor[tg] : C.gray,
                }}>{tg}</button>
              ))}
            </div>
          </div>
          <button onClick={addEvent} disabled={saving} style={{
            marginTop: 4, padding: "10px 0", borderRadius: 10, border: "none",
            background: C.orange, color: C.navyDeep, fontFamily: "Sora, sans-serif",
            fontWeight: 700, fontSize: 13, cursor: saving ? "default" : "pointer", opacity: saving ? 0.7 : 1,
          }}>{saving ? "Publication…" : "Publier"}</button>
        </div>
      )}

      {loading && (
        <div style={{ color: C.gray, fontFamily: "Inter, sans-serif", fontSize: 12.5, textAlign: "center", padding: "20px 0" }}>
          Chargement du calendrier…
        </div>
      )}

      {!loading && events.length === 0 && (
        <div style={{ color: C.gray, fontFamily: "Inter, sans-serif", fontSize: 12.5, textAlign: "center", padding: "20px 0" }}>
          Aucun événement pour le moment.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {events.map((ev) => (
          <div key={ev.id} style={{
            display: "flex", gap: 12, padding: 14, borderRadius: 14,
            background: C.navyCard, border: `1px solid ${C.line}`,
          }}>
            <div style={{
              width: 54, flexShrink: 0, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", borderRadius: 10,
              background: `${tagColor[ev.tag] || C.aqua}18`,
            }}>
              <span style={{ color: tagColor[ev.tag] || C.aqua, fontFamily: "Sora, sans-serif", fontWeight: 700, fontSize: 11, textAlign: "center", lineHeight: 1.3 }}>
                {ev.date}
              </span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: "#fff", fontFamily: "Sora, sans-serif", fontWeight: 600, fontSize: 13.5 }}>{ev.title}</div>
              <div style={{ color: C.gray, fontFamily: "Inter, sans-serif", fontSize: 11.5, marginTop: 3 }}>{ev.place}</div>
              <span style={{
                display: "inline-block", marginTop: 6, padding: "2px 8px", borderRadius: 6,
                fontSize: 10, fontFamily: "Inter, sans-serif", fontWeight: 600,
                background: `${tagColor[ev.tag] || C.aqua}20`, color: tagColor[ev.tag] || C.aqua,
              }}>{ev.tag}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  DOCUMENTS SCREEN                                                    */
/* ------------------------------------------------------------------ */
function DocumentsScreen() {
  const [tab, setTab] = useState("reglement");
  const tabs = [
    { id: "reglement", label: "Règlement", icon: ScrollText },
    { id: "sanction", label: "Sanctions", icon: Gavel },
    { id: "electoral", label: "Code Électoral", icon: Users },
  ];
  const content =
    tab === "reglement" ? [...REGLEMENT, ...REGLEMENT_ANNEXE] :
    tab === "sanction" ? SANCTIONS :
    [...ELECTORAL, ...ELECTORAL_ANNEXE];

  return (
    <div style={{ padding: "0 16px 90px" }}>
      <div style={{ display: "flex", gap: 6, margin: "14px 0", background: C.navyCard, borderRadius: 12, padding: 4, border: `1px solid ${C.line}` }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            padding: "8px 2px", borderRadius: 9, border: "none", cursor: "pointer",
            background: tab === t.id ? C.orange : "transparent",
          }}>
            <t.icon size={14} color={tab === t.id ? C.navyDeep : C.gray} />
            <span style={{
              fontFamily: "Inter, sans-serif", fontSize: 10, fontWeight: 600,
              color: tab === t.id ? C.navyDeep : C.gray,
            }}>{t.label}</span>
          </button>
        ))}
      </div>
      <Accordion items={content} />
      <div style={{ height: 8 }} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CHAT SCREEN                                                        */
/* ------------------------------------------------------------------ */
function formatSize(bytes) {
  if (bytes < 1024) return bytes + " o";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " Ko";
  return (bytes / (1024 * 1024)).toFixed(1) + " Mo";
}

function AttachmentBubble({ attachment }) {
  if (attachment.kind === "image") {
    return (
      <img
        src={attachment.url}
        alt={attachment.name}
        style={{ width: "100%", maxWidth: 220, borderRadius: 12, display: "block" }}
      />
    );
  }
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, padding: "10px 12px",
      borderRadius: 12, background: "rgba(255,255,255,0.06)", border: `1px solid ${C.line}`, minWidth: 190,
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 9, flexShrink: 0, background: `${C.aqua}22`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <FileIcon size={16} color={C.aqua} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          color: "#fff", fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 600,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{attachment.name}</div>
        <div style={{ color: C.gray, fontFamily: "Inter, sans-serif", fontSize: 10.5 }}>{attachment.size}</div>
      </div>
      <Download size={14} color={C.gray} />
    </div>
  );
}

function ChatScreen({ user }) {
  const isBureau = user.role === "bureau";
  const [channel, setChannel] = useState("general");
  const [messages, setMessages] = useState([]);
  const [loadingMsgs, setLoadingMsgs] = useState(true);
  const [input, setInput] = useState("");
  const [pendingFile, setPendingFile] = useState(null); // raw File, staged before sending
  const [pendingPreview, setPendingPreview] = useState(null); // {kind,name,size,url?}
  const [uploading, setUploading] = useState(false);
  const endRef = useRef(null);
  const fileRef = useRef(null);

  // On ne s'abonne au canal "bureau" que si l'utilisateur a le droit d'y accéder.
  useEffect(() => {
    if (channel === "bureau" && !isBureau) return;
    setLoadingMsgs(true);
    const colName = channel === "bureau" ? "messages_bureau" : "messages_general";
    const q = query(collection(db, colName), orderBy("createdAt", "asc"), limit(200));
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoadingMsgs(false);
    });
    return unsub;
  }, [channel, isBureau]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if ((!input.trim() && !pendingFile) || uploading) return;
    setUploading(true);
    try {
      let attachment = null;
      if (pendingFile) {
        const form = new FormData();
        form.append("file", pendingFile);
        const res = await fetch(`${BACKEND_URL}/upload`, { method: "POST", body: form });
        if (!res.ok) throw new Error("Échec de l’envoi du fichier");
        const data = await res.json();
        attachment = { kind: data.kind, name: data.name, size: formatSize(data.size), url: data.url };
      }
      const colName = channel === "bureau" ? "messages_bureau" : "messages_general";
      await addDoc(collection(db, colName), {
        authorId: user.uid,
        author: user.name,
        role: user.role,
        text: input.trim() || null,
        attachment,
        createdAt: serverTimestamp(),
      });
      setInput("");
      setPendingFile(null);
      setPendingPreview(null);
    } catch (e) {
      alert("Impossible d’envoyer le message : " + e.message + "\n(Le backend d’upload est-il démarré ?)");
    } finally {
      setUploading(false);
    }
  };

  const onPickFile = (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = ""; // permet de re-sélectionner le même fichier
    if (!file) return;
    setPendingFile(file);
    const isImage = file.type.startsWith("image/");
    if (isImage) {
      const reader = new FileReader();
      reader.onload = () => setPendingPreview({ kind: "image", name: file.name, size: formatSize(file.size), url: reader.result });
      reader.readAsDataURL(file);
    } else {
      setPendingPreview({ kind: "file", name: file.name, size: formatSize(file.size), url: null });
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {isBureau && (
        <div style={{ display: "flex", gap: 6, padding: "0 16px 12px" }}>
          <ChanTab active={channel === "general"} onClick={() => setChannel("general")} icon={MessageCircle} label="Général" color={C.green} />
          <ChanTab active={channel === "bureau"} onClick={() => setChannel("bureau")} icon={Shield} label="Bureau" color={C.aqua} />
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto", padding: "0 16px", display: "flex", flexDirection: "column", gap: 10 }}>
        {loadingMsgs && (
          <div style={{ color: C.gray, fontFamily: "Inter, sans-serif", fontSize: 12.5, textAlign: "center", padding: "20px 0" }}>
            Chargement des messages…
          </div>
        )}
        {!loadingMsgs && messages.length === 0 && (
          <div style={{ color: C.gray, fontFamily: "Inter, sans-serif", fontSize: 12.5, textAlign: "center", padding: "20px 0" }}>
            Aucun message pour l’instant. Lance la conversation !
          </div>
        )}
        {messages.map((m) => {
          const mine = m.authorId === user.uid;
          const time = m.createdAt?.toDate
            ? m.createdAt.toDate().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
            : "…";
          return (
            <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: mine ? "flex-end" : "flex-start" }}>
              {!mine && (
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 3, marginLeft: 4 }}>
                  <span style={{ color: "#fff", fontFamily: "Sora, sans-serif", fontSize: 11, fontWeight: 600 }}>{m.author}</span>
                  {m.role === "bureau" && <Shield size={10} color={C.aqua} />}
                </div>
              )}
              <div style={{
                maxWidth: "78%", padding: m.attachment && m.attachment.kind === "image" ? 5 : "9px 13px",
                borderRadius: mine ? "14px 14px 3px 14px" : "14px 14px 14px 3px",
                background: mine ? C.orange : C.navyCard, border: mine ? "none" : `1px solid ${C.line}`,
                display: "flex", flexDirection: "column", gap: m.attachment ? 6 : 0,
              }}>
                {m.attachment && (
                  m.attachment.kind === "image" ? (
                    <a href={m.attachment.url} target="_blank" rel="noreferrer">
                      <img src={m.attachment.url} alt={m.attachment.name} style={{ width: "100%", maxWidth: 220, borderRadius: 12, display: "block" }} />
                    </a>
                  ) : (
                    <a href={m.attachment.url} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                      <AttachmentBubble attachment={m.attachment} />
                    </a>
                  )
                )}
                {m.text && (
                  <span style={{
                    color: mine ? C.navyDeep : "rgba(255,255,255,0.9)",
                    fontFamily: "Inter, sans-serif", fontSize: 13, lineHeight: 1.4,
                    padding: m.attachment && m.attachment.kind === "image" ? "0 6px 4px" : 0,
                  }}>{m.text}</span>
                )}
              </div>
              <span style={{ color: C.gray, fontSize: 9.5, marginTop: 3, fontFamily: "Inter, sans-serif" }}>{time}</span>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      {pendingPreview && (
        <div style={{ margin: "0 16px 8px", display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 12, background: C.navyCard, border: `1px solid ${C.line}` }}>
          {pendingPreview.kind === "image" ? (
            <img src={pendingPreview.url} alt={pendingPreview.name} style={{ width: 38, height: 38, borderRadius: 8, objectFit: "cover" }} />
          ) : (
            <div style={{ width: 38, height: 38, borderRadius: 8, background: `${C.aqua}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <FileIcon size={16} color={C.aqua} />
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: "#fff", fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pendingPreview.name}</div>
            <div style={{ color: C.gray, fontFamily: "Inter, sans-serif", fontSize: 10.5 }}>{pendingPreview.size}</div>
          </div>
          <button onClick={() => { setPendingFile(null); setPendingPreview(null); }} style={{ ...iconBtnStyle, width: 26, height: 26 }}>
            <X size={13} color="#fff" />
          </button>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, padding: "10px 16px 18px", alignItems: "center" }}>
        <input
          ref={fileRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
          onChange={onPickFile}
          style={{ display: "none" }}
        />
        <button onClick={() => fileRef.current && fileRef.current.click()} style={{
          width: 40, height: 40, borderRadius: "50%", border: `1px solid ${C.line}`, flexShrink: 0,
          background: C.navyCard, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}>
          <Paperclip size={16} color={C.gray} />
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={channel === "bureau" ? "Message au bureau…" : "Écrire un message…"}
          style={{
            flex: 1, minWidth: 0, padding: "11px 14px", borderRadius: 20, border: `1px solid ${C.line}`,
            background: C.navyCard, color: "#fff", fontFamily: "Inter, sans-serif", fontSize: 13, outline: "none",
          }}
        />
        <button onClick={send} disabled={uploading} style={{
          width: 40, height: 40, borderRadius: "50%", border: "none", flexShrink: 0,
          background: C.orange, display: "flex", alignItems: "center", justifyContent: "center",
          cursor: uploading ? "default" : "pointer", opacity: uploading ? 0.6 : 1,
        }}>
          <Send size={16} color={C.navyDeep} />
        </button>
      </div>
    </div>
  );
}

function ChanTab({ active, onClick, icon: Icon, label, color }) {
  return (
    <button onClick={onClick} style={{
      flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
      padding: "9px 0", borderRadius: 10, cursor: "pointer",
      border: `1px solid ${active ? color : C.line}`,
      background: active ? `${color}1f` : "transparent",
      color: active ? color : C.gray, fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: 600,
    }}>
      <Icon size={13} /> {label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  BOTTOM NAV                                                         */
/* ------------------------------------------------------------------ */
function BottomNav({ current, go, isBureau }) {
  const items = [
    { id: "home", label: "Accueil", icon: Home },
    { id: "calendar", label: "Calendrier", icon: Calendar },
    { id: "documents", label: "Docs", icon: FileText },
    { id: "chat-general", label: "Chat", icon: MessageCircle },
  ];
  const activeId = current === "chat-bureau" ? "chat-general" : current;
  return (
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0, display: "flex",
      padding: "8px 10px 14px", background: "rgba(1,15,40,0.92)", backdropFilter: "blur(10px)",
      borderTop: `1px solid ${C.line}`,
    }}>
      {items.map((it) => {
        const active = activeId === it.id;
        return (
          <button key={it.id} onClick={() => go(it.id)} style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            background: "transparent", border: "none", cursor: "pointer", padding: "4px 0",
          }}>
            <it.icon size={19} color={active ? C.orange : C.gray} />
            <span style={{
              fontFamily: "Inter, sans-serif", fontSize: 9.5, fontWeight: 600,
              color: active ? C.orange : C.gray,
            }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  APP ROOT                                                           */
/* ------------------------------------------------------------------ */
const SCREEN_TITLES = {
  home: "Accueil",
  calendar: "Calendrier",
  documents: "Règlement & Code Électoral",
  "chat-general": "Chat",
  "chat-bureau": "Chat",
};

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [screen, setScreen] = useState("home");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setAuthLoading(false);
        return;
      }
      try {
        const snap = await getDoc(doc(db, "users", fbUser.uid));
        const profile = snap.exists() ? snap.data() : { name: fbUser.email, role: "membre" };
        setUser({ uid: fbUser.uid, email: fbUser.email, name: profile.name, role: profile.role || "membre" });
      } catch (e) {
        setUser({ uid: fbUser.uid, email: fbUser.email, name: fbUser.email, role: "membre" });
      } finally {
        setAuthLoading(false);
      }
    });
    return unsub;
  }, []);

  const onAuth = {
    login: async (email, password) => {
      await signInWithEmailAndPassword(auth, email, password);
    },
    signup: async (name, email, password) => {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      await setDoc(doc(db, "users", cred.user.uid), {
        name, email, role: "membre", createdAt: serverTimestamp(),
      });
    },
  };

  if (authLoading) {
    return (
      <Shell>
        <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: C.gray, fontFamily: "Inter, sans-serif", fontSize: 13 }}>Chargement…</span>
        </div>
      </Shell>
    );
  }

  if (!user) {
    return (
      <Shell>
        <AuthScreen onAuth={onAuth} />
      </Shell>
    );
  }

  const isBureau = user.role === "bureau";
  const showBack = screen !== "home";
  const showTopBar = screen !== "home";

  return (
    <Shell>
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {showTopBar && (
          <TopBar
            title={SCREEN_TITLES[screen]}
            onBack={showBack ? () => setScreen("home") : null}
            right={screen === "home" ? null : (
              <button onClick={() => signOut(auth)} style={iconBtnStyle}>
                <LogOut size={15} color="#fff" />
              </button>
            )}
          />
        )}
        {screen === "home" && (
          <div style={{ position: "relative" }}>
            <div style={{
              position: "absolute", top: 0, right: 10, display: "flex", gap: 6, padding: "12px 0", zIndex: 4,
            }}>
              <button onClick={() => signOut(auth)} style={iconBtnStyle}>
                <LogOut size={15} color="#fff" />
              </button>
            </div>
          </div>
        )}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {screen === "home" && <HomeScreen user={user} go={setScreen} />}
          {screen === "calendar" && <CalendarScreen user={user} />}
          {screen === "documents" && <DocumentsScreen />}
          {(screen === "chat-general" || screen === "chat-bureau") && <ChatScreen user={user} />}
        </div>
        <BottomNav current={screen} go={setScreen} isBureau={isBureau} />
      </div>
    </Shell>
  );
}

function useViewport() {
  const [vp, setVp] = useState({ w: typeof window !== "undefined" ? window.innerWidth : 390, h: typeof window !== "undefined" ? window.innerHeight : 780 });
  useEffect(() => {
    const onResize = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return vp;
}

function Shell({ children }) {
  const { w: vw, h: vh } = useViewport();
  // Fit a 390x780 reference frame inside whatever viewport we're given,
  // with a small margin, never overflowing on narrow or short phones.
  const margin = vw < 480 ? 0 : 24;
  const maxW = Math.max(vw - margin * 2, 260);
  const maxH = Math.max(vh - margin * 2, 480);
  const scale = Math.min(1, maxW / 390, maxH / 780);
  const frameOnPhone = vw < 480; // on real small screens, go edge-to-edge, no bezel

  return (
    <div style={{
      minHeight: "100vh", width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
      background: `radial-gradient(circle at 50% -10%, ${C.navyCardSoft} 0%, ${C.navyDeep} 60%)`,
      fontFamily: "Inter, sans-serif", padding: frameOnPhone ? 0 : "24px 0", boxSizing: "border-box",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        html, body { overflow-x: hidden; }
        input, button { font-size: 16px; }
        input::placeholder { color: rgba(255,255,255,0.35); }
        div::-webkit-scrollbar { width: 0px; }
      `}</style>
      <div style={{
        width: 390, height: 780,
        transform: `scale(${scale})`,
        transformOrigin: "center center",
        borderRadius: frameOnPhone ? 0 : 40,
        background: C.navy,
        border: frameOnPhone ? "none" : "8px solid #000",
        boxShadow: frameOnPhone ? "none" : "0 30px 70px rgba(0,0,0,0.55)",
        position: "relative", overflow: "hidden", flexShrink: 0,
      }}>
        {!frameOnPhone && (
          <div style={{
            position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
            width: 130, height: 26, background: "#000", borderRadius: "0 0 16px 16px", zIndex: 20,
          }} />
        )}
        <div style={{ position: "absolute", inset: 0 }}>{children}</div>
      </div>
    </div>
  );
}
