import { useState } from "react";
import { Metric, PageShell } from "../components/ui";
import { api } from "../lib/api";
import { usePageTitle } from "../lib/format";

export default function ContactPage() {
  usePageTitle("Contact");
  const [form, setForm] = useState({ name: "", mobile: "", email: "", requirement: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await api("/enquiries", {
        method: "POST",
        auth: false,
        body: {
          name: form.name,
          mobile: form.mobile,
          email: form.email || null,
          projectType: "General Contact",
          requirement: form.requirement,
        },
      });
      setMessage("Message sent. We'll get back to you soon.");
      setForm({ name: "", mobile: "", email: "", requirement: "" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send message");
    }
  };

  return (
    <PageShell eyebrow="Contact" title="We are here for your garden" text="Call, WhatsApp, email, or send a plant-care question.">
      {message && <p>{message}</p>}
      {error && <p style={{ color: "#b00020" }}>{error}</p>}
      <div className="contact-layout">
        <form className="form-grid" onSubmit={(e) => void submit(e)}>
          <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input required placeholder="Phone" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
          <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <textarea required placeholder="How can we help?" value={form.requirement} onChange={(e) => setForm({ ...form, requirement: e.target.value })} />
          <button className="btn primary" type="submit">Send Message</button>
        </form>
        <aside className="summary">
          <Metric label="WhatsApp" value="+91 63940 60938" />
          <Metric label="Email" value="mittilok@gmail.com" />
          <Metric label="Address" value="Pachperwa, Uttar Pradesh" />
          <div className="map">Pachperwa, Uttar Pradesh</div>
        </aside>
      </div>
    </PageShell>
  );
}
