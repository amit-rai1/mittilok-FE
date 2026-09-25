import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { EmptyState, PageShell } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import { api, buildQuery, mediaUrl } from "../lib/api";
import { money, usePageTitle } from "../lib/format";
import type { CategoryTreeDto, PagedResult, ServiceBookingDto, ServiceDto } from "../types";

function findMaliRoot(nodes: CategoryTreeDto[]): CategoryTreeDto | undefined {
  const bySlug = nodes.find((node) => node.slug === "gardening-plant-care-services" || node.slug === "mittilok-mali");
  if (bySlug) return bySlug;
  for (const node of nodes) {
    const nested = findMaliRoot(node.children ?? []);
    if (nested) return nested;
  }
  return nodes.find((node) => node.name.toLowerCase().includes("mali"));
}

export default function ServicesPage() {
  usePageTitle("MittiLok Mali");
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [groups, setGroups] = useState<CategoryTreeDto[]>([]);
  const [services, setServices] = useState<ServiceDto[]>([]);
  const [selected, setSelected] = useState<CategoryTreeDto | null>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("Morning");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const tree = await api<CategoryTreeDto[]>("/categories/tree?activeOnly=true", { auth: false });
        const mali = findMaliRoot(tree ?? []);
        const children = (mali?.children ?? []).filter((child) => child.isActive !== false);
        let items: ServiceDto[] = [];
        if (mali) {
          const res = await api<PagedResult<ServiceDto>>(
            `/services${buildQuery({ categoryId: mali.id, pageSize: 50 })}`,
            { auth: false },
          );
          items = res.items ?? [];
          if (items.length === 0) {
            const all = await api<PagedResult<ServiceDto>>(`/services${buildQuery({ pageSize: 50 })}`, { auth: false });
            items = (all.items ?? []).filter((service) => (service.categoryName ?? "").toLowerCase().includes("mali"));
          }
        }
        if (cancelled) return;
        setGroups(children);
        setServices(items);
        setSelected(children[0] ?? null);
      } catch (err) {
        if (cancelled) return;
        setGroups([]);
        setServices([]);
        setSelected(null);
        setError(err instanceof Error ? err.message : "Unable to load Mali services");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const serviceFor = (group: CategoryTreeDto | null) =>
    group ? services.find((service) => service.subCategoryId === group.id) ?? null : null;

  const choose = (group: CategoryTreeDto) => {
    setSelected(group);
    document.getElementById("mali-booking")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const book = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login", { state: { from: location.pathname + location.search } });
      return;
    }
    const matched = serviceFor(selected);
    const service = matched ?? services[0];
    if (!service || !bookingDate) {
      setError(service ? "Select a date." : "Booking is not available for this visit yet.");
      return;
    }
    setError("");
    setMessage("");
    const subcategoryNote = selected && !matched ? `Subcategory: ${selected.name}` : "";
    const combinedNotes = [subcategoryNote, notes.trim()].filter(Boolean).join("\n");
    try {
      const result = await api<ServiceBookingDto>("/service-bookings", {
        method: "POST",
        body: {
          serviceId: service.id,
          bookingDate: new Date(bookingDate).toISOString(),
          timeSlot,
          notes: combinedNotes || null,
        },
      });
      setMessage(`Booking ${result.bookingNumber} requested. We'll confirm soon.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed");
    }
  };

  const selectedService = serviceFor(selected);
  const bookTitle = selected?.name ?? selectedService?.name ?? "a visit";

  return (
    <PageShell
      eyebrow="Services"
      title="MittiLok Mali"
      text="Professional plant-care visits for homes, balconies, and offices — book a mali, not a product shop."
    >
      {error && <p className="auth-error">{error}</p>}
      {message && <p className="mali-success">{message}</p>}
      {loading ? (
        <div className="skeleton grid" />
      ) : groups.length === 0 ? (
        <EmptyState text="Mali services will appear here soon. Contact us to schedule a visit in the meantime." action="Contact us" to="/contact" />
      ) : (
        <>
          <div className="mali-grid">
            {groups.map((group) => {
              const matched = serviceFor(group);
              const active = selected?.id === group.id;
              return (
                <button
                  type="button"
                  key={group.id}
                  className={`mali-card${active ? " active" : ""}`}
                  onClick={() => choose(group)}
                >
                  <span className="mali-card-media">
                    <img src={mediaUrl(group.image)} alt="" />
                    {!group.image && <span className="mali-card-fallback">Photo coming soon</span>}
                  </span>
                  <span className="mali-card-body">
                    <strong>{group.name}</strong>
                    {(group.description || matched?.description) && (
                      <span className="mali-card-desc">{group.description || matched?.description}</span>
                    )}
                    {matched ? <em>{money(matched.basePrice)}</em> : <em>Book a visit</em>}
                  </span>
                </button>
              );
            })}
          </div>
          <form id="mali-booking" className="mali-book" onSubmit={(e) => void book(e)}>
            <h2>Book {bookTitle}</h2>
            {selected?.description?.trim() && <p className="mali-book-desc">{selected.description}</p>}
            {selectedService && <p className="mali-book-price">{money(selectedService.basePrice)} · {selectedService.duration ?? "Flexible"}</p>}
            <label>
              Date
              <input type="date" required value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} />
            </label>
            <label>
              Time slot
              <select value={timeSlot} onChange={(e) => setTimeSlot(e.target.value)}>
                <option>Morning</option>
                <option>Afternoon</option>
                <option>Evening</option>
              </select>
            </label>
            <label className="mali-book-notes">
              Notes
              <textarea placeholder="Notes / plant issues" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
            </label>
            <button className="btn primary" type="submit">Request booking</button>
          </form>
        </>
      )}
    </PageShell>
  );
}
