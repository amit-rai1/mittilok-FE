import { Link, useLocation, useNavigate } from "react-router-dom";
import { PageShell } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { usePageTitle } from "../lib/format";
import { useEffect } from "react";

export default function AccountPage() {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  usePageTitle("Account");

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location.pathname + location.search } });
    }
  }, [loading, isAuthenticated, navigate, location.pathname, location.search]);

  if (loading || !isAuthenticated || !user) {
    return (
      <PageShell narrow eyebrow="Account" title="Loading..." text="Checking your session.">
        <div className="skeleton" />
      </PageShell>
    );
  }

  return (
    <PageShell narrow eyebrow="Customer Account" title={`Welcome back, ${user.name}`} text={user.email}>
      <div className="account-profile">
        <div className="button-row">
          <Link className="btn primary" to="/orders">My orders</Link>
          <Link className="btn secondary" to="/wishlist">Wishlist</Link>
          <Link className="btn secondary" to="/notifications">Notifications</Link>
        </div>
        <button
          type="button"
          className="btn ghost"
          onClick={() => {
            logout();
            navigate("/");
          }}
        >
          Logout
        </button>
      </div>
    </PageShell>
  );
}
