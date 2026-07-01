import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/profil")({
  head: () => ({ meta: [{ title: "Profil — Cursus" }] }),
  component: ProfilPage,
});

type Profile = {
  id: string; full_name: string; headline: string; bio: string; school: string; formation: string;
  city: string; status: string; skills: string[]; mbti: string; avatar_emoji: string; avatar_gradient: string;
};

const GRADIENTS = ["from-teal-300 to-emerald-500","from-rose-300 to-orange-400","from-indigo-300 to-blue-500","from-amber-300 to-yellow-500","from-fuchsia-300 to-purple-500","from-stone-300 to-stone-500"];
const EMOJIS = ["🎓","🎨","🤖","⚖️","📈","🧬","🏛️","💻","🎬","🎵","⚗️","📚"];

function ProfilPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [p, setP] = useState<Profile | null>(null);
  const [stats, setStats] = useState({ connections: 0, mbti: false, formations: 0 });
  const [editing, setEditing] = useState(false);

  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [loading, user, navigate]);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    if (data) setP(data as Profile);
    const [{ count: conn }, { count: mbti }, { count: f }] = await Promise.all([
      supabase.from("connections").select("*", { count: "exact", head: true }).or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`).eq("status", "accepted"),
      supabase.from("mbti_results").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("formations").select("*", { count: "exact", head: true }).eq("created_by", user.id),
    ]);
    setStats({ connections: conn ?? 0, mbti: (mbti ?? 0) > 0, formations: f ?? 0 });
  };
  useEffect(() => { load(); }, [user?.id]);

  const save = async () => {
    if (!p || !user) return;
    const { error } = await supabase.from("profiles").update({
      full_name: p.full_name, headline: p.headline, bio: p.bio, school: p.school, formation: p.formation,
      city: p.city, status: p.status, skills: p.skills, avatar_emoji: p.avatar_emoji, avatar_gradient: p.avatar_gradient,
    }).eq("id", user.id);
    if (error) toast.error(error.message); else { toast.success("Profil enregistré"); setEditing(false); }
  };

  if (loading || !user || !p) return <main className="max-w-4xl mx-auto py-12 px-6 text-center text-neutral-400">Chargement…</main>;

  return (
    <main className="max-w-4xl mx-auto py-12 px-6 space-y-8">
      <section className="bg-white ring-1 ring-black/5 rounded-3xl p-8">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className={`size-24 rounded-full bg-gradient-to-br ${p.avatar_gradient} grid place-items-center text-4xl shrink-0`}>{p.avatar_emoji}</div>
          <div className="flex-1 space-y-2">
            {editing ? (
              <>
                <input value={p.full_name} onChange={e => setP({...p, full_name: e.target.value})} placeholder="Nom complet" className="w-full px-3 py-2 rounded ring-1 ring-black/10 text-lg font-semibold" />
                <input value={p.headline} onChange={e => setP({...p, headline: e.target.value})} placeholder="Titre (ex: Étudiant en L3 Design)" className="w-full px-3 py-2 rounded ring-1 ring-black/10 text-sm" />
              </>
            ) : (
              <>
                <h1 className="font-display text-3xl font-semibold">{p.full_name || "Sans nom"}</h1>
                <p className="text-neutral-500">{p.headline || "Aucun titre"}</p>
                {p.mbti && <span className="inline-block text-xs font-bold text-brand bg-brand-light px-2 py-0.5 rounded">{p.mbti}</span>}
              </>
            )}
          </div>
          <button onClick={() => editing ? save() : setEditing(true)} className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium">
            {editing ? "Enregistrer" : "Modifier"}
          </button>
        </div>

        {editing && (
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <input value={p.school} onChange={e => setP({...p, school: e.target.value})} placeholder="École" className="px-3 py-2 rounded ring-1 ring-black/10 text-sm" />
            <input value={p.formation} onChange={e => setP({...p, formation: e.target.value})} placeholder="Formation" className="px-3 py-2 rounded ring-1 ring-black/10 text-sm" />
            <input value={p.city} onChange={e => setP({...p, city: e.target.value})} placeholder="Ville" className="px-3 py-2 rounded ring-1 ring-black/10 text-sm" />
            <select value={p.status} onChange={e => setP({...p, status: e.target.value})} className="px-3 py-2 rounded ring-1 ring-black/10 text-sm">
              <option value="student">Étudiant</option>
              <option value="alumni">Alumni</option>
              <option value="working">En poste</option>
            </select>
            <textarea value={p.bio} onChange={e => setP({...p, bio: e.target.value})} placeholder="Bio" rows={3} className="md:col-span-2 px-3 py-2 rounded ring-1 ring-black/10 text-sm" />
            <input value={p.skills.join(", ")} onChange={e => setP({...p, skills: e.target.value.split(",").map(s => s.trim()).filter(Boolean)})} placeholder="Compétences (séparées par virgules)" className="md:col-span-2 px-3 py-2 rounded ring-1 ring-black/10 text-sm" />
            <div className="md:col-span-2 flex gap-2 items-center flex-wrap">
              <span className="text-xs text-neutral-500">Avatar :</span>
              {EMOJIS.map(e => <button key={e} onClick={() => setP({...p, avatar_emoji: e})} className={`size-8 rounded ${p.avatar_emoji===e?"ring-2 ring-brand":""}`}>{e}</button>)}
            </div>
            <div className="md:col-span-2 flex gap-2 items-center flex-wrap">
              <span className="text-xs text-neutral-500">Couleur :</span>
              {GRADIENTS.map(g => <button key={g} onClick={() => setP({...p, avatar_gradient: g})} className={`size-8 rounded-full bg-gradient-to-br ${g} ${p.avatar_gradient===g?"ring-2 ring-brand ring-offset-2":""}`} />)}
            </div>
          </div>
        )}

        {!editing && (
          <div className="mt-6 space-y-3">
            {p.bio && <p className="text-sm text-neutral-700">{p.bio}</p>}
            <div className="flex flex-wrap gap-2 text-xs text-neutral-500">
              {p.school && <span>🏛️ {p.school}</span>}
              {p.formation && <span>📖 {p.formation}</span>}
              {p.city && <span>📍 {p.city}</span>}
              <span className="capitalize">· {p.status}</span>
            </div>
            {p.skills.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {p.skills.map(s => <span key={s} className="text-xs bg-neutral-100 px-2 py-0.5 rounded">{s}</span>)}
              </div>
            )}
          </div>
        )}
      </section>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Connexions" value={stats.connections} />
        <StatCard label="Formations créées" value={stats.formations} />
        <StatCard label="Test MBTI" value={stats.mbti ? "✓" : "—"} />
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        <Link to="/mbti" className="bg-brand-light ring-1 ring-brand/20 p-5 rounded-2xl hover:brightness-105">
          <h3 className="font-display font-semibold">Test MBTI</h3>
          <p className="text-xs text-neutral-600 mt-1">Découvre ton type de personnalité</p>
        </Link>
        <Link to="/reseau" className="bg-white ring-1 ring-black/5 p-5 rounded-2xl hover:ring-brand/30">
          <h3 className="font-display font-semibold">Réseau</h3>
          <p className="text-xs text-neutral-600 mt-1">Explore les étudiants et alumni</p>
        </Link>
        <Link to="/messages" className="bg-white ring-1 ring-black/5 p-5 rounded-2xl hover:ring-brand/30">
          <h3 className="font-display font-semibold">Messages</h3>
          <p className="text-xs text-neutral-600 mt-1">Ta boîte de réception</p>
        </Link>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white ring-1 ring-black/5 rounded-2xl p-5">
      <p className="text-3xl font-display font-semibold text-brand">{value}</p>
      <p className="text-[11px] uppercase tracking-wider text-neutral-500 mt-1">{label}</p>
    </div>
  );
}
