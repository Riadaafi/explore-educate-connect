import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/carrieres")({
  head: () => ({ meta: [{ title: "Formations — Cursus" }, { name: "description", content: "1000+ formations : Master, Licence, BUT, BTS, MBA, École. Recherche, filtres, expertise." }] }),
  component: FormationsPage,
});

type Formation = {
  id: string; name: string; type: string; sector: string; school: string; city: string | null;
  duration: string | null; expertise_level: string | null; description: string | null; outlets: string[] | null;
  created_by: string | null;
};

const EMPTY: Omit<Formation, "id" | "created_by"> = {
  name: "", type: "Master", sector: "Informatique", school: "", city: "", duration: "2 ans", expertise_level: "Intermédiaire", description: "", outlets: [],
};

const TYPES = ["Master","Licence","BUT","BTS","MBA","École","Licence Pro","Prépa"];
const LEVELS = ["Débutant","Intermédiaire","Avancé","Expert"];

function FormationsPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<Formation[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [sector, setSector] = useState("");
  const [level, setLevel] = useState("");
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState<Formation | null>(null);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("formations").select("*").order("created_at", { ascending: false }).limit(2000);
    setItems((data as Formation[]) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const sectors = useMemo(() => Array.from(new Set(items.map(i => i.sector))).sort(), [items]);

  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return items.filter(i =>
      (!s || i.name.toLowerCase().includes(s) || i.school.toLowerCase().includes(s) || (i.city ?? "").toLowerCase().includes(s)) &&
      (!type || i.type === type) &&
      (!sector || i.sector === sector) &&
      (!level || i.expertise_level === level)
    );
  }, [items, q, type, sector, level]);

  const pageSize = 24;
  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const pageCount = Math.ceil(filtered.length / pageSize);
  useEffect(() => { setPage(0); }, [q, type, sector, level]);

  const remove = async (id: string) => {
    if (!confirm("Supprimer cette formation ?")) return;
    const { error } = await supabase.from("formations").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Supprimé"); load(); }
  };

  return (
    <main className="max-w-6xl mx-auto py-12 px-6 space-y-8">
      <header className="space-y-3">
        <span className="text-[11px] uppercase tracking-[0.2em] text-brand font-semibold">Catalogue</span>
        <h1 className="font-display text-4xl md:text-5xl font-semibold">{items.length}+ formations</h1>
        <p className="text-neutral-600">Master, Licence, BUT, BTS, MBA, École. Recherche + filtres. Chacun peut ajouter/modifier.</p>
      </header>

      <div className="bg-ui-bg ring-1 ring-black/5 rounded-2xl p-4 grid gap-3 md:grid-cols-5">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="🔍 Nom, école, ville…" className="md:col-span-2 px-3 py-2 rounded-lg bg-white ring-1 ring-black/10 text-sm focus:outline-none focus:ring-brand" />
        <select value={type} onChange={e => setType(e.target.value)} className="px-3 py-2 rounded-lg bg-white ring-1 ring-black/10 text-sm">
          <option value="">Tous types</option>{TYPES.map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={sector} onChange={e => setSector(e.target.value)} className="px-3 py-2 rounded-lg bg-white ring-1 ring-black/10 text-sm">
          <option value="">Tous secteurs</option>{sectors.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={level} onChange={e => setLevel(e.target.value)} className="px-3 py-2 rounded-lg bg-white ring-1 ring-black/10 text-sm">
          <option value="">Tous niveaux</option>{LEVELS.map(l => <option key={l}>{l}</option>)}
        </select>
      </div>

      <div className="flex justify-between items-center">
        <p className="text-sm text-neutral-500">{filtered.length} résultats</p>
        {user && <button onClick={() => setCreating(true)} className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium">+ Ajouter</button>}
      </div>

      {loading ? <p className="text-center text-neutral-400 py-16">Chargement…</p> : (
        <>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {paged.map(f => (
              <article key={f.id} className="bg-white ring-1 ring-black/5 rounded-2xl p-5 space-y-3 hover:ring-brand/30 transition">
                <div className="flex justify-between gap-2">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-brand bg-brand-light px-2 py-0.5 rounded">{f.type}</span>
                  <span className="text-[10px] uppercase text-neutral-500">{f.expertise_level}</span>
                </div>
                <h3 className="font-display font-semibold text-base leading-tight">{f.name}</h3>
                <div className="text-xs text-neutral-500 space-y-0.5">
                  <p>🏛️ {f.school}</p>
                  <p>📍 {f.city} · ⏱ {f.duration}</p>
                  <p className="text-brand font-medium">{f.sector}</p>
                </div>
                {f.outlets && f.outlets.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {f.outlets.slice(0,3).map(o => <span key={o} className="text-[10px] bg-neutral-100 px-2 py-0.5 rounded">{o}</span>)}
                  </div>
                )}
                {user && (
                  <div className="flex gap-2 pt-2 border-t border-black/5">
                    <button onClick={() => setEditing(f)} className="text-xs text-brand hover:underline">Modifier</button>
                    <button onClick={() => remove(f.id)} className="text-xs text-red-500 hover:underline">Supprimer</button>
                  </div>
                )}
              </article>
            ))}
          </div>

          {pageCount > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <button disabled={page===0} onClick={() => setPage(p => p-1)} className="px-3 py-1.5 text-sm rounded ring-1 ring-black/10 disabled:opacity-30">←</button>
              <span className="px-3 py-1.5 text-sm">{page+1} / {pageCount}</span>
              <button disabled={page>=pageCount-1} onClick={() => setPage(p => p+1)} className="px-3 py-1.5 text-sm rounded ring-1 ring-black/10 disabled:opacity-30">→</button>
            </div>
          )}
        </>
      )}

      {(editing || creating) && (
        <FormationForm initial={editing ?? { ...EMPTY, id: "", created_by: null }} onClose={() => { setEditing(null); setCreating(false); }} onSaved={load} isNew={creating} userId={user?.id ?? null} />
      )}
    </main>
  );
}

