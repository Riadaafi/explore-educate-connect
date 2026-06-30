import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/carrieres")({
  head: () => ({
    meta: [
      { title: "Formations — Cursus" },
      { name: "description", content: "Base de masters, écoles et programmes. Recherche, filtre par secteur et ajoute tes propres formations." },
    ],
  }),
  component: FormationsPage,
});

type FormationType = "Master" | "École" | "BUT" | "Licence" | "BTS" | "MBA";
type Sector =
  | "Tech & Digital" | "Business & Management" | "Finance" | "Marketing & Com"
  | "Design & Création" | "Santé & Bio" | "Sciences & Ingénierie" | "Droit"
  | "Sciences sociales" | "Lettres & Langues" | "Architecture" | "Audiovisuel"
  | "Environnement" | "Hôtellerie & Tourisme" | "Sport" | "Enseignement";

type Formation = {
  id: string;
  name: string;
  school: string;
  city: string;
  type: FormationType;
  sector: Sector;
  duration: string; // ex "2 ans"
  level: string;    // entry: "Bac+3" -> output "Bac+5"
  tuition: string;
  rating: number;   // /5
  rncp: boolean;    // reconnu RNCP
  description: string;
};

const SECTORS: Sector[] = [
  "Tech & Digital", "Business & Management", "Finance", "Marketing & Com",
  "Design & Création", "Santé & Bio", "Sciences & Ingénierie", "Droit",
  "Sciences sociales", "Lettres & Langues", "Architecture", "Audiovisuel",
  "Environnement", "Hôtellerie & Tourisme", "Sport", "Enseignement",
];

const TYPES: FormationType[] = ["Master", "École", "BUT", "Licence", "BTS", "MBA"];

