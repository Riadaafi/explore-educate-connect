import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/reseau")({
  head: () => ({
    meta: [
      { title: "Réseau — Cursus" },
      { name: "description", content: "Annuaire alumni : profils, parcours et métriques sur les écoles, licences et formations." },
    ],
  }),
  component: ReseauPage,
});

type Status = "Étudiant" | "Alumni" | "En poste";

type Member = {
  id: string;
  name: string;
  age: number;
  status: Status;
  school: string;
  degree: string;     // ex "Master Finance"
  field: string;      // ex "Finance"
  graduationYear: number;
  currentRole: string;
  company: string;
  city: string;
  bio: string;
  gradient: string;
  emoji: string;
  skills: string[];
};

const SEED: Member[] = [
  { id: "1", name: "Léa Martin", age: 24, status: "Alumni", school: "HEC Paris", degree: "Master Marketing", field: "Marketing & Com", graduationYear: 2024, currentRole: "Product Marketing Manager", company: "Doctolib", city: "Paris", bio: "Passionnée par la santé digitale et la growth.", gradient: "from-rose-300 to-orange-400", emoji: "🎨", skills: ["Growth", "Branding", "SQL"] },
  { id: "2", name: "Karim Benali", age: 26, status: "En poste", school: "Polytechnique", degree: "MSc Data Science", field: "Tech & Digital", graduationYear: 2023, currentRole: "Senior Data Scientist", company: "Mistral AI", city: "Paris", bio: "NLP, LLMs et open source.", gradient: "from-indigo-300 to-blue-500", emoji: "🤖", skills: ["Python", "PyTorch", "LLMs"] },
  { id: "3", name: "Sarah Calvet", age: 22, status: "Étudiant", school: "Assas", degree: "Master Droit des Affaires", field: "Droit", graduationYear: 2026, currentRole: "Stagiaire", company: "Cabinet Gide", city: "Paris", bio: "Future avocate, M&A et fusions.", gradient: "from-amber-300 to-yellow-500", emoji: "⚖️", skills: ["Droit des sociétés", "Anglais juridique"] },
  { id: "4", name: "Thomas Dubois", age: 27, status: "Alumni", school: "HEC Paris", degree: "MSc Finance", field: "Finance", graduationYear: 2022, currentRole: "Investment Banker", company: "Goldman Sachs", city: "Londres", bio: "M&A tech et crypto.", gradient: "from-emerald-300 to-teal-500", emoji: "📈", skills: ["M&A", "Modélisation", "VBA"] },
  { id: "5", name: "Inès Rahman", age: 21, status: "Étudiant", school: "Paris-Saclay", degree: "Licence Biologie", field: "Santé & Bio", graduationYear: 2026, currentRole: "Étudiante L3", company: "—", city: "Orsay", bio: "Recherche en génétique et musique électronique.", gradient: "from-fuchsia-300 to-purple-500", emoji: "🧬", skills: ["Biochimie", "R", "Microscopie"] },
  { id: "6", name: "Hugo Lefèvre", age: 28, status: "En poste", school: "ENSA Paris", degree: "Master Architecture", field: "Architecture", graduationYear: 2021, currentRole: "Architecte associé", company: "AAA Studio", city: "Lyon", bio: "Urbanisme et habitat durable.", gradient: "from-stone-300 to-stone-500", emoji: "🏛️", skills: ["Revit", "Urbanisme", "BIM"] },
  { id: "7", name: "Camille Roux", age: 25, status: "En poste", school: "Les Gobelins", degree: "Bachelor UX Design", field: "Design & Création", graduationYear: 2023, currentRole: "Lead UX Designer", company: "Back Market", city: "Paris", bio: "Design system et accessibilité.", gradient: "from-pink-300 to-rose-500", emoji: "✏️", skills: ["Figma", "Design system", "A11y"] },
  { id: "8", name: "Yanis Moreau", age: 23, status: "Alumni", school: "EPITA", degree: "MSc Computer Science", field: "Tech & Digital", graduationYear: 2024, currentRole: "Backend Engineer", company: "Stripe", city: "Dublin", bio: "Distributed systems & Go.", gradient: "from-sky-300 to-cyan-500", emoji: "💻", skills: ["Go", "Kubernetes", "PostgreSQL"] },
  { id: "9", name: "Marie Chen", age: 29, status: "En poste", school: "Sciences Po Paris", degree: "Master Affaires Publiques", field: "Sciences sociales", graduationYear: 2020, currentRole: "Policy Advisor", company: "Commission EU", city: "Bruxelles", bio: "Politique climatique européenne.", gradient: "from-green-300 to-emerald-500", emoji: "🌍", skills: ["Politique publique", "Anglais", "Allemand"] },
  { id: "10", name: "Antoine Garcia", age: 26, status: "Alumni", school: "EM Lyon", degree: "MBA Marketing Digital", field: "Marketing & Com", graduationYear: 2023, currentRole: "Head of Growth", company: "Alan", city: "Paris", bio: "Performance marketing et SEO.", gradient: "from-violet-300 to-purple-500", emoji: "🚀", skills: ["Growth", "SEO", "Analytics"] },
  { id: "11", name: "Julie Petit", age: 24, status: "Alumni", school: "La Fémis", degree: "Master Cinéma", field: "Audiovisuel", graduationYear: 2024, currentRole: "Réalisatrice", company: "Indé", city: "Paris", bio: "Documentaires sociaux.", gradient: "from-red-300 to-orange-500", emoji: "🎬", skills: ["Réalisation", "Montage", "Scénario"] },
  { id: "12", name: "Mehdi Bensaïd", age: 30, status: "En poste", school: "CentraleSupélec", degree: "Diplôme d'Ingénieur", field: "Sciences & Ingénierie", graduationYear: 2018, currentRole: "Ingénieur R&D", company: "Airbus", city: "Toulouse", bio: "Avionique et systèmes embarqués.", gradient: "from-blue-300 to-indigo-500", emoji: "✈️", skills: ["C++", "Systèmes embarqués", "DO-178C"] },
  { id: "13", name: "Clara Vidal", age: 22, status: "Étudiant", school: "IUT Bordeaux", degree: "BUT MMI", field: "Design & Création", graduationYear: 2026, currentRole: "Étudiante en alternance", company: "Ubisoft", city: "Bordeaux", bio: "Direction artistique jeux vidéo.", gradient: "from-yellow-300 to-amber-500", emoji: "🎮", skills: ["Illustration", "Unity", "Photoshop"] },
  { id: "14", name: "Lucas Bernard", age: 27, status: "Alumni", school: "AgroParisTech", degree: "Master Environnement", field: "Environnement", graduationYear: 2022, currentRole: "Consultant ESG", company: "Carbone 4", city: "Paris", bio: "Bilan carbone et stratégie climat.", gradient: "from-lime-300 to-green-500", emoji: "🌱", skills: ["ACV", "Bilan carbone", "Stratégie"] },
];

