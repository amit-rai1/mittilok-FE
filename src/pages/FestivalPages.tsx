import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api, mediaUrl } from "../lib/api";
import { usePageTitle } from "../lib/format";

export type FestivalVariant = { id: number; name: string; price: number; stock: number };
export type FestivalProduct = {
  id: number;
  productId: number;
  productName: string;
  productSlug: string;
  thumbnail?: string | null;
  basePrice: number;
  festivalPrice?: number | null;
  variants: FestivalVariant[];
};
export type FestivalCampaign = {
  id: number;
  name: string;
  slug: string;
  banner?: string | null;
  description?: string | null;
  offerStrip?: string | null;
  bookingStart: string;
  bookingEnd: string;
  deliveryStart?: string | null;
  deliveryEnd?: string | null;
  advancePercent: number;
  isBookingOpen: boolean;
  products: FestivalProduct[];
};
export type FestivalPot = { id: number; name: string; image?: string | null; priceDelta: number; stock: number };
export type FestivalAddon = { id: number; name: string; description?: string | null; image?: string | null; price: number };
export type FestivalPrice = {
  unitPrice: number;
  subtotal: number;
  grandTotal: number;
  advancePercent: number;
  advanceRequired: number;
  balanceDue: number;
  error?: string | null;
};

type BookingState = { bookingNumber?: string; advancePaid?: number; balanceDue?: number; grandTotal?: number };

export function useCountdown(targetIso?: string | null) {
  const target = targetIso ? new Date(targetIso).getTime() : 0;
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!target) return;
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [target]);
  return useMemo(() => {
    const diff = Math.max(0, target - now);
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return { days, hours, mins, secs, expired: diff <= 0 };
  }, [target, now]);
}

