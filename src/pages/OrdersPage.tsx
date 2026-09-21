import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { EmptyState, Metric, PageShell } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { api, buildQuery, mediaUrl } from "../lib/api";
import { festivalBookingStatusLabel, money, ORDER_STATUS_LABELS, usePageTitle } from "../lib/format";
import type { FestivalBookingDto, OrderDetailDto, OrderDto, PagedResult } from "../types";

export function OrdersPage() {
  usePageTitle("Orders");
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [bookings, setBookings] = useState<FestivalBookingDto[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location.pathname + location.search } });
      return;
    }
    setLoading(true);
    Promise.all([
      api<PagedResult<OrderDto>>(`/orders/mine${buildQuery({ page: 1, pageSize: 50 })}`),
      api<PagedResult<FestivalBookingDto>>(`/festivals/bookings/mine${buildQuery({ page: 1, pageSize: 50 })}`),
    ])
      .then(([orderRes, bookingRes]) => {
        setOrders(orderRes.items ?? []);
        setBookings(bookingRes.items ?? []);
        setError("");
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [authLoading, isAuthenticated, navigate, location.pathname, location.search]);

  const empty = !loading && !error && !orders.length && !bookings.length;

  return (
    <PageShell eyebrow="Orders" title="Your orders" text="Shop orders and festival pre-bookings in one place.">
      {error && <p className="auth-error">{error}</p>}
      {loading && <div className="skeleton" />}
      {empty && <EmptyState text="No orders or festival pre-bookings yet." action="Shop plants" to="/shop" />}

      {!loading && orders.length > 0 && (
        <section className="orders-section">
          <h2 className="orders-section-title">Shop orders</h2>
          {orders.map((order) => (
            <Link className="order-card" to={`/orders/${order.id}`} key={order.id}>
              <strong>{order.orderNumber}</strong>
              <span>{ORDER_STATUS_LABELS[order.orderStatus] ?? order.orderStatus}</span>
              <b>{money(order.grandTotal)}</b>
            </Link>
          ))}
        </section>
      )}

      {!loading && (
        <section className="orders-section" id="festival-bookings">
          <h2 className="orders-section-title">Festival pre-bookings</h2>
          {!bookings.length ? (
            <EmptyState text="No festival pre-bookings yet." action="Browse festivals" to="/festival" />
          ) : (
            bookings.map((booking) => (
              <Link className="order-card" to={`/festival/bookings/${booking.id}`} key={booking.id}>
                <div>
                  <strong>{booking.bookingNumber}</strong>
                  <p className="muted" style={{ margin: "4px 0 0" }}>{booking.festivalName ?? "Festival"}</p>
                </div>
                <span>{festivalBookingStatusLabel(booking.status)}</span>
                <b>{money(booking.grandTotal)}</b>
              </Link>
            ))
          )}
        </section>
      )}
    </PageShell>
  );
}

export function FestivalBookingDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [booking, setBooking] = useState<FestivalBookingDto | null>(null);
  const [error, setError] = useState("");
  usePageTitle(booking?.bookingNumber ?? "Festival booking");

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location.pathname + location.search } });
      return;
    }
    if (!id) return;
    api<FestivalBookingDto>(`/festivals/bookings/${id}`)
      .then(setBooking)
      .catch((err: Error) => setError(err.message));
  }, [authLoading, isAuthenticated, navigate, id, location.pathname, location.search]);

  if (error) {
    return (
      <PageShell eyebrow="Festival booking" title="Not found" text={error}>
        <Link className="btn secondary" to="/orders">Back to orders</Link>
      </PageShell>
    );
  }

  if (!booking) {
    return (
      <PageShell eyebrow="Festival booking" title="Loading..." text="Fetching booking details.">
        <div className="skeleton" />
      </PageShell>
    );
  }

  const address = [booking.addressLine1, booking.addressLine2, booking.city, booking.state, booking.pincode]
    .filter(Boolean)
    .join(", ");

  return (
    <PageShell
      eyebrow="Festival pre-booking"
      title={booking.bookingNumber}
      text={booking.festivalName ?? "Festival booking"}
    >
      <div className="button-row" style={{ marginBottom: 16 }}>
        <Link className="btn secondary" to="/orders">Back to orders</Link>
      </div>

      <div className="summary festival-booking-summary">
        <Metric label="Status" value={festivalBookingStatusLabel(booking.status)} />
        <Metric label="Grand total" value={money(booking.grandTotal)} />
        <Metric label="Advance paid" value={money(booking.advancePaid)} />
        <Metric label="Balance due" value={money(booking.balanceDue)} />
      </div>

      <section className="festival-booking-block">
        <h2>Customer</h2>
        <p><strong>{booking.customerName}</strong></p>
        <p>{booking.customerPhone}</p>
        {booking.customerEmail && <p>{booking.customerEmail}</p>}
        {address && <p>{address}</p>}
        {booking.preferredDeliverySlot && <p>Delivery slot: {booking.preferredDeliverySlot}</p>}
        {booking.notes && <p className="note">{booking.notes}</p>}
      </section>

      <section className="festival-booking-block">
        <h2>Items</h2>
        <div className="festival-booking-items">
          {booking.items.map((item, index) => (
            <article className="festival-booking-item" key={`${item.productId}-${index}`}>
              {item.productImage && (
                <img src={mediaUrl(item.productImage)} alt={item.productName ?? "Plant"} />
              )}
              <div>
                <strong>{item.productName ?? "Plant"}</strong>
                {item.variantName && <p>{item.variantName}</p>}
                {item.potName && (
                  <p className="festival-booking-pot">
                    {item.potImage && <img src={mediaUrl(item.potImage)} alt="" />}
                    Pot: {item.potName}
                  </p>
                )}
                {item.addonNames && <p>Add-ons: {item.addonNames}</p>}
                {!!item.addonImages?.length && (
                  <div className="festival-booking-addons">
                    {item.addonImages.map((addon) => (
                      <span key={addon.name}>
                        {addon.image && <img src={mediaUrl(addon.image)} alt="" />}
                        {addon.name}
                      </span>
                    ))}
                  </div>
                )}
                <p>Qty {item.quantity} · {money(item.unitPrice)} each</p>
              </div>
              <b>{money(item.lineTotal)}</b>
            </article>
          ))}
        </div>
      </section>

      <p className="muted">Booked on {new Date(booking.createdAt).toLocaleString()}</p>
    </PageShell>
  );
}

