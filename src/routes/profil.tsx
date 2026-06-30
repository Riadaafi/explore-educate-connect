import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/profil")({
  head: () => ({
    meta: [
      { title: "Profil — Cursus" },
      { name: "description", content: "Stats, connexions et paramètres de ton compte Cursus." },
    ],
  }),
  component: ProfilPage,
});

const CONNECTIONS = [
  { name: "Léa Martin", program: "Master Design • Lyon 2", gradient: "from-rose-300 to-orange-400", emoji: "🎨" },
  { name: "Karim Benali", program: "Master IA • Sorbonne", gradient: "from-indigo-300 to-blue-500", emoji: "🤖" },
  { name: "Sarah Calvet", program: "L3 Droit • Assas", gradient: "from-amber-300 to-yellow-500", emoji: "⚖️" },
  { name: "Thomas Dubois", program: "MSc Finance • HEC", gradient: "from-emerald-300 to-teal-500", emoji: "📈" },
  { name: "Inès Rahman", program: "L2 Bio • Saclay", gradient: "from-fuchsia-300 to-purple-500", emoji: "🧬" },
  { name: "Hugo Lefèvre", program: "Master Archi • ENSA", gradient: "from-stone-300 to-stone-500", emoji: "🏛️" },
];

function ProfilPage() {
  const [notifications, setNotifications] = useState(true);
  const [emailNotif, setEmailNotif] = useState(false);
  const [lang, setLang] = useState("fr");

  return (
    <main className="max-w-6xl mx-auto py-12 px-6">
      <section className="bg-ui-bg ring-1 ring-black/5 rounded-[32px] p-8 md:p-12">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Left: avatar + settings */}
          <aside className="w-full md:w-72 space-y-6 shrink-0">
            <div className="space-y-4">
              <div className="size-24 rounded-full bg-gradient-to-br from-brand to-emerald-400 grid place-items-center text-4xl text-white ring-1 ring-black/5">
                TD
              </div>
              <div>
                <h1 className="font-display font-semibold text-2xl">Thomas Dubois</h1>
                <p className="text-sm text-neutral-500">Étudiant en Design • 3ème année</p>
              </div>
            </div>

            <div className="pt-6 border-t border-black/5 space-y-5">
              <h3 className="text-[11px] uppercase tracking-wider text-neutral-500 font-semibold">Paramètres</h3>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Notifications push</span>
                <button
                  onClick={() => setNotifications(!notifications)}
                  className={`w-11 h-6 rounded-full relative transition-colors ${notifications ? "bg-brand" : "bg-neutral-300"}`}
                  aria-label="Notifications"
                >
                  <span className={`absolute top-1 size-4 bg-white rounded-full transition-all ${notifications ? "right-1" : "left-1"}`} />
                </button>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Notifications email</span>
                <button
                  onClick={() => setEmailNotif(!emailNotif)}
                  className={`w-11 h-6 rounded-full relative transition-colors ${emailNotif ? "bg-brand" : "bg-neutral-300"}`}
                  aria-label="Notifications email"
                >
                  <span className={`absolute top-1 size-4 bg-white rounded-full transition-all ${emailNotif ? "right-1" : "left-1"}`} />
                </button>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Langue</span>
                <select
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  className="text-xs bg-white ring-1 ring-black/10 rounded-md px-2 py-1.5 focus:outline-none focus:ring-brand"
                >
                  <option value="fr">Français (FR)</option>
                  <option value="en">English (EN)</option>
                  <option value="es">Español (ES)</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Right: stats + connections */}
          <div className="flex-1 space-y-10">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Connexions", value: 42 },
                { label: "Cours suivis", value: 12 },
                { label: "Certifications", value: 4 },
              ].map(s => (
                <div key={s.label} className="p-6 bg-white ring-1 ring-black/5 rounded-2xl space-y-1">
                  <span className="text-3xl font-display font-semibold text-brand">{s.value}</span>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-display font-semibold text-lg">Mes connexions</h4>
                <span className="text-xs text-neutral-500">{CONNECTIONS.length} récentes</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CONNECTIONS.map(c => (
                  <div key={c.name} className="p-3 bg-white ring-1 ring-black/5 rounded-xl flex items-center gap-3">
                    <div className={`size-11 rounded-full bg-gradient-to-br ${c.gradient} grid place-items-center text-xl`}>{c.emoji}</div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{c.name}</p>
                      <p className="text-xs text-neutral-500 truncate">{c.program}</p>
                    </div>
                    <button className="text-xs text-brand font-medium hover:underline shrink-0">Message</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
