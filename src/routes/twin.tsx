import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { twinChat, twinHistory, twinClear } from "@/lib/twin.functions";

export const Route = createFileRoute("/twin")({
  head: () => ({ meta: [{ title: "Twin — Ton IA d'orientation" }, { name: "description", content: "Ton jumeau IA d'orientation : mémoire de ton profil, conseil continu sur choix d'école, spé et carrière." }] }),
  component: TwinPage,
});

type Msg = { id?: string; role: "user"|"assistant"|"system"; content: string };

function TwinPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const chat = useServerFn(twinChat);
  const history = useServerFn(twinHistory);
  const clear = useServerFn(twinClear);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [loading, user, navigate]);
  useEffect(() => { if (user) history().then((h: any) => setMsgs(h.filter((m: Msg) => m.role !== "system"))); }, [user?.id]);
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, busy]);

  const send = async () => {
    if (!input.trim() || busy) return;
    const message = input.trim();
    setInput("");
    setMsgs(m => [...m, { role: "user", content: message }]);
    setBusy(true);
    try {
      const { reply } = await chat({ data: { message } });
      setMsgs(m => [...m, { role: "assistant", content: reply }]);
    } catch (e: any) { toast.error(e.message || "Erreur"); }
    finally { setBusy(false); }
  };

  const reset = async () => {
    if (!confirm("Effacer toute la conversation avec Twin ?")) return;
    await clear();
    setMsgs([]);
  };

  if (loading || !user) return <main className="max-w-3xl mx-auto py-12 px-6 text-center text-neutral-400">…</main>;

  return (
    <main className="max-w-3xl mx-auto py-8 px-4 md:px-6 flex flex-col" style={{ height: "calc(100vh - 4rem)" }}>
      <header className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="size-9 rounded-full bg-gradient-to-br from-brand to-emerald-500 grid place-items-center text-lg">🧬</div>
            <div>
              <h1 className="font-display text-xl font-semibold leading-none">Twin</h1>
              <p className="text-xs text-neutral-500">Ton jumeau IA d'orientation</p>
            </div>
          </div>
        </div>
        {msgs.length > 0 && <button onClick={reset} className="text-xs text-neutral-400 hover:text-red-500">Réinitialiser</button>}
      </header>

      <div className="flex-1 overflow-y-auto space-y-3 pb-4">
        {msgs.length === 0 && (
          <div className="text-center text-neutral-500 py-16 space-y-4">
            <p className="text-2xl">🧬</p>
            <p className="text-sm">Salut ! Je suis <b>Twin</b>. Je connais ton profil et je t'accompagne pendant toute ta scolarité.</p>
            <div className="grid gap-2 max-w-md mx-auto text-left">
              {["Quelle spécialité choisir en Terminale ?","Où faire mon stage de M1 en tech ?","Quelle école correspond à mon profil MBTI ?","Comment devenir data scientist ?"].map(p => (
                <button key={p} onClick={() => setInput(p)} className="text-left text-xs bg-white ring-1 ring-black/5 rounded-lg px-3 py-2 hover:ring-brand/40">{p}</button>
              ))}
            </div>
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${m.role === "user" ? "bg-brand text-white" : "bg-white ring-1 ring-black/5"}`}>{m.content}</div>
          </div>
        ))}
        {busy && <div className="text-xs text-neutral-400 italic">Twin réfléchit…</div>}
        <div ref={bottom} />
      </div>

      <form onSubmit={e => { e.preventDefault(); send(); }} className="flex gap-2 bg-white ring-1 ring-black/5 rounded-2xl p-2">
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Pose ta question à Twin…" className="flex-1 px-3 py-2 text-sm bg-transparent focus:outline-none" disabled={busy} />
        <button type="submit" disabled={busy || !input.trim()} className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium disabled:opacity-40">Envoyer</button>
      </form>
    </main>
  );
}
