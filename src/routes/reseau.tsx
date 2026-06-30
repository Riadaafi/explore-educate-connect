import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/reseau")({
  head: () => ({
    meta: [
      { title: "Réseau — Cursus" },
      { name: "description", content: "Connecte-toi avec des étudiants de ton campus. Swipe, pass ou connect." },
    ],
  }),
  component: ReseauPage,
});

type Profile = {
  id: string;
  name: string;
  age: number;
  program: string;
  school: string;
  bio: string;
  gradient: string;
  emoji: string;
};

const PROFILES: Profile[] = [
  { id: "1", name: "Léa Martin", age: 22, program: "Master Design Stratégique", school: "Lyon 2", bio: "Cherche binôme pour projet startup.", gradient: "from-rose-300 to-orange-400", emoji: "🎨" },
  { id: "2", name: "Karim Benali", age: 23, program: "Master IA Appliquée", school: "Sorbonne", bio: "Passionné de NLP et open source.", gradient: "from-indigo-300 to-blue-500", emoji: "🤖" },
  { id: "3", name: "Sarah Calvet", age: 21, program: "L3 Droit des Affaires", school: "Assas", bio: "Future avocate, fan de débats.", gradient: "from-amber-300 to-yellow-500", emoji: "⚖️" },
  { id: "4", name: "Thomas Dubois", age: 24, program: "MSc Finance", school: "HEC", bio: "Crypto, marchés & escalade.", gradient: "from-emerald-300 to-teal-500", emoji: "📈" },
  { id: "5", name: "Inès Rahman", age: 20, program: "L2 Biologie", school: "Paris Saclay", bio: "Recherche & musique électronique.", gradient: "from-fuchsia-300 to-purple-500", emoji: "🧬" },
  { id: "6", name: "Hugo Lefèvre", age: 25, program: "Master Architecture", school: "ENSA Paris", bio: "Maquettes, urbanisme et café.", gradient: "from-stone-300 to-stone-500", emoji: "🏛️" },
];

function ReseauPage() {
  const [index, setIndex] = useState(0);
  const [connections, setConnections] = useState(1402);
  const [myConnections, setMyConnections] = useState(0);
  const [exitDir, setExitDir] = useState<"left" | "right" | null>(null);
  const [history, setHistory] = useState<{ profile: Profile; action: "pass" | "connect" }[]>([]);

  const current = PROFILES[index % PROFILES.length];

  const handle = (action: "pass" | "connect") => {
    setExitDir(action === "pass" ? "left" : "right");
    setTimeout(() => {
      if (action === "connect") {
        setConnections(c => c + 1);
        setMyConnections(c => c + 1);
      }
      setHistory(h => [{ profile: current, action }, ...h].slice(0, 8));
      setIndex(i => i + 1);
      setExitDir(null);
    }, 280);
  };

  return (
    <main className="max-w-6xl mx-auto py-12 px-6">
      <section className="py-12 bg-neutral-100 rounded-[32px] ring-1 ring-black/5 overflow-hidden">
        <div className="max-w-2xl mx-auto px-6 text-center space-y-10">
          <div className="space-y-2">
            <h1 className="font-display text-3xl font-semibold">Rencontrez vos pairs.</h1>
            <p className="text-sm text-neutral-600">Pass ou Connect : swipe les profils étudiants de ton campus.</p>
          </div>

          <div className="relative max-w-sm mx-auto h-[520px]">
            <div
              key={current.id + (exitDir ?? "")}
              className={`absolute inset-0 bg-ui-bg rounded-[24px] ring-1 ring-black/5 p-4 shadow-xl shadow-black/5 flex flex-col transition-all duration-300 ${
                exitDir === "left" ? "-translate-x-[120%] rotate-[-12deg] opacity-0" :
                exitDir === "right" ? "translate-x-[120%] rotate-[12deg] opacity-0" :
                "animate-fade-in"
              }`}
            >
              <div className={`flex-1 w-full rounded-[16px] bg-gradient-to-br ${current.gradient} grid place-items-center text-7xl`}>
                {current.emoji}
              </div>
              <div className="py-5 text-left">
                <h4 className="font-display font-semibold text-xl">{current.name}, {current.age}</h4>
                <p className="text-sm text-neutral-500">{current.program} • {current.school}</p>
                <p className="text-sm mt-3 text-neutral-700 italic">"{current.bio}"</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-6">
            <button
              onClick={() => handle("pass")}
              className="size-16 bg-white ring-1 ring-black/10 rounded-full flex items-center justify-center text-2xl text-neutral-500 hover:scale-110 hover:text-red-500 transition-all"
              aria-label="Passer"
            >
              ✕
            </button>
            <button
              onClick={() => handle("connect")}
              className="size-16 bg-brand text-white ring-1 ring-brand rounded-full flex items-center justify-center text-2xl shadow-lg shadow-brand/30 hover:scale-110 transition-all"
              aria-label="Connecter"
            >
              ❤
            </button>
          </div>

          <div className="flex justify-center gap-4 flex-wrap">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white ring-1 ring-black/5 rounded-full">
              <div className="size-2 bg-brand rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-neutral-600">{connections.toLocaleString("fr-FR")} connexions actives</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-full">
              <span className="text-xs font-medium">Tes nouvelles connexions : {myConnections}</span>
            </div>
          </div>
        </div>
      </section>

      {history.length > 0 && (
        <section className="mt-12 space-y-4">
          <h3 className="font-display font-semibold text-lg">Activité récente</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {history.map((h, i) => (
              <div key={i} className="bg-ui-bg ring-1 ring-black/5 rounded-xl p-3 flex items-center gap-3">
                <div className={`size-10 rounded-full bg-gradient-to-br ${h.profile.gradient} grid place-items-center text-lg`}>{h.profile.emoji}</div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{h.profile.name}</p>
                  <p className={`text-[11px] ${h.action === "connect" ? "text-brand" : "text-neutral-400"}`}>
                    {h.action === "connect" ? "❤ Connecté" : "✕ Passé"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
