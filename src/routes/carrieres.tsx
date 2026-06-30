import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/carrieres")({
  head: () => ({
    meta: [
      { title: "Carrières — Cursus" },
      { name: "description", content: "Métiers, masters et test d'orientation pour construire ton avenir." },
    ],
  }),
  component: CarrieresPage,
});

type Job = {
  id: string;
  name: string;
  salary: string;
  growth: string;
  growthPositive: boolean;
  skills: string[];
  path: { step: string; detail: string }[];
  tip: string;
  expert: string;
};

const JOBS: Job[] = [
  {
    id: "pm",
    name: "Product Manager",
    salary: "45k - 65k €",
    growth: "+12% / an",
    growthPositive: true,
    skills: ["Stratégie produit", "Data analytics", "Communication", "Agile"],
    path: [
      { step: "Licence", detail: "Commerce, ingénierie ou design (Bac+3)" },
      { step: "Master", detail: "Management de l'innovation ou MBA produit" },
      { step: "Stage / Alternance", detail: "12 mois en équipe produit" },
      { step: "Junior PM", detail: "Première mission sur une feature, montée en autonomie" },
    ],
    tip: "Construis un portfolio de cas produits dès la L3 — même fictifs.",
    expert: "Marie L., Head of Product @ Doctolib",
  },
  {
    id: "ds",
    name: "Data Scientist",
    salary: "48k - 70k €",
    growth: "+18% / an",
    growthPositive: true,
    skills: ["Python", "Machine Learning", "Statistiques", "SQL"],
    path: [
      { step: "Licence", detail: "Maths, info ou physique (Bac+3)" },
      { step: "Master", detail: "Data Science, IA ou statistiques appliquées" },
      { step: "Projets", detail: "Kaggle, GitHub, contributions open source" },
      { step: "Junior DS", detail: "Mission en entreprise ou cabinet conseil" },
    ],
    tip: "Maîtrise les bases stats avant les frameworks à la mode.",
    expert: "Yacine B., Lead Data @ Criteo",
  },
  {
    id: "ux",
    name: "UX Researcher",
    salary: "40k - 58k €",
    growth: "+8% / an",
    growthPositive: true,
    skills: ["Recherche utilisateur", "Tests d'usabilité", "Synthèse", "Empathie"],
    path: [
      { step: "Licence", detail: "Sciences humaines, psycho ou design" },
      { step: "Master", detail: "UX Design, ergonomie ou sociologie appliquée" },
      { step: "Portfolio", detail: "3-5 études de cas avec méthodologie claire" },
      { step: "Junior UXR", detail: "Mission en agence puis en produit" },
    ],
    tip: "Pratique l'écoute active : la moitié du job est de poser les bonnes questions.",
    expert: "Sophie M., UX Lead @ BlaBlaCar",
  },
  {
    id: "juriste",
    name: "Juriste d'affaires",
    salary: "38k - 52k €",
    growth: "Stable",
    growthPositive: false,
    skills: ["Droit privé", "Anglais juridique", "Négociation", "Rédaction"],
    path: [
      { step: "Licence Droit", detail: "Bac+3 généraliste" },
      { step: "Master 2", detail: "Droit des affaires ou droit international" },
      { step: "Stages", detail: "Cabinets d'avocats ou direction juridique" },
      { step: "Juriste junior", detail: "Entreprise ou cabinet, spécialisation progressive" },
    ],
    tip: "L'anglais juridique fait toute la différence sur le marché.",
    expert: "Paul R., DJ @ Capgemini",
  },
];

type Master = { category: string; name: string; school: string };
const MASTERS: Master[] = [
  { category: "Tech & Data", name: "Master IA Appliquée", school: "Sorbonne Université" },
  { category: "Tech & Data", name: "MSc Data Science", school: "Polytechnique" },
  { category: "Management", name: "MSc International Business", school: "HEC Paris" },
  { category: "Management", name: "Master Innovation & Entrepreneuriat", school: "ESSEC" },
  { category: "Design", name: "Master Design Stratégique", school: "ENSCI" },
  { category: "Design", name: "MSc UX & Service Design", school: "Strate École" },
  { category: "Droit", name: "Master Droit des Affaires", school: "Assas" },
  { category: "Droit", name: "Master Droit du Numérique", school: "Paris 1" },
  { category: "Sciences", name: "Master Biologie Computationnelle", school: "Paris Saclay" },
];

