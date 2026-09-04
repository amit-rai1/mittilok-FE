import { Flower2, Leaf, Mic, Sprout, Trees, type LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { api, mediaUrl } from "../lib/api";
import type { CategoryTreeDto } from "../types";

/** Canonical vertical key → storefront route */
const ROUTE_BY_KEY: Record<string, string> = {
  nursery: "/nursery",
  organics: "/organics",
  mali: "/services/mali",
  landscaping: "/landscaping",
  podcast: "/podcast",
};

const ICON_BY_KEY: Record<string, LucideIcon> = {
  nursery: Flower2,
  organics: Leaf,
  mali: Sprout,
  landscaping: Trees,
  podcast: Mic,
};

/** Map any known DB slug (canonical or drifted) → vertical key */
const KEY_BY_SLUG: Record<string, string> = {
  nursery: "nursery",
  "mittilok-nursery": "nursery",
  "organic-gardening-products": "organics",
  "mittilok-organics": "organics",
  organics: "organics",
  "gardening-plant-care-services": "mali",
  "mittilok-mali": "mali",
  mali: "mali",
  landscaping: "landscaping",
  "mittilok-landscaping": "landscaping",
  podcast: "podcast",
  "mittilok-podcast": "podcast",
};

const PREFERRED_KEYS = ["nursery", "organics", "mali", "landscaping", "podcast"] as const;

const FALLBACK_ROOTS: { key: string; slug: string; name: string }[] = [
  { key: "nursery", slug: "nursery", name: "Nursery" },
  { key: "organics", slug: "organic-gardening-products", name: "Organics" },
  { key: "mali", slug: "gardening-plant-care-services", name: "Mali" },
  { key: "landscaping", slug: "landscaping", name: "Landscaping" },
  { key: "podcast", slug: "podcast", name: "Podcast" },
];

function resolveKey(slug: string, name?: string): string | undefined {
  if (KEY_BY_SLUG[slug]) return KEY_BY_SLUG[slug];
  const lower = (name ?? "").toLowerCase();
  if (lower.includes("nursery")) return "nursery";
  if (lower.includes("organic")) return "organics";
  if (lower.includes("mali") || lower.includes("gardening")) return "mali";
  if (lower.includes("landscape")) return "landscaping";
  if (lower.includes("podcast")) return "podcast";
  return undefined;
}

function shortLabel(key: string, name: string) {
  if (key === "mali") return "Mali";
  if (key === "organics") return "Organics";
  return name.replace(/^MittiLok\s+/i, "");
}

function isActiveRoute(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export function CategoryIconRail() {
  const { pathname } = useLocation();
  const [roots, setRoots] = useState<CategoryTreeDto[]>([]);

  useEffect(() => {
    let cancelled = false;
    api<CategoryTreeDto[]>("/categories/tree?activeOnly=true", { auth: false })
      .then((tree) => {
        if (cancelled) return;
        const preferred = PREFERRED_KEYS.map((key) =>
          tree.find((c) => resolveKey(c.slug, c.name) === key),
        ).filter(Boolean) as CategoryTreeDto[];
        setRoots(preferred.length ? preferred : tree.filter((c) => resolveKey(c.slug, c.name)));
      })
      .catch(() => {
        if (!cancelled) setRoots([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const items: { id: number; name: string; slug: string; key: string; image?: string | null }[] = roots.length
    ? roots.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        key: resolveKey(cat.slug, cat.name) ?? "nursery",
        image: cat.image,
      }))
    : FALLBACK_ROOTS.map((fb, i) => ({
        id: -(i + 1),
        name: fb.name,
        slug: fb.slug,
        key: fb.key,
        image: null,
      }));

  return (
    <nav className="category-icon-rail" aria-label="MittiLok verticals">
      <div className="category-icon-rail-track">
        {items.map((cat) => {
          const route = ROUTE_BY_KEY[cat.key] ?? "/nursery";
          const Icon = ICON_BY_KEY[cat.key] ?? Leaf;
          const active = isActiveRoute(pathname, route);
          const imageSrc = cat.image ? mediaUrl(cat.image, "") : "";

          return (
            <Link
              key={cat.id}
              to={route}
              className={`category-icon-item${active ? " active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <span className="category-icon-bubble">
                {imageSrc ? (
                  <img src={imageSrc} alt="" className="category-icon-photo" />
                ) : (
                  <Icon size={22} strokeWidth={1.85} />
                )}
              </span>
              <span className="category-icon-label">{shortLabel(cat.key, cat.name)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
