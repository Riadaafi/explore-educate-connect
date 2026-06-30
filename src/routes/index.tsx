import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Orientation — Cursus" },
      { name: "description", content: "Test d'orientation complet : matières, personnalité, métiers, secteurs. Découvre ta voie." },
    ],
  }),
  component: OrientationPage,
});

// 5 profils RIASEC-inspirés adaptés au lycée FR
type Profile = "scientifique" | "litteraire" | "eco" | "techno" | "artistique";

const PROFILE_LABELS: Record<Profile, string> = {
  scientifique: "Profil Scientifique & Analytique",
  litteraire: "Profil Littéraire & Humanités",
  eco: "Profil Économique & Social",
  techno: "Profil Technologique & Pratique",
  artistique: "Profil Créatif & Artistique",
};

const PROFILE_EMOJI: Record<Profile, string> = {
  scientifique: "🔬",
  litteraire: "📚",
  eco: "📊",
  techno: "⚙️",
  artistique: "🎨",
};

type Section = "Matières" | "Personnalité" | "Méthode" | "Métier" | "Secteur";

type Question = {
  section: Section;
  q: string;
  options: { label: string; tag: Profile }[];
};

const QUIZ: Question[] = [
  // MATIÈRES
  { section: "Matières", q: "Quelle matière te passionne le plus ?", options: [
    { label: "Maths / Physique / SVT", tag: "scientifique" },
    { label: "Français / Philo / Langues", tag: "litteraire" },
    { label: "SES / Histoire-Géo", tag: "eco" },
    { label: "NSI / Techno / SI", tag: "techno" },
    { label: "Arts / Musique / Cinéma", tag: "artistique" },
  ]},
  { section: "Matières", q: "Dans quel cours te sens-tu le plus à l'aise ?", options: [
    { label: "Résoudre un problème de maths", tag: "scientifique" },
    { label: "Analyser un texte", tag: "litteraire" },
    { label: "Décrypter un graphique économique", tag: "eco" },
    { label: "Coder un mini-programme", tag: "techno" },
    { label: "Créer un projet visuel", tag: "artistique" },
  ]},
  { section: "Matières", q: "Une spé que tu garderais en terminale ?", options: [
    { label: "Maths expertes / Physique", tag: "scientifique" },
    { label: "HLP ou LLCE", tag: "litteraire" },
    { label: "SES + HGGSP", tag: "eco" },
    { label: "NSI ou Sciences de l'ingénieur", tag: "techno" },
    { label: "Arts plastiques / Cinéma", tag: "artistique" },
  ]},

  // PERSONNALITÉ
  { section: "Personnalité", q: "Tu es plutôt...", options: [
    { label: "Logique et rigoureux·se", tag: "scientifique" },
    { label: "Curieux·se et empathique", tag: "litteraire" },
    { label: "Stratège et persuasif·ve", tag: "eco" },
    { label: "Manuel·le et débrouillard·e", tag: "techno" },
    { label: "Sensible et imaginatif·ve", tag: "artistique" },
  ]},
  { section: "Personnalité", q: "Face à un problème, tu...", options: [
    { label: "Décomposes méthodiquement", tag: "scientifique" },
    { label: "En parles pour comprendre", tag: "litteraire" },
    { label: "Cherches le meilleur compromis", tag: "eco" },
    { label: "Bricoles une solution concrète", tag: "techno" },
    { label: "Imagines plusieurs scénarios", tag: "artistique" },
  ]},
  { section: "Personnalité", q: "Tes amis te décrivent comme...", options: [
    { label: "Le cerveau du groupe", tag: "scientifique" },
    { label: "Celui qui écoute et conseille", tag: "litteraire" },
    { label: "Le leader / l'organisateur", tag: "eco" },
    { label: "Le bricoleur, qui répare tout", tag: "techno" },
    { label: "L'artiste original·e", tag: "artistique" },
  ]},

  // MÉTHODE DE TRAVAIL
  { section: "Méthode", q: "Tu préfères travailler...", options: [
    { label: "Seul·e sur un problème complexe", tag: "scientifique" },
    { label: "En débat avec d'autres", tag: "litteraire" },
    { label: "En équipe vers un objectif", tag: "eco" },
    { label: "Sur le terrain, avec tes mains", tag: "techno" },
    { label: "Sur un projet créatif perso", tag: "artistique" },
  ]},
  { section: "Méthode", q: "Tu apprends mieux en...", options: [
    { label: "Calculant et démontrant", tag: "scientifique" },
    { label: "Lisant et discutant", tag: "litteraire" },
    { label: "Étudiant des cas concrets", tag: "eco" },
    { label: "Manipulant et testant", tag: "techno" },
    { label: "Créant et expérimentant", tag: "artistique" },
  ]},

  // MÉTIER IDÉAL
  { section: "Métier", q: "Ton métier idéal ressemble à...", options: [
    { label: "Chercheur, ingénieur, médecin", tag: "scientifique" },
    { label: "Journaliste, prof, avocat", tag: "litteraire" },
    { label: "Manager, économiste, RH", tag: "eco" },
    { label: "Dev, technicien, mécano", tag: "techno" },
    { label: "Designer, archi, réalisateur", tag: "artistique" },
  ]},
  { section: "Métier", q: "Ce qui compte le plus pour toi dans un job ?", options: [
    { label: "Comprendre comment ça marche", tag: "scientifique" },
    { label: "Aider et transmettre", tag: "litteraire" },
    { label: "Diriger et décider", tag: "eco" },
    { label: "Construire du concret", tag: "techno" },
    { label: "Exprimer ma créativité", tag: "artistique" },
  ]},

  // SECTEUR
  { section: "Secteur", q: "Quel secteur t'attire le plus ?", options: [
    { label: "Santé / Recherche / Environnement", tag: "scientifique" },
    { label: "Édition / Droit / Enseignement", tag: "litteraire" },
    { label: "Banque / Conseil / Marketing", tag: "eco" },
    { label: "Tech / Industrie / BTP", tag: "techno" },
    { label: "Mode / Cinéma / Design / Jeu vidéo", tag: "artistique" },
  ]},
  { section: "Secteur", q: "Après le bac, tu te vois...", options: [
    { label: "En prépa scientifique ou PASS", tag: "scientifique" },
    { label: "À la fac en lettres / droit / langues", tag: "litteraire" },
    { label: "En école de commerce ou IEP", tag: "eco" },
    { label: "En BUT, BTS ou alternance", tag: "techno" },
    { label: "En école d'art, archi ou design", tag: "artistique" },
  ]},
];

