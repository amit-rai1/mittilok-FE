import { Link, useNavigate } from "react-router-dom";
import { EmptyState, Metric, PageShell } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { mediaUrl } from "../lib/api";
import { money, usePageTitle } from "../lib/format";

export default function CartPage() {
  usePageTitle("Cart");
  const { items, subtotal, removeFromCart, updateQuantity } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const delivery = subtotal > 999 || subtotal === 0 ? 0 : 79;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + delivery + tax;

  return (
    <PageShell eyebrow="Cart" title="Your garden basket" text="Review quantities and proceed to secure checkout.">
      <div className="cart-layout">
        <div className="cart-items">
          {items.length ? items.map((item) => (
            <article className="cart-item" key={`${item.productId}-${item.variantId ?? "base"}-${item.id ?? "local"}`}>
              <img src={mediaUrl(item.imageUrl)} alt={item.productName} />
              <div className="cart-item-info">
                <h3>{item.productName}</h3>
                <p>{item.variantName ?? "Standard"}</p>
                <button type="button" onClick={() => void removeFromCart(item)}>Remove</button>
              </div>
              <label className="cart-qty">
                <span className="sr-only">Quantity</span>
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => void updateQuantity(item, Math.max(1, item.quantity - 1))}
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={(e) => void updateQuantity(item, Number(e.target.value))}
                />
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => void updateQuantity(item, item.quantity + 1)}
                >
                  +
                </button>
              </label>
              <strong className="cart-line-total">
                {money(("lineTotal" in item && item.lineTotal) ? item.lineTotal : item.unitPrice * item.quantity)}
              </strong>
            </article>
          )) : (
            <EmptyState text="Your cart is waiting for something green." action="Continue Shopping" to="/nursery" />
          )}
        </div>
        <aside className="summary cart-summary">
          <h2>Order summary</h2>
          <Metric label="Subtotal" value={money(subtotal)} />
          <Metric label="Shipping" value={delivery ? money(delivery) : "Free"} />
          <Metric label="Tax (est.)" value={money(tax)} />
          <Metric label="Total" value={money(total)} />
          {subtotal > 0 && subtotal < 999 && (
            <p className="cart-ship-hint">Add {money(999 - subtotal)} more for free shipping.</p>
          )}
          <button
            className="btn primary full"
            disabled={!items.length}
            onClick={() => {
              if (!isAuthenticated) {
                navigate("/login", { state: { from: "/checkout" } });
              } else {
                navigate("/checkout");
              }
            }}
          >
            Proceed to checkout
          </button>
          <Link className="btn secondary full" to="/nursery">Continue shopping</Link>
        </aside>
      </div>
    </PageShell>
  );
}
