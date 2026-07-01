import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/mbti")({
  head: () => ({ meta: [{ title: "Test MBTI — Cursus" }, { name: "description", content: "Découvre ton type de personnalité MBTI parmi les 16 profils." }] }),
  component: MBTIPage,
});

type Axis = "EI" | "SN" | "TF" | "JP";
type Question = { q: string; axis: Axis; a: string; b: string; // a maps to 1st letter, b to 2nd
};

const Q: Question[] = [
  // E/I (8)
  { axis: "EI", q: "En soirée, tu préfères…", a: "Rencontrer plein de nouvelles personnes", b: "Discuter en profondeur avec quelques amis" },
  { axis: "EI", q: "Après une longue journée, tu recharges…", a: "En sortant avec des amis", b: "Seul·e chez toi" },
  { axis: "EI", q: "En cours tu es plutôt…", a: "Actif·ve, tu prends la parole", b: "Discret·ète, tu écoutes" },
  { axis: "EI", q: "Ton téléphone…", a: "Sonne souvent, tu adores appeler", b: "Tu préfères largement écrire" },
  { axis: "EI", q: "Le travail en groupe…", a: "Te booste", b: "T'épuise" },
  { axis: "EI", q: "Face à un problème tu…", a: "En parles pour clarifier", b: "Réfléchis seul·e d'abord" },
  { axis: "EI", q: "Le weekend idéal ?", a: "Sortir non-stop", b: "Rester au calme" },
  { axis: "EI", q: "Nouveau groupe = tu…", a: "Vas parler aux gens", b: "Attends qu'on te parle" },
  // S/N (8)
  { axis: "SN", q: "Tu retiens mieux…", a: "Les faits et détails concrets", b: "Les idées et concepts abstraits" },
  { axis: "SN", q: "Tu préfères…", a: "Ce qui est pratique et éprouvé", b: "Ce qui est nouveau et théorique" },
  { axis: "SN", q: "Un bon prof…", a: "Donne des exemples concrets", b: "Explique les grandes théories" },
  { axis: "SN", q: "Tu es fasciné·e par…", a: "Le présent et le tangible", b: "Le futur et les possibles" },
  { axis: "SN", q: "En vacances…", a: "Tu suis un plan précis", b: "Tu improvises selon l'inspiration" },
  { axis: "SN", q: "Tu fais confiance à…", a: "Ton expérience", b: "Ton intuition" },
  { axis: "SN", q: "Une consigne doit être…", a: "Détaillée et étape par étape", b: "Globale, tu improvises" },
  { axis: "SN", q: "Tu aimes lire…", a: "Des faits, biographies, docus", b: "De la fiction, philo, sci-fi" },
  // T/F (8)
  { axis: "TF", q: "Une décision importante repose sur…", a: "La logique et les faits", b: "Les valeurs et les émotions" },
  { axis: "TF", q: "Un ami vient se plaindre…", a: "Tu proposes des solutions", b: "Tu l'écoutes et compatis" },
  { axis: "TF", q: "Tu es plus fier·e d'être…", a: "Objectif·ve", b: "Empathique" },
  { axis: "TF", q: "Une critique doit être…", a: "Directe et honnête", b: "Douce et bienveillante" },
  { axis: "TF", q: "Face à un conflit…", a: "Tu analyses qui a raison", b: "Tu cherches l'harmonie" },
  { axis: "TF", q: "Tu juges les gens sur…", a: "Leurs compétences", b: "Leurs intentions" },
  { axis: "TF", q: "Un mensonge pieux…", a: "Reste un mensonge", b: "C'est parfois nécessaire" },
  { axis: "TF", q: "En équipe tu privilégies…", a: "L'efficacité", b: "La cohésion" },
  // J/P (8)
  { axis: "JP", q: "Ton bureau/chambre est…", a: "Rangé et organisé", b: "Créatif, un peu bordélique" },
  { axis: "JP", q: "Un projet, tu…", a: "Fais un planning strict", b: "Improvises au fil de l'eau" },
  { axis: "JP", q: "Les deadlines…", a: "Tu finis en avance", b: "Tu finis à la dernière minute" },
  { axis: "JP", q: "Tu préfères…", a: "Les décisions actées", b: "Garder toutes tes options" },
  { axis: "JP", q: "Un weekend improvisé…", a: "Te stresse", b: "T'excite" },
  { axis: "JP", q: "Les listes de choses à faire…", a: "Sont ta vie", b: "T'oppressent" },
  { axis: "JP", q: "Tu préfères…", a: "Un plan clair", b: "La spontanéité" },
  { axis: "JP", q: "Tu fais tes valises…", a: "Plusieurs jours à l'avance", b: "1h avant le départ" },
];

