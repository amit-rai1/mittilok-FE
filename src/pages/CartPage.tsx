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

  return (
    <PageShell eyebrow="Cart" title="Your garden basket" text="Review quantities and proceed to secure checkout.">
      <div className="cart-layout">
        <div>
          {items.length ? items.map((item) => (
            <article className="cart-item" key={`${item.productId}-${item.variantId ?? "base"}-${item.id ?? "local"}`}>
              <img src={mediaUrl(item.imageUrl)} alt={item.productName} />
              <div>
                <h3>{item.productName}</h3>
                <p>{item.variantName ?? "Standard"}</p>
                <button type="button" onClick={() => void removeFromCart(item)}>Remove</button>
              </div>
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => void updateQuantity(item, Number(e.target.value))}
              />
              <strong>{money(("lineTotal" in item && item.lineTotal) ? item.lineTotal : item.unitPrice * item.quantity)}</strong>
            </article>
          )) : (
            <EmptyState text="Your cart is waiting for something green." action="Continue Shopping" to="/shop" />
          )}
        </div>
        <aside className="summary">
          <h2>Order Summary</h2>
          <Metric label="Subtotal" value={money(subtotal)} />
          <Metric label="Shipping" value={delivery ? money(delivery) : "Free"} />
          <Metric label="Tax (est.)" value={money(tax)} />
          <Metric label="Total" value={money(subtotal + delivery + tax)} />
          <button
            className="btn primary full"
            disabled={!items.length}
            onClick={() => {
              if (!isAuthenticated) navigate("/login");
              else navigate("/checkout");
            }}
          >
            Proceed to Checkout
          </button>
          <Link className="btn secondary full" to="/shop">Continue Shopping</Link>
        </aside>
      </div>
    </PageShell>
  );
}