export function OrderTrackingPage() {
  const { id } = useParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState<OrderDetailDto | null>(null);
  const [error, setError] = useState("");
  const [returnReason, setReturnReason] = useState("");
  const [returnMsg, setReturnMsg] = useState("");
  const [returning, setReturning] = useState(false);
  usePageTitle(order?.orderNumber ?? "Order");

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location.pathname + location.search } });
      return;
    }
    if (!id) return;
    api<OrderDetailDto>(`/orders/${id}`)
      .then(setOrder)
      .catch((err: Error) => setError(err.message));
  }, [authLoading, isAuthenticated, navigate, id, location.pathname, location.search]);

  async function submitReturn() {
    if (!order || !returnReason.trim()) return;
    setReturning(true);
    setReturnMsg("");
    try {
      await api("/returns", {
        method: "POST",
        body: {
          orderId: order.id,
          reason: returnReason.trim(),
          items: order.items.map((item) => ({
            orderItemId: item.id,
            quantity: item.quantity,
          })),
        },
      });
      setReturnMsg("Return request submitted.");
      setReturnReason("");
    } catch (err) {
      setReturnMsg(err instanceof Error ? err.message : "Unable to submit return");
    } finally {
      setReturning(false);
    }
  }

  if (error) {
    return <PageShell eyebrow="Order" title="Not found" text={error}><Link className="btn secondary" to="/orders">Back</Link></PageShell>;
  }

  if (!order) {
    return <PageShell eyebrow="Order Tracking" title="Loading..." text="Fetching order details."><div className="skeleton" /></PageShell>;
  }

  const stages = [0, 1, 2, 3, 4, 5, 6];
  const active = order.orderStatus;
  const canReturn = active === 6 || active === 4 || active === 5;

  return (
    <PageShell eyebrow="Order Tracking" title={order.orderNumber} text={`${order.fullName} · ${order.city}`}>
      {stages.map((stage) => (
        <div className={`tracking-stage ${stage <= active && active < 7 ? "done" : ""}`} key={stage}>
          <span>{stage + 1}</span>
          <strong>{ORDER_STATUS_LABELS[stage]}</strong>
        </div>
      ))}
      {order.statusHistory?.map((h, i) => (
        <p key={i} className="note">{ORDER_STATUS_LABELS[h.status] ?? h.status}: {h.note ?? ""} · {new Date(h.createdAt).toLocaleString()}</p>
      ))}
      <div className="summary" style={{ marginTop: 16 }}>
        {order.items.map((item) => (
          <p key={item.id}>{item.productName} × {item.quantity} — {money(item.lineTotal)}</p>
        ))}
        <strong>Total {money(order.grandTotal)}</strong>
      </div>
      {canReturn && (
        <div className="summary" style={{ marginTop: 16 }}>
          <strong>Request a return</strong>
          <input
            style={{ display: "block", width: "100%", margin: "8px 0" }}
            placeholder="Reason for return"
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value)}
          />
          <button className="btn" type="button" disabled={returning || !returnReason.trim()} onClick={() => void submitReturn()}>
            {returning ? "Submitting…" : "Submit return"}
          </button>
          {returnMsg && <p className="note">{returnMsg}</p>}
        </div>
      )}
      <Link className="btn secondary" to="/orders">Back to orders</Link>
      <Link className="btn secondary" to="/contact">Support</Link>
    </PageShell>
  );
}
