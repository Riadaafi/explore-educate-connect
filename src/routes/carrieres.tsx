import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ReactNode } from "react";

export const Route = createFileRoute("/carrieres")({
  head: () => ({
    meta: [
      { title: "Formations — Cursus" },
      {
        name: "description",
        content:
          "Base de masters, écoles et programmes. Recherche, filtre par secteur et ajoute tes propres formations.",
      },
    ],
  }),
  component: FormationsPage,
});

type FormationType = "Master" | "École" | "BUT" | "Licence" | "BTS" | "MBA";
type Sector =
  | "Tech & Digital"
  | "Business & Management"
  | "Finance"
  | "Marketing & Com"
  | "Design & Création"
  | "Santé & Bio"
  | "Sciences & Ingénierie"
  | "Droit"
  | "Sciences sociales"
  | "Lettres & Langues"
  | "Architecture"
  | "Audiovisuel"
  | "Environnement"
  | "Hôtellerie & Tourisme"
  | "Sport"
  | "Enseignement";

type Formation = {
  id: string;
  name: string;
  school: string;
  city: string;
  type: FormationType;
  sector: Sector;
  duration: string; // ex "2 ans"
  level: string; // entry: "Bac+3" -> output "Bac+5"
  tuition: string;
  rating: number; // /5
  rncp: boolean; // reconnu RNCP
  description: string;
  imageUrl?: string;
};

const SECTORS: Sector[] = [
  "Tech & Digital",
  "Business & Management",
  "Finance",
  "Marketing & Com",
  "Design & Création",
  "Santé & Bio",
  "Sciences & Ingénierie",
  "Droit",
  "Sciences sociales",
  "Lettres & Langues",
  "Architecture",
  "Audiovisuel",
  "Environnement",
  "Hôtellerie & Tourisme",
  "Sport",
  "Enseignement",
];

const TYPES: FormationType[] = ["Master", "École", "BUT", "Licence", "BTS", "MBA"];

const SEED: Formation[] = generateSeedFormations();

type FormationTemplate = {
  name: string;
  type: FormationType;
  sector: Sector;
  duration: string;
  level: string;
  tuition: string;
  rating?: number;
  rncp: boolean;
  baseDescription: string;
};

