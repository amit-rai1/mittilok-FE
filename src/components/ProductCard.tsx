import { Heart, Star } from "lucide-react";
import { useRef, useState } from "react";
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
  const [added, setAdded] = useState(false);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const price = product.sellingPrice || product.price;
  const image = mediaUrl(product.thumbnail);
  const outOfStock = (product.stockQuantity ?? 0) <= 0;
  const discount =
    product.discountPercent > 0
      ? Math.round(product.discountPercent)
      : product.mrp > price
        ? Math.round(((product.mrp - price) / product.mrp) * 100)
        : 0;
  const wished = has(product.id);

  return (
    <article className={`product-card${outOfStock ? " is-oos" : ""}`}>
      <div className="product-image-wrap">
        <Link to={`/product/${product.slug}`} className="product-image">
          <img src={image} alt={product.name} loading="lazy" />
          {outOfStock && <span className="oos-overlay">Out of stock</span>}
        </Link>
        <div className="product-badges">
          {product.isBestSeller && <span className="pill">Bestseller</span>}
          {!product.isBestSeller && product.isNewArrival && <span className="pill pill-new">New</span>}
          {product.isOrganic && <span className="pill pill-organic">Organic</span>}
          {discount > 0 && <span className="pill pill-off">{discount}% OFF</span>}
        </div>
        <button
          type="button"
          className={`wishlist-fab${wished ? " active" : ""}`}
          onClick={() =>
            void toggleWishlist({
              id: product.id,
              name: product.name,
              slug: product.slug,
              thumbnail: product.thumbnail,
              sellingPrice: price,
              mrp: product.mrp,
            })
          }
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart size={16} fill={wished ? "currentColor" : "none"} />
        </button>
      </div>
      <div className="product-body">
        <div className="rating">
          <Star size={13} fill="currentColor" />
          <span className="rating-value">{product.averageRating?.toFixed(1) ?? "—"}</span>
          <span className="rating-count">| {product.reviewCount}</span>
        </div>
        <Link to={`/product/${product.slug}`}>
          <h3>{product.name}</h3>
        </Link>
        <p className="product-tagline">{product.categoryName ?? "MittiLok Nursery"}</p>
        <div className="price">
          <strong>{money(price)}</strong>
          {product.mrp > price && <span>{money(product.mrp)}</span>}
          {discount > 0 && <em className="price-off">{discount}% off</em>}
        </div>
        <button
          type="button"
          className="btn compact full card-cta"
          disabled={outOfStock}
          onClick={() => {
            void addToCart({
              productId: product.id,
              productName: product.name,
              slug: product.slug,
              imageUrl: product.thumbnail,
              unitPrice: price,
              mrp: product.mrp,
            }).then(() => {
              setAdded(true);
              if (addedTimer.current) clearTimeout(addedTimer.current);
              addedTimer.current = setTimeout(() => setAdded(false), 2500);
            }).catch(() => setAdded(false));
          }}
        >
          {outOfStock ? "Sold out" : added ? "Added" : "Add to Cart"}
        </button>
      </div>
    </article>
  );
}

export function ProductRail({
  title,
  items,
  cta = "/nursery",
  eyebrow = "MittiLok picks",
}: {
  title: string;
  items: ProductListDto[];
  cta?: string;
  eyebrow?: string;
}) {
  if (!items.length) return null;
  return (
    <section className="section">
      <SectionHeader eyebrow={eyebrow} title={title} cta={cta} />
      <div className="product-rail">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
