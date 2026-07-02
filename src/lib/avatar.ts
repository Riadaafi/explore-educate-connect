import { supabase } from "@/integrations/supabase/client";

// Cache résolutions signed URLs pendant la session.
const cache = new Map<string, string>();

export async function resolveAvatarUrl(path: string | null | undefined): Promise<string | null> {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  if (cache.has(path)) return cache.get(path)!;
  const { data } = await supabase.storage.from("avatars").createSignedUrl(path, 60 * 60 * 24 * 7);
  if (data?.signedUrl) { cache.set(path, data.signedUrl); return data.signedUrl; }
  return null;
}

export async function resolveMany(paths: (string | null | undefined)[]): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  await Promise.all(paths.filter(Boolean).map(async (p) => {
    const url = await resolveAvatarUrl(p);
    if (url) out[p as string] = url;
  }));
  return out;
}
