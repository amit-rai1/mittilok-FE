import { useState } from "react";
import { PageShell } from "../components/ui";
import { api } from "../lib/api";
import { usePageTitle } from "../lib/format";
import type { EnquiryDto, EnquiryRequest } from "../types";

export default function LandscapingPage() {
  usePageTitle("MittiLok Landscaping");
  const [form, setForm] = useState<EnquiryRequest>({
    name: "",
    mobile: "",
    email: "",
    projectType: "Landscaping",
    location: "",
    propertyType: "",
    areaSize: "",
    requirement: "",
    budgetRange: "",
    preferredDate: null,
    additionalNotes: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      const body: EnquiryRequest = {
        ...form,
        preferredDate: form.preferredDate ? new Date(form.preferredDate).toISOString() : null,
      };
      const res = await api<EnquiryDto>("/enquiries", { method: "POST", body, auth: false });
      setMessage(`Enquiry #${res.id} received. Our landscaping team will contact you soon.`);
      setForm({
        name: "",
        mobile: "",
        email: "",
        projectType: "Landscaping",
        location: "",
        propertyType: "",
        areaSize: "",
        requirement: "",
        budgetRange: "",
        preferredDate: null,
        additionalNotes: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit enquiry");
    }
  };

  return (
    <PageShell
      eyebrow="Services"
      title="MittiLok Landscaping"
      text="Design and install gardens, lawns, balconies, and commercial greens — request a custom quote below."
    >
      {message && <p>{message}</p>}
      {error && <p style={{ color: "#b00020" }}>{error}</p>}
      <form className="form-grid" onSubmit={(e) => void submit(e)}>
        <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input required placeholder="Mobile" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
        <input type="email" placeholder="Email" value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input placeholder="Location / city" value={form.location ?? ""} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <input placeholder="Property type" value={form.propertyType ?? ""} onChange={(e) => setForm({ ...form, propertyType: e.target.value })} />
        <input placeholder="Area size" value={form.areaSize ?? ""} onChange={(e) => setForm({ ...form, areaSize: e.target.value })} />
        <input placeholder="Budget range" value={form.budgetRange ?? ""} onChange={(e) => setForm({ ...form, budgetRange: e.target.value })} />
        <input type="date" value={form.preferredDate ?? ""} onChange={(e) => setForm({ ...form, preferredDate: e.target.value })} />
        <textarea required placeholder="Requirement" value={form.requirement ?? ""} onChange={(e) => setForm({ ...form, requirement: e.target.value })} />
        <textarea placeholder="Additional notes" value={form.additionalNotes ?? ""} onChange={(e) => setForm({ ...form, additionalNotes: e.target.value })} />
        <button className="btn primary" type="submit">Submit enquiry</button>
      </form>
    </PageShell>
  );
}
