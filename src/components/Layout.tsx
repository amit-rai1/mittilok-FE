import { Bell, Home, Menu, MessageCircle, Search, ShoppingBag, ShoppingCart, Sparkles, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { api } from "../lib/api";
import { useHasOpenFestival } from "../lib/festivalNav";
import type { NotificationDto } from "../types";
import { CategoryIconRail } from "./CategoryIconRail";

const NAV_LINKS: [string, string][] = [
  ["Home", "/"],
  ["Nursery", "/nursery"],
  ["Organics", "/organics"],
  ["Festival", "/festival"],
  ["Mali", "/services/mali"],
  ["Landscaping", "/landscaping"],
  ["Podcast", "/podcast"],
  ["About", "/about"],
  ["Contact", "/contact"],
];

function useNavLinks() {
  const showFestival = useHasOpenFestival();
  return NAV_LINKS.filter(([label]) => showFestival || label !== "Festival");
}

const ANNOUNCEMENTS = [
  "Healthy Plants • Secure Packaging • Delivered Across India",
  "Shop Nursery essentials & organics with care guidance",
  "Book Mali visits • Landscaping quotes • Podcast studio",
];

function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [items, setItems] = useState<NotificationDto[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const openRef = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  useEffect(() => {
    if (!isAuthenticated) {
      setUnread(0);
      setItems([]);
      return;
    }
    let cancelled = false;
    const tick = async () => {
      try {
        if (openRef.current) {
          const data = await api<{ items: NotificationDto[]; unreadCount: number }>("/notifications?page=1&pageSize=5");
          if (cancelled) return;
          setItems(data.items ?? []);
          setUnread(data.unreadCount ?? 0);
        } else {
          const countRes = await api<{ count: number }>("/notifications/unread-count");
          if (!cancelled) setUnread(countRes.count ?? 0);
        }
      } catch {
        /* keep the last list and badge if a refresh fails */
      }
    };
    void tick();
    const timer = window.setInterval(() => void tick(), 60000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
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
      navigate("/login", { state: { from: location.pathname + location.search } });
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
    const target = items.find((n) => n.id === id);
    if (!target || target.isRead) return;
    const prevItems = items;
    const prevUnread = unread;
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setUnread((c) => Math.max(0, c - 1));
    try {
      await api(`/notifications/${id}/read`, { method: "PATCH" });
    } catch {
      setItems(prevItems);
      setUnread(prevUnread);
    }
  };

  const markAll = async () => {
    if (unread === 0 && items.every((n) => n.isRead)) return;
    const prevItems = items;
    const prevUnread = unread;
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnread(0);
    try {
      await api("/notifications/read-all", { method: "PATCH" });
    } catch {
      setItems(prevItems);
      setUnread(prevUnread);
    }
  };

  if (!isAuthenticated) {
    return (
      <Link
        to="/login"
        state={{ from: "/account?tab=notifications" }}
        className="icon-btn"
        aria-label="Notifications"
      >
        <Bell size={19} />
      </Link>
    );
  }

  return (
    <div className="notif-bell" ref={ref}>
      <button className="icon-btn badge-btn" onClick={() => void loadDropdown()} aria-label="Notifications">
        <Bell size={19} />
        {unread > 0 && <span>{unread > 9 ? "9+" : unread}</span>}
      </button>
      {open && (
        <div className="notif-dropdown">
          <div className="notif-dropdown-head">
            <strong>Notifications</strong>
            <span className="notif-dropdown-actions">
              {unread > 0 && (
                <button type="button" onClick={() => void markAll()}>
                  Mark all read
                </button>
              )}
              <Link to="/notifications" onClick={() => setOpen(false)}>
                View all
              </Link>
            </span>
          </div>
          {items.length === 0 ? (
            <p className="notif-empty">No notifications yet.</p>
          ) : (
            items.map((n) => (
              <button key={n.id} type="button" className={`notif-item${n.isRead ? "" : " unread"}`} onClick={() => void markRead(n.id)}>
                <strong>{n.title}</strong>
                <span>{n.message}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function AccountMenu() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<number | null>(null);

  const clearClose = () => {
    if (closeTimer.current != null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const openMenu = () => {
    clearClose();
    setOpen(true);
  };

  const scheduleClose = () => {
    clearClose();
    closeTimer.current = window.setTimeout(() => setOpen(false), 160);
  };

  useEffect(() => () => clearClose(), []);

  if (!isAuthenticated) {
    return (
      <Link
        to="/login"
        state={{ from: location.pathname + location.search }}
        className="icon-btn"
        aria-label="Account"
      >
        <User size={19} />
      </Link>
    );
  }

  return (
    <div
      className={`account-menu${open ? " open" : ""}`}
      onMouseEnter={openMenu}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        className="icon-btn"
        aria-label="Account menu"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
      >
        <User size={19} />
      </button>
      {open && (
        <div className="account-dropdown" role="menu">
          {user?.name && <p className="account-dropdown-name">{user.name}</p>}
          <Link role="menuitem" to="/orders" onClick={() => setOpen(false)}>Orders</Link>
          <Link role="menuitem" to="/wishlist" onClick={() => setOpen(false)}>Wishlist</Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              logout();
              setOpen(false);
              navigate("/");
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [annIndex, setAnnIndex] = useState(0);
  const { count } = useCart();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navLinks = useNavLinks();
  const desktopLinks = useNavLinks().filter(([label]) =>
    ["Nursery", "Organics", "Festival", "Mali", "Landscaping", "Podcast", "About"].includes(label),
  );

  useEffect(() => {
    const t = window.setInterval(() => setAnnIndex((i) => (i + 1) % ANNOUNCEMENTS.length), 4500);
    return () => window.clearInterval(t);
  }, []);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/nursery?query=${encodeURIComponent(q)}` : "/nursery");
    setOpen(false);
  };

  const searchForm = (
    <form onSubmit={onSearch} className="header-search" role="search">
      <Search size={18} className="header-search-icon" aria-hidden />
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search plants, pots, organics..."
        aria-label="Search plants"
      />
    </form>
  );

  const isActive = (to: string) =>
    location.pathname === to || (to !== "/" && location.pathname.startsWith(to));

  return (
    <header className="site-header">
      <div className="announcement" aria-label="Promotions">
        <p className="announcement-static" key={annIndex}>{ANNOUNCEMENTS[annIndex]}</p>
      </div>
      <div className="nav-shell">
        <Link to="/" className="brand brand-logo-only" aria-label="MittiLok Nursery home">
          <img className="brand-logo" src="/logo.png" alt="MittiLok" />
        </Link>
        <div className="header-search-desktop">{searchForm}</div>
        <div className="nav-actions">
          <NotificationBell />
          <Link to="/cart" className="icon-btn badge-btn" aria-label="Cart">
            <ShoppingCart size={19} />
            <span>{count}</span>
          </Link>
          <AccountMenu />
          <button className="icon-btn mobile-only" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu size={21} />
          </button>
        </div>
      </div>
      <div className="header-search-mobile">{searchForm}</div>
      <nav className="desktop-link-row" aria-label="Primary">
        {desktopLinks.map(([label, to]) => (
          <Link key={to} to={to} className={isActive(to) ? "active" : undefined}>
            {label}
          </Link>
        ))}
        <Link to="/blog" className={isActive("/blog") ? "active" : undefined}>Blog</Link>
        <Link to="/ai-plant-finder" className={isActive("/ai-plant-finder") ? "active" : undefined}>Find plant</Link>
      </nav>
      {open && (
        <>
          <div className="drawer-backdrop" onClick={() => setOpen(false)} />
          <div className="drawer" role="dialog" aria-modal="true">
            <button className="icon-btn close" onClick={() => setOpen(false)} aria-label="Close menu">
              <X />
            </button>
            {navLinks.map(([label, to]) => (
              <Link key={to} to={to} onClick={() => setOpen(false)}>
                {label}
              </Link>
            ))}
            <Link to="/ai-plant-finder" onClick={() => setOpen(false)}>
              AI Plant Finder
            </Link>
            <Link to="/blog" onClick={() => setOpen(false)}>Blog</Link>
            {isAuthenticated ? (
              <>
                <Link to="/orders" onClick={() => setOpen(false)}>Orders</Link>
                <Link to="/wishlist" onClick={() => setOpen(false)}>Wishlist</Link>
                <Link to="/account" onClick={() => setOpen(false)}>
                  {user?.name ?? "Account"}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setOpen(false);
                    navigate("/");
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)}>
                Login
              </Link>
            )}
          </div>
        </>
      )}
    </header>
  );
}

export function Footer() {
  const showFestival = useHasOpenFestival();
  return (
    <footer className="footer">
      <div>
        <h2>MittiLok Nursery</h2>
        <p>Bring Nature Home — healthy plants, organics, and garden care across India.</p>
        <form onSubmit={(e) => e.preventDefault()} className="footer-subscribe">
          <input placeholder="Email for garden tips" aria-label="Email" />
          <button type="submit">Subscribe</button>
        </form>
      </div>
      <div>
        <h3>Shop</h3>
        <Link to="/nursery">Nursery</Link>
        <Link to="/organics">Organics</Link>
        {showFestival && <Link to="/festival">Festival pre-booking</Link>}
        <Link to="/ai-plant-finder">AI Plant Finder</Link>
      </div>
      <div>
        <h3>Services</h3>
        <Link to="/services/mali">MittiLok Mali</Link>
        <Link to="/landscaping">Landscaping</Link>
        <Link to="/podcast">Podcast studio</Link>
        <Link to="/blog">Care tips</Link>
      </div>
      <div>
        <h3>Help</h3>
        <Link to="/contact">Contact</Link>
        <Link to="/orders">Order tracking</Link>
        <Link to="/account">My account</Link>
        <Link to="/privacy-policy">Privacy</Link>
        <Link to="/terms">Terms</Link>
        <Link to="/refund-policy">Refunds & shipping</Link>
      </div>
    </footer>
  );
}

export function MobileBottomNav() {
  const { pathname } = useLocation();
  const { isAuthenticated } = useAuth();
  const items = [
    { to: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
    { to: "/nursery", label: "Shop", icon: ShoppingBag, match: (p: string) => p.startsWith("/nursery") || p.startsWith("/organics") || p.startsWith("/shop") },
    { to: "/ai-plant-finder", label: "Find", icon: Sparkles, match: (p: string) => p.startsWith("/ai-plant-finder") },
    { to: isAuthenticated ? "/account" : "/login", label: "Account", icon: User, match: (p: string) => p.startsWith("/account") },
    { to: "/cart", label: "Cart", icon: ShoppingCart, match: (p: string) => p.startsWith("/cart") },
  ] as const;

  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      {items.map(({ to, label, icon: Icon, match }) => (
        <Link key={label} to={to} className={match(pathname) ? "active" : undefined}>
          <Icon size={20} />
          <span>{label}</span>
        </Link>
      ))}
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

function CartNotice() {
  const { notice } = useCart();
  if (!notice) return null;
  const added = notice === "Added to cart";
  return (
    <div className="cart-toast" role="status">
      <span>{notice}</span>
      {added && <Link to="/cart">View cart</Link>}
    </div>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const hideRail = ["/login", "/signup", "/forgot-password"].some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  return (
    <>
      <Header />
      {!hideRail && <CategoryIconRail />}
      <main>{children}</main>
      <CartNotice />
      <MobileBottomNav />
      <FloatingWhatsApp />
      <Footer />
    </>
  );
}
