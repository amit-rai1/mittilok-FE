import { ChevronLeft, ChevronRight, Leaf, MessageCircle, Mic, PackageCheck, ShieldCheck, Sparkles, Sprout, Star, Trees, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ProductRail } from "../components/ProductCard";
import { SectionHeader } from "../components/ui";
import { api, buildQuery, mediaUrl } from "../lib/api";
import { usePageTitle } from "../lib/format";
import type { BannerDto, CategoryTreeDto, HomepageSectionDto, PagedResult, ProductListDto, ReviewDto } from "../types";

function TrustBand() {
  const items = [
    [Leaf, "Healthy Plants"],
    [PackageCheck, "Secure Packaging"],
    [Truck, "Delivery Across India"],
    [MessageCircle, "Gardening Support"],
    [ShieldCheck, "Secure Payments"],
  ] as const;
  return (
    <section className="trust-band">
      {items.map(([Icon, label]) => (
        <div key={label}><Icon /><span>{label}</span></div>
      ))}
    </section>
  );
}

async function fetchProducts(params: Record<string, string | number | boolean | undefined>) {
  return api<PagedResult<ProductListDto>>(`/products${buildQuery(params)}`, { auth: false });
}

function VerticalCtaStrip() {
  const items = [
    {
      to: "/services/mali",
      icon: Sprout,
      title: "MittiLok Mali",
      text: "Book a plant-care visit for home, balcony, or office gardens.",
      action: "Book Mali",
    },
    {
      to: "/landscaping",
      icon: Trees,
      title: "MittiLok Landscaping",
      text: "Request a quote for gardens, lawns, and commercial greens.",
      action: "Get a quote",
    },
    {
      to: "/podcast",
      icon: Mic,
      title: "MittiLok Podcast",
      text: "Reserve the studio for plant conversations and green stories.",
      action: "Book studio",
    },
  ] as const;

  return (
    <section className="section vertical-cta-section">
      <SectionHeader eyebrow="Services" title="Grow beyond the shop" />
      <div className="vertical-cta-grid">
        {items.map(({ to, icon: Icon, title, text, action }) => (
          <Link key={to} to={to} className="vertical-cta-card">
            <span className="vertical-cta-icon"><Icon size={26} /></span>
            <div>
              <h3>{title}</h3>
              <p>{text}</p>
              <span>{action} →</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  usePageTitle("Bring Nature Home");
  const [banners, setBanners] = useState<BannerDto[]>([]);
  const [sections, setSections] = useState<HomepageSectionDto[]>([]);
  const [featured, setFeatured] = useState<ProductListDto[]>([]);
  const [bestSellers, setBestSellers] = useState<ProductListDto[]>([]);
  const [organic, setOrganic] = useState<ProductListDto[]>([]);
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [bannerRes, catRes, homeRes] = await Promise.all([
          api<BannerDto[]>("/content/banners", { auth: false }),
          api<CategoryTreeDto[]>("/categories/tree?activeOnly=true", { auth: false }),
          api<HomepageSectionDto[]>("/content/homepage", { auth: false }),
        ]);
        if (cancelled) return;
        setBanners(bannerRes.filter((b) => b.isActive).sort((a, b) => a.displayOrder - b.displayOrder));
        setSections(homeRes.filter((s) => s.isEnabled).sort((a, b) => a.displayOrder - b.displayOrder));

        const nursery = catRes.find((c) => c.slug === "nursery" || c.slug === "mittilok-nursery" || /nursery/i.test(c.name));
        const organicsCat = catRes.find((c) =>
          c.slug === "organic-gardening-products" || c.slug === "mittilok-organics" || /organic/i.test(c.name),
        );

        const [feat, best, org] = await Promise.all([
          fetchProducts({ isFeatured: true, categoryId: nursery?.id, pageSize: 8 }),
          fetchProducts({ isBestSeller: true, categoryId: nursery?.id, pageSize: 8 }),
          fetchProducts({ isOrganic: true, categoryId: organicsCat?.id, pageSize: 8 }),
        ]);
        if (cancelled) return;
        setFeatured(feat.items ?? []);
        setBestSellers(best.items ?? []);
        setOrganic(org.items ?? []);
        if (feat.items?.[0]) {
          try {
            const rev = await api<PagedResult<ReviewDto>>(`/reviews/product/${feat.items[0].id}?pageSize=6`, { auth: false });
            if (!cancelled) setReviews(rev.items ?? []);
          } catch { /* optional */ }
        }
      } catch {
        /* keep empty rails */
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const fallbackSlides = [
    { image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1800&q=80", title: "Bring Nature Home", subtitle: "Healthy Plants Delivered Across India", buttonText: "Shop Nursery", buttonLink: "/nursery" },
  ];
  const slides = banners.length
    ? banners.map((b) => ({ image: mediaUrl(b.image), title: b.title, subtitle: b.subtitle ?? "", buttonText: b.buttonText ?? "Shop Now", buttonLink: b.buttonLink ?? "/nursery" }))
    : fallbackSlides;
  const slide = slides[activeSlide % slides.length];

  useEffect(() => {
    const timer = window.setInterval(() => setActiveSlide((c) => (c + 1) % slides.length), 5000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const changeSlide = (direction: number) => setActiveSlide((c) => (c + direction + slides.length) % slides.length);

  return (
    <>
      <section className="hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(8,42,20,.78), rgba(8,42,20,.18)), url(${slide.image})` }}>
        <div className="hero-content">
          <p className="eyebrow">MittiLok Nursery</p>
          <h1 key={activeSlide}>{slide.title}</h1>
          <p>{slide.subtitle}</p>
          <div className="button-row">
            <Link className="btn primary" to={slide.buttonLink || "/nursery"}>{slide.buttonText || "Shop Nursery"}</Link>
            <Link className="btn ghost-light" to="/ai-plant-finder">Find Your Perfect Plant</Link>
          </div>
        </div>
        <Link className="finder-callout" to="/ai-plant-finder">
          <Sparkles />
          <strong>AI Plant Finder</strong>
          <span>Not sure which plant is right for you?</span>
          <b>Find Your Perfect Plant</b>
        </Link>
        <div className="hero-controls" aria-label="Hero slides">
          <button className="icon-btn hero-arrow" onClick={() => changeSlide(-1)} aria-label="Previous slide"><ChevronLeft size={20} /></button>
          <div className="hero-dots">
            {slides.map((_, index) => (
              <button key={index} className={`hero-dot ${index === activeSlide ? "active" : ""}`} onClick={() => setActiveSlide(index)} aria-label={`Show slide ${index + 1}`} />
            ))}
          </div>
          <button className="icon-btn hero-arrow" onClick={() => changeSlide(1)} aria-label="Next slide"><ChevronRight size={20} /></button>
        </div>
      </section>

      <TrustBand />

      {sections.map((section) => (
        <section className="section" key={section.id}>
          <SectionHeader eyebrow={section.sectionType || "Featured"} title={section.title} cta="/nursery" />
        </section>
      ))}

      <ProductRail title="Best Selling Plants" items={bestSellers.length ? bestSellers : featured} cta="/nursery" />
      <ProductRail title="Featured Nursery Picks" items={featured} cta="/nursery" />
      <ProductRail title="Organic Collection" items={organic} cta="/organics" />

      <VerticalCtaStrip />

      {reviews.length > 0 && (
        <section className="section">
          <SectionHeader eyebrow="Reviews" title="Verified plant stories" />
          <div className="review-grid">
            {reviews.map((review) => (
              <article key={review.id}>
                <div className="rating"><Star size={15} fill="currentColor" /> {review.rating}</div>
                <p>{review.comment ?? review.title}</p>
                <strong>{review.userName ?? "Customer"}</strong>
                {review.isVerifiedPurchase && <span>Verified purchase</span>}
              </article>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
