import { useEffect, useState } from "react";
import { EmptyState, PageShell } from "../components/ui";
import { api } from "../lib/api";
import { money, usePageTitle } from "../lib/format";
import type { PodcastBookingDto, PodcastBookingRequest, PodcastDto, PodcastPackageDto } from "../types";

export default function PodcastPage() {
  usePageTitle("MittiLok Podcast");
  const [podcast, setPodcast] = useState<PodcastDto | null>(null);
  const [packages, setPackages] = useState<PodcastPackageDto[]>([]);
  const [form, setForm] = useState<PodcastBookingRequest>({
    name: "",
    mobile: "",
    email: "",
    packageId: null,
    bookingDate: "",
    preferredTime: "Morning",
    guestCount: 1,
    topic: "",
    requirements: "",
    additionalNotes: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api<PodcastDto>("/podcast", { auth: false }),
      api<PodcastPackageDto[]>("/podcast/packages", { auth: false }),
    ])
      .then(([details, pkgs]) => {
        setPodcast(details);
        const list = pkgs.length ? pkgs : details.packages ?? [];
        setPackages(list);
        if (list[0]) {
          setForm((f) => ({ ...f, packageId: list[0].id }));
        }
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const res = await api<PodcastBookingDto>("/podcast/book", {
        method: "POST",
        body: {
          ...form,
          bookingDate: new Date(form.bookingDate).toISOString(),
        },
        auth: false,
      });
      setMessage(`Booking ${res.bookingNumber} received. We'll confirm your studio slot.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Booking failed");
    }
  };

  return (
    <PageShell
      eyebrow="Studio"
      title="MittiLok Podcast"
      text={podcast?.description ?? "Book the MittiLok recording space for plant conversations and green stories — not a product catalogue."}
    >
      {error && <p style={{ color: "#b00020" }}>{error}</p>}
      {message && <p>{message}</p>}
      {loading ? (
        <div className="skeleton grid" />
      ) : packages.length === 0 && !podcast ? (
        <EmptyState text="Podcast studio packages will be listed here soon. Reach out to reserve a session." action="Contact us" to="/contact" />
      ) : (
        <>
          {packages.length > 0 && (
            <div className="dashboard-grid" style={{ marginBottom: 24 }}>
              {packages.map((pkg) => (
                <button
                  key={pkg.id}
                  type="button"
                  className={form.packageId === pkg.id ? "btn primary" : "btn secondary"}
                  onClick={() => setForm({ ...form, packageId: pkg.id })}
                >
                  {pkg.name} · {money(pkg.price)} · {pkg.durationMinutes} min
                </button>
              ))}
            </div>
          )}
          <form className="form-grid" onSubmit={(e) => void submit(e)}>
            <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input required placeholder="Mobile" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
            <input type="email" placeholder="Email" value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input required type="date" value={form.bookingDate} onChange={(e) => setForm({ ...form, bookingDate: e.target.value })} />
            <input placeholder="Preferred time" value={form.preferredTime ?? ""} onChange={(e) => setForm({ ...form, preferredTime: e.target.value })} />
            <input type="number" min={1} placeholder="Guests" value={form.guestCount ?? 1} onChange={(e) => setForm({ ...form, guestCount: Number(e.target.value) })} />
            <input placeholder="Topic" value={form.topic ?? ""} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
            <textarea placeholder="Requirements" value={form.requirements ?? ""} onChange={(e) => setForm({ ...form, requirements: e.target.value })} />
            <button className="btn primary" type="submit">Book studio</button>
          </form>
        </>
      )}
    </PageShell>
  );
}