const STORAGE_KEY = "cursus.network.v1";

function load(): Member[] {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : SEED;
  } catch { return SEED; }
}

function save(d: Member[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
}

type Tab = "annuaire" | "metrics";

function ReseauPage() {
  const [members, setMembers] = useState<Member[]>(SEED);
  const [tab, setTab] = useState<Tab>("annuaire");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [schoolFilter, setSchoolFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Member | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => { setMembers(load()); }, []);

  const schools = useMemo(() => Array.from(new Set(members.map(m => m.school))).sort(), [members]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter(m =>
      (statusFilter === "all" || m.status === statusFilter) &&
      (schoolFilter === "all" || m.school === schoolFilter) &&
      (!q || `${m.name} ${m.degree} ${m.school} ${m.currentRole} ${m.company} ${m.city}`.toLowerCase().includes(q))
    );
  }, [members, query, statusFilter, schoolFilter]);

  const handleAdd = (m: Member) => {
    setMembers(prev => { const next = [m, ...prev]; save(next); return next; });
    setShowForm(false);
  };

  return (
    <main className="max-w-6xl mx-auto py-12 px-6 space-y-8">
      <section className="space-y-3">
        <span className="text-[11px] uppercase tracking-[0.2em] text-brand font-semibold">Réseau</span>
        <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight">
          L'annuaire des étudiants & alumni.
        </h1>
        <p className="text-neutral-600 max-w-2xl">
          {members.length} profils référencés. Explore les parcours, filtre par école et visualise les statistiques en temps réel.
        </p>
      </section>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-black/5">
        <TabBtn active={tab === "annuaire"} onClick={() => setTab("annuaire")} label="👥 Annuaire" />
        <TabBtn active={tab === "metrics"} onClick={() => setTab("metrics")} label="📊 Statistiques" />
      </div>

      {tab === "annuaire" && (
        <>
          <section className="bg-ui-bg ring-1 ring-black/5 rounded-2xl p-5 space-y-3">
            <div className="flex flex-col md:flex-row gap-3">
              <input
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="🔍 Nom, école, métier, entreprise..."
                className="flex-1 px-4 py-3 bg-white rounded-xl ring-1 ring-black/5 text-sm focus:ring-brand outline-none"
              />
              <button onClick={() => setShowForm(true)} className="px-5 py-3 bg-brand text-white rounded-xl text-sm font-medium hover:brightness-110 whitespace-nowrap">
                + Rejoindre
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(["all", "Étudiant", "Alumni", "En poste"] as const).map(s => (
                <Chip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)} label={s === "all" ? "Tous statuts" : s} />
              ))}
            </div>
            <div className="flex flex-wrap gap-2 pt-2 border-t border-black/5">
              <Chip active={schoolFilter === "all"} onClick={() => setSchoolFilter("all")} label="Toutes écoles" />
              {schools.map(s => <Chip key={s} active={schoolFilter === s} onClick={() => setSchoolFilter(s)} label={s} />)}
            </div>
          </section>

          <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.length === 0 && <div className="col-span-full text-center py-16 text-neutral-500 text-sm">Aucun profil ne correspond.</div>}
            {filtered.map(m => (
              <button key={m.id} onClick={() => setSelected(m)} className="text-left bg-white ring-1 ring-black/5 rounded-2xl p-4 hover:ring-brand/30 transition flex gap-4">
                <div className={`size-16 shrink-0 rounded-xl bg-gradient-to-br ${m.gradient} grid place-items-center text-3xl`}>{m.emoji}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-semibold text-sm truncate">{m.name}</h3>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${m.status === "Étudiant" ? "bg-blue-50 text-blue-700" : m.status === "Alumni" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{m.status}</span>
                  </div>
                  <p className="text-xs text-neutral-600 truncate">{m.currentRole}</p>
                  <p className="text-xs text-neutral-500 truncate">{m.company} • {m.city}</p>
                  <p className="text-[11px] text-brand mt-1 truncate">🎓 {m.school}</p>
                </div>
              </button>
            ))}
          </section>
        </>
      )}

      {tab === "metrics" && <Metrics members={members} />}

      {selected && <ProfileModal member={selected} onClose={() => setSelected(null)} />}
      {showForm && <JoinForm onClose={() => setShowForm(false)} onSave={handleAdd} />}
    </main>
  );
}