function money(n: number) {
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function formatWindow(start?: string | null, end?: string | null) {
  if (!start && !end) return null;
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  if (start && end) return `${fmt(start)} – ${fmt(end)}`;
  return fmt(start || end || "");
}

function CountdownChips({ target }: { target?: string | null }) {
  const c = useCountdown(target);
  if (!target || c.expired) return null;
  const parts = [
    [c.days, "Days"],
    [c.hours, "Hrs"],
    [c.mins, "Min"],
    [c.secs, "Sec"],
  ] as const;
  return (
    <div className="festival-countdown" aria-label="Booking closes in">
      {parts.map(([value, label]) => (
        <div key={label} className="festival-countdown-chip">
          <strong>{String(value).padStart(2, "0")}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

function CampaignCard({ campaign }: { campaign: FestivalCampaign }) {
  return (
    <Link to={`/festival/${campaign.slug}`} className="festival-campaign-card">
      <div className="festival-campaign-media">
        {campaign.banner ? <img src={mediaUrl(campaign.banner)} alt="" /> : <div className="skeleton" />}
        <span className={`festival-badge ${campaign.isBookingOpen ? "open" : "closed"}`}>
          {campaign.isBookingOpen ? "Booking open" : "Closed"}
        </span>
      </div>
      <div className="festival-campaign-body">
        <h3>{campaign.name}</h3>
        <p>{campaign.offerStrip || "Pre-book plants with pots & gifts"}</p>
        {campaign.isBookingOpen ? <CountdownChips target={campaign.bookingEnd} /> : null}
        <span className="btn primary festival-card-cta">{campaign.isBookingOpen ? "Pre-book now" : "View campaign"}</span>
      </div>
    </Link>
  );
}

export function FestivalListPage() {
  usePageTitle("Festival Pre-Booking");
  const [items, setItems] = useState<FestivalCampaign[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api<FestivalCampaign[]>("/festivals", { auth: false })
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : "Unable to load festivals"));
  }, []);

  return (
    <section className="festival-list page-shell">
      <header className="festival-list-hero">
        <p className="eyebrow">Gifting</p>
        <h1>Festival Pre-Booking</h1>
        <p className="festival-lead">Reserve festival plants with pot & gift options. Pay a small advance to confirm your booking.</p>
      </header>
      {error && <p className="auth-error">{error}</p>}
      <div className="festival-campaign-grid">
        {items.map((c) => (
          <CampaignCard key={c.id} campaign={c} />
        ))}
      </div>
      {items.length === 0 && !error && <p className="empty-inline">No live festival campaigns right now.</p>}
    </section>
  );
}

export function FestivalLandingPage() {
  const { slug } = useParams();
  const [campaign, setCampaign] = useState<FestivalCampaign | null>(null);
  const [error, setError] = useState("");
  usePageTitle(campaign?.name ?? "Festival");
  const delivery = formatWindow(campaign?.deliveryStart, campaign?.deliveryEnd);

  useEffect(() => {
    if (!slug) return;
    api<FestivalCampaign>(`/festivals/${slug}`, { auth: false })
      .then(setCampaign)
      .catch((e) => setError(e instanceof Error ? e.message : "Campaign not found"));
  }, [slug]);

  if (error) {
    return (
      <section className="page-shell">
        <p className="auth-error">{error}</p>
      </section>
    );
  }
  if (!campaign) {
    return (
      <section className="page-shell">
        <div className="skeleton grid" />
      </section>
    );
  }

  return (
    <div className="festival-landing">
      <section
        className="hero hero-home hero-art-led festival-hero"
        style={{
          backgroundImage: `linear-gradient(105deg, rgba(8,42,20,.72), rgba(8,42,20,.28)), url("${mediaUrl(campaign.banner)}")`,
        }}
      >
        <div className="hero-content">
          <p className="eyebrow">Pre-booking {campaign.isBookingOpen ? "open" : "closed"}</p>
          <h1>{campaign.name}</h1>
          {campaign.offerStrip && <p className="festival-offer">{campaign.offerStrip}</p>}
          <CountdownChips target={campaign.isBookingOpen ? campaign.bookingEnd : null} />
          {delivery && <p className="festival-delivery-line">Delivery window: {delivery}</p>}
          <div className="button-row">
            <a className="btn primary" href="#festival-products">
              Book now
            </a>
            <Link className="btn secondary" to="/festival">
              All festivals
            </Link>
          </div>
        </div>
      </section>

      <section className="page-shell festival-products" id="festival-products">
        {campaign.description && <p className="festival-desc">{campaign.description}</p>}
        <h2>Choose a plant</h2>
        <div className="festival-product-grid">
          {(campaign.products ?? []).map((p) => {
            const price = p.festivalPrice ?? p.basePrice;
            return (
              <Link key={p.id} to={`/festival/${campaign.slug}/book/${p.productSlug}`} className="festival-product-card">
                <div className="festival-product-media">
                  {p.thumbnail ? <img src={mediaUrl(p.thumbnail)} alt="" /> : <div className="skeleton" />}
                </div>
                <div className="festival-product-body">
                  <h3>{p.productName}</h3>
                  <p className="price">
                    <strong>{money(price)}</strong>
                    {p.festivalPrice != null && p.festivalPrice < p.basePrice ? (
                      <span className="festival-mrp">{money(p.basePrice)}</span>
                    ) : null}
                  </p>
                  <span className="btn primary">Customise & book</span>
                </div>
              </Link>
            );
          })}
        </div>
        {(campaign.products ?? []).length === 0 && <p className="empty-inline">Plants will appear here soon.</p>}
      </section>
    </div>
  );
}

export function FestivalBookPage() {
  const { slug, productSlug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [campaign, setCampaign] = useState<FestivalCampaign | null>(null);
  const [pots, setPots] = useState<FestivalPot[]>([]);
  const [addons, setAddons] = useState<FestivalAddon[]>([]);
  const [variantId, setVariantId] = useState<number | "">("");
  const [potId, setPotId] = useState<number | "">("");
  const [addonIds, setAddonIds] = useState<number[]>([]);
  const [qty, setQty] = useState(1);
  const [price, setPrice] = useState<FestivalPrice | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    addressLine1: "",
    city: "",
    pincode: "",
    preferredDeliverySlot: "",
    notes: "",
    markAdvancePaid: true,
  });

  const product = campaign?.products.find((p) => p.productSlug === productSlug);
  usePageTitle(product?.productName ?? "Book festival plant");
  const delivery = formatWindow(campaign?.deliveryStart, campaign?.deliveryEnd);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location.pathname + location.search } });
    }
  }, [authLoading, isAuthenticated, navigate, location.pathname, location.search]);

  useEffect(() => {
    if (!slug || !isAuthenticated) return;
    Promise.all([
      api<FestivalCampaign>(`/festivals/${slug}`, { auth: false }),
      api<FestivalPot[]>("/festivals/options/pots", { auth: false }),
      api<FestivalAddon[]>("/festivals/options/addons", { auth: false }),
    ])
      .then(([c, p, a]) => {
        setCampaign(c);
        setPots(p);
        setAddons(a);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Unable to load"));
  }, [slug, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !campaign || !product) return;
    const t = window.setTimeout(() => {
      void api<FestivalPrice>("/festivals/price-preview", {
        method: "POST",
        auth: false,
        body: {
          campaignId: campaign.id,
          productId: product.productId,
          variantId: variantId || null,
          potOptionId: potId || null,
          addonIds,
          quantity: qty,
        },
      })
        .then(setPrice)
        .catch((e) => setError(e instanceof Error ? e.message : "Price error"));
    }, 200);
    return () => window.clearTimeout(t);
  }, [isAuthenticated, campaign, product, variantId, potId, addonIds, qty]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isAuthenticated || !campaign || !product) return;
    if (!campaign.isBookingOpen) {
      setError("Booking window is closed.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const booking = await api<BookingState>("/festivals/book", {
        method: "POST",
        body: {
          campaignId: campaign.id,
          productId: product.productId,
          variantId: variantId || null,
          potOptionId: potId || null,
          addonIds,
          quantity: qty,
          ...form,
        },
      });
      navigate(`/festival/${slug}/confirmation`, { state: booking });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Booking failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (!campaign || !product) {
    return (
      <section className="page-shell">
        {error ? <p className="auth-error">{error}</p> : <div className="skeleton grid" />}
      </section>
    );
  }

  const selectedPot = typeof potId === "number" ? pots.find((p) => p.id === potId) : undefined;
  const potOos = !!selectedPot && selectedPot.stock < qty;

  return (
    <section className="page-shell festival-book">
      <p className="eyebrow">{campaign.name}</p>
      <h1>{product.productName}</h1>
      {delivery && <p className="festival-delivery-line muted">Delivery: {delivery}</p>}
      {product.thumbnail && <img className="festival-book-hero-img" src={mediaUrl(product.thumbnail)} alt="" />}

      <form className="festival-book-form" onSubmit={(e) => void onSubmit(e)}>
        {product.variants.length > 0 && (
          <section className="festival-step">
            <h2>
              <span className="festival-step-num">1</span> Size
            </h2>
            <label>
              <select value={variantId} onChange={(e) => setVariantId(e.target.value ? Number(e.target.value) : "")}>
                <option value="">Default</option>
                {product.variants.map((v) => (
                  <option key={v.id} value={v.id} disabled={v.stock < qty}>
                    {v.name} · {money(v.price)} {v.stock < qty ? "(OOS)" : ""}
                  </option>
                ))}
              </select>
            </label>
          </section>
        )}

        <section className="festival-step">
          <h2>
            <span className="festival-step-num">2</span> Pot
          </h2>
          <div className="festival-option-grid">
            {pots.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`festival-option-tile${potId === p.id ? " selected" : ""}`}
                disabled={p.stock < qty}
                onClick={() => setPotId(p.id)}
              >
                {p.image ? <img src={mediaUrl(p.image)} alt="" /> : <div className="festival-option-placeholder" />}
                <strong>{p.name}</strong>
                <small>+{money(p.priceDelta)}</small>
                {p.stock < qty ? <small className="oos">Out of stock</small> : null}
              </button>
            ))}
          </div>
          {potOos && <p className="auth-error">Selected pot is out of stock. Please choose another pot.</p>}
        </section>

        <section className="festival-step">
          <h2>
            <span className="festival-step-num">3</span> Add-ons
          </h2>
          <div className="festival-addon-list">
            {addons.map((a) => {
              const checked = addonIds.includes(a.id);
              return (
                <label key={a.id} className={`festival-addon-row${checked ? " selected" : ""}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => setAddonIds((prev) => (checked ? prev.filter((id) => id !== a.id) : [...prev, a.id]))}
                  />
                  {a.image ? <img src={mediaUrl(a.image)} alt="" /> : <span className="festival-option-placeholder sm" />}
                  <span className="festival-addon-meta">
                    <strong>{a.name}</strong>
                  </span>
                  <span className="festival-addon-price">{money(a.price)}</span>
                </label>
              );
            })}
            {addons.length === 0 && <p className="empty-inline">No add-ons for this festival.</p>}
          </div>
        </section>

        <section className="festival-step">
          <h2>
            <span className="festival-step-num">4</span> Quantity
          </h2>
          <div className="festival-qty-row">
            <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))}>
              −
            </button>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
              aria-label="Quantity"
            />
            <button type="button" aria-label="Increase quantity" onClick={() => setQty((q) => q + 1)}>
              +
            </button>
          </div>
        </section>

        <section className="festival-step">
          <h2>
            <span className="festival-step-num">5</span> Delivery details
          </h2>
          <div className="festival-fields">
            <input required placeholder="Full name" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
            <input required placeholder="Phone" value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} />
            <input placeholder="Email" value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} />
            <input placeholder="Address" value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} />
            <div className="festival-fields-row">
              <input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              <input placeholder="Pincode" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
            </div>
            <input
              placeholder="Preferred delivery slot"
              value={form.preferredDeliverySlot}
              onChange={(e) => setForm({ ...form, preferredDeliverySlot: e.target.value })}
            />
            <label className="festival-check">
              <input type="checkbox" checked={form.markAdvancePaid} onChange={(e) => setForm({ ...form, markAdvancePaid: e.target.checked })} />
              Mark advance as paid now (MVP confirm)
            </label>
          </div>
        </section>

        {error && <p className="auth-error">{error}</p>}

        <div className="festival-sticky-bar">
          <div className="festival-sticky-price">
            {price?.error ? (
              <p className="auth-error">{price.error}</p>
            ) : price ? (
              <>
                <small>Advance ({price.advancePercent}%)</small>
                <strong>{money(price.advanceRequired)}</strong>
                <span>Total {money(price.grandTotal)} · Balance {money(price.balanceDue)}</span>
              </>
            ) : (
              <small>Calculating…</small>
            )}
          </div>
          <button className="btn primary" disabled={submitting || !campaign.isBookingOpen || !!price?.error || potOos}>
            {submitting ? "Booking…" : `Confirm · Pay ${price ? money(price.advanceRequired) : "advance"}`}
          </button>
        </div>
      </form>
    </section>
  );
}

export function FestivalConfirmationPage() {
  usePageTitle("Booking confirmed");
  const { state } = useLocation() as { state?: BookingState };
  return (
    <section className="page-shell festival-confirm">
      <div className="festival-confirm-card">
        <p className="eyebrow">Festival pre-booking</p>
        <h1>Booking confirmed</h1>
        {state?.bookingNumber ? (
          <dl className="festival-confirm-stats">
            <div>
              <dt>Booking ID</dt>
              <dd>{state.bookingNumber}</dd>
            </div>
            <div>
              <dt>Grand total</dt>
              <dd>{money(state.grandTotal ?? 0)}</dd>
            </div>
            <div>
              <dt>Advance paid</dt>
              <dd>{money(state.advancePaid ?? 0)}</dd>
            </div>
            <div>
              <dt>Balance due</dt>
              <dd>{money(state.balanceDue ?? 0)}</dd>
            </div>
          </dl>
        ) : (
          <p>Your festival pre-booking was received.</p>
        )}
        <div className="button-row">
          <Link className="btn primary" to="/orders#festival-bookings">
            View my bookings
          </Link>
          <Link className="btn secondary" to="/festival">
            Back to festivals
          </Link>
        </div>
      </div>
    </section>
  );
}
