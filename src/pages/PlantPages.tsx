import { Heart, Sprout } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState, PageShell } from "../components/ui";
import { api, buildQuery } from "../lib/api";
import { money, usePageTitle } from "../lib/format";
import { recommendationService } from "../services/recommendationService";
import type { AIPlantFinderAnswers, PagedResult, PlantRecommendation, ProductListDto } from "../types";

export function PlantFinderPage() {
  usePageTitle("AI Plant Finder");
  const [answers, setAnswers] = useState<AIPlantFinderAnswers>({});
  const [step, setStep] = useState(0);
  const [sort, setSort] = useState("Best Match");
  const [assistantText, setAssistantText] = useState("Answer a few simple questions and I will recommend plants that match your lifestyle and growing conditions.");
  const [catalog, setCatalog] = useState<ProductListDto[]>([]);
  const [catalogError, setCatalogError] = useState("");
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  useEffect(() => {
    setLoadingCatalog(true);
    api<PagedResult<ProductListDto>>(`/products${buildQuery({ pageSize: 100 })}`, { auth: false })
      .then((res) => setCatalog(res.items ?? []))
      .catch((err: Error) => setCatalogError(err.message || "Unable to load plants"))
      .finally(() => setLoadingCatalog(false));
  }, []);

  const questions = recommendationService.getQuestions(answers);
  const done = step >= questions.length;
  const recs = useMemo(
    () => (done ? recommendationService.recommend(catalog, answers) : []),
    [answers, catalog, done],
  );
  const sorted = [...recs].sort((a, b) =>
    sort === "Price Low to High" ? a.product.price - b.product.price
      : sort === "Price High to Low" ? b.product.price - a.product.price
        : sort === "Beginner Friendly" ? Number(b.product.isBestSeller || b.product.isFeatured) - Number(a.product.isBestSeller || a.product.isFeatured)
          : b.score - a.score);
  const question = questions[step];

  const choose = (key: string, value: string) => {
    setAnswers((current) => ({ ...current, [key]: value }));
    setStep((current) => current + 1);
  };

  return (
    <PageShell eyebrow="AI Plant Finder" title="Let's find the perfect plant for you!" text={assistantText}>
      <div className="finder-layout">
        <section className="chat-panel">
          <div className="avatar"><Sprout /> MittiLok Assistant</div>
          <div className="progress"><span style={{ width: `${Math.min(100, (step / Math.max(questions.length, 1)) * 100)}%` }} /></div>
          {!done && question ? (
            <div className="question-card">
              <p className="bubble">{question.text}</p>
              <div className="option-grid">{question.options.map((option) => <button key={option} type="button" onClick={() => choose(question.key, option)}>{option}</button>)}</div>
              <div className="button-row">
                <button className="btn secondary" type="button" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</button>
                <button className="btn secondary" type="button" onClick={() => setStep(step + 1)}>Next</button>
                <button className="btn ghost" type="button" onClick={() => { setAnswers({}); setStep(0); }}>Restart</button>
              </div>
            </div>
          ) : (
            <div className="question-card">
              <p className="bubble">We found plants that match your lifestyle from the live catalog.</p>
              <button className="btn secondary" type="button" onClick={() => { setAnswers({}); setStep(0); }}>Start again</button>
            </div>
          )}
        </section>
        <section className="results-panel">
          <div className="section-header">
            <div>
              <p className="eyebrow">Recommendations</p>
              <h2>We found plants that match your lifestyle</h2>
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option>Best Match</option>
              <option>Price Low to High</option>
              <option>Price High to Low</option>
              <option>Beginner Friendly</option>
            </select>
          </div>
          {loadingCatalog && <p>Loading live catalog...</p>}
          {catalogError && <p className="auth-error">{catalogError}</p>}
          {!loadingCatalog && !catalogError && done && !sorted.length && (
            <EmptyState text="No matching plants in the catalog yet. Browse the nursery instead." action="Shop plants" to="/shop" />
          )}
          <div className="recommendations">{sorted.map((item) => <RecommendationCard key={item.product.id} item={item} />)}</div>
          {done && sorted.length > 0 && (
            <div className="quick-actions">
              {["Show flowering plants", "Show low-maintenance plants", "Show cheaper options", "Show pet-friendly options", "Explain this plant"].map((action) => (
                <button key={action} type="button" onClick={() => setAssistantText(recommendationService.followUp(action, recs).text)}>{action}</button>
              ))}
            </div>
          )}
        </section>
      </div>
    </PageShell>
  );
}

function RecommendationCard({ item }: { item: PlantRecommendation }) {
  return (
    <article className="recommend-card">
      <img src={item.product.thumbnail} alt={item.product.name} />
      <div>
        <strong>{item.score}% Match</strong>
        <h3>{item.product.name}</h3>
        <ul>{item.reasons.map((reason) => <li key={reason}>✓ {reason}</li>)}</ul>
        {item.product.categoryName && <p>{item.product.categoryName}</p>}
        <p>{money(item.product.price)}{item.product.mrp > item.product.price ? <> · <s>{money(item.product.mrp)}</s></> : null}</p>
        <div className="button-row">
          <Link className="btn compact" to={`/shop?query=${encodeURIComponent(item.product.name)}`}>Find in Shop</Link>
          <Link className="btn compact" to={`/product/${item.product.slug}`}>View Plant</Link>
          <span className="icon-btn" aria-hidden><Heart size={17} /></span>
        </div>
      </div>
    </article>
  );
}
