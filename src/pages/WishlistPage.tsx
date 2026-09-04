import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import { EmptyState, PageShell } from "../components/ui";
import { useWishlist } from "../context/WishlistContext";
import { api, buildQuery, mediaUrl } from "../lib/api";
import { money, usePageTitle } from "../lib/format";
import type { PagedResult, ProductListDto } from "../types";

export default function WishlistPage() {
  usePageTitle("Wishlist");
  const { items, ids, toggleWishlist } = useWishlist();
  const [products, setProducts] = useState<ProductListDto[]>([]);

  useEffect(() => {
    if (!ids.length) {
      setProducts([]);
      return;
    }
    // Fetch products page and filter client-side for guest wishlist ids without slug snapshots
    api<PagedResult<ProductListDto>>(`/products${buildQuery({ pageSize: 100 })}`, { auth: false })
      .then((res) => setProducts((res.items ?? []).filter((p) => ids.includes(p.id))))
      .catch(() => setProducts([]));
  }, [ids]);

  const hasServerSnapshots = items.some((i) => i.slug);

  return (
    <PageShell eyebrow="Wishlist" title="Plants you love" text={ids.length ? "Move favorites to cart whenever your garden is ready." : "Save plants you love and find them here later."}>
      {!ids.length ? (
        <EmptyState text="Save plants you love and find them here later." action="Browse Plants" to="/shop" />
      ) : products.length ? (
        <div className="product-grid">{products.map((p) => <ProductCard key={p.id} product={p} />)}</div>
      ) : hasServerSnapshots ? (
        <div className="product-grid">
          {items.map((item) => (
            <article className="product-card" key={item.id}>
              <Link to={item.slug ? `/product/${item.slug}` : "/shop"} className="product-image">
                <img src={mediaUrl(item.thumbnail)} alt={item.productName} />
              </Link>
              <div className="product-body">
                <Link to={item.slug ? `/product/${item.slug}` : "/shop"}><h3>{item.productName}</h3></Link>
                <div className="price"><strong>{money(item.sellingPrice)}</strong><span>{money(item.mrp)}</span></div>
                <button className="btn compact" onClick={() => void toggleWishlist({ id: item.productId })}>Remove</button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p>Loading wishlist...</p>
      )}
    </PageShell>
  );
}