const SEED: Formation[] = [
  { id: "1", name: "MSc Data Science", school: "Polytechnique", city: "Palaiseau", type: "Master", sector: "Tech & Digital", duration: "2 ans", level: "Bac+5", tuition: "16 000 €/an", rating: 4.8, rncp: true, description: "Programme intensif en machine learning et data engineering." },
  { id: "2", name: "Grande École", school: "HEC Paris", city: "Jouy-en-Josas", type: "École", sector: "Business & Management", duration: "3 ans", level: "Bac+5", tuition: "21 000 €/an", rating: 4.9, rncp: true, description: "Programme grande école, classé #1 européen." },
  { id: "3", name: "Master Finance", school: "ESSEC", city: "Cergy", type: "Master", sector: "Finance", duration: "2 ans", level: "Bac+5", tuition: "20 000 €/an", rating: 4.7, rncp: true, description: "Spécialisation marchés financiers et corporate finance." },
  { id: "4", name: "MBA Marketing Digital", school: "EM Lyon", city: "Lyon", type: "MBA", sector: "Marketing & Com", duration: "1 an", level: "Bac+5", tuition: "18 500 €", rating: 4.5, rncp: true, description: "MBA spécialisé en marketing data-driven et growth." },
  { id: "5", name: "MSc Computer Science", school: "EPITA", city: "Paris", type: "École", sector: "Tech & Digital", duration: "5 ans", level: "Bac+5", tuition: "9 800 €/an", rating: 4.4, rncp: true, description: "École d'ingénieurs spécialisée en informatique." },
  { id: "6", name: "BUT Informatique", school: "IUT Lyon 1", city: "Lyon", type: "BUT", sector: "Tech & Digital", duration: "3 ans", level: "Bac+3", tuition: "Gratuit (public)", rating: 4.3, rncp: true, description: "Formation pro courte, alternance possible dès la 2ᵉ année." },
  { id: "7", name: "BUT MMI", school: "IUT Bordeaux", city: "Bordeaux", type: "BUT", sector: "Design & Création", duration: "3 ans", level: "Bac+3", tuition: "Gratuit (public)", rating: 4.2, rncp: true, description: "Métiers du multimédia et de l'internet : design, dev, com." },
  { id: "8", name: "Bachelor UX Design", school: "Les Gobelins", city: "Paris", type: "École", sector: "Design & Création", duration: "3 ans", level: "Bac+3", tuition: "8 900 €/an", rating: 4.6, rncp: true, description: "Référence européenne en design d'interaction." },
  { id: "9", name: "Master Droit des Affaires", school: "Paris 1 Panthéon-Sorbonne", city: "Paris", type: "Master", sector: "Droit", duration: "2 ans", level: "Bac+5", tuition: "Gratuit (public)", rating: 4.5, rncp: true, description: "Droit des sociétés, M&A, contentieux." },
  { id: "10", name: "PASS / L.AS", school: "Sorbonne Université", city: "Paris", type: "Licence", sector: "Santé & Bio", duration: "1 an", level: "Bac+1", tuition: "Gratuit (public)", rating: 4.0, rncp: true, description: "Parcours d'accès aux études de santé (médecine, pharma, dentaire)." },
  { id: "11", name: "Diplôme d'Ingénieur", school: "CentraleSupélec", city: "Gif-sur-Yvette", type: "École", sector: "Sciences & Ingénierie", duration: "3 ans", level: "Bac+5", tuition: "2 500 €/an", rating: 4.9, rncp: true, description: "Ingénieur généraliste sur un large spectre scientifique." },
  { id: "12", name: "Master Architecture", school: "ENSA Paris-Malaquais", city: "Paris", type: "Master", sector: "Architecture", duration: "2 ans", level: "Bac+5", tuition: "Gratuit (public)", rating: 4.4, rncp: true, description: "DEA permettant d'exercer en tant qu'architecte." },
  { id: "13", name: "Master Cinéma", school: "La Fémis", city: "Paris", type: "École", sector: "Audiovisuel", duration: "4 ans", level: "Bac+5", tuition: "500 €/an", rating: 4.8, rncp: true, description: "École nationale supérieure des métiers de l'image et du son." },
  { id: "14", name: "Master Sciences Po", school: "Sciences Po Paris", city: "Paris", type: "Master", sector: "Sciences sociales", duration: "2 ans", level: "Bac+5", tuition: "14 000 €/an", rating: 4.7, rncp: true, description: "13 masters : affaires publiques, journalisme, droit, etc." },
  { id: "15", name: "BTS Tourisme", school: "CFA Tourisme", city: "Marseille", type: "BTS", sector: "Hôtellerie & Tourisme", duration: "2 ans", level: "Bac+2", tuition: "Gratuit (alternance)", rating: 3.9, rncp: true, description: "Formation pro courte en gestion touristique." },
  { id: "16", name: "Licence STAPS", school: "Université Paris-Saclay", city: "Orsay", type: "Licence", sector: "Sport", duration: "3 ans", level: "Bac+3", tuition: "Gratuit (public)", rating: 4.1, rncp: true, description: "Sciences et techniques des activités physiques et sportives." },
  { id: "17", name: "Master MEEF", school: "INSPÉ Lyon", city: "Lyon", type: "Master", sector: "Enseignement", duration: "2 ans", level: "Bac+5", tuition: "Gratuit (public)", rating: 4.0, rncp: true, description: "Métiers de l'enseignement, de l'éducation et de la formation." },
  { id: "18", name: "Master Environnement", school: "AgroParisTech", city: "Palaiseau", type: "Master", sector: "Environnement", duration: "2 ans", level: "Bac+5", tuition: "2 500 €/an", rating: 4.6, rncp: true, description: "Sciences et ingénierie de l'environnement et du vivant." },
  { id: "19", name: "Master LLCE Anglais", school: "Paris Nanterre", city: "Nanterre", type: "Master", sector: "Lettres & Langues", duration: "2 ans", level: "Bac+5", tuition: "Gratuit (public)", rating: 4.2, rncp: true, description: "Langues, littératures et civilisations étrangères." },
  { id: "20", name: "MSc Cybersecurity", school: "Telecom Paris", city: "Palaiseau", type: "Master", sector: "Tech & Digital", duration: "2 ans", level: "Bac+5", tuition: "14 000 €/an", rating: 4.7, rncp: true, description: "Spécialisation en cybersécurité offensive et défensive." },
  { id: "21", name: "Bachelor Communication", school: "CELSA Sorbonne", city: "Neuilly", type: "Licence", sector: "Marketing & Com", duration: "3 ans", level: "Bac+3", tuition: "Gratuit (public)", rating: 4.5, rncp: true, description: "Référence en sciences de l'information et de la communication." },
  { id: "22", name: "Diplôme Vétérinaire", school: "ENVA Maisons-Alfort", city: "Maisons-Alfort", type: "École", sector: "Santé & Bio", duration: "6 ans", level: "Bac+6", tuition: "5 000 €/an", rating: 4.6, rncp: true, description: "École nationale vétérinaire d'Alfort." },
  { id: "23", name: "Master Game Design", school: "Rubika", city: "Valenciennes", type: "École", sector: "Audiovisuel", duration: "5 ans", level: "Bac+5", tuition: "8 200 €/an", rating: 4.3, rncp: true, description: "Game design, programmation et art pour le jeu vidéo." },
  { id: "24", name: "Master Économie", school: "PSE - Paris School of Economics", city: "Paris", type: "Master", sector: "Finance", duration: "2 ans", level: "Bac+5", tuition: "Gratuit (public)", rating: 4.8, rncp: true, description: "Top mondial en recherche économique." },
];