const TYPES: Record<string, { name: string; desc: string; forte: string; formations: string[] }> = {
  INTJ: { name: "L'Architecte", desc: "Stratège visionnaire, indépendant et déterminé.", forte: "Analyse systémique, planification long terme.", formations: ["Master Maths/Physique", "École d'ingé", "Master Data Science", "MBA stratégie"] },
  INTP: { name: "Le Logicien", desc: "Penseur inventif, curieux insatiable.", forte: "Théorie, recherche, résolution abstraite.", formations: ["Licence Maths", "Master Philosophie", "Master IA", "École informatique 42/Epitech"] },
  ENTJ: { name: "Le Commandant", desc: "Leader né, audacieux et efficace.", forte: "Direction, prise de décision, vision.", formations: ["HEC/ESSEC", "Sciences Po", "MBA", "Master Management"] },
  ENTP: { name: "L'Innovateur", desc: "Débatteur brillant, créatif provocateur.", forte: "Idéation, entrepreneuriat, débat.", formations: ["École de commerce", "Sciences Po", "Master Innovation", "Bachelor Startup"] },
  INFJ: { name: "L'Avocat", desc: "Idéaliste inspirant, discret et déterminé.", forte: "Vision humaniste, écriture, conseil.", formations: ["Master Psychologie", "Master Lettres", "Master Sociologie", "École du journalisme"] },
  INFP: { name: "Le Médiateur", desc: "Idéaliste rêveur, sensible et créatif.", forte: "Écriture, art, empathie.", formations: ["Licence Arts", "Master Cinéma", "Licence Lettres", "École de design"] },
  ENFJ: { name: "Le Protagoniste", desc: "Leader charismatique, empathique.", forte: "Enseignement, coaching, communication.", formations: ["Master Sciences de l'éducation", "CELSA", "Master RH", "Sciences Po"] },
  ENFP: { name: "L'Inspirateur", desc: "Enthousiaste créatif, libre et sociable.", forte: "Créativité, communication, animation.", formations: ["Master Communication", "Master Marketing", "École d'art", "Journalisme"] },
  ISTJ: { name: "Le Logisticien", desc: "Fiable, méthodique, respectueux des règles.", forte: "Organisation, rigueur, fiabilité.", formations: ["Master Compta/Contrôle", "Master Droit", "BUT GEA", "Master Finance"] },
  ISFJ: { name: "Le Défenseur", desc: "Protecteur dévoué, chaleureux et loyal.", forte: "Care, soin, service.", formations: ["Infirmier IFSI", "Master Psycho", "Master Éducation", "Kiné"] },
  ESTJ: { name: "Le Directeur", desc: "Manager pragmatique, décideur né.", forte: "Gestion, structure, résultats.", formations: ["École de commerce", "Master Management", "Master Droit des affaires", "MBA"] },
  ESFJ: { name: "Le Consul", desc: "Sociable attentionné, populaire et loyal.", forte: "Relations humaines, événementiel.", formations: ["Master RH", "Master Événementiel", "IFSI", "Master Tourisme"] },
  ISTP: { name: "Le Virtuose", desc: "Expérimentateur pragmatique, débrouillard.", forte: "Bricolage, mécanique, sport.", formations: ["BTS/BUT technique", "École d'ingé", "Écoles de mécanique", "Cybersécurité"] },
  ISFP: { name: "L'Aventurier", desc: "Artiste sensible, libre et curieux.", forte: "Art, mode, photo, musique.", formations: ["Beaux-Arts", "École de mode", "Photographie", "Licence Arts"] },
  ESTP: { name: "L'Entrepreneur", desc: "Énergique pragmatique, prend des risques.", forte: "Business, sport, action.", formations: ["École de commerce", "STAPS", "BTS MCO", "Master Entrepreneuriat"] },
  ESFP: { name: "L'Amuseur", desc: "Extraverti spontané, adore le contact.", forte: "Scène, événementiel, tourisme.", formations: ["École de théâtre", "STAPS", "Master Événementiel", "Tourisme"] },
};