const FORMATION_TEMPLATES: FormationTemplate[] = [
  {
    name: "Licence Droit",
    type: "Licence",
    sector: "Droit",
    duration: "3 ans",
    level: "Bac+3",
    tuition: "Gratuit (public)",
    rncp: true,
    baseDescription: "Licence en droit public, privé et contentieux.",
  },
  {
    name: "Licence Économie-Gestion",
    type: "Licence",
    sector: "Business & Management",
    duration: "3 ans",
    level: "Bac+3",
    tuition: "Gratuit (public)",
    rncp: true,
    baseDescription: "Formation en économie, gestion et management.",
  },
  {
    name: "Licence Informatique",
    type: "Licence",
    sector: "Tech & Digital",
    duration: "3 ans",
    level: "Bac+3",
    tuition: "Gratuit (public)",
    rncp: true,
    baseDescription: "Informatique, développement et systèmes d'information.",
  },
  {
    name: "Licence Psychologie",
    type: "Licence",
    sector: "Sciences sociales",
    duration: "3 ans",
    level: "Bac+3",
    tuition: "Gratuit (public)",
    rncp: true,
    baseDescription: "Étude du comportement humain et des relations sociales.",
  },
  {
    name: "Licence STAPS",
    type: "Licence",
    sector: "Sport",
    duration: "3 ans",
    level: "Bac+3",
    tuition: "Gratuit (public)",
    rncp: true,
    baseDescription: "Sciences et techniques des activités physiques et sportives.",
  },
  {
    name: "Licence Lettres Modernes",
    type: "Licence",
    sector: "Lettres & Langues",
    duration: "3 ans",
    level: "Bac+3",
    tuition: "Gratuit (public)",
    rncp: true,
    baseDescription: "Formation en lettres, littérature et communication écrite.",
  },
  {
    name: "Licence Science Politique",
    type: "Licence",
    sector: "Sciences sociales",
    duration: "3 ans",
    level: "Bac+3",
    tuition: "Gratuit (public)",
    rncp: true,
    baseDescription: "Étude des institutions, politiques et relations internationales.",
  },
  {
    name: "BUT Informatique",
    type: "BUT",
    sector: "Tech & Digital",
    duration: "3 ans",
    level: "Bac+3",
    tuition: "Gratuit (public)",
    rncp: true,
    baseDescription: "Formation professionnalisante en développement logiciel.",
  },
  {
    name: "BUT Génie Civil",
    type: "BUT",
    sector: "Sciences & Ingénierie",
    duration: "3 ans",
    level: "Bac+3",
    tuition: "Gratuit (public)",
    rncp: true,
    baseDescription: "Conception, construction et maintenance du bâti.",
  },
  {
    name: "BUT MMI",
    type: "BUT",
    sector: "Design & Création",
    duration: "3 ans",
    level: "Bac+3",
    tuition: "Gratuit (public)",
    rncp: true,
    baseDescription: "Multimédia, communication digitale et design interactif.",
  },
  {
    name: "BUT GEII",
    type: "BUT",
    sector: "Tech & Digital",
    duration: "3 ans",
    level: "Bac+3",
    tuition: "Gratuit (public)",
    rncp: true,
    baseDescription: "Électronique, informatique industrielle et réseaux.",
  },
  {
    name: "BTS NDRC",
    type: "BTS",
    sector: "Business & Management",
    duration: "2 ans",
    level: "Bac+2",
    tuition: "Gratuit (public)",
    rncp: true,
    baseDescription: "Négociation et digitalisation de la relation client.",
  },
  {
    name: "BTS Comptabilité et Gestion",
    type: "BTS",
    sector: "Business & Management",
    duration: "2 ans",
    level: "Bac+2",
    tuition: "Gratuit (public)",
    rncp: true,
    baseDescription: "Comptabilité, finance et gestion d'entreprise.",
  },
  {
    name: "BTS Communication",
    type: "BTS",
    sector: "Marketing & Com",
    duration: "2 ans",
    level: "Bac+2",
    tuition: "Gratuit (public)",
    rncp: true,
    baseDescription: "Techniques de communication, événementiel et publicité.",
  },
  {
    name: "BTS Tourisme",
    type: "BTS",
    sector: "Hôtellerie & Tourisme",
    duration: "2 ans",
    level: "Bac+2",
    tuition: "Gratuit (public)",
    rncp: true,
    baseDescription: "Accueil, gestion et commercialisation touristique.",
  },
  {
    name: "BTS Services Informatiques aux Organisations",
    type: "BTS",
    sector: "Tech & Digital",
    duration: "2 ans",
    level: "Bac+2",
    tuition: "Gratuit (public)",
    rncp: true,
    baseDescription: "Support et développement des services informatiques.",
  },
  {
    name: "Bachelor Commerce International",
    type: "Licence",
    sector: "Business & Management",
    duration: "3 ans",
    level: "Bac+3",
    tuition: "7 200 €/an",
    rating: 4.3,
    rncp: true,
    baseDescription: "Commerce international, export et logistique.",
  },
  {
    name: "Bachelor UX/UI",
    type: "Licence",
    sector: "Design & Création",
    duration: "3 ans",
    level: "Bac+3",
    tuition: "7 500 €/an",
    rncp: true,
    baseDescription: "Design d'interfaces et expérience utilisateur.",
  },
  {
    name: "Bachelor Marketing Digital",
    type: "Licence",
    sector: "Marketing & Com",
    duration: "3 ans",
    level: "Bac+3",
    tuition: "8 000 €/an",
    rncp: true,
    baseDescription: "Stratégies de marketing online et réseaux sociaux.",
  },
  {
    name: "Bachelor Journalisme",
    type: "Licence",
    sector: "Sciences sociales",
    duration: "3 ans",
    level: "Bac+3",
    tuition: "8 500 €/an",
    rncp: true,
    baseDescription: "Rédaction, média et communication journalistique.",
  },
  {
    name: "MSc Data Science",
    type: "Master",
    sector: "Tech & Digital",
    duration: "2 ans",
    level: "Bac+5",
    tuition: "16 000 €/an",
    rating: 4.8,
    rncp: true,
    baseDescription: "Machine learning, statistiques et big data.",
  },
  {
    name: "Master Management",
    type: "Master",
    sector: "Business & Management",
    duration: "2 ans",
    level: "Bac+5",
    tuition: "14 000 €/an",
    rating: 4.6,
    rncp: true,
    baseDescription: "Management d'entreprise, stratégie et leadership.",
  },
  {
    name: "Master Finance",
    type: "Master",
    sector: "Finance",
    duration: "2 ans",
    level: "Bac+5",
    tuition: "20 000 €/an",
    rating: 4.7,
    rncp: true,
    baseDescription: "Marchés financiers, audit et contrôle de gestion.",
  },
  {
    name: "Master Marketing Digital",
    type: "Master",
    sector: "Marketing & Com",
    duration: "2 ans",
    level: "Bac+5",
    tuition: "17 000 €/an",
    rating: 4.5,
    rncp: true,
    baseDescription: "Stratégies numériques et growth marketing.",
  },
  {
    name: "MBA Management International",
    type: "MBA",
    sector: "Business & Management",
    duration: "1 an",
    level: "Bac+5",
    tuition: "21 000 €/an",
    rating: 4.6,
    rncp: true,
    baseDescription: "Management global, commerce international et leadership.",
  },
  {
    name: "MBA Data & IA",
    type: "MBA",
    sector: "Tech & Digital",
    duration: "1 an",
    level: "Bac+5",
    tuition: "19 000 €/an",
    rating: 4.4,
    rncp: true,
    baseDescription: "Data science appliquée à l'intelligence artificielle.",
  },
  {
    name: "Master Biotechnologies",
    type: "Master",
    sector: "Santé & Bio",
    duration: "2 ans",
    level: "Bac+5",
    tuition: "4 000 €/an",
    rating: 4.5,
    rncp: true,
    baseDescription: "Recherche et innovation en biotechnologies.",
  },
  {
    name: "Master Droit des Affaires",
    type: "Master",
    sector: "Droit",
    duration: "2 ans",
    level: "Bac+5",
    tuition: "Gratuit (public)",
    rating: 4.5,
    rncp: true,
    baseDescription: "Droit des sociétés, contrats et fiscalité.",
  },
  {
    name: "Master Architecture",
    type: "Master",
    sector: "Architecture",
    duration: "2 ans",
    level: "Bac+5",
    tuition: "Gratuit (public)",
    rating: 4.4,
    rncp: true,
    baseDescription: "Conception architecturale et projet urbain.",
  },
  {
    name: "Master Cinema & Audiovisuel",
    type: "Master",
    sector: "Audiovisuel",
    duration: "2 ans",
    level: "Bac+5",
    tuition: "6 000 €/an",
    rating: 4.7,
    rncp: true,
    baseDescription: "Production, réalisation et post-production.",
  },
  {
    name: "Master Ingénierie Durable",
    type: "Master",
    sector: "Environnement",
    duration: "2 ans",
    level: "Bac+5",
    tuition: "3 000 €/an",
    rating: 4.6,
    rncp: true,
    baseDescription: "Transition énergétique et ingénierie environnementale.",
  },
  {
    name: "École d'Architecture",
    type: "École",
    sector: "Architecture",
    duration: "5 ans",
    level: "Bac+5",
    tuition: "4 000 €/an",
    rating: 4.3,
    rncp: true,
    baseDescription: "Architecture, urbanisme et design d'espace.",
  },
  {
    name: "École de Commerce",
    type: "École",
    sector: "Business & Management",
    duration: "5 ans",
    level: "Bac+5",
    tuition: "15 000 €/an",
    rating: 4.7,
    rncp: true,
    baseDescription: "Commerce, finance et business international.",
  },
  {
    name: "École d'Ingénieurs",
    type: "École",
    sector: "Sciences & Ingénierie",
    duration: "5 ans",
    level: "Bac+5",
    tuition: "12 000 €/an",
    rating: 4.8,
    rncp: true,
    baseDescription: "Formation d'ingénieur généraliste et spécialisé.",
  },
];

