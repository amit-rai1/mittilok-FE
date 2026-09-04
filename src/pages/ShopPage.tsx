import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import { PageShell } from "../components/ui";
import { api, buildQuery } from "../lib/api";
import { usePageTitle } from "../lib/format";
import type { CategoryTreeDto, PagedResult, ProductListDto } from "../types";

const LEGACY_CATEGORY_REDIRECTS: Record<string, string> = {
  nursery: "/nursery",
  "organic-gardening-products": "/organics",
  organics: "/organics",
};

type ShopPageProps = {
  rootSlug?: string;
};

export default function ShopPage({ rootSlug }: ShopPageProps) {
  const { subSlug } = useParams<{ subSlug?: string }>();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const query = params.get("query") ?? "";
  const legacyCategory = params.get("category") ?? "";
  const organic = params.get("organic") === "1";
  const sort = params.get("sort") ?? "featured";
  const page = Number(params.get("page") ?? "1") || 1;

  const [tree, setTree] = useState<CategoryTreeDto[]>([]);
  const [products, setProducts] = useState<ProductListDto[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [localQuery, setLocalQuery] = useState(query);

  const root = useMemo(() => {
    if (!rootSlug) return undefined;
    const aliases: Record<string, string[]> = {
      nursery: ["nursery", "mittilok-nursery"],
      "organic-gardening-products": ["organic-gardening-products", "mittilok-organics", "organics"],
    };
    const match = aliases[rootSlug] ?? [rootSlug];
    return tree.find((c) => match.includes(c.slug));
  }, [tree, rootSlug]);
  const children = root?.children ?? [];
  const activeChild = useMemo(
    () => (subSlug ? children.find((c) => c.slug === subSlug) : undefined),
    [children, subSlug],
  );

  const categoryId = activeChild?.id ?? root?.id;
  const basePath = rootSlug === "organic-gardening-products" ? "/organics" : rootSlug === "nursery" ? "/nursery" : "/shop";

  const title = activeChild?.name
    ?? root?.name
    ?? (organic ? "Organics" : "Plants, Pots & Gardening Essentials");

  usePageTitle(rootSlug ? (activeChild?.name ?? root?.name ?? rootSlug) : (legacyCategory || "Shop"));

  useEffect(() => {
    void api<CategoryTreeDto[]>("/categories/tree?activeOnly=true", { auth: false })
      .then(setTree)
      .catch(() => setTree([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const sortMap: Record<string, { sortBy?: string; sortDesc?: boolean }> = {
      featured: { sortBy: "featured", sortDesc: true },
      "price-asc": { sortBy: "price", sortDesc: false },
      "price-desc": { sortBy: "price", sortDesc: true },
      rating: { sortBy: "rating", sortDesc: true },
      newest: { sortBy: "createdAt", sortDesc: true },
    };
    const sortOpts = sortMap[sort] ?? sortMap.featured;

    if (rootSlug && tree.length === 0) {
      return () => {
        cancelled = true;
      };
    }

    api<PagedResult<ProductListDto>>(`/products${buildQuery({
      query: query || undefined,
      categoryId,
      isOrganic: organic || undefined,
      page,
      pageSize: 12,
      ...sortOpts,
    })}`, { auth: false })
      .then((res) => {
        if (cancelled) return;
        setProducts(res.items ?? []);
        setTotalCount(res.totalCount ?? 0);
        setTotalPages(res.totalPages ?? Math.max(1, Math.ceil((res.totalCount ?? 0) / (res.pageSize || 12))));
      })
      .catch(() => {
        if (!cancelled) {
          setProducts([]);
          setTotalCount(0);
          setTotalPages(1);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [query, categoryId, organic, sort, page, rootSlug, tree.length]);

  const legacyRedirect = !rootSlug && legacyCategory ? LEGACY_CATEGORY_REDIRECTS[legacyCategory] : undefined;
  if (legacyRedirect) {
    const next = new URLSearchParams(params);
    next.delete("category");
    const qs = next.toString();
    return <Navigate to={qs ? `${legacyRedirect}?${qs}` : legacyRedirect} replace />;
  }

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => {
      if (!v) next.delete(k);
      else next.set(k, v);
    });
    if (!("page" in patch)) next.delete("page");
    setParams(next);
  };

  return (
    <PageShell
      eyebrow={rootSlug ? (root?.name?.replace(/^MittiLok\s+/i, "") ?? "Shop") : "Shop"}
      title={title}
      text={`${totalCount} products · Search, filter, and grow your garden.`}
    >
      {rootSlug && children.length > 0 && (
        <div className="subcategory-chips" role="navigation" aria-label="Subcategories">
          <Link to={basePath} className={`chip${!subSlug ? " active" : ""}`}>All</Link>
          {children.map((child) => (
            <Link
              key={child.id}
              to={`${basePath}/${child.slug}`}
              className={`chip${subSlug === child.slug ? " active" : ""}`}
            >
              {child.name}
            </Link>
          ))}
        </div>
      )}

      <div className="shop-layout">
        <aside className="filters">
          <form onSubmit={(e) => { e.preventDefault(); update({ query: localQuery || null }); }}>
            <label>Search
              <input value={localQuery} onChange={(e) => setLocalQuery(e.target.value)} placeholder="Snake plant, orchid..." />
            </label>
          </form>
          {!rootSlug && (
            <label>Category
              <select
                value={legacyCategory}
                onChange={(e) => {
                  const slug = e.target.value;
                  if (slug && LEGACY_CATEGORY_REDIRECTS[slug]) {
                    navigate(LEGACY_CATEGORY_REDIRECTS[slug]);
                    return;
                  }
                  update({ category: slug || null });
                }}
              >
                <option value="">All</option>
                {tree.map((c) => (
                  <option key={c.id} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </label>
          )}
          {!rootSlug && (
            <label>Organics
              <select value={organic ? "1" : ""} onChange={(e) => update({ organic: e.target.value || null })}>
                <option value="">All products</option>
                <option value="1">Organic only</option>
              </select>
            </label>
          )}
          <label>Sort
            <select value={sort} onChange={(e) => update({ sort: e.target.value })}>
              <option value="featured">Featured</option>
              <option value="price-asc">Price Low to High</option>
              <option value="price-desc">Price High to Low</option>
              <option value="rating">Rating</option>
              <option value="newest">Newest</option>
            </select>
          </label>
        </aside>
        <div>
          {loading ? <div className="skeleton grid" /> : (
            products.length
              ? <div className="product-grid">{products.map((p) => <ProductCard key={p.id} product={p} />)}</div>
              : <p>No products found. Try another filter.</p>
          )}
          {totalPages > 1 && (
            <div className="button-row" style={{ marginTop: 24 }}>
              <button className="btn secondary" disabled={page <= 1} onClick={() => update({ page: String(page - 1) })}>Previous</button>
              <span>Page {page} of {totalPages}</span>
              <button className="btn secondary" disabled={page >= totalPages} onClick={() => update({ page: String(page + 1) })}>Next</button>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
