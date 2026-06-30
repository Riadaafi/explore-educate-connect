import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Orientation — Cursus" },
      { name: "description", content: "Trouve ta voie : questionnaire d'orientation, spécialités, débouchés, licence, BUT, CAP, IUT." },
    ],
  }),
  component: OrientationPage,
});

type Profile = "scientifique" | "litteraire" | "eco" | "techno" | "artistique";

const PROFILE_LABELS: Record<Profile, string> = {
  scientifique: "Profil Scientifique",
  litteraire: "Profil Littéraire & Humanités",
  eco: "Profil Économique & Social",
  techno: "Profil Technologique",
  artistique: "Profil Artistique & Créatif",
};

const QUIZ: { q: string; options: { label: string; tag: Profile }[] }[] = [
  {
    q: "Quelle matière te passionne le plus au lycée ?",
    options: [
      { label: "Maths, Physique ou SVT", tag: "scientifique" },
      { label: "Français, Philo ou Langues", tag: "litteraire" },
      { label: "SES, Histoire-Géo", tag: "eco" },
      { label: "Techno, Informatique, Atelier", tag: "techno" },
      { label: "Arts plastiques, Musique, Cinéma", tag: "artistique" },
    ],
  },
  {
    q: "Comment préfères-tu apprendre ?",
    options: [
      { label: "En résolvant des problèmes logiques", tag: "scientifique" },
      { label: "En lisant et en débattant", tag: "litteraire" },
      { label: "En analysant l'actualité et la société", tag: "eco" },
      { label: "En manipulant et fabriquant", tag: "techno" },
      { label: "En créant et en imaginant", tag: "artistique" },
    ],
  },
  {
    q: "Ton métier idéal ressemble plutôt à...",
    options: [
      { label: "Chercheur, ingénieur, médecin", tag: "scientifique" },
      { label: "Journaliste, prof, juriste", tag: "litteraire" },
      { label: "Manager, économiste, RH", tag: "eco" },
      { label: "Technicien, développeur, mécanicien", tag: "techno" },
      { label: "Designer, artiste, architecte", tag: "artistique" },
    ],
  },
  {
    q: "Tu préfères travailler...",
    options: [
      { label: "Seul·e sur un problème complexe", tag: "scientifique" },
      { label: "En équipe sur des idées", tag: "litteraire" },
      { label: "En relation avec des clients", tag: "eco" },
      { label: "Avec tes mains, sur le terrain", tag: "techno" },
      { label: "Sur un projet personnel créatif", tag: "artistique" },
    ],
  },
  {
    q: "Après le bac, tu te vois plutôt...",
    options: [
      { label: "Dans une longue formation (Bac+5/+8)", tag: "scientifique" },
      { label: "À l'université, en humanités", tag: "litteraire" },
      { label: "En école de commerce / IEP", tag: "eco" },
      { label: "En BUT, BTS ou alternance", tag: "techno" },
      { label: "En école d'art ou d'architecture", tag: "artistique" },
    ],
  },
];

type Recommendation = {
  spes: string[];
  debouches: string[];
  licences: string[];
  buts: string[];
  caps: string[];
  iuts: string[];
};