const SCHOOLS = [
  "Sorbonne Université",
  "Université Paris-Saclay",
  "Université de Lyon",
  "Université de Lille",
  "Université de Strasbourg",
  "Université Rennes 1",
  "Université Grenoble-Alpes",
  "Université de Bordeaux",
  "Université d'Aix-Marseille",
  "Université de Toulouse",
  "HEC Paris",
  "ESSEC",
  "ESCP",
  "EM Lyon",
  "EDHEC",
  "Sciences Po Paris",
  "Polytechnique",
  "CentraleSupélec",
  "Telecom Paris",
  "École 42",
  "EPITA",
  "EPF",
  "ENS Paris",
  "ENS Lyon",
  "ENSA Paris-Malaquais",
  "La Fémis",
  "Les Gobelins",
  "Rubika",
  "ENVA Maisons-Alfort",
  "INSPÉ Lyon",
  "AgroParisTech",
  "Université de Nantes",
  "Université de Lorraine",
  "Université Paris Nanterre",
  "Université Paris Cité",
  "Université Lyon 2",
  "Université Clermont Auvergne",
  "Université de Nice",
  "Université de Montpellier",
];

const CITIES = [
  "Paris",
  "Lyon",
  "Marseille",
  "Bordeaux",
  "Toulouse",
  "Nantes",
  "Strasbourg",
  "Lille",
  "Rennes",
  "Grenoble",
  "Nice",
  "Montpellier",
  "Dijon",
  "Nancy",
  "Aix-en-Provence",
  "Besançon",
  "Le Mans",
  "Clermont-Ferrand",
  "Metz",
  "Rouen",
];