function TabBtn({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className={`px-4 py-3 text-sm font-medium border-b-2 transition ${active ? "border-brand text-brand" : "border-transparent text-neutral-500 hover:text-brand"}`}>{label}</button>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${active ? "bg-brand text-white" : "bg-white text-neutral-600 ring-1 ring-black/5 hover:ring-brand"}`}>{label}</button>
  );
}

function Metrics({ members }: { members: Member[] }) {
  const total = members.length;
  const byStatus = countBy(members, m => m.status);
  const bySchool = sortedCount(members, m => m.school);
  const byField = sortedCount(members, m => m.field);
  const byDegree = sortedCount(members, m => m.degree);
  const byCity = sortedCount(members, m => m.city);
  const byCompany = sortedCount(members, m => m.company).filter(([k]) => k !== "—");

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Membres" value={total.toString()} />
        <Stat label="Alumni" value={(byStatus["Alumni"] ?? 0).toString()} />
        <Stat label="Étudiants" value={(byStatus["Étudiant"] ?? 0).toString()} />
        <Stat label="En poste" value={(byStatus["En poste"] ?? 0).toString()} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <BarChart title="🎓 Par école" data={bySchool} total={total} />
        <BarChart title="📚 Par formation" data={byDegree} total={total} />
        <BarChart title="🏷 Par secteur" data={byField} total={total} />
        <BarChart title="🌍 Par ville" data={byCity} total={total} />
        <BarChart title="🏢 Top entreprises" data={byCompany.slice(0, 10)} total={total} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white ring-1 ring-black/5 rounded-xl p-4">
      <div className="text-3xl font-display font-semibold text-brand">{value}</div>
      <div className="text-xs text-neutral-500 mt-1">{label}</div>
    </div>
  );
}

function BarChart({ title, data, total }: { title: string; data: [string, number][]; total: number }) {
  const max = Math.max(1, ...data.map(([, n]) => n));
  return (
    <div className="bg-white ring-1 ring-black/5 rounded-2xl p-5">
      <h3 className="font-display font-semibold text-sm mb-4">{title}</h3>
      <div className="space-y-2.5">
        {data.length === 0 && <p className="text-xs text-neutral-400">Aucune donnée.</p>}
        {data.map(([key, n]) => (
          <div key={key}>
            <div className="flex justify-between text-xs mb-1">
              <span className="truncate pr-2">{key}</span>
              <span className="text-neutral-500 shrink-0">{n} <span className="text-neutral-300">({Math.round((n / total) * 100)}%)</span></span>
            </div>
            <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
              <div className="h-full bg-brand transition-all" style={{ width: `${(n / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function countBy<T>(arr: T[], fn: (x: T) => string): Record<string, number> {
  const o: Record<string, number> = {};
  arr.forEach(x => { const k = fn(x); o[k] = (o[k] ?? 0) + 1; });
  return o;
}
function sortedCount<T>(arr: T[], fn: (x: T) => string): [string, number][] {
  return Object.entries(countBy(arr, fn)).sort((a, b) => b[1] - a[1]);
}

function ProfileModal({ member, onClose }: { member: Member; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 grid place-items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className={`h-32 bg-gradient-to-br ${member.gradient} grid place-items-center text-6xl`}>{member.emoji}</div>
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-display text-2xl font-semibold">{member.name}, {member.age}</h2>
              <p className="text-sm text-neutral-600">{member.currentRole} @ {member.company}</p>
              <p className="text-xs text-neutral-500">{member.city}</p>
            </div>
            <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700">✕</button>
          </div>
          <p className="text-sm italic text-neutral-700">"{member.bio}"</p>
          <div className="grid grid-cols-2 gap-3 text-sm border-y border-black/5 py-4">
            <div><div className="text-[10px] uppercase text-neutral-400">École</div><div>{member.school}</div></div>
            <div><div className="text-[10px] uppercase text-neutral-400">Formation</div><div>{member.degree}</div></div>
            <div><div className="text-[10px] uppercase text-neutral-400">Promo</div><div>{member.graduationYear}</div></div>
            <div><div className="text-[10px] uppercase text-neutral-400">Statut</div><div>{member.status}</div></div>
          </div>
          <div>
            <div className="text-[10px] uppercase text-neutral-400 mb-2">Compétences</div>
            <div className="flex flex-wrap gap-1.5">
              {member.skills.map(s => <span key={s} className="px-2 py-1 bg-brand-light text-brand text-xs rounded-full">{s}</span>)}
            </div>
          </div>
          <button className="w-full py-2.5 bg-brand text-white rounded-lg text-sm font-medium hover:brightness-110">Se connecter</button>
        </div>
      </div>
    </div>
  );
}

function JoinForm({ onClose, onSave }: { onClose: () => void; onSave: (m: Member) => void }) {
  const [m, setM] = useState<Member>({
    id: crypto.randomUUID(), name: "", age: 22, status: "Étudiant", school: "", degree: "", field: "Tech & Digital",
    graduationYear: 2026, currentRole: "", company: "", city: "", bio: "", gradient: "from-teal-300 to-cyan-500", emoji: "🎓", skills: [],
  });
  const [skillsRaw, setSkillsRaw] = useState("");

  const u = <K extends keyof Member>(k: K, v: Member[K]) => setM(p => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 grid place-items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-display text-xl font-semibold">Rejoindre le réseau</h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700">✕</button>
        </div>
        <form onSubmit={e => { e.preventDefault(); if (!m.name) return; onSave({ ...m, skills: skillsRaw.split(",").map(s => s.trim()).filter(Boolean) }); }} className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <F label="Nom complet"><input required value={m.name} onChange={e => u("name", e.target.value)} className="inp" /></F>
            <F label="Âge"><input type="number" value={m.age} onChange={e => u("age", parseInt(e.target.value))} className="inp" /></F>
          </div>
          <F label="Statut">
            <select value={m.status} onChange={e => u("status", e.target.value as Status)} className="inp">
              <option>Étudiant</option><option>Alumni</option><option>En poste</option>
            </select>
          </F>
          <div className="grid grid-cols-2 gap-3">
            <F label="École"><input value={m.school} onChange={e => u("school", e.target.value)} className="inp" /></F>
            <F label="Formation / Diplôme"><input value={m.degree} onChange={e => u("degree", e.target.value)} className="inp" /></F>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <F label="Secteur"><input value={m.field} onChange={e => u("field", e.target.value)} className="inp" /></F>
            <F label="Année de promo"><input type="number" value={m.graduationYear} onChange={e => u("graduationYear", parseInt(e.target.value))} className="inp" /></F>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <F label="Poste actuel"><input value={m.currentRole} onChange={e => u("currentRole", e.target.value)} className="inp" /></F>
            <F label="Entreprise"><input value={m.company} onChange={e => u("company", e.target.value)} className="inp" /></F>
          </div>
          <F label="Ville"><input value={m.city} onChange={e => u("city", e.target.value)} className="inp" /></F>
          <F label="Bio"><textarea rows={2} value={m.bio} onChange={e => u("bio", e.target.value)} className="inp" /></F>
          <F label="Compétences (séparées par virgules)"><input value={skillsRaw} onChange={e => setSkillsRaw(e.target.value)} className="inp" placeholder="Python, SQL, Leadership" /></F>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-lg ring-1 ring-black/10">Annuler</button>
            <button type="submit" className="px-4 py-2 text-sm bg-brand text-white rounded-lg">Rejoindre</button>
          </div>
        </form>
        <style>{`.inp{width:100%;padding:.55rem .75rem;background:#fafaf9;border-radius:.5rem;border:1px solid rgba(0,0,0,.08);font-size:.875rem;outline:none}.inp:focus{border-color:#0d9488}`}</style>
      </div>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="block text-xs font-medium text-neutral-600 mb-1">{label}</span>{children}</label>;
}