function FormationForm({ initial, onClose, onSaved, isNew, userId }: { initial: Formation; onClose: () => void; onSaved: () => void; isNew: boolean; userId: string | null }) {
  const [f, setF] = useState(initial);
  const save = async () => {
    if (!f.name || !f.school) { toast.error("Nom + école requis"); return; }
    const payload = { name: f.name, type: f.type, sector: f.sector, school: f.school, city: f.city, duration: f.duration, expertise_level: f.expertise_level, description: f.description, outlets: f.outlets };
    const { error } = isNew
      ? await supabase.from("formations").insert({ ...payload, created_by: userId })
      : await supabase.from("formations").update(payload).eq("id", f.id);
    if (error) toast.error(error.message); else { toast.success(isNew ? "Créée" : "Modifiée"); onSaved(); onClose(); }
  };
  return (
    <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-3" onClick={e => e.stopPropagation()}>
        <h2 className="font-display font-semibold text-xl">{isNew ? "Nouvelle formation" : "Modifier"}</h2>
        <input placeholder="Nom" value={f.name} onChange={e => setF({...f, name: e.target.value})} className="w-full px-3 py-2 rounded ring-1 ring-black/10 text-sm" />
        <input placeholder="École" value={f.school} onChange={e => setF({...f, school: e.target.value})} className="w-full px-3 py-2 rounded ring-1 ring-black/10 text-sm" />
        <input placeholder="Ville" value={f.city ?? ""} onChange={e => setF({...f, city: e.target.value})} className="w-full px-3 py-2 rounded ring-1 ring-black/10 text-sm" />
        <div className="grid grid-cols-2 gap-2">
          <select value={f.type} onChange={e => setF({...f, type: e.target.value})} className="px-3 py-2 rounded ring-1 ring-black/10 text-sm">{TYPES.map(t => <option key={t}>{t}</option>)}</select>
          <select value={f.expertise_level ?? ""} onChange={e => setF({...f, expertise_level: e.target.value})} className="px-3 py-2 rounded ring-1 ring-black/10 text-sm">{LEVELS.map(l => <option key={l}>{l}</option>)}</select>
        </div>
        <input placeholder="Secteur" value={f.sector} onChange={e => setF({...f, sector: e.target.value})} className="w-full px-3 py-2 rounded ring-1 ring-black/10 text-sm" />
        <input placeholder="Durée" value={f.duration ?? ""} onChange={e => setF({...f, duration: e.target.value})} className="w-full px-3 py-2 rounded ring-1 ring-black/10 text-sm" />
        <textarea placeholder="Description" value={f.description ?? ""} onChange={e => setF({...f, description: e.target.value})} rows={3} className="w-full px-3 py-2 rounded ring-1 ring-black/10 text-sm" />
        <input placeholder="Débouchés (séparés par des virgules)" value={(f.outlets ?? []).join(", ")} onChange={e => setF({...f, outlets: e.target.value.split(",").map(s => s.trim()).filter(Boolean)})} className="w-full px-3 py-2 rounded ring-1 ring-black/10 text-sm" />
        <div className="flex gap-2 pt-2">
          <button onClick={save} className="flex-1 py-2 bg-brand text-white rounded text-sm font-medium">Enregistrer</button>
          <button onClick={onClose} className="px-4 py-2 ring-1 ring-black/10 rounded text-sm">Annuler</button>
        </div>
      </div>
    </div>
  );
}