const IMAGE_URLS = [
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
];

const TITLE_ADJECTIVES = [
  "International",
  "Professionnel",
  "Avancé",
  "Stratégique",
  "Créatif",
  "Numérique",
  "Innovation",
  "& Management",
  "& Entrepreneuriat",
  "et Data",
];

const DESCRIPTION_VARIANTS = [
  "Axé sur l'emploi et la veille sectorielle.",
  "Avec des projets réels encadrés par des spécialistes.",
  "En partenariat avec des entreprises et des associations.",
  "Une formation pratique qui prépare à l'alternance.",
  "Orientée vers les métiers de demain.",
  "Pour développer un profil polyvalent et recherché.",
  "Avec un accompagnement personnalisé vers l'insertion.",
  "Accessible après le bac et idéale pour les jeunes motivés.",
  "Forte d'un réseau d'anciens et de stages intégrés.",
  "Une spécialisation reconnue au niveau national.",
];

function generateSeedFormations(): Formation[] {
  return Array.from({ length: 1000 }, (_, index) => {
    const template = FORMATION_TEMPLATES[index % FORMATION_TEMPLATES.length];
    const school = SCHOOLS[index % SCHOOLS.length];
    const city = CITIES[index % CITIES.length];
    const rating = parseFloat((3.6 + (index % 15) * 0.14).toFixed(1));
    const imageUrl = index % 4 === 0 ? IMAGE_URLS[index % IMAGE_URLS.length] : undefined;
    const titleAddon = TITLE_ADJECTIVES[index % TITLE_ADJECTIVES.length];
    const descriptionAddon = DESCRIPTION_VARIANTS[index % DESCRIPTION_VARIANTS.length];
    const name = index % 3 === 0 ? `${template.name} ${titleAddon}` : template.name;
    return {
      id: String(index + 1),
      name,
      school,
      city,
      type: template.type,
      sector: template.sector,
      duration: template.duration,
      level: template.level,
      tuition: template.tuition,
      rating: Math.min(5, rating),
      rncp: template.rncp,
      description: `${template.baseDescription} ${descriptionAddon} Proposé par ${school} à ${city}.`,
      imageUrl,
    };
  });
}

