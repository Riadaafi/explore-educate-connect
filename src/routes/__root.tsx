import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold">404</h1>
        <p className="mt-2 text-sm text-neutral-500">Page introuvable.</p>
        <Link to="/" className="mt-6 inline-flex rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Cette page n'a pas pu charger</h1>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white"
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Cursus — Plateforme étudiante" },
      { name: "description", content: "Orientation MBTI, 1000+ formations, réseau étudiant, messagerie — tout pour ton parcours." },
      { property: "og:title", content: "Cursus — Plateforme étudiante" },
      { name: "twitter:title", content: "Cursus — Plateforme étudiante" },
      { property: "og:description", content: "Orientation MBTI, 1000+ formations, réseau étudiant, messagerie — tout pour ton parcours." },
      { name: "twitter:description", content: "Orientation MBTI, 1000+ formations, réseau étudiant, messagerie — tout pour ton parcours." },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function NavBar() {
  const { user, loading } = useAuth();
  const linkCls = "text-sm font-medium text-neutral-600 hover:text-brand transition-colors";
  const activeCls = "text-brand";

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <nav className="sticky top-0 z-50 bg-surface/80 backdrop-blur-md border-b border-black/5">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <Link to="/" className="font-display font-semibold text-xl tracking-tight text-brand shrink-0">
          Cursus.
        </Link>
        <div className="flex gap-5 flex-wrap justify-end">
          <Link to="/" className={linkCls} activeProps={{ className: activeCls }} activeOptions={{ exact: true }}>Orientation</Link>
          <Link to="/mbti" className={linkCls} activeProps={{ className: activeCls }}>MBTI</Link>
          <Link to="/carrieres" className={linkCls} activeProps={{ className: activeCls }}>Formations</Link>
          <Link to="/reseau" className={linkCls} activeProps={{ className: activeCls }}>Réseau</Link>
          {user && <Link to="/messages" className={linkCls} activeProps={{ className: activeCls }}>Messages</Link>}
          {user ? (
            <>
              <Link to="/profil" className={linkCls} activeProps={{ className: activeCls }}>Profil</Link>
              <button onClick={signOut} className="text-sm font-medium text-neutral-400 hover:text-brand">Déconnexion</button>
            </>
          ) : !loading ? (
            <Link to="/auth" className="text-sm font-medium bg-brand text-white px-3 py-1.5 rounded-lg hover:brightness-110">Connexion</Link>
          ) : null}
        </div>
      </div>
    </nav>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-surface text-text-main">
        <NavBar />
        <Outlet />
        <Toaster position="top-right" />
        <footer className="py-12 px-6 border-t border-black/5 bg-ui-bg mt-32">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <span className="font-display font-semibold text-brand">Cursus.</span>
            <p className="text-xs text-neutral-500">© 2026 Plateforme étudiante.</p>
            <div className="flex gap-6">
              <a href="#" className="text-xs font-medium text-neutral-500 hover:text-brand">Mentions légales</a>
              <a href="#" className="text-xs font-medium text-neutral-500 hover:text-brand">Confidentialité</a>
            </div>
          </div>
        </footer>
      </div>
    </QueryClientProvider>
  );
}
