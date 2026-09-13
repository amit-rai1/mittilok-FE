import { SlidersHorizontal, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import { api, buildQuery } from "../lib/api";
import { usePageTitle } from "../lib/format";
import type { CategoryTreeDto, PagedResult, ProductListDto } from "../types";

const LEGACY_CATEGORY_REDIRECTS: Record<string, string> = {
  nursery: "/nursery",
  "organic-gardening-products": "/organics",
  organics: "/organics",
};

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "bestselling", label: "Best selling" },
  { value: "price-asc", label: "Price, low to high" },
  { value: "price-desc", label: "Price, high to low" },
  { value: "rating", label: "Top rated" },
  { value: "newest", label: "Newest" },
];

const PRICE_BANDS: { id: string; label: string; min?: number; max?: number }[] = [
  { id: "", label: "Any price" },
  { id: "0-299", label: "Under ₹300", max: 299 },
  { id: "300-699", label: "₹300 – ₹699", min: 300, max: 699 },
  { id: "700-1499", label: "₹700 – ₹1,499", min: 700, max: 1499 },
  { id: "1500+", label: "₹1,500 & above", min: 1500 },
];

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
  const stock = params.get("stock") ?? "";
  const priceBand = params.get("price") ?? "";
  const sort = params.get("sort") ?? "featured";
  const page = Number(params.get("page") ?? "1") || 1;

  const [tree, setTree] = useState<CategoryTreeDto[]>([]);
  const [products, setProducts] = useState<ProductListDto[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [draftOrganic, setDraftOrganic] = useState(organic);
  const [draftStock, setDraftStock] = useState(stock);
  const [draftPrice, setDraftPrice] = useState(priceBand);
  const [draftQuery, setDraftQuery] = useState(query);

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
    ?? root?.name?.replace(/^MittiLok\s+/i, "")
    ?? (organic ? "Organics" : "Plants, Pots & Gardening Essentials");

  usePageTitle(rootSlug ? (activeChild?.name ?? root?.name ?? rootSlug) : (legacyCategory || "Shop"));

  useEffect(() => {
    void api<CategoryTreeDto[]>("/categories/tree?activeOnly=true", { auth: false })
      .then(setTree)
      .catch(() => setTree([]));
  }, []);

  useEffect(() => {
    setDraftQuery(query);
    setDraftOrganic(organic);
    setDraftStock(stock);
    setDraftPrice(priceBand);
  }, [query, organic, stock, priceBand]);

  useEffect(() => {
    const open = filterOpen || sortOpen;
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [filterOpen, sortOpen]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const sortMap: Record<string, { sortBy?: string; sortDesc?: boolean }> = {
      featured: { sortBy: "featured", sortDesc: true },
      bestselling: { sortBy: "bestseller", sortDesc: true },
      "price-asc": { sortBy: "price", sortDesc: false },
      "price-desc": { sortBy: "price", sortDesc: true },
      rating: { sortBy: "rating", sortDesc: true },
      newest: { sortBy: "createdAt", sortDesc: true },
    };
    const sortOpts = sortMap[sort] ?? sortMap.featured;
    const band = PRICE_BANDS.find((b) => b.id === priceBand);

    if (rootSlug && tree.length === 0) {
      return () => {
        cancelled = true;
      };
    }

    api<PagedResult<ProductListDto>>(`/products${buildQuery({
      query: query || undefined,
      categoryId,
      isOrganic: organic || undefined,
      stock: stock || undefined,
      minPrice: band?.min,
      maxPrice: band?.max,
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
  }, [query, categoryId, organic, stock, priceBand, sort, page, rootSlug, tree.length]);

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

  const applyFilters = () => {
    update({
      query: draftQuery.trim() || null,
      organic: draftOrganic ? "1" : null,
      stock: draftStock || null,
      price: draftPrice || null,
    });
    setFilterOpen(false);
  };

  const clearFilters = () => {
    setDraftQuery("");
    setDraftOrganic(false);
    setDraftStock("");
    setDraftPrice("");
    update({ query: null, organic: null, stock: null, price: null });
    setFilterOpen(false);
  };

  const activeFilterCount = [organic, stock, priceBand, query].filter(Boolean).length;
  const sortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Featured";

  const filterFields = (
    <div className="sheet-body">
      <label>
        Search
        <input
          value={draftQuery}
          onChange={(e) => setDraftQuery(e.target.value)}
          placeholder="Snake plant, orchid..."
        />
      </label>
      {!rootSlug && (
        <label>
          Category
          <select
            value={legacyCategory}
            onChange={(e) => {
              const slug = e.target.value;
              if (slug && LEGACY_CATEGORY_REDIRECTS[slug]) {
                navigate(LEGACY_CATEGORY_REDIRECTS[slug]);
                setFilterOpen(false);
                return;
              }
              update({ category: slug || null });
            }}
          >
            <option value="">All</option>
            {tree.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <fieldset className="filter-fieldset">
        <legend>Availability</legend>
        <label className="check-row">
          <input type="checkbox" checked={draftStock === "available"} onChange={(e) => setDraftStock(e.target.checked ? "available" : "")} />
          In stock
        </label>
        <label className="check-row">
          <input type="checkbox" checked={draftOrganic} onChange={(e) => setDraftOrganic(e.target.checked)} />
          Organic only
        </label>
      </fieldset>
      <fieldset className="filter-fieldset">
        <legend>Price</legend>
        {PRICE_BANDS.map((band) => (
          <label key={band.id || "any"} className="check-row">
            <input
              type="radio"
              name="price-band"
              checked={draftPrice === band.id}
              onChange={() => setDraftPrice(band.id)}
            />
            {band.label}
          </label>
        ))}
      </fieldset>
    </div>
  );

  return (
    <section className="page-shell collection-page">
      <div className="collection-intro">
        <p className="eyebrow">{rootSlug ? (root?.name?.replace(/^MittiLok\s+/i, "") ?? "Shop") : "Shop"}</p>
        <h1>{title}</h1>
        <p className="collection-count">{totalCount} products</p>
      </div>

      {rootSlug && children.length > 0 && (
        <div className="subcategory-chips" role="navigation" aria-label="Subcategories">
          <Link to={basePath} className={`chip${!subSlug ? " active" : ""}`}>
            All
          </Link>
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

      <div className="catalog-toolbar" role="toolbar" aria-label="Catalog tools">
        <button type="button" className="toolbar-btn" onClick={() => setFilterOpen(true)}>
          <SlidersHorizontal size={16} />
          Filter{activeFilterCount ? ` (${activeFilterCount})` : ""}
        </button>
        <button type="button" className="toolbar-btn" onClick={() => setSortOpen(true)}>
          Sort by · {sortLabel}
        </button>
        <span className="toolbar-count desktop-only">{totalCount} products</span>
      </div>

      <div className="shop-layout shop-layout-ugaoo">
        <aside className="filters desktop-filters">
          <h2>Filters</h2>
          {filterFields}
          <div className="sheet-actions">
            <button type="button" className="btn secondary" onClick={clearFilters}>
              Clear
            </button>
            <button type="button" className="btn primary" onClick={applyFilters}>
              Apply
            </button>
          </div>
        </aside>

        <div>
          {loading ? (
            <div className="skeleton grid" />
          ) : products.length ? (
            <div className="product-grid">{products.map((p) => <ProductCard key={p.id} product={p} />)}</div>
          ) : (
            <p className="empty-inline">No products found. Try another filter.</p>
          )}
          {totalPages > 1 && (
            <div className="button-row pagination-row">
              <button className="btn secondary" disabled={page <= 1} onClick={() => update({ page: String(page - 1) })}>
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button className="btn secondary" disabled={page >= totalPages} onClick={() => update({ page: String(page + 1) })}>
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {filterOpen && (
        <div className="sheet-root" role="dialog" aria-modal="true" aria-label="Filters">
          <button type="button" className="sheet-backdrop" aria-label="Close filters" onClick={() => setFilterOpen(false)} />
          <div className="bottom-sheet">
            <div className="sheet-head">
              <strong>Filter</strong>
              <button type="button" className="icon-btn" onClick={() => setFilterOpen(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            {filterFields}
            <div className="sheet-actions">
              <button type="button" className="btn secondary" onClick={clearFilters}>
                Clear
              </button>
              <button type="button" className="btn primary" onClick={applyFilters}>
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {sortOpen && (
        <div className="sheet-root" role="dialog" aria-modal="true" aria-label="Sort">
          <button type="button" className="sheet-backdrop" aria-label="Close sort" onClick={() => setSortOpen(false)} />
          <div className="bottom-sheet sort-sheet">
            <div className="sheet-head">
              <strong>Sort by</strong>
              <button type="button" className="icon-btn" onClick={() => setSortOpen(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <div className="sort-options">
              {SORT_OPTIONS.map((opt) => (
                <label key={opt.value} className={`sort-option${sort === opt.value ? " active" : ""}`}>
                  <input
                    type="radio"
                    name="sort"
                    checked={sort === opt.value}
                    onChange={() => {
                      update({ sort: opt.value });
                      setSortOpen(false);
                    }}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