type Recommendation = {
  spes: string[];
  perso: string;
  secteurs: string[];
  metiers: string[];
  licences: string[];
  buts: string[];
  ecoles: string[];
};

const RECOS: Record<Profile, Recommendation> = {
  scientifique: {
    perso: "Tu as un esprit analytique, méthodique et curieux. Tu aimes comprendre les mécanismes du monde.",
    spes: ["Mathématiques", "Physique-Chimie", "SVT", "NSI", "Maths expertes"],
    secteurs: ["Santé & Bio-tech", "Recherche & R&D", "Énergie & Environnement", "Aérospatial", "Industrie pharmaceutique"],
    metiers: ["Ingénieur·e", "Médecin", "Chercheur·se", "Data Scientist", "Pharmacien·ne", "Vétérinaire", "Actuaire"],
    licences: ["Licence Mathématiques", "Licence Physique", "Licence Informatique", "Licence SVT", "PASS / L.AS"],
    buts: ["BUT Informatique", "BUT Génie Biologique", "BUT Mesures Physiques", "BUT Chimie"],
    ecoles: ["Polytechnique", "CentraleSupélec", "INSA", "Mines ParisTech", "Écoles vétérinaires"],
  },
  litteraire: {
    perso: "Tu es sensible aux mots, aux idées et aux autres. Tu aimes comprendre, transmettre, débattre.",
    spes: ["HLP", "LLCE", "Histoire-Géo / HGGSP", "SES", "Arts"],
    secteurs: ["Édition & Médias", "Droit & Justice", "Enseignement", "Culture & Patrimoine", "Diplomatie"],
    metiers: ["Professeur·e", "Journaliste", "Avocat·e", "Traducteur·rice", "Éditeur·rice", "Diplomate", "Bibliothécaire"],
    licences: ["Licence Lettres", "Licence Droit", "Licence LLCE", "Licence Histoire", "Licence Philo"],
    buts: ["BUT Info-Com", "BUT Carrières Juridiques", "BUT Carrières Sociales"],
    ecoles: ["Sciences Po", "ENS Ulm/Lyon", "Écoles de journalisme (CFJ, ESJ)", "Écoles du Barreau"],
  },
  eco: {
    perso: "Tu es stratège, organisé·e et à l'aise avec les chiffres et les gens. Tu vises l'impact.",
    spes: ["SES", "Mathématiques", "HGGSP", "LLCE Anglais"],
    secteurs: ["Banque & Finance", "Conseil & Audit", "Marketing & Communication", "RH", "Politique publique"],
    metiers: ["Manager", "Économiste", "Consultant·e", "Chargé·e de marketing", "Trader", "DRH", "Entrepreneur·e"],
    licences: ["Licence Économie-Gestion", "Licence AES", "Licence Droit-Éco", "Bachelor BBA", "Sciences Po"],
    buts: ["BUT GEA", "BUT TC", "BUT GACO", "BUT Carrières Juridiques"],
    ecoles: ["HEC", "ESSEC", "ESCP", "EM Lyon", "Sciences Po Paris"],
  },
  techno: {
    perso: "Tu es concret·e, débrouillard·e et tu aimes voir le résultat de ton travail rapidement.",
    spes: ["NSI", "Sciences de l'Ingénieur", "Physique-Chimie", "Maths", "STI2D"],
    secteurs: ["Tech & Logiciel", "Industrie 4.0", "BTP & Construction", "Énergie", "Cybersécurité"],
    metiers: ["Développeur·se", "Ingénieur·e DevOps", "Technicien·ne réseaux", "Mécanicien·ne", "Chef·fe de chantier"],
    licences: ["Licence Informatique", "Licence MIASHS", "Licence Pro Industrie"],
    buts: ["BUT Informatique", "BUT GEII", "BUT GMP", "BUT Réseaux & Télécoms", "BUT Génie Civil"],
    ecoles: ["42", "Epitech", "EPF", "ESTP", "ENSAM (Arts & Métiers)"],
  },
  artistique: {
    perso: "Tu es créatif·ve, sensible et original·e. Tu as besoin d'exprimer ta vision du monde.",
    spes: ["Arts", "HLP", "LLCE", "Numérique & Sciences"],
    secteurs: ["Design & UX", "Architecture", "Cinéma & Audiovisuel", "Mode & Luxe", "Jeu vidéo"],
    metiers: ["Designer", "Architecte", "Réalisateur·rice", "Graphiste", "Game Designer", "Photographe", "Styliste"],
    licences: ["Licence Arts plastiques", "Licence Cinéma", "Licence Design", "Prépa MANAA"],
    buts: ["BUT MMI", "BUT Info-Com"],
    ecoles: ["Beaux-Arts", "Les Gobelins", "ENSCI", "École Boulle", "La Fémis", "ENSA (architecture)"],
  },
};

