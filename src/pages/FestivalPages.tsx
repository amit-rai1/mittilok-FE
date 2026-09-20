import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
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
export type FestivalAddon = { id: number; name: string; description?: string | null; price: number };
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
    <section className="page-shell">
      <p className="eyebrow">Gifting</p>
      <h1>Festival Pre-Booking</h1>
      <p>Reserve festival plants with pot & gift options. Pay a small advance to confirm.</p>
      {error && <p className="auth-error">{error}</p>}
      <div className="product-grid" style={{ marginTop: "1.5rem" }}>
        {items.map((c) => (
          <Link key={c.id} to={`/festival/${c.slug}`} className="product-card" style={{ textDecoration: "none", color: "inherit" }}>
            {c.banner ? <img src={mediaUrl(c.banner)} alt="" /> : <div className="skeleton" style={{ aspectRatio: "4/3" }} />}
            <div className="card-body">
              <h3>{c.name}</h3>
              <p>{c.offerStrip || "Pre-booking open"}</p>
              <span className="btn secondary" style={{ marginTop: 8 }}>
                {c.isBookingOpen ? "Book now" : "View campaign"}
              </span>
            </div>
          </Link>
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
  const countdown = useCountdown(campaign?.bookingEnd);

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
    <>
      <section
        className="hero hero-home hero-art-led"
        style={{
          backgroundImage: `linear-gradient(90deg, rgba(8,42,20,.45), rgba(8,42,20,.12)), url("${mediaUrl(campaign.banner)}")`,
          minHeight: 360,
        }}
      >
        <div className="hero-content">
          <p className="eyebrow">Pre-Booking {campaign.isBookingOpen ? "Open" : "Closed"}</p>
          <h1>{campaign.name}</h1>
          {campaign.offerStrip && <p>{campaign.offerStrip}</p>}
          <div className="button-row">
            <a className="btn primary" href="#festival-products">
              Book Now
            </a>
          </div>
          {!countdown.expired && (
            <p style={{ marginTop: "1rem", fontWeight: 700 }}>
              Closes in {countdown.days}d {countdown.hours}h {countdown.mins}m {countdown.secs}s
            </p>
          )}
        </div>
      </section>
      <section className="page-shell" id="festival-products">
        {campaign.description && <p>{campaign.description}</p>}
        <div className="product-grid">
          {(campaign.products ?? []).map((p) => {
            const price = p.festivalPrice ?? p.basePrice;
            return (
              <Link
                key={p.id}
                to={`/festival/${campaign.slug}/book/${p.productSlug}`}
                className="product-card"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                {p.thumbnail ? <img src={mediaUrl(p.thumbnail)} alt="" /> : <div className="skeleton" style={{ aspectRatio: "1" }} />}
                <div className="card-body">
                  <h3>{p.productName}</h3>
                  <p className="price">
                    <strong>{money(price)}</strong>
                  </p>
                  <span className="btn primary">Customise & book</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}

export function FestivalBookPage() {
  const { slug, productSlug } = useParams();
  const navigate = useNavigate();
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

  useEffect(() => {
    if (!slug) return;
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
  }, [slug]);

  useEffect(() => {
    if (!campaign || !product) return;
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
  }, [campaign, product, variantId, potId, addonIds, qty]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!campaign || !product) return;
    if (!campaign.isBookingOpen) {
      setError("Booking window is closed.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const booking = await api<BookingState>("/festivals/book", {
        method: "POST",
        auth: false,
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
      {product.thumbnail && (
        <img src={mediaUrl(product.thumbnail)} alt="" style={{ width: "100%", maxHeight: 280, objectFit: "cover", borderRadius: 16 }} />
      )}

      <form onSubmit={(e) => void onSubmit(e)} style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
        {product.variants.length > 0 && (
          <label>
            Size
            <select value={variantId} onChange={(e) => setVariantId(e.target.value ? Number(e.target.value) : "")}>
              <option value="">Default</option>
              {product.variants.map((v) => (
                <option key={v.id} value={v.id} disabled={v.stock < qty}>
                  {v.name} · {money(v.price)} {v.stock < qty ? "(OOS)" : ""}
                </option>
              ))}
            </select>
          </label>
        )}

        <fieldset>
          <legend>Pot</legend>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(120px,1fr))", gap: 8 }}>
            {pots.map((p) => (
              <button
                key={p.id}
                type="button"
                className={potId === p.id ? "btn primary" : "btn secondary"}
                disabled={p.stock < qty}
                onClick={() => setPotId(p.id)}
              >
                {p.name}
                <small style={{ display: "block" }}>+{money(p.priceDelta)}</small>
                {p.stock < qty ? <small>Out of stock</small> : null}
              </button>
            ))}
          </div>
          {potOos && <p className="auth-error">Selected pot is out of stock. Please choose another pot.</p>}
        </fieldset>

        <fieldset>
          <legend>Add-ons</legend>
          {addons.map((a) => {
            const checked = addonIds.includes(a.id);
            return (
              <label key={a.id} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => setAddonIds((prev) => (checked ? prev.filter((id) => id !== a.id) : [...prev, a.id]))}
                />
                {a.name} · {money(a.price)}
              </label>
            );
          })}
        </fieldset>

        <label>
          Quantity
          <input type="number" min={1} value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} />
        </label>

        <div
          className="summary"
          style={{ position: "sticky", bottom: 72, background: "#fff", border: "1px solid var(--line)", borderRadius: 12, padding: "1rem" }}
        >
          {price?.error ? <p className="auth-error">{price.error}</p> : null}
          {price && !price.error && (
            <>
              <p>
                Unit {money(price.unitPrice)} · Subtotal <strong>{money(price.subtotal)}</strong>
              </p>
              <p>
                Advance ({price.advancePercent}%) <strong>{money(price.advanceRequired)}</strong>
              </p>
              <p>Balance due later {money(price.balanceDue)}</p>
            </>
          )}
        </div>

        <h2>Delivery details</h2>
        <input required placeholder="Full name" value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
        <input required placeholder="Phone" value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} />
        <input placeholder="Email" value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} />
        <input placeholder="Address" value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} />
        <input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        <input placeholder="Pincode" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
        <input
          placeholder="Preferred delivery slot"
          value={form.preferredDeliverySlot}
          onChange={(e) => setForm({ ...form, preferredDeliverySlot: e.target.value })}
        />
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="checkbox" checked={form.markAdvancePaid} onChange={(e) => setForm({ ...form, markAdvancePaid: e.target.checked })} />
          Mark advance as paid now (MVP confirm)
        </label>

        {error && <p className="auth-error">{error}</p>}
        <button className="btn primary" disabled={submitting || !campaign.isBookingOpen || !!price?.error || potOos}>
          {submitting ? "Booking…" : `Confirm · Pay ${price ? money(price.advanceRequired) : "advance"}`}
        </button>
      </form>
    </section>
  );
}

export function FestivalConfirmationPage() {
  usePageTitle("Booking confirmed");
  const { state } = useLocation() as { state?: BookingState };
  return (
    <section className="page-shell auth-page">
      <div className="auth-card">
        <p className="eyebrow">Festival pre-booking</p>
        <h1>Booking confirmed</h1>
        {state?.bookingNumber ? (
          <>
            <p>
              Booking ID <strong>{state.bookingNumber}</strong>
            </p>
            <p>Grand total {money(state.grandTotal ?? 0)}</p>
            <p>Advance paid {money(state.advancePaid ?? 0)}</p>
            <p>Balance due {money(state.balanceDue ?? 0)}</p>
          </>
        ) : (
          <p>Your festival pre-booking was received.</p>
        )}
        <Link className="btn primary" to="/festival">
          Back to festivals
        </Link>
      </div>
    </section>
  );
}
