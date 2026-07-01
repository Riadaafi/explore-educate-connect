import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/messages")({
  head: () => ({ meta: [{ title: "Messages — Cursus" }] }),
  component: MessagesPage,
});

type Msg = { id: string; sender_id: string; recipient_id: string; content: string; read: boolean; created_at: string };
type Profile = { id: string; full_name: string; avatar_emoji: string | null; avatar_gradient: string | null; headline: string | null };

function MessagesPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [loading, user, navigate]);

  const load = async () => {
    if (!user) return;
    const { data: m } = await supabase.from("messages").select("*").or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`).order("created_at");
    setMsgs((m as Msg[]) || []);
    const ids = Array.from(new Set(((m as Msg[])||[]).flatMap(x => [x.sender_id, x.recipient_id]).filter(id => id !== user.id)));
    if (ids.length) {
      const { data: p } = await supabase.from("profiles").select("id, full_name, avatar_emoji, avatar_gradient, headline").in("id", ids);
      const map: Record<string, Profile> = {};
      (p as Profile[] || []).forEach(pr => { map[pr.id] = pr; });
      setProfiles(map);
    }
  };
  useEffect(() => { load(); }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    const ch = supabase.channel("messages-rt")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const m = payload.new as Msg;
        if (m.sender_id === user.id || m.recipient_id === user.id) load();
      }).subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user?.id]);

  const conversations = useMemo(() => {
    if (!user) return [];
    const map = new Map<string, Msg[]>();
    msgs.forEach(m => {
      const other = m.sender_id === user.id ? m.recipient_id : m.sender_id;
      if (!map.has(other)) map.set(other, []);
      map.get(other)!.push(m);
    });
    return Array.from(map.entries()).sort((a,b) => new Date(b[1][b[1].length-1].created_at).getTime() - new Date(a[1][a[1].length-1].created_at).getTime());
  }, [msgs, user?.id]);

  const active = activeId ? msgs.filter(m => m.sender_id === activeId || m.recipient_id === activeId) : [];

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [active.length]);

  const send = async () => {
    if (!user || !activeId || !text.trim()) return;
    const { error } = await supabase.from("messages").insert({ sender_id: user.id, recipient_id: activeId, content: text.trim() });
    if (error) toast.error(error.message); else setText("");
  };

  const startNew = async () => {
    const name = prompt("Nom exact de la personne à contacter :");
    if (!name || !user) return;
    const { data } = await supabase.from("profiles").select("id").ilike("full_name", `%${name}%`).neq("id", user.id).limit(1);
    if (data && data.length) setActiveId(data[0].id);
    else toast.error("Introuvable");
  };

  if (loading || !user) return null;

  return (
    <main className="max-w-6xl mx-auto py-8 px-6">
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4 h-[70vh] bg-white ring-1 ring-black/5 rounded-2xl overflow-hidden">
        <aside className="border-r border-black/5 flex flex-col">
          <div className="p-4 border-b border-black/5 flex justify-between items-center">
            <h2 className="font-display font-semibold">Messages</h2>
            <button onClick={startNew} className="text-xs text-brand font-medium">+ Nouveau</button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 && <p className="p-4 text-xs text-neutral-400">Aucune conversation. <Link to="/reseau" className="text-brand">Trouve des étudiants</Link></p>}
            {conversations.map(([otherId, list]) => {
              const p = profiles[otherId];
              const last = list[list.length-1];
              const unread = list.filter(m => m.recipient_id === user.id && !m.read).length;
              return (
                <button key={otherId} onClick={() => setActiveId(otherId)}
                  className={`w-full text-left p-3 flex gap-3 items-start hover:bg-neutral-50 ${activeId===otherId?"bg-brand-light":""}`}>
                  <div className={`size-10 rounded-full bg-gradient-to-br ${p?.avatar_gradient ?? "from-teal-300 to-emerald-500"} grid place-items-center`}>{p?.avatar_emoji ?? "🎓"}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{p?.full_name ?? "…"}</p>
                    <p className="text-xs text-neutral-500 truncate">{last.content}</p>
                  </div>
                  {unread > 0 && <span className="text-[10px] bg-brand text-white rounded-full px-1.5">{unread}</span>}
                </button>
              );
            })}
          </div>
        </aside>

        <section className="flex flex-col">
          {!activeId ? <p className="m-auto text-neutral-400 text-sm">Sélectionne une conversation</p> : (
            <>
              <div className="p-4 border-b border-black/5 flex items-center gap-3">
                <div className={`size-9 rounded-full bg-gradient-to-br ${profiles[activeId]?.avatar_gradient} grid place-items-center`}>{profiles[activeId]?.avatar_emoji}</div>
                <div><p className="font-medium text-sm">{profiles[activeId]?.full_name}</p><p className="text-xs text-neutral-500">{profiles[activeId]?.headline}</p></div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {active.map(m => (
                  <div key={m.id} className={`flex ${m.sender_id === user.id ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${m.sender_id === user.id ? "bg-brand text-white" : "bg-neutral-100"}`}>{m.content}</div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <form onSubmit={e => { e.preventDefault(); send(); }} className="p-3 border-t border-black/5 flex gap-2">
                <input value={text} onChange={e => setText(e.target.value)} placeholder="Message…" className="flex-1 px-3 py-2 rounded-lg ring-1 ring-black/10 text-sm focus:outline-none focus:ring-brand" />
                <button className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium">Envoyer</button>
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