const STORAGE_KEY = "cursus.formations.v1";

function load(): Formation[] {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : SEED;
  } catch {
    return SEED;
  }
}

function save(data: Formation[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function createEmptyFormation(): Formation {
  return {
    id: crypto.randomUUID(),
    name: "",
    school: "",
    city: "",
    type: "Master",
    sector: "Tech & Digital",
    duration: "2 ans",
    level: "Bac+5",
    tuition: "",
    rating: 4.0,
    rncp: true,
    description: "",
    imageUrl: "",
  };
}

function FormationsPage() {
  const [items, setItems] = useState<Formation[]>(SEED);
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState<Sector | "all">("all");
  const [type, setType] = useState<FormationType | "all">("all");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Formation | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    save(items);
  }, [hydrated, items]);

  useEffect(() => {
    setPage(1);
  }, [query, sector, type]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const terms = q.split(/\s+/).filter(Boolean);
    return items.filter((f) => {
      if (sector !== "all" && f.sector !== sector) return false;
      if (type !== "all" && f.type !== type) return false;
      if (!terms.length) return true;
      const target =
        `${f.name} ${f.school} ${f.city} ${f.sector} ${f.type} ${f.level} ${f.tuition} ${f.description}`.toLowerCase();
      return terms.every((term) => target.includes(term));
    });
  }, [items, query, sector, type]);

  const PER_PAGE = 12;
  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const pageItems = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const averageRating =
    filtered.length > 0
      ? (filtered.reduce((sum, formation) => sum + formation.rating, 0) / filtered.length).toFixed(1)
      : "—";

  const handleSave = (f: Formation) => {
    setItems((prev) => {
      const exists = prev.some((x) => x.id === f.id);
      const next = exists ? prev.map((x) => (x.id === f.id ? f : x)) : [f, ...prev];
      return next;
    });
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Supprimer cette formation ?")) return;
    setItems((prev) => prev.filter((x) => x.id !== id));
  };

  return (
    <main className="max-w-6xl mx-auto py-12 px-6 space-y-10">
      <section className="space-y-3">
        <span className="text-[11px] uppercase tracking-[0.2em] text-brand font-semibold">
          Formations
        </span>
        <h1 className="font-display text-4xl md:text-5xl font-semibold leading-tight">
          Toutes les formations, en un seul endroit.
        </h1>
        <p className="text-neutral-600 max-w-2xl">
          Masters, écoles, BUT, BTS et licences. {items.length} formations référencées. Ajoute des
          formations, édite les fiches et partage une image de chaque cursus.
        </p>
      </section>

      {/* Search + filters */}
      <section className="bg-ui-bg ring-1 ring-black/5 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="🔍 Rechercher une formation, école ou ville..."
            className="flex-1 px-4 py-3 bg-white rounded-xl ring-1 ring-black/5 text-sm focus:ring-brand outline-none"
          />
          <button
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="px-5 py-3 bg-brand text-white rounded-xl text-sm font-medium hover:brightness-110 whitespace-nowrap"
          >
            + Ajouter
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterChip active={type === "all"} onClick={() => setType("all")} label="Tous types" />
          {TYPES.map((t) => (
            <FilterChip key={t} active={type === t} onClick={() => setType(t)} label={t} />
          ))}
        </div>
        <div className="flex flex-wrap gap-2 pt-1 border-t border-black/5">
          <FilterChip
            active={sector === "all"}
            onClick={() => setSector("all")}
            label="Tous secteurs"
          />
          {SECTORS.map((s) => (
            <FilterChip key={s} active={sector === s} onClick={() => setSector(s)} label={s} />
          ))}
        </div>
      </section>

      {/* Metrics */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Formations affichées" value={filtered.length.toString()} />
        <Stat
          label="Écoles uniques"
          value={new Set(filtered.map((f) => f.school)).size.toString()}
        />
        <Stat label="Villes" value={new Set(filtered.map((f) => f.city)).size.toString()} />
        <Stat label="Note moyenne" value={averageRating} />
      </section>

      {/* Grid */}
      <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-neutral-500 text-sm">
            Aucune formation ne correspond.
          </div>
        )}
        {pageItems.map((f) => (
          <FormationCard
            key={f.id}
            formation={f}
            onEdit={() => {
              setEditing(f);
              setShowForm(true);
            }}
            onDelete={() => handleDelete(f.id)}
          />
        ))}
      </section>

      {pageCount > 1 && (
        <section className="flex flex-col items-center gap-3 pt-4">
          <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-neutral-600">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="px-3 py-2 rounded-full ring-1 ring-black/10 bg-white hover:bg-brand/5 disabled:opacity-40"
            >
              Précédent
            </button>
            {Array.from({ length: pageCount }, (_, index) => index + 1)
              .filter(
                (pageNumber) =>
                  pageNumber === 1 || pageNumber === pageCount || Math.abs(pageNumber - page) <= 2,
              )
              .map((pageNumber) => (
                <button
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                  className={`px-3 py-2 rounded-full ring-1 ring-black/10 ${page === pageNumber ? "bg-brand text-white" : "bg-white hover:bg-brand/5"}`}
                >
                  {pageNumber}
                </button>
              ))}
            <button
              onClick={() => setPage((prev) => Math.min(pageCount, prev + 1))}
              disabled={page === pageCount}
              className="px-3 py-2 rounded-full ring-1 ring-black/10 bg-white hover:bg-brand/5 disabled:opacity-40"
            >
              Suivant
            </button>
          </div>
          <p className="text-xs text-neutral-500">
            Page {page} sur {pageCount} — {filtered.length} résultats
          </p>
        </section>
      )}
      {showForm && (
        <FormationForm
          initial={editing}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSave={handleSave}
        />
      )}
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white ring-1 ring-black/5 rounded-xl p-4">
      <div className="text-2xl font-display font-semibold text-brand">{value}</div>
      <div className="text-xs text-neutral-500 mt-1">{label}</div>
    </div>
  );
}

