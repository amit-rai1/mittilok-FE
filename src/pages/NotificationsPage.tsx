import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { EmptyState, PageShell } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { usePageTitle } from "../lib/format";
import type { NotificationDto, NotificationListResponse } from "../types";

export default function NotificationsPage() {
  usePageTitle("Notifications");
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [items, setItems] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = async (quiet = false) => {
    try {
      const data = await api<NotificationListResponse>("/notifications?page=1&pageSize=50");
      setItems(data.items ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      if (!quiet) setItems([]);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location.pathname + location.search } });
      return;
    }
    void load();
    const timer = window.setInterval(() => void load(true), 60000);
    return () => window.clearInterval(timer);
  }, [authLoading, isAuthenticated, navigate, location.pathname, location.search]);

  const markRead = async (id: number) => {
    const target = items.find((n) => n.id === id);
    if (!target || target.isRead) return;
    const prevItems = items;
    const prevUnread = unreadCount;
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await api(`/notifications/${id}/read`, { method: "PATCH" });
    } catch {
      setItems(prevItems);
      setUnreadCount(prevUnread);
    }
  };

  const markAll = async () => {
    if (unreadCount === 0 && items.every((n) => n.isRead)) return;
    const prevItems = items;
    const prevUnread = unreadCount;
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await api("/notifications/read-all", { method: "PATCH" });
    } catch {
      setItems(prevItems);
      setUnreadCount(prevUnread);
    }
  };

  return (
    <PageShell narrow eyebrow="Notifications" title="Your updates" text={unreadCount ? `${unreadCount} unread` : "You're all caught up."}>
      {items.length > 0 && (
        <button className="btn secondary" onClick={() => void markAll()} style={{ marginBottom: 16 }}>Mark all read</button>
      )}
      {!items.length ? (
        <EmptyState text="No notifications yet. Order updates will appear here." action="Go to shop" to="/shop" />
      ) : (
        items.map((n) => (
          <article className="order-card" key={n.id} style={{ opacity: n.isRead ? 0.65 : 1 }}>
            <div>
              <strong>{n.title}</strong>
              <p style={{ margin: "4px 0 0" }}>{n.message}</p>
              <small>{new Date(n.createdAt).toLocaleString()}</small>
            </div>
            {!n.isRead && <button className="btn compact" onClick={() => void markRead(n.id)}>Mark read</button>}
          </article>
        ))
      )}
    </PageShell>
  );
}
