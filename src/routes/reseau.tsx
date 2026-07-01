import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/reseau")({
  head: () => ({ meta: [{ title: "Réseau — Cursus" }, { name: "description", content: "Annuaire des étudiants et alumni. Connecte-toi, échange, découvre les parcours." }] }),
  component: NetworkPage,
});

type Profile = {
  id: string; full_name: string; headline: string | null; school: string | null; formation: string | null;
  city: string | null; status: string | null; skills: string[] | null; mbti: string | null;
  avatar_emoji: string | null; avatar_gradient: string | null;
};

type Connection = { id: string; requester_id: string; recipient_id: string; status: string };

function NetworkPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"annuaire"|"stats"|"demandes">("annuaire");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [q, setQ] = useState("");
  const [school, setSchool] = useState("");

  const load = async () => {
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(500),
      user ? supabase.from("connections").select("*") : Promise.resolve({ data: [] as Connection[] }),
    ]);
    setProfiles((p as Profile[]) || []);
    setConnections((c as Connection[]) || []);
  };
  useEffect(() => { load(); }, [user?.id]);

  const schools = useMemo(() => Array.from(new Set(profiles.map(p => p.school).filter(Boolean) as string[])).sort(), [profiles]);
  const filtered = useMemo(() => {
    const s = q.toLowerCase();
    return profiles.filter(p =>
      p.id !== user?.id &&
      (!s || p.full_name?.toLowerCase().includes(s) || (p.headline ?? "").toLowerCase().includes(s) || (p.formation ?? "").toLowerCase().includes(s)) &&
      (!school || p.school === school)
    );
  }, [profiles, q, school, user?.id]);

  const connect = async (recipientId: string) => {
    if (!user) { toast.error("Connecte-toi d'abord"); return; }
    const { error } = await supabase.from("connections").insert({ requester_id: user.id, recipient_id: recipientId, status: "pending" });
    if (error) toast.error(error.message); else { toast.success("Demande envoyée"); load(); }
  };
  const respond = async (id: string, status: "accepted"|"declined") => {
    const { error } = await supabase.from("connections").update({ status }).eq("id", id);
    if (error) toast.error(error.message); else load();
  };

  const connStatus = (otherId: string) => connections.find(c => (c.requester_id === user?.id && c.recipient_id === otherId) || (c.recipient_id === user?.id && c.requester_id === otherId));

  const pendingIncoming = connections.filter(c => c.recipient_id === user?.id && c.status === "pending");

  // Stats
  const stats = useMemo(() => {
    const bySchool: Record<string, number> = {};
    const byFormation: Record<string, number> = {};
    const byCity: Record<string, number> = {};
    const byMbti: Record<string, number> = {};
    profiles.forEach(p => {
      if (p.school) bySchool[p.school] = (bySchool[p.school] ?? 0) + 1;
      if (p.formation) byFormation[p.formation] = (byFormation[p.formation] ?? 0) + 1;
      if (p.city) byCity[p.city] = (byCity[p.city] ?? 0) + 1;
      if (p.mbti) byMbti[p.mbti] = (byMbti[p.mbti] ?? 0) + 1;
    });
    return { bySchool, byFormation, byCity, byMbti };
  }, [profiles]);

  return (
    <main className="max-w-6xl mx-auto py-12 px-6 space-y-8">
      <header className="space-y-3">
        <span className="text-[11px] uppercase tracking-[0.2em] text-brand font-semibold">Réseau étudiant</span>
        <h1 className="font-display text-4xl md:text-5xl font-semibold">Connecte-toi avec {profiles.length} étudiants</h1>
        <p className="text-neutral-600">Annuaire, statistiques du réseau, demandes de connexion.</p>
      </header>

      <div className="flex gap-1 bg-ui-bg p-1 rounded-lg w-fit">
        {(["annuaire","demandes","stats"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-1.5 rounded-md text-sm font-medium ${tab===t?"bg-white shadow-sm text-brand":"text-neutral-500"}`}>
            {t === "annuaire" ? "Annuaire" : t === "demandes" ? `Demandes (${pendingIncoming.length})` : "Statistiques"}
          </button>
        ))}
      </div>

      {tab === "annuaire" && (
        <>
          <div className="bg-ui-bg ring-1 ring-black/5 rounded-2xl p-4 grid gap-3 md:grid-cols-2">
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="🔍 Nom, formation, bio…" className="px-3 py-2 rounded-lg bg-white ring-1 ring-black/10 text-sm" />
            <select value={school} onChange={e => setSchool(e.target.value)} className="px-3 py-2 rounded-lg bg-white ring-1 ring-black/10 text-sm">
              <option value="">Toutes écoles</option>{schools.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          {filtered.length === 0 && <p className="text-center text-neutral-400 py-12">Personne pour l'instant. Invite des amis à s'inscrire !</p>}
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map(p => {
              const c = connStatus(p.id);
              return (
                <article key={p.id} className="bg-white ring-1 ring-black/5 rounded-2xl p-5 space-y-3">
                  <div className="flex gap-3 items-start">
                    <div className={`size-12 rounded-full bg-gradient-to-br ${p.avatar_gradient ?? "from-teal-300 to-emerald-500"} grid place-items-center text-xl`}>{p.avatar_emoji ?? "🎓"}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-base truncate">{p.full_name || "Étudiant·e"}</h3>
                      <p className="text-xs text-neutral-500 truncate">{p.headline || p.formation}</p>
                    </div>
                    {p.mbti && <span className="text-[10px] font-bold text-brand bg-brand-light px-2 py-0.5 rounded">{p.mbti}</span>}
                  </div>
                  <div className="text-xs text-neutral-500 space-y-0.5">
                    {p.school && <p>🏛️ {p.school}</p>}
                    {p.city && <p>📍 {p.city}</p>}
                  </div>
                  {p.skills && p.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {p.skills.slice(0,4).map(s => <span key={s} className="text-[10px] bg-neutral-100 px-2 py-0.5 rounded">{s}</span>)}
                    </div>
                  )}
                  <div className="pt-2 border-t border-black/5 flex gap-2">
                    {!user ? <Link to="/auth" className="text-xs text-brand">Connecte-toi pour interagir</Link>
                    : !c ? <button onClick={() => connect(p.id)} className="text-xs text-brand font-medium hover:underline">+ Se connecter</button>
                    : c.status === "accepted" ? <Link to="/messages" className="text-xs text-brand font-medium hover:underline">💬 Message</Link>
                    : c.status === "pending" ? <span className="text-xs text-neutral-400">Demande envoyée</span>
                    : <span className="text-xs text-neutral-400">-</span>}
                  </div>
                </article>
              );
            })}
          </div>
        </>
      )}

      {tab === "demandes" && (
        <div className="space-y-3">
          {pendingIncoming.length === 0 && <p className="text-neutral-400 text-center py-12">Aucune demande en attente.</p>}
          {pendingIncoming.map(c => {
            const p = profiles.find(x => x.id === c.requester_id);
            if (!p) return null;
            return (
              <div key={c.id} className="bg-white ring-1 ring-black/5 rounded-xl p-4 flex items-center gap-3">
                <div className={`size-11 rounded-full bg-gradient-to-br ${p.avatar_gradient} grid place-items-center text-xl`}>{p.avatar_emoji}</div>
                <div className="flex-1"><p className="text-sm font-medium">{p.full_name}</p><p className="text-xs text-neutral-500">{p.headline}</p></div>
                <button onClick={() => respond(c.id, "accepted")} className="px-3 py-1.5 bg-brand text-white text-xs rounded font-medium">Accepter</button>
                <button onClick={() => respond(c.id, "declined")} className="px-3 py-1.5 ring-1 ring-black/10 text-xs rounded">Refuser</button>
              </div>
            );
          })}
        </div>
      )}

      {tab === "stats" && (
        <div className="grid md:grid-cols-2 gap-4">
          <StatBlock title="Par école" data={stats.bySchool} />
          <StatBlock title="Par formation" data={stats.byFormation} />
          <StatBlock title="Par ville" data={stats.byCity} />
          <StatBlock title="Par type MBTI" data={stats.byMbti} />
        </div>
      )}
    </main>
  );
}

function StatBlock({ title, data }: { title: string; data: Record<string, number> }) {
  const entries = Object.entries(data).sort((a,b) => b[1]-a[1]).slice(0, 10);
  const max = Math.max(1, ...entries.map(e => e[1]));
  return (
    <div className="bg-white ring-1 ring-black/5 rounded-2xl p-5">
      <h3 className="font-display font-semibold mb-4">{title}</h3>
      {entries.length === 0 ? <p className="text-xs text-neutral-400">Aucune donnée</p> : (
        <div className="space-y-2">
          {entries.map(([k, v]) => (
            <div key={k}>
              <div className="flex justify-between text-xs mb-0.5"><span className="truncate pr-2">{k}</span><span className="text-neutral-500">{v}</span></div>
              <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden"><div className="h-full bg-brand" style={{ width: `${(v/max)*100}%` }} /></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