function FormationCard({
  formation,
  onEdit,
  onDelete,
}: {
  formation: Formation;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [imageError, setImageError] = useState(false);

  return (
    <article className="bg-white ring-1 ring-black/5 rounded-2xl p-5 flex flex-col gap-3 hover:ring-brand/30 transition">
      {formation.imageUrl && !imageError ? (
        <div className="overflow-hidden rounded-3xl h-44 mb-4">
          <img
            src={formation.imageUrl}
            alt={formation.name}
            loading="lazy"
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        </div>
      ) : (
        <div className="h-44 rounded-3xl bg-neutral-100 grid place-items-center text-neutral-400 text-sm mb-4">
          Aucune image
        </div>
      )}
      <div className="flex justify-between items-start gap-2">
        <span className="text-[10px] uppercase tracking-wider font-semibold text-brand px-2 py-1 bg-brand-light rounded">
          {formation.type}
        </span>
        <span className="text-xs text-neutral-500">⭐ {formation.rating}</span>
      </div>
      <div>
        <h3 className="font-display font-semibold text-base leading-tight">{formation.name}</h3>
        <p className="text-sm text-neutral-600 mt-1">{formation.school}</p>
        <p className="text-xs text-neutral-400">{formation.city}</p>
      </div>
      <p className="text-xs text-neutral-600 line-clamp-2">{formation.description}</p>
      <div className="flex flex-wrap gap-1 text-[11px]">
        <span className="px-2 py-0.5 bg-neutral-100 rounded-full">{formation.sector}</span>
        <span className="px-2 py-0.5 bg-neutral-100 rounded-full">{formation.duration}</span>
        <span className="px-2 py-0.5 bg-neutral-100 rounded-full">{formation.level}</span>
        {formation.rncp && (
          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">RNCP</span>
        )}
      </div>
      <div className="flex justify-between items-center pt-3 border-t border-black/5 text-xs">
        <span className="text-neutral-500">{formation.tuition}</span>
        <div className="flex gap-2">
          <button onClick={onEdit} className="text-neutral-500 hover:text-brand" aria-label="Éditer">
            ✏️
          </button>
          <button onClick={onDelete} className="text-neutral-500 hover:text-red-500" aria-label="Supprimer">
            🗑
          </button>
        </div>
      </div>
    </article>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
        active
          ? "bg-brand text-white"
          : "bg-white text-neutral-600 ring-1 ring-black/5 hover:ring-brand"
      }`}
    >
      {label}
    </button>
  );
}

function FormationForm({
  initial,
  onClose,
  onSave,
}: {
  initial: Formation | null;
  onClose: () => void;
  onSave: (f: Formation) => void;
}) {
  const [form, setForm] = useState<Formation>(createEmptyFormation());
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(initial ? { ...initial, imageUrl: initial.imageUrl ?? "" } : createEmptyFormation());
    setError("");
  }, [initial]);

  const update = <K extends keyof Formation>(k: K, v: Formation[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const normalizedName = form.name.trim();
    const normalizedSchool = form.school.trim();
    const normalizedRating = Number.parseFloat(String(form.rating));

    if (!normalizedName || !normalizedSchool) {
      setError("Le nom de la formation et l’école sont obligatoires.");
      return;
    }

    if (Number.isNaN(normalizedRating) || normalizedRating < 0 || normalizedRating > 5) {
      setError("La note doit être comprise entre 0 et 5.");
      return;
    }

    setError("");
    onSave({
      ...form,
      name: normalizedName,
      school: normalizedSchool,
      city: form.city.trim(),
      duration: form.duration.trim(),
      level: form.level.trim(),
      tuition: form.tuition.trim(),
      description: form.description.trim(),
      imageUrl: form.imageUrl?.trim() || undefined,
      rating: Number(normalizedRating.toFixed(1)),
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 grid place-items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-display text-xl font-semibold">
            {initial ? "Modifier" : "Ajouter"} une formation
          </h3>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700">
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="grid gap-3">
          <Field label="Nom de la formation">
            <input
              required
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="input"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="École / Université">
              <input
                required
                value={form.school}
                onChange={(e) => update("school", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Ville">
              <input
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                className="input"
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <select
                value={form.type}
                onChange={(e) => update("type", e.target.value as FormationType)}
                className="input"
              >
                {TYPES.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </Field>
            <Field label="Secteur">
              <select
                value={form.sector}
                onChange={(e) => update("sector", e.target.value as Sector)}
                className="input"
              >
                {SECTORS.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Durée">
              <input
                value={form.duration}
                onChange={(e) => update("duration", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Niveau">
              <input
                value={form.level}
                onChange={(e) => update("level", e.target.value)}
                className="input"
              />
            </Field>
            <Field label="Note /5">
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={form.rating}
                onChange={(e) => update("rating", parseFloat(e.target.value))}
                className="input"
              />
            </Field>
          </div>
          <Field label="Frais">
            <input
              value={form.tuition}
              onChange={(e) => update("tuition", e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Image (URL)">
            <input
              value={form.imageUrl ?? ""}
              onChange={(e) => update("imageUrl", e.target.value)}
              className="input"
              placeholder="https://..."
            />
          </Field>
          <Field label="Description">
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              className="input"
            />
          </Field>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.rncp}
              onChange={(e) => update("rncp", e.target.checked)}
            />{" "}
            Reconnu RNCP
          </label>
          <div className="flex justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg ring-1 ring-black/10 hover:bg-neutral-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-brand text-white rounded-lg hover:brightness-110"
            >
              Enregistrer
            </button>
          </div>
        </form>
        <style>{`.input{width:100%;padding:.55rem .75rem;background:#fafaf9;border-radius:.5rem;border:1px solid rgba(0,0,0,.08);font-size:.875rem;outline:none}.input:focus{border-color:#0d9488}`}</style>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-neutral-600 mb-1">{label}</span>
      {children}
    </label>
  );
}