const RECOS: Record<Profile, Recommendation> = {
  scientifique: {
    spes: ["Mathématiques", "Physique-Chimie", "SVT", "NSI (informatique)", "Maths expertes"],
    debouches: ["Ingénieur", "Médecin", "Chercheur", "Data scientist", "Pharmacien", "Vétérinaire"],
    licences: ["Licence Mathématiques", "Licence Physique", "Licence Informatique", "Licence SVT", "PASS / L.AS (santé)"],
    buts: ["BUT Informatique", "BUT Génie Biologique", "BUT Mesures Physiques", "BUT Chimie"],
    caps: ["CAP Électricien", "CAP Maintenance des Véhicules"],
    iuts: ["IUT Orsay", "IUT Grenoble", "IUT Lyon 1", "IUT Toulouse"],
  },
  litteraire: {
    spes: ["HLP (Humanités, Litt., Philo)", "LLCE (Langues)", "Histoire-Géo / Géopolitique", "SES", "Arts"],
    debouches: ["Professeur", "Journaliste", "Avocat", "Traducteur", "Éditeur", "Diplomate"],
    licences: ["Licence Lettres modernes", "Licence Droit", "Licence LLCE Anglais", "Licence Histoire", "Licence Philo"],
    buts: ["BUT Information-Communication", "BUT Carrières Juridiques", "BUT Carrières Sociales"],
    caps: ["CAP Accompagnant éducatif petite enfance"],
    iuts: ["IUT Bordeaux Montaigne", "IUT Paris Descartes", "IUT Tours"],
  },
  eco: {
    spes: ["SES", "Mathématiques", "HGGSP", "LLCE Anglais", "Maths complémentaires"],
    debouches: ["Manager", "Économiste", "Chargé de marketing", "Banquier", "Consultant", "RH"],
    licences: ["Licence Économie-Gestion", "Licence AES", "Licence Droit", "Bachelor École de commerce", "Sciences Po"],
    buts: ["BUT GEA (Gestion)", "BUT TC (Techniques de Commercialisation)", "BUT GACO", "BUT Carrières Juridiques"],
    caps: ["CAP Employé de commerce", "CAP Vente"],
    iuts: ["IUT Sceaux", "IUT Aix-Marseille", "IUT Lille", "IUT Nantes"],
  },
  techno: {
    spes: ["NSI", "Sciences de l'Ingénieur", "Physique-Chimie", "Mathématiques", "STI2D (filière techno)"],
    debouches: ["Développeur", "Technicien réseaux", "Mécanicien", "Électronicien", "Chef de chantier"],
    licences: ["Licence Informatique", "Licence MIASHS", "Licence Pro Industrie"],
    buts: ["BUT Informatique", "BUT GEII (Électrique)", "BUT GMP (Mécanique)", "BUT Réseaux & Télécoms", "BUT Génie Civil"],
    caps: ["CAP Électricien", "CAP Menuisier", "CAP Maintenance véhicules", "CAP Plombier-chauffagiste"],
    iuts: ["IUT Cachan", "IUT Lyon 1", "IUT Nantes", "IUT Grenoble", "IUT Belfort-Montbéliard"],
  },
  artistique: {
    spes: ["Arts (plastiques, théâtre, cinéma...)", "HLP", "LLCE", "HGGSP", "Numérique & Sciences"],
    debouches: ["Designer", "Architecte", "Réalisateur", "Graphiste", "Game designer", "Photographe"],
    licences: ["Licence Arts plastiques", "Licence Cinéma", "Licence Design", "Prépa MANAA / Bachelor Design"],
    buts: ["BUT MMI (Métiers du Multimédia et de l'Internet)", "BUT Information-Communication"],
    caps: ["CAP Ébéniste", "CAP Métiers de la mode", "CAP Photographe", "CAP Arts du bois"],
    iuts: ["IUT Bordeaux MMI", "IUT Champs-sur-Marne MMI", "IUT Velizy MMI"],
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

  const reco = result ? RECOS[result] : null;
  const done = answers.length >= QUIZ.length;
  const current = QUIZ[answers.length];

  const reset = () => { setAnswers([]); setShowResult(false); };

  return (
    <main className="max-w-5xl mx-auto py-12 px-6 space-y-16">
      <section className="space-y-4 text-center max-w-2xl mx-auto">
        <span className="text-[11px] uppercase tracking-[0.2em] text-brand font-semibold">Orientation</span>
        <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight text-balance">
          Trouve ta voie en quelques minutes.
        </h1>
        <p className="text-neutral-600 text-pretty">
          Réponds à {QUIZ.length} questions pour découvrir tes spés idéales, tes débouchés et les formations qui te correspondent : licences, BUT, CAP, IUT.
        </p>
      </section>

      {!showResult && (
        <section className="bg-ui-bg ring-1 ring-black/5 rounded-3xl p-8 md:p-10">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs text-neutral-500">
              Question {Math.min(answers.length + 1, QUIZ.length)} / {QUIZ.length}
            </span>
            {answers.length > 0 && (
              <button onClick={reset} className="text-xs text-neutral-500 hover:text-brand">Recommencer</button>
            )}
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
            </>
          ) : (
            <div className="text-center space-y-4 py-8">
              <p className="text-sm text-neutral-600">Tu as terminé le questionnaire !</p>
              <button
                onClick={() => setShowResult(true)}
                className="px-6 py-3 bg-brand text-white rounded-lg text-sm font-medium hover:brightness-110"
              >
                Voir mon orientation
              </button>
            </div>
          )}
        </section>
      )}

      {showResult && reco && result && (
        <section className="space-y-8 animate-fade-in">
          <div className="text-center space-y-3">
            <span className="text-[11px] uppercase tracking-[0.2em] text-brand font-semibold">Ton résultat</span>
            <h2 className="font-display text-3xl md:text-4xl font-semibold">{PROFILE_LABELS[result]}</h2>
            <button onClick={reset} className="text-xs text-neutral-500 hover:text-brand underline">Refaire le test</button>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <RecoCard title="Spécialités recommandées" subtitle="À choisir en 1ʳᵉ et terminale" items={reco.spes} accent />
            <RecoCard title="Débouchés métiers" subtitle="Vers quoi cela peut mener" items={reco.debouches} />
            <RecoCard title="Licences (université)" subtitle="Bac+3, parcours académique" items={reco.licences} />
            <RecoCard title="BUT (ex-DUT, Bac+3)" subtitle="Professionnalisant, en IUT" items={reco.buts} />
            <RecoCard title="CAP" subtitle="Formation pratique en 2 ans" items={reco.caps} />
            <RecoCard title="IUT recommandés" subtitle="Établissements à explorer" items={reco.iuts} />
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
