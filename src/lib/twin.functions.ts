import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// AI Twin — compagnon d'orientation IA persistant.
// Utilise Lovable AI Gateway (LOVABLE_API_KEY).

const SYSTEM = `Tu es "Twin", le jumeau numérique d'orientation d'un·e étudiant·e français·e.
Tu connais son profil (école, formation, MBTI, compétences, ville). Tu es chaleureux, direct, concret.
Ton rôle : l'aider à choisir sa spécialité, son école, son stage, à comprendre les débouchés.
Réponds en français, court, actionnable. Propose 2-3 pistes concrètes à chaque réponse.
Utilise ses infos de profil pour personnaliser (ne les répète pas platement, intègre-les).`;

export const twinChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ message: z.string().min(1).max(2000) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY manquant");

    // Charge le profil
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
    const { data: history } = await supabase.from("twin_messages").select("role,content").eq("user_id", userId).order("created_at", { ascending: true }).limit(40);

    const profileNote = profile ? `Profil de l'utilisateur : nom=${profile.full_name || "?"}, école=${profile.school || "?"}, formation=${profile.formation || "?"}, ville=${profile.city || "?"}, MBTI=${profile.mbti || "?"}, statut=${profile.status || "?"}, compétences=${(profile.skills || []).join(", ") || "?"}, bio=${profile.bio || "?"}.` : "";

    const messages = [
      { role: "system", content: SYSTEM + "\n\n" + profileNote },
      ...(history || []).map((m: any) => ({ role: m.role, content: m.content })),
      { role: "user", content: data.message },
    ];

    // Sauvegarde le message utilisateur
    await supabase.from("twin_messages").insert({ user_id: userId, role: "user", content: data.message });

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: "google/gemini-2.5-flash", messages }),
    });

    if (!res.ok) {
      const t = await res.text();
      if (res.status === 429) throw new Error("Trop de requêtes. Réessaie dans 1 min.");
      if (res.status === 402) throw new Error("Crédits IA épuisés. Recharge le workspace.");
      throw new Error(`AI error ${res.status}: ${t.slice(0, 200)}`);
    }
    const json = await res.json();
    const reply = json.choices?.[0]?.message?.content ?? "…";

    await supabase.from("twin_messages").insert({ user_id: userId, role: "assistant", content: reply });
    return { reply };
  });

export const twinHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("twin_messages").select("id,role,content,created_at").eq("user_id", context.userId).order("created_at", { ascending: true }).limit(100);
    return data ?? [];
  });

export const twinClear = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await context.supabase.from("twin_messages").delete().eq("user_id", context.userId);
    return { ok: true };
  });
