import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cours — Cursus" },
      { name: "description", content: "Explore les cours par catégorie : Tech, Design, Business, Droit, Sciences." },
    ],
  }),
  component: CoursPage,
});

type Course = {
  id: string;
  title: string;
  desc: string;
  category: "Tech" | "Design" | "Business" | "Droit" | "Sciences";
  rating: number;
  hours: number;
  students: number;
  gradient: string;
};

const COURSES: Course[] = [
  { id: "1", title: "Design de Systèmes", desc: "Apprenez à construire des interfaces cohérentes et scalables.", category: "Design", rating: 4.9, hours: 12, students: 840, gradient: "from-teal-200 to-emerald-400" },
  { id: "2", title: "Algorithmique Avancée", desc: "Maîtrisez les structures de données complexes et l'optimisation.", category: "Tech", rating: 4.7, hours: 24, students: 1240, gradient: "from-indigo-200 to-blue-400" },
  { id: "3", title: "Droit des Affaires", desc: "Les fondamentaux du droit commercial et des contrats.", category: "Droit", rating: 4.6, hours: 30, students: 620, gradient: "from-amber-200 to-orange-400" },
  { id: "4", title: "Stratégie SaaS", desc: "Modèles économiques, GTM et croissance d'un produit logiciel.", category: "Business", rating: 4.8, hours: 18, students: 1980, gradient: "from-rose-200 to-pink-400" },
  { id: "5", title: "Biologie Cellulaire", desc: "Plongée dans les mécanismes du vivant à l'échelle cellulaire.", category: "Sciences", rating: 4.5, hours: 22, students: 410, gradient: "from-lime-200 to-green-400" },
  { id: "6", title: "Machine Learning", desc: "De la régression linéaire aux réseaux de neurones profonds.", category: "Tech", rating: 4.9, hours: 36, students: 2150, gradient: "from-cyan-200 to-sky-400" },
  { id: "7", title: "Branding & Identité", desc: "Construire une marque mémorable et un système visuel.", category: "Design", rating: 4.7, hours: 14, students: 720, gradient: "from-fuchsia-200 to-purple-400" },
  { id: "8", title: "Droit Constitutionnel", desc: "Institutions, pouvoirs et libertés fondamentales.", category: "Droit", rating: 4.4, hours: 28, students: 540, gradient: "from-stone-200 to-stone-400" },
  { id: "9", title: "Physique Quantique", desc: "Introduction accessible aux principes fondateurs.", category: "Sciences", rating: 4.8, hours: 26, students: 380, gradient: "from-violet-200 to-indigo-400" },
];

const CATEGORIES = ["Tous", "Tech", "Design", "Business", "Droit", "Sciences"] as const;

function CoursPage() {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<(typeof CATEGORIES)[number]>("Tous");
  const [enrolled, setEnrolled] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return COURSES.filter(c => {
      const matchCat = cat === "Tous" || c.category === cat;
      const matchQ = query.trim() === "" || c.title.toLowerCase().includes(query.toLowerCase()) || c.desc.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQ;
    });
  }, [query, cat]);

  const toggle = (id: string) => {
    setEnrolled(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <main className="max-w-6xl mx-auto py-12 px-6">
      <section className="space-y-12">
        <div className="space-y-4">
          <h1 className="font-display text-4xl font-semibold leading-tight text-balance">Apprendre sans limites.</h1>
          <p className="text-neutral-600 max-w-[60ch]">Une bibliothèque collaborative façon Wikipédia, organisée par les étudiants pour les étudiants.</p>
          <div className="flex flex-wrap gap-3 items-center pt-2">
            <div className="relative flex-1 min-w-[300px]">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="text"
                placeholder="Rechercher un cours..."
                className="w-full h-11 pl-4 pr-10 bg-ui-bg ring-1 ring-black/5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg ring-1 transition-colors ${
                    cat === c ? "bg-brand text-white ring-brand" : "bg-ui-bg ring-black/5 hover:bg-neutral-200"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(c => {
            const isEnrolled = enrolled.has(c.id);
            return (
              <article key={c.id} className="bg-ui-bg ring-1 ring-black/5 rounded-2xl p-5 space-y-4 hover:-translate-y-0.5 transition-transform">
                <div className={`w-full aspect-video rounded-xl bg-gradient-to-br ${c.gradient} relative overflow-hidden`}>
                  <span className="absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-wider bg-white/80 text-text-main px-2 py-1 rounded">
                    {c.category}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-3">
                    <h3 className="font-display font-semibold text-lg leading-tight">{c.title}</h3>
                    <span className="shrink-0 text-xs font-medium px-2 py-1 bg-brand-light text-brand rounded">{c.rating.toFixed(1)} ★</span>
                  </div>
                  <p className="text-sm text-neutral-600 text-pretty">{c.desc}</p>
                  <div className="flex items-center gap-4 text-[13px] text-neutral-500 pt-2">
                    <span>{c.hours} heures</span>
                    <span>{c.students.toLocaleString("fr-FR")} étudiants</span>
                  </div>
                </div>
                <button
                  onClick={() => toggle(c.id)}
                  className={`w-full py-2.5 text-sm font-medium rounded-lg ring-1 transition ${
                    isEnrolled
                      ? "bg-brand-light text-brand ring-brand/30"
                      : "bg-brand text-white ring-brand hover:brightness-110"
                  }`}
                >
                  {isEnrolled ? "✓ Inscrit" : "S'inscrire"}
                </button>
              </article>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-neutral-500 py-12">Aucun cours ne correspond à ta recherche.</p>
        )}
      </section>
    </main>
  );
}
