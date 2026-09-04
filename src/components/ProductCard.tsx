import { Heart, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { mediaUrl } from "../lib/api";
import { money } from "../lib/format";
import type { ProductListDto } from "../types";
import { SectionHeader } from "./ui";

export function ProductCard({ product }: { product: ProductListDto }) {
  const { addToCart } = useCart();
  const { has, toggleWishlist } = useWishlist();
  const price = product.sellingPrice || product.price;
  const image = mediaUrl(product.thumbnail);

  return (
    <article className="product-card">
      <Link to={`/product/${product.slug}`} className="product-image">
        <img src={image} alt={product.name} loading="lazy" />
        {product.isBestSeller && <span className="pill">Best Seller</span>}
        {!product.isBestSeller && product.isNewArrival && <span className="pill">New</span>}
        {!product.isBestSeller && !product.isNewArrival && product.isOrganic && <span className="pill">Organic</span>}
      </Link>
      <div className="product-body">
        <div className="rating">
          <Star size={15} fill="currentColor" /> {product.averageRating?.toFixed(1) ?? "—"}{" "}
          <span>({product.reviewCount})</span>
        </div>
        <Link to={`/product/${product.slug}`}><h3>{product.name}</h3></Link>
        <p>{product.categoryName ?? "MittiLok"}</p>
        <div className="price">
          <strong>{money(price)}</strong>
          {product.mrp > price && <span>{money(product.mrp)}</span>}
        </div>
        <div className="card-actions">
          <button
            className="btn compact"
            onClick={() => void addToCart({
              productId: product.id,
              productName: product.name,
              slug: product.slug,
              imageUrl: product.thumbnail,
              unitPrice: price,
              mrp: product.mrp,
            })}
          >
            Add to Cart
          </button>
          <button
            className={`icon-btn ${has(product.id) ? "active" : ""}`}
            onClick={() => void toggleWishlist({
              id: product.id,
              name: product.name,
              slug: product.slug,
              thumbnail: product.thumbnail,
              sellingPrice: price,
              mrp: product.mrp,
            })}
            aria-label="Toggle wishlist"
          >
            <Heart size={18} />
          </button>
        </div>
      </div>
    </article>
  );
}

export function ProductRail({ title, items, cta = "/nursery" }: { title: string; items: ProductListDto[]; cta?: string }) {
  if (!items.length) return null;
  return (
    <section className="section">
      <SectionHeader eyebrow="MittiLok picks" title={title} cta={cta} />
      <div className="product-rail">
        {items.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  );
}
