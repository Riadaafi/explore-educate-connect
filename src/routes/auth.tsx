import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Connexion — Cursus" }, { name: "description", content: "Crée ton compte étudiant Cursus." }] }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/profil" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: fullName } },
        });
        if (error) throw error;
        toast.success("Compte créé ! Tu es connecté·e.");
        navigate({ to: "/profil" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Bienvenue !");
        navigate({ to: "/profil" });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally { setBusy(false); }
  };

  const google = async () => {
    const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (r.error) toast.error("Erreur Google");
  };

  return (
    <main className="max-w-md mx-auto py-16 px-6">
      <div className="bg-white ring-1 ring-black/5 rounded-3xl p-8 space-y-6">
        <div className="text-center space-y-1">
          <h1 className="font-display text-3xl font-semibold">{mode === "signup" ? "Créer ton compte" : "Se connecter"}</h1>
          <p className="text-sm text-neutral-500">Rejoins la communauté étudiante</p>
        </div>

        <button onClick={google} className="w-full py-2.5 rounded-lg ring-1 ring-black/10 hover:bg-neutral-50 text-sm font-medium flex items-center justify-center gap-2">
          <svg viewBox="0 0 24 24" className="size-4"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continuer avec Google
        </button>

        <div className="flex items-center gap-3 text-xs text-neutral-400"><div className="h-px flex-1 bg-neutral-200" />ou<div className="h-px flex-1 bg-neutral-200" /></div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <input required value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Nom complet" className="w-full px-3 py-2.5 rounded-lg ring-1 ring-black/10 text-sm focus:outline-none focus:ring-brand" />
          )}
          <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full px-3 py-2.5 rounded-lg ring-1 ring-black/10 text-sm focus:outline-none focus:ring-brand" />
          <input required type="password" minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="Mot de passe (6+ caractères)" className="w-full px-3 py-2.5 rounded-lg ring-1 ring-black/10 text-sm focus:outline-none focus:ring-brand" />
          <button disabled={busy} className="w-full py-2.5 rounded-lg bg-brand text-white text-sm font-medium hover:brightness-110 disabled:opacity-50">
            {busy ? "…" : mode === "signup" ? "Créer le compte" : "Se connecter"}
          </button>
        </form>

        <p className="text-center text-xs text-neutral-500">
          {mode === "signup" ? "Déjà un compte ?" : "Pas encore de compte ?"}{" "}
          <button onClick={() => setMode(mode === "signup" ? "signin" : "signup")} className="text-brand font-medium hover:underline">
            {mode === "signup" ? "Se connecter" : "S'inscrire"}
          </button>
        </p>
      </div>
    </main>
  );
}
