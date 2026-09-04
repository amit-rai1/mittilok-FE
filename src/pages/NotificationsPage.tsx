import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EmptyState, PageShell } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";
import { usePageTitle } from "../lib/format";
import type { NotificationDto, NotificationListResponse } from "../types";

export default function NotificationsPage() {
  usePageTitle("Notifications");
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const load = async () => {
    const data = await api<NotificationListResponse>("/notifications?page=1&pageSize=50");
    setItems(data.items ?? []);
    setUnreadCount(data.unreadCount ?? 0);
  };

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    void load().catch(() => setItems([]));
  }, [authLoading, isAuthenticated, navigate]);

  const markRead = async (id: number) => {
    await api(`/notifications/${id}/read`, { method: "PATCH" });
    await load();
  };

  const markAll = async () => {
    await api("/notifications/read-all", { method: "PATCH" });
    await load();
  };

  return (
    <PageShell eyebrow="Notifications" title="Your updates" text={unreadCount ? `${unreadCount} unread` : "You're all caught up."}>
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