function OrientationPage() {
  const [answers, setAnswers] = useState<Profile[]>([]);
  const [showResult, setShowResult] = useState(false);

  const result = useMemo<Profile | null>(() => {
    if (answers.length === 0) return null;
    const tally: Record<string, number> = {};
    answers.forEach(a => { tally[a] = (tally[a] ?? 0) + 1; });
    return Object.entries(tally).sort((a, b) => b[1] - a[1])[0][0] as Profile;
  }, [answers]);

  const scores = useMemo(() => {
    const t: Record<Profile, number> = { scientifique: 0, litteraire: 0, eco: 0, techno: 0, artistique: 0 };
    answers.forEach(a => { t[a] += 1; });
    return t;
  }, [answers]);

  const done = answers.length >= QUIZ.length;
  const current = QUIZ[answers.length];
  const reco = result ? RECOS[result] : null;

  const reset = () => { setAnswers([]); setShowResult(false); };
  const undo = () => setAnswers(a => a.slice(0, -1));

  return (
    <main className="max-w-5xl mx-auto py-12 px-6 space-y-16">
      <section className="space-y-4 text-center max-w-2xl mx-auto">
        <span className="text-[11px] uppercase tracking-[0.2em] text-brand font-semibold">Test d'orientation</span>
        <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight text-balance">
          Découvre ta voie en {QUIZ.length} questions.
        </h1>
        <p className="text-neutral-600 text-pretty">
          Matières, personnalité, méthode de travail, métiers et secteurs : un test complet pour révéler ton profil et tes formations idéales.
        </p>
      </section>

      {!showResult && (
        <section className="bg-ui-bg ring-1 ring-black/5 rounded-3xl p-8 md:p-10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[11px] uppercase tracking-wider text-brand font-semibold">
              {current?.section ?? "Terminé"}
            </span>
            <span className="text-xs text-neutral-500">
              {Math.min(answers.length + 1, QUIZ.length)} / {QUIZ.length}
            </span>
          </div>
          <div className="h-1 bg-neutral-200 rounded-full overflow-hidden mb-8">
            <div className="h-full bg-brand transition-all" style={{ width: `${(answers.length / QUIZ.length) * 100}%` }} />
          </div>

          {!done ? (
            <>
              <h2 className="font-display text-2xl font-semibold mb-6">{current.q}</h2>
              <div className="grid gap-2">
                {current.options.map(opt => (
                  <button
                    key={opt.label}
                    onClick={() => setAnswers([...answers, opt.tag])}
                    className="w-full text-left p-4 bg-white rounded-xl ring-1 ring-black/5 hover:ring-brand hover:bg-brand-light transition"
                  >
                    <span className="text-sm font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>
              <div className="flex justify-between mt-6 text-xs text-neutral-500">
                <button onClick={undo} disabled={answers.length === 0} className="hover:text-brand disabled:opacity-30">← Question précédente</button>
                <button onClick={reset} disabled={answers.length === 0} className="hover:text-brand disabled:opacity-30">Recommencer</button>
              </div>
            </>
          ) : (
            <div className="text-center space-y-4 py-8">
              <p className="text-sm text-neutral-600">Tu as terminé le questionnaire !</p>
              <button
                onClick={() => setShowResult(true)}
                className="px-6 py-3 bg-brand text-white rounded-lg text-sm font-medium hover:brightness-110"
              >
                Voir mon résultat d'orientation →
              </button>
            </div>
          )}
        </section>
      )}

      {showResult && reco && result && (
        <section className="space-y-8 animate-fade-in">
          <div className="text-center space-y-3">
            <div className="text-6xl">{PROFILE_EMOJI[result]}</div>
            <span className="text-[11px] uppercase tracking-[0.2em] text-brand font-semibold">Ton profil</span>
            <h2 className="font-display text-3xl md:text-4xl font-semibold">{PROFILE_LABELS[result]}</h2>
            <p className="text-neutral-600 max-w-2xl mx-auto">{reco.perso}</p>
            <button onClick={reset} className="text-xs text-neutral-500 hover:text-brand underline">Refaire le test</button>
          </div>

          {/* Score breakdown */}
          <div className="bg-white ring-1 ring-black/5 rounded-2xl p-6">
            <h3 className="font-display font-semibold text-sm mb-4">Répartition de tes réponses</h3>
            <div className="space-y-2">
              {(Object.keys(scores) as Profile[])
                .sort((a, b) => scores[b] - scores[a])
                .map(p => {
                  const pct = (scores[p] / QUIZ.length) * 100;
                  return (
                    <div key={p}>
                      <div className="flex justify-between text-xs mb-1">
                        <span>{PROFILE_EMOJI[p]} {PROFILE_LABELS[p]}</span>
                        <span className="text-neutral-500">{Math.round(pct)}%</span>
                      </div>
                      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                        <div className={`h-full transition-all ${p === result ? "bg-brand" : "bg-neutral-300"}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <RecoCard title="Spécialités recommandées" subtitle="À choisir en 1ʳᵉ et terminale" items={reco.spes} accent />
            <RecoCard title="Secteurs qui te correspondent" subtitle="Domaines d'activité" items={reco.secteurs} accent />
            <RecoCard title="Métiers à explorer" subtitle="Quelques pistes concrètes" items={reco.metiers} />
            <RecoCard title="Licences (université)" subtitle="Bac+3, parcours académique" items={reco.licences} />
            <RecoCard title="BUT / BTS" subtitle="Professionnalisant" items={reco.buts} />
            <RecoCard title="Écoles ciblées" subtitle="Établissements à viser" items={reco.ecoles} />
          </div>
        </section>
      )}
    </main>
  );
}

function RecoCard({ title, subtitle, items, accent = false }: { title: string; subtitle: string; items: string[]; accent?: boolean }) {
  return (
    <article className={`p-6 rounded-2xl ring-1 ${accent ? "bg-brand-light ring-brand/20" : "bg-white ring-black/5"}`}>
      <h3 className="font-display font-semibold text-base">{title}</h3>
      <p className="text-xs text-neutral-500 mb-4">{subtitle}</p>
      <ul className="space-y-2">
        {items.map(it => (
          <li key={it} className="flex items-start gap-2 text-sm">
            <span className={`mt-1.5 size-1.5 rounded-full shrink-0 ${accent ? "bg-brand" : "bg-neutral-400"}`} />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}
