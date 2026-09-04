import { ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { PageShell } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { usePageTitle } from "../lib/format";

export default function AccountPage() {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const navigate = useNavigate();
  usePageTitle("Account");

  if (loading) {
    return <PageShell eyebrow="Account" title="Loading..." text="Checking your session."><div className="skeleton" /></PageShell>;
  }

  if (!isAuthenticated || !user) {
    return (
      <PageShell eyebrow="Account" title="Sign in to continue" text="Access orders, wishlist, addresses, and notifications.">
        <div className="button-row">
          <Link className="btn primary" to="/login">Login</Link>
          <Link className="btn secondary" to="/signup">Create account</Link>
        </div>
      </PageShell>
    );
  }

  const links: [string, string][] = [
    ["Orders", "/orders"],
    ["Wishlist", "/wishlist"],
    ["Notifications", "/notifications"],
    ["My Plants", "/my-plants"],
    ["Care Reminders", "/care"],
  ];

  return (
    <PageShell eyebrow="Customer Account" title={`Welcome back, ${user.name}`} text={user.email}>
      <div className="dashboard-grid">
        {links.map(([label, to]) => (
          <Link to={to} key={label}>{label}<ChevronRight size={16} /></Link>
        ))}
        <button
          type="button"
          onClick={() => { logout(); navigate("/"); }}
          style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}
        >
          Logout <ChevronRight size={16} />
        </button>
      </div>
    </PageShell>
  );
}
