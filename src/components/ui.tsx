import { Link } from "react-router-dom";
import { Sprout } from "lucide-react";

export function PageShell({ eyebrow, title, text, children }: { eyebrow: string; title: string; text: string; children: React.ReactNode }) {
  return (
    <section className="page-shell">
      <div className="page-intro">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
      {children}
    </section>
  );
}

export function EmptyState({ text, action, to }: { text: string; action: string; to: string }) {
  return (
    <div className="empty">
      <Sprout size={38} />
      <p>{text}</p>
      <Link className="btn primary" to={to}>{action}</Link>
    </div>
  );
}

export function SectionHeader({ eyebrow, title, cta }: { eyebrow: string; title: string; cta?: string }) {
  return (
    <div className="section-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {cta && <Link to={cta}>View all →</Link>}
    </div>
  );
}

export function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function SkeletonPage() {
  return (
    <div className="page-shell">
      <div className="skeleton" />
      <div className="skeleton grid" />
    </div>
  );
}
