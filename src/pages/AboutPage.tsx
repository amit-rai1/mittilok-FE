import { PageShell } from "../components/ui";
import { usePageTitle } from "../lib/format";

export default function AboutPage() {
  usePageTitle("About");
  return (
    <PageShell eyebrow="About MittiLok" title="Premium nursery experience, rooted in trust" text="MittiLok Nursery brings healthy plants, careful packaging, and friendly gardening support to homes across India.">
      <div className="story-grid">
        {["MittiLok story", "Mission", "Vision", "Why choose us", "Nursery experience", "Founder journey", "Quality promise"].map((item) => (
          <article key={item}>
            <h3>{item}</h3>
            <p>We select strong plants, pack them securely, and help customers grow with confidence after delivery.</p>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
