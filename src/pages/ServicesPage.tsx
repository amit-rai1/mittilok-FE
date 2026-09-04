import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EmptyState, PageShell } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { api, buildQuery } from "../lib/api";
import { money, usePageTitle } from "../lib/format";
import type { PagedResult, ServiceBookingDto, ServiceDto } from "../types";

export default function ServicesPage() {
  usePageTitle("MittiLok Mali");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [services, setServices] = useState<ServiceDto[]>([]);
  const [selected, setSelected] = useState<ServiceDto | null>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("Morning");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api<PagedResult<ServiceDto>>(`/services${buildQuery({ query: "mali", pageSize: 20 })}`, { auth: false })
      .then((res) => {
        const items = res.items ?? [];
        setServices(items);
        setSelected(items[0] ?? null);
      })
      .catch(() => {
        api<PagedResult<ServiceDto>>(`/services${buildQuery({ pageSize: 20 })}`, { auth: false })
          .then((res) => {
            setServices(res.items ?? []);
            setSelected(res.items?.[0] ?? null);
          })
          .catch((err: Error) => setError(err.message));
      })
      .finally(() => setLoading(false));
  }, []);

  const book = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!selected || !bookingDate) {
      setError("Select a service and date.");
      return;
    }
    setError("");
    setMessage("");
    try {
      const result = await api<ServiceBookingDto>("/service-bookings", {
        method: "POST",
        body: {
          serviceId: selected.id,
          bookingDate: new Date(bookingDate).toISOString(),
          timeSlot,
          notes: notes || null,
        },
      });
      setMessage(`Booking ${result.bookingNumber} requested. We'll confirm soon.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed");
    }
  };

  return (
    <PageShell
      eyebrow="Services"
      title="MittiLok Mali"
      text="Professional plant-care visits for homes, balconies, and offices — book a mali, not a product shop."
    >
      {error && <p style={{ color: "#b00020" }}>{error}</p>}
      {message && <p>{message}</p>}
      {loading ? (
        <div className="skeleton grid" />
      ) : services.length === 0 ? (
        <EmptyState text="Mali services will appear here soon. Contact us to schedule a visit in the meantime." action="Contact us" to="/contact" />
      ) : (
        <div className="shop-layout service-booking-layout">
          <div>
            {services.map((s) => (
              <article
                className="order-card"
                key={s.id}
                style={{ cursor: "pointer", outline: selected?.id === s.id ? "2px solid var(--forest)" : undefined }}
                onClick={() => setSelected(s)}
              >
                <strong>{s.name}</strong>
                <span>{s.duration ?? "Flexible"}</span>
                <b>{money(s.basePrice)}</b>
                <p style={{ width: "100%" }}>{s.description}</p>
              </article>
            ))}
          </div>
          <form className="summary form-grid" onSubmit={(e) => void book(e)}>
            <h2>Book {selected?.name ?? "service"}</h2>
            <label>Date<input type="date" required value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} /></label>
            <label>Time slot
              <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
                <option>Morning</option>
                <option>Afternoon</option>
                <option>Evening</option>
              </select>
            </label>
            <textarea placeholder="Notes / plant issues" value={notes} onChange={(e) => setNotes(e.target.value)} />
            <button className="btn primary" type="submit">Request booking</button>
          </form>
        </div>
      )}
    </PageShell>
  );
}
