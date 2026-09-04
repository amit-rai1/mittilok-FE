import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { EmptyState, PageShell } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { api, buildQuery } from "../lib/api";
import { money, ORDER_STATUS_LABELS, usePageTitle } from "../lib/format";
import type { OrderDetailDto, OrderDto, PagedResult } from "../types";

export function OrdersPage() {
  usePageTitle("Orders");
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    api<PagedResult<OrderDto>>(`/orders/mine${buildQuery({ page: 1, pageSize: 50 })}`)
      .then((res) => setOrders(res.items ?? []))
      .catch((err: Error) => setError(err.message));
  }, [authLoading, isAuthenticated, navigate]);

  return (
    <PageShell eyebrow="Orders" title="Your orders" text="Track purchases, invoices, and delivery status.">
      {error && <p style={{ color: "#b00020" }}>{error}</p>}
      {!orders.length && !error ? (
        <EmptyState text="No orders yet. Your next plant is one click away." action="Shop plants" to="/shop" />
      ) : (
        orders.map((order) => (
          <Link className="order-card" to={`/orders/${order.id}`} key={order.id}>
            <strong>{order.orderNumber}</strong>
            <span>{ORDER_STATUS_LABELS[order.orderStatus] ?? order.orderStatus}</span>
            <b>{money(order.grandTotal)}</b>
          </Link>
        ))
      )}
    </PageShell>
  );
}

export function OrderTrackingPage() {
  const { id } = useParams();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetailDto | null>(null);
  const [error, setError] = useState("");
  const [returnReason, setReturnReason] = useState("");
  const [returnMsg, setReturnMsg] = useState("");
  const [returning, setReturning] = useState(false);
  usePageTitle(order?.orderNumber ?? "Order");

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!id) return;
    api<OrderDetailDto>(`/orders/${id}`)
      .then(setOrder)
      .catch((err: Error) => setError(err.message));
  }, [authLoading, isAuthenticated, navigate, id]);

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
      <Link className="btn secondary" to="/contact">Support</Link>
    </PageShell>
  );
}
