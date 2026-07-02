import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { resolveAvatarUrl } from "@/lib/avatar";

export const Route = createFileRoute("/reseau")({
  head: () => ({ meta: [{ title: "Réseau — Cursus" }, { name: "description", content: "Fil réseau étudiant style LinkedIn. Publie, commente, connecte." }] }),
  component: NetworkPage,
});

type Profile = {
  id: string; full_name: string; headline: string | null; school: string | null; formation: string | null;
  city: string | null; status: string | null; skills: string[] | null; mbti: string | null;
  avatar_emoji: string | null; avatar_gradient: string | null; avatar_url: string | null;
};
type Connection = { id: string; requester_id: string; recipient_id: string; status: string };
type Post = { id: string; author_id: string; content: string; image_url: string | null; created_at: string };
type Comment = { id: string; post_id: string; author_id: string; content: string; created_at: string };
type Like = { post_id: string; user_id: string };

function NetworkPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"feed"|"annuaire"|"demandes"|"stats">("feed");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [avatars, setAvatars] = useState<Record<string, string>>({});
  const [connections, setConnections] = useState<Connection[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [likes, setLikes] = useState<Like[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [q, setQ] = useState("");
  const [school, setSchool] = useState("");

  const load = async () => {
    const [{ data: p }, { data: c }, { data: po }, { data: li }, { data: co }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(500),
      user ? supabase.from("connections").select("*") : Promise.resolve({ data: [] as Connection[] }),
      supabase.from("posts").select("*").order("created_at", { ascending: false }).limit(50),
      supabase.from("post_likes").select("*"),
      supabase.from("post_comments").select("*").order("created_at", { ascending: true }),
    ]);
    const profs = (p as Profile[]) || [];
    setProfiles(profs);
    setConnections((c as Connection[]) || []);
    setPosts((po as Post[]) || []);
    setLikes((li as Like[]) || []);
    setComments((co as Comment[]) || []);
    // Résoudre les avatars
    const map: Record<string, string> = {};
    await Promise.all(profs.map(async pr => {
      if (pr.avatar_url) { const u = await resolveAvatarUrl(pr.avatar_url); if (u) map[pr.id] = u; }
    }));
    setAvatars(map);
  };
  useEffect(() => { load(); }, [user?.id]);

  const profileById = useMemo(() => Object.fromEntries(profiles.map(p => [p.id, p])), [profiles]);
  const schools = useMemo(() => Array.from(new Set(profiles.map(p => p.school).filter(Boolean) as string[])).sort(), [profiles]);
  const pendingIncoming = connections.filter(c => c.recipient_id === user?.id && c.status === "pending");

  return (
    <main className="max-w-5xl mx-auto py-6 px-3 md:px-6 grid md:grid-cols-[1fr_2fr_1fr] gap-4">
      {/* Sidebar gauche : profil rapide */}
      <aside className="hidden md:block space-y-3">
        {user && profileById[user.id] && (
          <div className="bg-white ring-1 ring-black/5 rounded-2xl overflow-hidden">
            <div className={`h-14 bg-gradient-to-br ${profileById[user.id].avatar_gradient ?? "from-teal-300 to-emerald-500"}`} />
            <div className="px-4 pb-4 -mt-8 text-center">
              <Avatar prof={profileById[user.id]} url={avatars[user.id]} size={16} />
              <Link to="/profil" className="block mt-2 font-display font-semibold text-sm hover:text-brand">{profileById[user.id].full_name || "Toi"}</Link>
              <p className="text-xs text-neutral-500 truncate">{profileById[user.id].headline}</p>
            </div>
            <div className="border-t border-black/5 p-3 grid grid-cols-2 text-center text-xs">
              <div><p className="font-semibold text-brand">{connections.filter(c => c.status === "accepted" && (c.requester_id===user.id || c.recipient_id===user.id)).length}</p><p className="text-neutral-500">Connexions</p></div>
              <div><p className="font-semibold text-brand">{posts.filter(p => p.author_id===user.id).length}</p><p className="text-neutral-500">Posts</p></div>
            </div>
          </div>
        )}
        <div className="bg-white ring-1 ring-black/5 rounded-2xl p-4">
          <div className="flex gap-1 flex-col">
            {(["feed","annuaire","demandes","stats"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`px-3 py-2 rounded-lg text-sm text-left ${tab===t?"bg-brand-light text-brand font-medium":"text-neutral-600 hover:bg-neutral-50"}`}>
                {t==="feed"?"🏠 Fil d'actualité":t==="annuaire"?"👥 Annuaire":t==="demandes"?`🔔 Demandes (${pendingIncoming.length})`:"📊 Statistiques"}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Colonne centrale */}
      <section className="space-y-4">
        {/* Onglets mobile */}
        <div className="md:hidden flex gap-1 bg-ui-bg p-1 rounded-lg overflow-x-auto">
          {(["feed","annuaire","demandes","stats"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${tab===t?"bg-white shadow-sm text-brand":"text-neutral-500"}`}>
              {t==="feed"?"Fil":t==="annuaire"?"Annuaire":t==="demandes"?`Demandes (${pendingIncoming.length})`:"Stats"}
            </button>
          ))}
        </div>

        {tab === "feed" && (
          <>
            {user && <PostComposer onPosted={load} />}
            {!user && <div className="bg-white ring-1 ring-black/5 rounded-2xl p-4 text-sm text-center"><Link to="/auth" className="text-brand font-medium">Connecte-toi</Link> pour publier.</div>}
            {posts.length === 0 && <p className="text-center text-neutral-400 py-8">Aucune publication pour l'instant. Sois le premier !</p>}
            {posts.map(p => (
              <PostCard key={p.id} post={p} author={profileById[p.author_id]} avatarUrl={avatars[p.author_id]}
                likes={likes.filter(l => l.post_id===p.id)} comments={comments.filter(c => c.post_id===p.id)}
                profileById={profileById} avatars={avatars} onChange={load} userId={user?.id ?? null} />
            ))}
          </>
        )}

        {tab === "annuaire" && (
          <>
            <div className="bg-white ring-1 ring-black/5 rounded-2xl p-3 grid gap-2 md:grid-cols-2">
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="🔍 Nom, formation, bio…" className="px-3 py-2 rounded-lg bg-ui-bg text-sm" />
              <select value={school} onChange={e => setSchool(e.target.value)} className="px-3 py-2 rounded-lg bg-ui-bg text-sm">
                <option value="">Toutes écoles</option>{schools.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            {profiles.filter(p => p.id !== user?.id && (!q || p.full_name?.toLowerCase().includes(q.toLowerCase()) || (p.headline??"").toLowerCase().includes(q.toLowerCase())) && (!school || p.school===school)).map(p => (
              <DirectoryCard key={p.id} p={p} url={avatars[p.id]} connections={connections} userId={user?.id ?? null} onChange={load} />
            ))}
          </>
        )}

        {tab === "demandes" && (
          <div className="space-y-2">
            {pendingIncoming.length === 0 && <p className="text-neutral-400 text-center py-12">Aucune demande.</p>}
            {pendingIncoming.map(c => {
              const p = profileById[c.requester_id]; if (!p) return null;
              return (
                <div key={c.id} className="bg-white ring-1 ring-black/5 rounded-xl p-4 flex items-center gap-3">
                  <Avatar prof={p} url={avatars[p.id]} size={11} />
                  <div className="flex-1"><p className="text-sm font-medium">{p.full_name}</p><p className="text-xs text-neutral-500">{p.headline}</p></div>
                  <button onClick={async () => { await supabase.from("connections").update({status:"accepted"}).eq("id",c.id); load(); }} className="px-3 py-1.5 bg-brand text-white text-xs rounded-full font-medium">Accepter</button>
                  <button onClick={async () => { await supabase.from("connections").update({status:"declined"}).eq("id",c.id); load(); }} className="px-3 py-1.5 ring-1 ring-black/10 text-xs rounded-full">Ignorer</button>
                </div>
              );
            })}
          </div>
        )}

        {tab === "stats" && <StatsPanel profiles={profiles} />}
      </section>

      {/* Sidebar droite : suggestions */}
      <aside className="hidden md:block space-y-3">
        <div className="bg-white ring-1 ring-black/5 rounded-2xl p-4 space-y-3">
          <h3 className="font-display font-semibold text-sm">Suggestions</h3>
          {profiles.filter(p => p.id !== user?.id).slice(0, 5).map(p => (
            <div key={p.id} className="flex items-center gap-2">
              <Avatar prof={p} url={avatars[p.id]} size={9} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{p.full_name}</p>
                <p className="text-[10px] text-neutral-500 truncate">{p.headline || p.school}</p>
              </div>
            </div>
          ))}
        </div>
        <Link to="/twin" className="block bg-gradient-to-br from-brand to-emerald-500 text-white rounded-2xl p-4 hover:brightness-105">
          <p className="text-sm font-semibold">🧬 Parle à Twin</p>
          <p className="text-xs opacity-90 mt-1">Ton IA d'orientation personnelle</p>
        </Link>
      </aside>
    </main>
  );
}

function Avatar({ prof, url, size=10 }: { prof: Profile | undefined; url?: string; size?: number }) {
  const cls = `size-${size} rounded-full shrink-0 grid place-items-center object-cover`;
  if (!prof) return <div className={`${cls} bg-neutral-200`} />;
  if (url) return <img src={url} alt={prof.full_name} className={`${cls} bg-neutral-100`} />;
  return <div className={`${cls} bg-gradient-to-br ${prof.avatar_gradient ?? "from-teal-300 to-emerald-500"} text-white`} style={{fontSize: `${size*2.5}px`}}>{prof.avatar_emoji ?? "🎓"}</div>;
}

function PostComposer({ onPosted }: { onPosted: () => void }) {
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!content.trim()) return;
    setBusy(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("posts").insert({ author_id: user!.id, content: content.trim() });
    if (error) toast.error(error.message); else { setContent(""); onPosted(); toast.success("Publié"); }
    setBusy(false);
  };
  return (
    <div className="bg-white ring-1 ring-black/5 rounded-2xl p-4 space-y-2">
      <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Partage une actu, une réussite, une question…" rows={2} className="w-full px-3 py-2 rounded-lg bg-ui-bg text-sm focus:outline-none" />
      <div className="flex justify-end">
        <button onClick={submit} disabled={busy || !content.trim()} className="px-4 py-1.5 bg-brand text-white rounded-full text-sm font-medium disabled:opacity-40">Publier</button>
      </div>
    </div>
  );
}

function PostCard({ post, author, avatarUrl, likes, comments, profileById, avatars, onChange, userId }: {
  post: Post; author?: Profile; avatarUrl?: string; likes: Like[]; comments: Comment[];
  profileById: Record<string, Profile>; avatars: Record<string, string>; onChange: () => void; userId: string | null;
}) {
  const liked = likes.some(l => l.user_id === userId);
  const [showComments, setShowComments] = useState(false);
  const [comment, setComment] = useState("");
  const toggleLike = async () => {
    if (!userId) return;
    if (liked) await supabase.from("post_likes").delete().eq("post_id",post.id).eq("user_id",userId);
    else await supabase.from("post_likes").insert({ post_id: post.id, user_id: userId });
    onChange();
  };
  const sendComment = async () => {
    if (!comment.trim() || !userId) return;
    await supabase.from("post_comments").insert({ post_id: post.id, author_id: userId, content: comment.trim() });
    setComment(""); onChange();
  };
  const del = async () => {
    if (!confirm("Supprimer cette publication ?")) return;
    await supabase.from("posts").delete().eq("id", post.id); onChange();
  };
  return (
    <article className="bg-white ring-1 ring-black/5 rounded-2xl p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Avatar prof={author} url={avatarUrl} size={11} />
        <div className="flex-1">
          <p className="text-sm font-semibold">{author?.full_name ?? "Utilisateur"}</p>
          <p className="text-xs text-neutral-500">{author?.headline}</p>
          <p className="text-[10px] text-neutral-400 mt-0.5">{new Date(post.created_at).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" })}</p>
        </div>
        {userId === post.author_id && <button onClick={del} className="text-neutral-400 hover:text-red-500 text-xs">Suppr.</button>}
      </div>
      <p className="text-sm whitespace-pre-wrap">{post.content}</p>
      <div className="flex items-center justify-between text-xs text-neutral-500 border-t border-black/5 pt-2">
        <span>{likes.length} like{likes.length>1?"s":""} · {comments.length} commentaire{comments.length>1?"s":""}</span>
      </div>
      <div className="flex gap-2 border-t border-black/5 pt-2">
        <button onClick={toggleLike} disabled={!userId} className={`flex-1 py-1.5 rounded-lg text-xs font-medium ${liked?"bg-brand-light text-brand":"hover:bg-neutral-50"}`}>{liked?"❤️ Aimé":"🤍 J'aime"}</button>
        <button onClick={() => setShowComments(s => !s)} className="flex-1 py-1.5 rounded-lg text-xs font-medium hover:bg-neutral-50">💬 Commenter</button>
      </div>
      {showComments && (
        <div className="space-y-2 border-t border-black/5 pt-2">
          {comments.map(c => {
            const cp = profileById[c.author_id];
            return (
              <div key={c.id} className="flex gap-2 items-start">
                <Avatar prof={cp} url={avatars[c.author_id]} size={7} />
                <div className="flex-1 bg-ui-bg rounded-xl px-3 py-2">
                  <p className="text-xs font-semibold">{cp?.full_name ?? "Utilisateur"}</p>
                  <p className="text-xs">{c.content}</p>
                </div>
              </div>
            );
          })}
          {userId && (
            <div className="flex gap-2">
              <input value={comment} onChange={e => setComment(e.target.value)} onKeyDown={e => e.key==="Enter" && sendComment()} placeholder="Écris un commentaire…" className="flex-1 px-3 py-1.5 rounded-full bg-ui-bg text-xs" />
              <button onClick={sendComment} className="px-3 py-1.5 bg-brand text-white rounded-full text-xs">Envoyer</button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function DirectoryCard({ p, url, connections, userId, onChange }: {
  p: Profile; url?: string; connections: Connection[]; userId: string | null; onChange: () => void;
}) {
  const c = connections.find(c => (c.requester_id===userId && c.recipient_id===p.id) || (c.recipient_id===userId && c.requester_id===p.id));
  const connect = async () => {
    if (!userId) return;
    const { error } = await supabase.from("connections").insert({ requester_id: userId, recipient_id: p.id, status: "pending" });
    if (error) toast.error(error.message); else { toast.success("Demande envoyée"); onChange(); }
  };
  return (
    <div className="bg-white ring-1 ring-black/5 rounded-2xl p-4 flex gap-3 items-center">
      <Avatar prof={p} url={url} size={14} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{p.full_name}</p>
        <p className="text-xs text-neutral-500 truncate">{p.headline || p.formation}</p>
        <p className="text-[10px] text-neutral-400 truncate">{p.school} · {p.city}</p>
        {p.skills && p.skills.length>0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {p.skills.slice(0,3).map(s => <span key={s} className="text-[10px] bg-neutral-100 px-2 py-0.5 rounded">{s}</span>)}
          </div>
        )}
      </div>
      {!userId ? <Link to="/auth" className="text-xs text-brand">Se connecter</Link>
      : !c ? <button onClick={connect} className="px-3 py-1.5 bg-brand text-white text-xs rounded-full font-medium">+ Connecter</button>
      : c.status==="accepted" ? <Link to="/messages" className="px-3 py-1.5 ring-1 ring-brand text-brand text-xs rounded-full">💬</Link>
      : <span className="text-xs text-neutral-400">En attente</span>}
    </div>
  );
}

function StatsPanel({ profiles }: { profiles: Profile[] }) {
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
    <div className="grid md:grid-cols-2 gap-3">
      <StatBlock title="Par école" data={stats.bySchool} />
      <StatBlock title="Par formation" data={stats.byFormation} />
      <StatBlock title="Par ville" data={stats.byCity} />
      <StatBlock title="Par type MBTI" data={stats.byMbti} />
    </div>
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
