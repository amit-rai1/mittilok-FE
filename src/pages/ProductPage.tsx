import { Heart, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ProductRail } from "../components/ProductCard";
import { Metric, PageShell } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { api, buildQuery, mediaUrl } from "../lib/api";
import { money, usePageTitle } from "../lib/format";
import type { CreateReviewRequest, PagedResult, ProductDetailDto, ProductListDto, ReviewDto } from "../types";

export default function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, has } = useWishlist();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState<ProductDetailDto | null>(null);
  const [related, setRelated] = useState<ProductListDto[]>([]);
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [variantId, setVariantId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", comment: "" });
  const [reviewMsg, setReviewMsg] = useState("");

  usePageTitle(product?.name ?? "Product");

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setError("");
    api<ProductDetailDto>(`/products/slug/${slug}`, { auth: false })
      .then(async (p) => {
        if (cancelled) return;
        setProduct(p);
        setVariantId(p.variants[0]?.id ?? null);
        const [rel, rev] = await Promise.all([
          api<PagedResult<ProductListDto>>(`/products${buildQuery({ categoryId: p.categoryId, pageSize: 8 })}`, { auth: false }),
          api<PagedResult<ReviewDto>>(`/reviews/product/${p.id}?pageSize=20`, { auth: false }),
        ]);
        if (cancelled) return;
        setRelated((rel.items ?? []).filter((item) => item.id !== p.id).slice(0, 8));
        setReviews(rev.items ?? []);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message || "Product not found");
      });
    return () => { cancelled = true; };
  }, [slug]);

  if (error) {
    return <PageShell eyebrow="Product" title="Not found" text={error}><Link className="btn primary" to="/shop">Back to Shop</Link></PageShell>;
  }

  if (!product) {
    return <PageShell eyebrow="Product" title="Loading..." text="Fetching plant details."><div className="skeleton" /></PageShell>;
  }

  const variant = product.variants.find((v) => v.id === variantId);
  const price = variant?.price ?? product.sellingPrice ?? product.price;
  const mrp = variant?.mrp ?? product.mrp;
  const images = product.images?.length
    ? product.images.map((i) => mediaUrl(i.url))
    : [mediaUrl(product.thumbnail)];

  const cartPayload = {
    productId: product.id,
    variantId,
    productName: product.name,
    slug: product.slug,
    imageUrl: images[0],
    unitPrice: price,
    mrp,
    variantName: variant?.name,
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      const body: CreateReviewRequest = {
        productId: product.id,
        rating: reviewForm.rating,
        title: reviewForm.title || null,
        comment: reviewForm.comment || null,
      };
      await api("/reviews", { method: "POST", body });
      setReviewMsg("Thanks! Your review was submitted.");
      setReviewForm({ rating: 5, title: "", comment: "" });
      const rev = await api<PagedResult<ReviewDto>>(`/reviews/product/${product.id}?pageSize=20`, { auth: false });
      setReviews(rev.items ?? []);
    } catch (err) {
      setReviewMsg(err instanceof Error ? err.message : "Could not submit review");
    }
  };

  return (
    <PageShell eyebrow={product.categoryName ?? "Shop"} title={product.name} text={product.shortDescription ?? product.fullDescription ?? ""}>
      <div className="product-detail">
        <div className="gallery">{images.map((image) => <img key={image} src={image} alt={product.name} />)}</div>
        <div className="buy-panel">
          <div className="rating">
            <Star size={16} fill="currentColor" /> {product.averageRating?.toFixed(1) ?? "—"} from {product.reviewCount} reviews
          </div>
          <div className="price large">
            <strong>{money(price)}</strong>
            {mrp > price && <span>{money(mrp)}</span>}
          </div>
          {product.variants.length > 0 && (
            <label>Variant
              <select value={variantId ?? ""} onChange={(e) => setVariantId(Number(e.target.value))}>
                {product.variants.map((v) => <option key={v.id} value={v.id}>{v.name} — {money(v.price)}</option>)}
              </select>
            </label>
          )}
          <div className="button-row">
            <button className="btn primary" onClick={() => void addToCart(cartPayload)}>Add to Cart</button>
            <button
              className="btn secondary"
              onClick={async () => {
                await addToCart(cartPayload);
                navigate("/checkout?buyNow=1");
              }}
            >
              Buy Now
            </button>
            <button
              className={`icon-btn ${has(product.id) ? "active" : ""}`}
              onClick={() => void toggleWishlist({
                id: product.id,
                name: product.name,
                slug: product.slug,
                thumbnail: images[0],
                sellingPrice: price,
                mrp,
              })}
              aria-label="Add to wishlist"
            >
              <Heart />
            </button>
          </div>
          <div className="care-guide">
            <Metric label="Light" value={product.sunlightRequirement ?? "—"} />
            <Metric label="Water" value={product.waterRequirement ?? "—"} />
            <Metric label="Pot size" value={product.potSize ?? "—"} />
            <Metric label="Delivery" value={product.deliveryInfo ?? "3-6 days across India"} />
          </div>
          {product.fullDescription && <p className="note">{product.fullDescription}</p>}
          <Link className="btn full" to="/ai-plant-finder">Ask AI About This Plant</Link>
        </div>
      </div>

      <ProductRail title="Complete Your Garden" items={related} />

      <section className="section">
        <h2>Reviews</h2>
        <div className="review-grid">
          {reviews.length ? reviews.map((review) => (
            <article key={review.id}>
              <div className="rating"><Star size={15} fill="currentColor" /> {review.rating}</div>
              <p>{review.comment ?? review.title}</p>
              <strong>{review.userName ?? "Customer"}</strong>
            </article>
          )) : <p>No reviews yet.</p>}
        </div>
        <form className="form-grid" onSubmit={(e) => void submitReview(e)} style={{ marginTop: 24 }}>
          <label>Rating
            <select value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}>
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <input placeholder="Title" value={reviewForm.title} onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })} />
          <textarea placeholder="Your review" value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} />
          <button className="btn primary" type="submit">Submit review</button>
          {reviewMsg && <p>{reviewMsg}</p>}
        </form>
      </section>
    </PageShell>
  );
}