const QUIZ: { q: string; options: { label: string; tag: keyof typeof TAG_TO_JOB }[] }[] = [
  {
    q: "Tu préfères passer ta journée à...",
    options: [
      { label: "Analyser des chiffres et trouver des patterns", tag: "data" },
      { label: "Comprendre les besoins des utilisateurs", tag: "human" },
      { label: "Construire une stratégie business", tag: "biz" },
      { label: "Décortiquer des textes et contrats", tag: "law" },
    ],
  },
  {
    q: "Quel environnement t'attire le plus ?",
    options: [
      { label: "Une startup tech en croissance", tag: "data" },
      { label: "Une agence créative", tag: "human" },
      { label: "Un grand groupe international", tag: "biz" },
      { label: "Un cabinet ou une institution", tag: "law" },
    ],
  },
  {
    q: "Tu es naturellement plus...",
    options: [
      { label: "Logique et rigoureux", tag: "data" },
      { label: "Empathique et observateur", tag: "human" },
      { label: "Visionnaire et négociateur", tag: "biz" },
      { label: "Méthodique et précis", tag: "law" },
    ],
  },
];

const TAG_TO_JOB = { data: "ds", human: "ux", biz: "pm", law: "juriste" } as const;

function CarrieresPage() {
  const [openJob, setOpenJob] = useState<string | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [answers, setAnswers] = useState<string[]>([]);
  const [masterCat, setMasterCat] = useState<string>("Tous");

  const masterCats = useMemo(() => ["Tous", ...Array.from(new Set(MASTERS.map(m => m.category)))], []);
  const filteredMasters = masterCat === "Tous" ? MASTERS : MASTERS.filter(m => m.category === masterCat);

  const quizResult = useMemo(() => {
    if (answers.length < QUIZ.length) return null;
    const tally: Record<string, number> = {};
    answers.forEach(a => { tally[a] = (tally[a] ?? 0) + 1; });
    const top = Object.entries(tally).sort((a, b) => b[1] - a[1])[0][0];
    return JOBS.find(j => j.id === TAG_TO_JOB[top as keyof typeof TAG_TO_JOB]);
  }, [answers]);

  return (
    <main className="max-w-6xl mx-auto py-12 px-6 space-y-20">
      {/* Header */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-4">
          <h1 className="font-display text-4xl font-semibold leading-tight text-balance">Préparez l'avenir.</h1>
          <p className="text-sm text-neutral-600 max-w-[56ch] text-pretty">
            Explorez les métiers en forte croissance, découvrez les masters qui y mènent et trouvez votre voie.
          </p>
        </div>
        <button
          onClick={() => { setShowQuiz(true); setAnswers([]); }}
          className="px-6 py-3 bg-brand text-white text-sm font-medium rounded-lg ring-1 ring-brand hover:brightness-110"
        >
          Passer le test d'orientation
        </button>
      </section>

      {/* Jobs list */}
      <section className="space-y-4">
        <h2 className="font-display font-semibold text-xl">Métiers porteurs</h2>
        <div className="bg-ui-bg ring-1 ring-black/5 rounded-2xl overflow-hidden divide-y divide-black/5">
          {JOBS.map(job => {
            const open = openJob === job.id;
            return (
              <div key={job.id}>
                <button
                  onClick={() => setOpenJob(open ? null : job.id)}
                  className="w-full px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-left hover:bg-neutral-100/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{job.name}</p>
                    <p className="text-xs text-neutral-500 mt-0.5">Croissance : <span className={job.growthPositive ? "text-brand font-medium" : "text-neutral-500"}>{job.growth}</span></p>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-sm text-neutral-700 font-medium">{job.salary}</span>
                    <span className={`text-xs text-neutral-400 transition-transform ${open ? "rotate-180" : ""}`}>▼</span>
                  </div>
                </button>
                {open && (
                  <div className="px-6 pb-6 pt-2 grid md:grid-cols-2 gap-8 bg-white/50 animate-fade-in">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold mb-2">Compétences clés</h4>
                        <div className="flex flex-wrap gap-2">
                          {job.skills.map(s => (
                            <span key={s} className="text-xs px-3 py-1 bg-brand-light text-brand rounded-full font-medium">{s}</span>
                          ))}
                        </div>
                      </div>
                      <div className="p-4 bg-ui-bg rounded-xl ring-1 ring-black/5">
                        <p className="text-[11px] uppercase tracking-wider text-brand font-semibold mb-1">Conseil d'expert</p>
                        <p className="text-sm text-neutral-700 italic">"{job.tip}"</p>
                        <p className="text-xs text-neutral-500 mt-2">— {job.expert}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold mb-3">Parcours étape par étape</h4>
                      <ol className="space-y-3">
                        {job.path.map((p, i) => (
                          <li key={i} className="flex gap-3">
                            <span className="size-6 shrink-0 rounded-full bg-brand text-white text-xs font-semibold grid place-items-center">{i + 1}</span>
                            <div>
                              <p className="text-sm font-medium">{p.step}</p>
                              <p className="text-xs text-neutral-500">{p.detail}</p>
                            </div>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Masters */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display font-semibold text-xl">Tous les masters</h2>
          <div className="flex gap-2 flex-wrap">
            {masterCats.map(c => (
              <button
                key={c}
                onClick={() => setMasterCat(c)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full ring-1 transition-colors ${
                  masterCat === c ? "bg-brand text-white ring-brand" : "bg-ui-bg ring-black/5 hover:bg-neutral-200"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredMasters.map((m, i) => (
            <a
              key={i}
              href="#"
              className="p-4 bg-white ring-1 ring-black/5 rounded-xl flex items-center justify-between hover:ring-brand/30 transition group"
            >
              <div className="space-y-1 min-w-0">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-brand">{m.category}</span>
                <p className="font-medium text-sm truncate">{m.name}</p>
                <p className="text-xs text-neutral-500 truncate">{m.school}</p>
              </div>
              <span className="text-neutral-300 group-hover:text-brand group-hover:translate-x-1 transition">→</span>
            </a>
          ))}
        </div>
      </section>

      {/* Quiz modal */}
      {showQuiz && (
        <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4 animate-fade-in">
          <div className="bg-surface rounded-3xl p-8 max-w-lg w-full ring-1 ring-black/10 shadow-2xl">
            {!quizResult ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs text-neutral-500">Question {answers.length + 1} / {QUIZ.length}</span>
                  <button onClick={() => setShowQuiz(false)} className="text-neutral-400 hover:text-text-main">✕</button>
                </div>
                <div className="h-1 bg-neutral-200 rounded-full overflow-hidden mb-6">
                  <div className="h-full bg-brand transition-all" style={{ width: `${(answers.length / QUIZ.length) * 100}%` }} />
                </div>
                <h3 className="font-display text-xl font-semibold mb-6">{QUIZ[answers.length].q}</h3>
                <div className="space-y-2">
                  {QUIZ[answers.length].options.map(opt => (
                    <button
                      key={opt.label}
                      onClick={() => setAnswers([...answers, opt.tag])}
                      className="w-full text-left p-4 bg-ui-bg rounded-xl ring-1 ring-black/5 hover:ring-brand hover:bg-brand-light transition"
                    >
                      <span className="text-sm font-medium">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-xs uppercase tracking-wider text-brand font-semibold">Ton résultat</p>
                <h3 className="font-display text-3xl font-semibold">{quizResult.name}</h3>
                <p className="text-sm text-neutral-600">{quizResult.tip}</p>
                <div className="flex flex-wrap gap-2 justify-center pt-2">
                  {quizResult.skills.map(s => (
                    <span key={s} className="text-xs px-3 py-1 bg-brand-light text-brand rounded-full font-medium">{s}</span>
                  ))}
                </div>
                <div className="flex gap-3 pt-4">
                  <button onClick={() => { setAnswers([]); }} className="flex-1 py-2.5 ring-1 ring-black/10 rounded-lg text-sm font-medium hover:bg-ui-bg">Recommencer</button>
                  <button onClick={() => { setShowQuiz(false); setOpenJob(quizResult.id); }} className="flex-1 py-2.5 bg-brand text-white rounded-lg text-sm font-medium hover:brightness-110">Voir le métier</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
