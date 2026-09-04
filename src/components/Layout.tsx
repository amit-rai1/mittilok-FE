import { Bell, Heart, Home, Menu, MessageCircle, Search, ShoppingBag, ShoppingCart, Sparkles, Sprout, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { api } from "../lib/api";
import type { NotificationDto } from "../types";
import { CategoryIconRail } from "./CategoryIconRail";

const NAV_LINKS: [string, string][] = [
  ["Home", "/"],
  ["Nursery", "/nursery"],
  ["Organics", "/organics"],
  ["Mali", "/services/mali"],
  ["Landscaping", "/landscaping"],
  ["Podcast", "/podcast"],
  ["About", "/about"],
  ["Contact", "/contact"],
];

function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<NotificationDto[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      setUnread(0);
      setItems([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const countRes = await api<{ count: number }>("/notifications/unread-count");
        if (!cancelled) setUnread(countRes.count ?? 0);
      } catch {
        if (!cancelled) setUnread(0);
      }
    })();
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const loadDropdown = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setOpen((v) => !v);
    if (open) return;
    try {
      const data = await api<{ items: NotificationDto[]; unreadCount: number }>("/notifications?page=1&pageSize=5");
      setItems(data.items ?? []);
      setUnread(data.unreadCount ?? unread);
    } catch {
      setItems([]);
    }
  };

  const markRead = async (id: number) => {
    await api(`/notifications/${id}/read`, { method: "PATCH" });
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setUnread((c) => Math.max(0, c - 1));
  };

  if (!isAuthenticated) {
    return (
      <Link to="/login" className="icon-btn" aria-label="Notifications">
        <Bell size={19} />
      </Link>
    );
  }

  return (
    <div className="notif-bell" ref={ref} style={{ position: "relative" }}>
      <button className="icon-btn badge-btn" onClick={() => void loadDropdown()} aria-label="Notifications">
        <Bell size={19} />
        {unread > 0 && <span>{unread > 9 ? "9+" : unread}</span>}
      </button>
      {open && (
        <div className="summary" style={{ position: "absolute", right: 0, top: "120%", width: 320, zIndex: 40, padding: 12 }}>
          <div className="section-header" style={{ marginBottom: 8 }}>
            <strong>Notifications</strong>
            <Link to="/notifications" onClick={() => setOpen(false)}>View all</Link>
          </div>
          {items.length === 0 ? (
            <p style={{ margin: 0, opacity: 0.7 }}>No notifications yet.</p>
          ) : (
            items.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => void markRead(n.id)}
                style={{ display: "block", width: "100%", textAlign: "left", background: n.isRead ? "transparent" : "rgba(20,90,50,.08)", border: 0, padding: "8px 6px", cursor: "pointer" }}
              >
                <strong style={{ display: "block" }}>{n.title}</strong>
                <span style={{ fontSize: 13, opacity: 0.8 }}>{n.message}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { count } = useCart();
  const { ids } = useWishlist();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/nursery?query=${encodeURIComponent(q)}` : "/nursery");
    setOpen(false);
  };

  return (
    <header className="site-header">
      <div className="announcement">Healthy Plants • Secure Packaging • Delivered Across India</div>
      <div className="nav-shell">
        <Link to="/" className="brand brand-logo-only" aria-label="MittiLok Nursery home">
          <span className="brand-mark"><img src="/logo.png" alt="MittiLok Nursery logo" /></span>
        </Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {NAV_LINKS.map(([label, to]) => <NavLink key={to} to={to}>{label}</NavLink>)}
        </nav>
        <div className="nav-actions">
          <form onSubmit={onSearch} className="desktop-only" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search plants..."
              aria-label="Search"
              style={{ width: 140, padding: "6px 10px", borderRadius: 999, border: "1px solid rgba(0,0,0,.12)" }}
            />
            <button type="submit" className="icon-btn" aria-label="Search"><Search size={19} /></button>
          </form>
          <Link to="/nursery" className="icon-btn mobile-only" aria-label="Search"><Search size={19} /></Link>
          <NotificationBell />
          <Link to="/wishlist" className="icon-btn badge-btn" aria-label="Wishlist"><Heart size={19} /><span>{ids.length}</span></Link>
          <Link to="/cart" className="icon-btn badge-btn" aria-label="Cart"><ShoppingCart size={19} /><span>{count}</span></Link>
          <Link to="/account" className="icon-btn desktop-only" aria-label="Account"><User size={19} /></Link>
          <button className="icon-btn mobile-only" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={21} /></button>
        </div>
      </div>
      {open && (
        <>
          <div className="drawer-backdrop" onClick={() => setOpen(false)} />
          <div className="drawer" role="dialog" aria-modal="true">
            <button className="icon-btn close" onClick={() => setOpen(false)} aria-label="Close menu"><X /></button>
            {NAV_LINKS.map(([label, to]) => <Link key={to} to={to} onClick={() => setOpen(false)}>{label}</Link>)}
            <Link to="/ai-plant-finder" onClick={() => setOpen(false)}>AI Plant Finder</Link>
            <Link to="/my-plants" onClick={() => setOpen(false)}>My Plants</Link>
            {isAuthenticated ? (
              <>
                <Link to="/account" onClick={() => setOpen(false)}>{user?.name ?? "Account"}</Link>
                <button type="button" onClick={() => { logout(); setOpen(false); }}>Logout</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)}>Login</Link>
            )}
          </div>
        </>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div>
        <h2>MittiLok Nursery</h2>
        <p>Bring Nature Home.</p>
        <form onSubmit={(e) => e.preventDefault()}>
          <input placeholder="Enter your email" />
          <button type="submit">Subscribe</button>
        </form>
      </div>
      <div>
        <h3>Quick Links</h3>
        {NAV_LINKS.map(([label, to]) => <Link key={to} to={to}>{label}</Link>)}
      </div>
      <div>
        <h3>Customer Support</h3>
        <Link to="/contact">Contact</Link>
        <Link to="/orders">Order Tracking</Link>
        <Link to="/ai-plant-finder">AI Plant Finder</Link>
        <Link to="/my-plants">My Plants</Link>
      </div>
      <div>
        <h3>Policies</h3>
        <Link to="/privacy-policy">Privacy Policy</Link>
        <Link to="/terms">Terms & Conditions</Link>
        <Link to="/refund-policy">Refund Policy</Link>
        <Link to="/refund-policy">Shipping Policy</Link>
      </div>
    </footer>
  );
}

export function MobileBottomNav() {
  return (
    <nav className="bottom-nav">
      <Link to="/"><Home /></Link>
      <Link to="/nursery"><ShoppingBag /></Link>
      <Link to="/ai-plant-finder"><Sparkles /></Link>
      <Link to="/my-plants"><Sprout /></Link>
      <Link to="/cart"><ShoppingCart /></Link>
    </nav>
  );
}

export function FloatingWhatsApp() {
  return (
    <a className="whatsapp" href="https://wa.me/916394060938" aria-label="WhatsApp support">
      <MessageCircle />
    </a>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <CategoryIconRail />
      <main>{children}</main>
      <MobileBottomNav />
      <FloatingWhatsApp />
      <Footer />
    </>
  );
}