const STORAGE_KEY = "cursus.formations.v1";

function load(): Formation[] {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : SEED;
  } catch { return SEED; }
}

function save(data: Formation[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function FormationsPage() {
  const [items, setItems] = useState<Formation[]>(SEED);
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState<Sector | "all">("all");
  const [type, setType] = useState<FormationType | "all">("all");
  const [editing, setEditing] = useState<Formation | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { setItems(load()); }, []);
  useEffect(() => { if (items !== SEED) save(items); }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(f =>
      (sector === "all" || f.sector === sector) &&
      (type === "all" || f.type === type) &&
      (!q || `${f.name} ${f.school} ${f.city} ${f.sector}`.toLowerCase().includes(q))
    );
  }, [items, query, sector, type]);

  const handleSave = (f: Formation) => {
    setItems(prev => {
      const exists = prev.some(x => x.id === f.id);
      const next = exists ? prev.map(x => x.id === f.id ? f : x) : [f, ...prev];
      save(next);
      return next;
    });
    setShowForm(false); setEditing(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Supprimer cette formation ?")) return;
    setItems(prev => { const next = prev.filter(x => x.id !== id); save(next); return next; });
  };

  return (
    <main className="max-w-6xl mx-auto py-12 px-6 space-y-10">
      <section className="space-y-3">
        <span className="text-[11px] uppercase tracking-[0.2em] text-brand font-semibold">Formations</span>
        <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight">
          Toutes les formations, en un seul endroit.
        </h1>
        <p className="text-neutral-600 max-w-2xl">
          Masters, écoles, BUT, BTS et licences. {items.length} formations référencées. Ajoute et modifie les tiennes.
        </p>
      </section>

      {/* Search + filters */}
      <section className="bg-ui-bg ring-1 ring-black/5 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="🔍 Rechercher une formation, école ou ville..."
            className="flex-1 px-4 py-3 bg-white rounded-xl ring-1 ring-black/5 text-sm focus:ring-brand outline-none"
          />
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="px-5 py-3 bg-brand text-white rounded-xl text-sm font-medium hover:brightness-110 whitespace-nowrap"
          >
            + Ajouter
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterChip active={type === "all"} onClick={() => setType("all")} label="Tous types" />
          {TYPES.map(t => (
            <FilterChip key={t} active={type === t} onClick={() => setType(t)} label={t} />
          ))}
        </div>
        <div className="flex flex-wrap gap-2 pt-1 border-t border-black/5">
          <FilterChip active={sector === "all"} onClick={() => setSector("all")} label="Tous secteurs" />
          {SECTORS.map(s => (
            <FilterChip key={s} active={sector === s} onClick={() => setSector(s)} label={s} />
          ))}
        </div>
      </section>

      {/* Metrics */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Formations affichées" value={filtered.length.toString()} />
        <Stat label="Écoles uniques" value={new Set(filtered.map(f => f.school)).size.toString()} />
        <Stat label="Villes" value={new Set(filtered.map(f => f.city)).size.toString()} />
        <Stat label="Note moyenne" value={filtered.length ? (filtered.reduce((a, f) => a + f.rating, 0) / filtered.length).toFixed(1) : "—"} />
      </section>

      {/* Grid */}
      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-neutral-500 text-sm">Aucune formation ne correspond.</div>
        )}
        {filtered.map(f => (
          <article key={f.id} className="bg-white ring-1 ring-black/5 rounded-2xl p-5 flex flex-col gap-3 hover:ring-brand/30 transition">
            <div className="flex justify-between items-start gap-2">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-brand px-2 py-1 bg-brand-light rounded">{f.type}</span>
              <span className="text-xs text-neutral-500">⭐ {f.rating}</span>
            </div>
            <div>
              <h3 className="font-display font-semibold text-base leading-tight">{f.name}</h3>
              <p className="text-sm text-neutral-600 mt-1">{f.school}</p>
              <p className="text-xs text-neutral-400">{f.city}</p>
            </div>
            <p className="text-xs text-neutral-600 line-clamp-2">{f.description}</p>
            <div className="flex flex-wrap gap-1 text-[11px]">
              <span className="px-2 py-0.5 bg-neutral-100 rounded-full">{f.sector}</span>
              <span className="px-2 py-0.5 bg-neutral-100 rounded-full">{f.duration}</span>
              <span className="px-2 py-0.5 bg-neutral-100 rounded-full">{f.level}</span>
              {f.rncp && <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">RNCP</span>}
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-black/5 text-xs">
              <span className="text-neutral-500">{f.tuition}</span>
              <div className="flex gap-2">
                <button onClick={() => { setEditing(f); setShowForm(true); }} className="text-neutral-500 hover:text-brand">✏️</button>
                <button onClick={() => handleDelete(f.id)} className="text-neutral-500 hover:text-red-500">🗑</button>
              </div>
            </div>
          </article>
        ))}
      </section>

      {showForm && (
        <FormationForm
          initial={editing}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSave={handleSave}
        />
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white ring-1 ring-black/5 rounded-xl p-4">
      <div className="text-2xl font-display font-semibold text-brand">{value}</div>
      <div className="text-xs text-neutral-500 mt-1">{label}</div>
    </div>
  );
}

function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
        active ? "bg-brand text-white" : "bg-white text-neutral-600 ring-1 ring-black/5 hover:ring-brand"
      }`}
    >{label}</button>
  );
}

function FormationForm({ initial, onClose, onSave }: { initial: Formation | null; onClose: () => void; onSave: (f: Formation) => void }) {
  const [form, setForm] = useState<Formation>(initial ?? {
    id: crypto.randomUUID(),
    name: "", school: "", city: "", type: "Master", sector: "Tech & Digital",
    duration: "2 ans", level: "Bac+5", tuition: "", rating: 4.0, rncp: true, description: "",
  });

  const update = <K extends keyof Formation>(k: K, v: Formation[K]) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 grid place-items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-display text-xl font-semibold">{initial ? "Modifier" : "Ajouter"} une formation</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700">✕</button>
        </div>
        <form
          onSubmit={e => { e.preventDefault(); if (!form.name || !form.school) return; onSave(form); }}
          className="grid gap-3"
        >
          <Field label="Nom de la formation"><input required value={form.name} onChange={e => update("name", e.target.value)} className="input" /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="École / Université"><input required value={form.school} onChange={e => update("school", e.target.value)} className="input" /></Field>
            <Field label="Ville"><input value={form.city} onChange={e => update("city", e.target.value)} className="input" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <select value={form.type} onChange={e => update("type", e.target.value as FormationType)} className="input">
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Secteur">
              <select value={form.sector} onChange={e => update("sector", e.target.value as Sector)} className="input">
                {SECTORS.map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Durée"><input value={form.duration} onChange={e => update("duration", e.target.value)} className="input" /></Field>
            <Field label="Niveau"><input value={form.level} onChange={e => update("level", e.target.value)} className="input" /></Field>
            <Field label="Note /5"><input type="number" min="0" max="5" step="0.1" value={form.rating} onChange={e => update("rating", parseFloat(e.target.value))} className="input" /></Field>
          </div>
          <Field label="Frais"><input value={form.tuition} onChange={e => update("tuition", e.target.value)} className="input" /></Field>
          <Field label="Description"><textarea rows={3} value={form.description} onChange={e => update("description", e.target.value)} className="input" /></Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.rncp} onChange={e => update("rncp", e.target.checked)} /> Reconnu RNCP
          </label>
          <div className="flex justify-end gap-2 pt-3">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg ring-1 ring-black/10 hover:bg-neutral-50">Annuler</button>
            <button type="submit" className="px-4 py-2 text-sm bg-brand text-white rounded-lg hover:brightness-110">Enregistrer</button>
          </div>
        </form>
        <style>{`.input{width:100%;padding:.55rem .75rem;background:#fafaf9;border-radius:.5rem;border:1px solid rgba(0,0,0,.08);font-size:.875rem;outline:none}.input:focus{border-color:#0d9488}`}</style>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-neutral-600 mb-1">{label}</span>
      {children}
    </label>
  );
}