function MBTIPage() {
  const { user } = useAuth();
  const [answers, setAnswers] = useState<("a"|"b")[]>([]);
  const [showResult, setShowResult] = useState(false);

  const done = answers.length >= Q.length;
  const scores = useMemo(() => {
    const s = { E:0, I:0, S:0, N:0, T:0, F:0, J:0, P:0 };
    answers.forEach((ans, i) => {
      const axis = Q[i].axis;
      const letter = ans === "a" ? axis[0] : axis[1];
      s[letter as keyof typeof s] += 1;
    });
    return s;
  }, [answers]);

  const type = useMemo(() => {
    return (scores.E >= scores.I ? "E" : "I") +
           (scores.S >= scores.N ? "S" : "N") +
           (scores.T >= scores.F ? "T" : "F") +
           (scores.J >= scores.P ? "J" : "P");
  }, [scores]);

  const info = TYPES[type];

  const save = async () => {
    if (!user) { toast.error("Connecte-toi pour sauvegarder"); return; }
    const { error } = await supabase.from("mbti_results").insert({ user_id: user.id, type, scores });
    if (!error) {
      await supabase.from("profiles").update({ mbti: type }).eq("id", user.id);
      toast.success("Résultat sauvegardé sur ton profil !");
    } else toast.error(error.message);
  };

  const reset = () => { setAnswers([]); setShowResult(false); };

  return (
    <main className="max-w-4xl mx-auto py-12 px-6 space-y-10">
      <header className="text-center space-y-3">
        <span className="text-[11px] uppercase tracking-[0.2em] text-brand font-semibold">Test de personnalité</span>
        <h1 className="font-display text-4xl md:text-5xl font-semibold">Découvre ton type MBTI</h1>
        <p className="text-neutral-600">32 questions pour révéler ton profil parmi les 16 personnalités.</p>
      </header>

      {!showResult ? (
        <section className="bg-ui-bg ring-1 ring-black/5 rounded-3xl p-8">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-brand font-semibold">{Q[answers.length]?.axis || "Terminé"}</span>
            <span className="text-neutral-500">{Math.min(answers.length+1, Q.length)} / {Q.length}</span>
          </div>
          <div className="h-1 bg-neutral-200 rounded-full overflow-hidden mb-8">
            <div className="h-full bg-brand transition-all" style={{ width: `${(answers.length/Q.length)*100}%` }} />
          </div>
          {!done ? (
            <>
              <h2 className="font-display text-xl md:text-2xl font-semibold mb-6">{Q[answers.length].q}</h2>
              <div className="grid gap-3">
                {(["a","b"] as const).map(k => (
                  <button key={k} onClick={() => setAnswers([...answers, k])}
                    className="text-left p-4 bg-white rounded-xl ring-1 ring-black/5 hover:ring-brand hover:bg-brand-light transition text-sm font-medium">
                    {Q[answers.length][k]}
                  </button>
                ))}
              </div>
              <div className="flex justify-between mt-6 text-xs text-neutral-500">
                <button onClick={() => setAnswers(a => a.slice(0,-1))} disabled={!answers.length} className="hover:text-brand disabled:opacity-30">← Précédent</button>
                <button onClick={reset} disabled={!answers.length} className="hover:text-brand disabled:opacity-30">Recommencer</button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <button onClick={() => setShowResult(true)} className="px-6 py-3 bg-brand text-white rounded-lg text-sm font-medium hover:brightness-110">
                Voir mon type →
              </button>
            </div>
          )}
        </section>
      ) : (
        <section className="space-y-8 animate-fade-in">
          <div className="text-center space-y-3">
            <div className="text-6xl font-display font-bold text-brand">{type}</div>
            <h2 className="font-display text-3xl font-semibold">{info.name}</h2>
            <p className="text-neutral-600 max-w-xl mx-auto">{info.desc}</p>
            <div className="flex gap-3 justify-center">
              <button onClick={save} className="px-5 py-2 bg-brand text-white rounded-lg text-sm font-medium">Enregistrer sur mon profil</button>
              <button onClick={reset} className="px-5 py-2 ring-1 ring-black/10 rounded-lg text-sm">Refaire</button>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-3">
            {([["E","I"],["S","N"],["T","F"],["J","P"]] as const).map(([a,b]) => {
              const total = scores[a]+scores[b];
              const pctA = Math.round((scores[a]/total)*100);
              return (
                <div key={a} className="bg-white ring-1 ring-black/5 rounded-2xl p-4">
                  <div className="flex justify-between text-xs font-medium mb-2"><span>{a} {pctA}%</span><span>{b} {100-pctA}%</span></div>
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand" style={{ width: `${pctA}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-brand-light ring-1 ring-brand/20 rounded-2xl p-6">
            <h3 className="font-display font-semibold mb-2">Ta force</h3>
            <p className="text-sm text-neutral-700 mb-4">{info.forte}</p>
            <h3 className="font-display font-semibold mb-2">Formations qui te correspondent</h3>
            <ul className="space-y-1">
              {info.formations.map(f => <li key={f} className="text-sm flex gap-2"><span className="text-brand">→</span>{f}</li>)}
            </ul>
          </div>
        </section>
      )}
    </main>
  );
}
