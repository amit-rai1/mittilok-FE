import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Metric, PageShell } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { api } from "../lib/api";
import { money, usePageTitle } from "../lib/format";
import type { AddressDto, AddressRequest, CheckoutPreviewResponse, OrderDetailDto, PaymentMethod, PaymentOrderResult } from "../types";
import { PaymentMethod as PM } from "../types";

const emptyAddress: AddressRequest = {
  fullName: "",
  mobile: "",
  houseFlat: "",
  street: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  addressType: 0,
  isDefault: true,
};

export default function CheckoutPage() {
  usePageTitle("Checkout");
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { refresh: refreshCart, clearLocal } = useCart();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const buyNow = params.get("buyNow") === "1";

  const [addresses, setAddresses] = useState<AddressDto[]>([]);
  const [addressId, setAddressId] = useState<number | null>(null);
  const [newAddress, setNewAddress] = useState<AddressRequest>(emptyAddress);
  const [showNew, setShowNew] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PM.Cod);
  const [preview, setPreview] = useState<CheckoutPreviewResponse | null>(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<OrderDetailDto | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) navigate("/login");
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (!isAuthenticated) return;
    api<AddressDto[]>("/addresses")
      .then((list) => {
        setAddresses(list);
        const def = list.find((a) => a.isDefault) ?? list[0];
        if (def) setAddressId(def.id);
        if (!list.length) setShowNew(true);
      })
      .catch(() => setShowNew(true));
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !addressId) return;
    api<CheckoutPreviewResponse>("/checkout/preview", {
      method: "POST",
      body: {
        addressId,
        couponCode: couponCode || null,
        paymentMethod,
        isBuyNow: buyNow,
      },
    })
      .then(setPreview)
      .catch((err: Error) => setError(err.message));
  }, [isAuthenticated, addressId, couponCode, paymentMethod, buyNow]);

  const saveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const created = await api<AddressDto>("/addresses", { method: "POST", body: newAddress });
      setAddresses((prev) => [...prev, created]);
      setAddressId(created.id);
      setShowNew(false);
      setNewAddress(emptyAddress);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save address");
    }
  };

  const placeOrder = async () => {
    if (!addressId) {
      setError("Please select or add an address.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const order = await api<OrderDetailDto>("/checkout/place", {
        method: "POST",
        body: {
          addressId,
          couponCode: couponCode || null,
          paymentMethod,
          notes: notes || null,
          isBuyNow: buyNow,
        },
      });

      if (paymentMethod === PM.Cod) {
        clearLocal();
        await refreshCart();
        setSuccess(order);
        return;
      }

      try {
        const payment = await api<PaymentOrderResult>("/payments/create", {
          method: "POST",
          body: { orderId: order.id },
        });
        clearLocal();
        await refreshCart();
        if (payment.requiresPayment && payment.gatewayOrderId) {
          setSuccess(order);
          setError(`Razorpay order created (${payment.gatewayOrderId}). Complete payment in the gateway when keys are live.`);
        } else {
          setSuccess(order);
        }
      } catch {
        clearLocal();
        await refreshCart();
        setSuccess(order);
        setError("Order placed. Online payment stub is not configured — pay on delivery or retry payment later.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <PageShell eyebrow="Order placed" title={`Thank you! ${success.orderNumber}`} text="Your nursery order is confirmed.">
        <Metric label="Total" value={money(success.grandTotal)} />
        <Metric label="Status" value={String(success.orderStatus)} />
        {error && <p>{error}</p>}
        <div className="button-row">
          <Link className="btn primary" to={`/orders/${success.id}`}>Track order</Link>
          <Link className="btn secondary" to="/shop">Continue shopping</Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell eyebrow="Checkout" title="Secure checkout" text="Choose address, review totals, and place your order.">
      {error && <p style={{ color: "#b00020" }}>{error}</p>}
      <div className="checkout-steps">
        <section>
          <span>Step 1</span>
          <h2>Address</h2>
          {addresses.map((addr) => (
            <label key={addr.id} style={{ display: "block", marginBottom: 8 }}>
              <input type="radio" name="address" checked={addressId === addr.id} onChange={() => setAddressId(addr.id)} />{" "}
              <strong>{addr.fullName}</strong> — {addr.houseFlat}, {addr.city}, {addr.state} {addr.pincode}
            </label>
          ))}
          <button type="button" className="btn secondary" onClick={() => setShowNew((v) => !v)}>
            {showNew ? "Hide form" : "Add new address"}
          </button>
          {showNew && (
            <form className="form-grid" onSubmit={(e) => void saveAddress(e)} style={{ marginTop: 12 }}>
              <input required placeholder="Full name" value={newAddress.fullName} onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })} />
              <input required placeholder="Mobile" value={newAddress.mobile} onChange={(e) => setNewAddress({ ...newAddress, mobile: e.target.value })} />
              <input required placeholder="House / Flat" value={newAddress.houseFlat} onChange={(e) => setNewAddress({ ...newAddress, houseFlat: e.target.value })} />
              <input placeholder="Street" value={newAddress.street ?? ""} onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })} />
              <input required placeholder="City" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} />
              <input required placeholder="State" value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} />
              <input required placeholder="PIN code" value={newAddress.pincode} onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })} />
              <button className="btn primary" type="submit">Save address</button>
            </form>
          )}
        </section>

        <section>
          <span>Step 2</span>
          <h2>Order preview</h2>
          <label>Coupon
            <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="MITTI10" />
          </label>
          {preview ? (
            <>
              {preview.items.map((line) => (
                <p key={`${line.productId}-${line.variantId}`}>{line.productName} × {line.quantity} — {money(line.lineTotal)}</p>
              ))}
              <Metric label="Subtotal" value={money(preview.subtotal)} />
              <Metric label="Discount" value={money(preview.discount + preview.couponDiscount)} />
              <Metric label="Shipping" value={money(preview.shipping)} />
              <Metric label="Tax" value={money(preview.tax)} />
              <Metric label="Grand total" value={money(preview.grandTotal)} />
              {preview.couponMessage && <p>{preview.couponMessage}</p>}
            </>
          ) : (
            <p>Select an address to preview totals.</p>
          )}
        </section>

        <section>
          <span>Step 3</span>
          <h2>Payment</h2>
          <div className="payment-options">
            {[
              [PM.Cod, "Cash on Delivery"],
              [PM.Razorpay, "Razorpay"],
              [PM.Upi, "UPI"],
              [PM.Card, "Card"],
            ].map(([value, label]) => (
              <button key={label} type="button" className={paymentMethod === value ? "btn primary" : "btn secondary"} onClick={() => setPaymentMethod(value as PaymentMethod)}>
                {label}
              </button>
            ))}
          </div>
          <textarea placeholder="Order notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
          <button className="btn primary full" disabled={submitting || !addressId} onClick={() => void placeOrder()}>
            {submitting ? "Placing order..." : "Place order"}
          </button>
        </section>
      </div>
    </PageShell>
  );
}
