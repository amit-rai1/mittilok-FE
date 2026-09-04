import { Heart, Sprout } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PageShell } from "../components/ui";
import { myPlants } from "../data/catalog";
import { money, usePageTitle } from "../lib/format";
import { recommendationService } from "../services/recommendationService";
import type { AIPlantFinderAnswers, PlantRecommendation } from "../types";

export function PlantFinderPage() {
  usePageTitle("AI Plant Finder");
  const [answers, setAnswers] = useState<AIPlantFinderAnswers>({});
  const [step, setStep] = useState(0);
  const [sort, setSort] = useState("Best Match");
  const [assistantText, setAssistantText] = useState("Answer a few simple questions and I will recommend plants that match your lifestyle and growing conditions.");
  const questions = recommendationService.getQuestions(answers);
  const done = step >= questions.length;
  const recs = useMemo(() => recommendationService.recommend(answers), [answers]);
  const sorted = [...recs].sort((a, b) =>
    sort === "Price Low to High" ? a.product.price - b.product.price
      : sort === "Price High to Low" ? b.product.price - a.product.price
        : sort === "Beginner Friendly" ? Number(b.product.beginnerFriendly) - Number(a.product.beginnerFriendly)
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
              <div className="option-grid">{question.options.map((option) => <button key={option} onClick={() => choose(question.key, option)}>{option}</button>)}</div>
              <div className="button-row">
                <button className="btn secondary" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</button>
                <button className="btn secondary" onClick={() => setStep(step + 1)}>Next</button>
                <button className="btn ghost" onClick={() => { setAnswers({}); setStep(0); }}>Restart</button>
              </div>
            </div>
          ) : (
            <div className="question-card">
              <p className="bubble">We found plants that match your lifestyle.</p>
              <button className="btn secondary" onClick={() => { setAnswers({}); setStep(0); }}>Start again</button>
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
          <div className="recommendations">{sorted.map((item) => <RecommendationCard key={item.product.id} item={item} />)}</div>
          <div className="quick-actions">
            {["Show flowering plants", "Show low-maintenance plants", "Show cheaper options", "Show pet-friendly options", "Explain this plant"].map((action) => (
              <button key={action} onClick={() => setAssistantText(recommendationService.followUp(action, recs).text)}>{action}</button>
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
}

function RecommendationCard({ item }: { item: PlantRecommendation }) {
  return (
    <article className="recommend-card">
      <img src={item.product.images[0]} alt={item.product.name} />
      <div>
        <strong>{item.score}% Match</strong>
        <h3>{item.product.name}</h3>
        <ul>{item.reasons.map((reason) => <li key={reason}>✓ {reason}</li>)}</ul>
        <p>{item.product.lightRequirement.join(", ")} • {item.product.waterRequirement} • {item.product.careLevel}</p>
        <p>{money(item.product.price)} • {item.product.sizes.join(", ")} • {item.product.availability}</p>
        <div className="button-row">
          <Link className="btn compact" to={`/shop?query=${encodeURIComponent(item.product.name)}`}>Find in Shop</Link>
          <Link className="btn compact" to={`/product/${item.product.slug}`}>View Plant</Link>
          <span className="icon-btn" aria-hidden><Heart size={17} /></span>
        </div>
      </div>
    </article>
  );
}

export function MyPlantsPage() {
  usePageTitle("My Plants");
  return (
    <PageShell eyebrow="My Plants" title="Your personal digital garden." text="Maintain records, care settings, growth notes, and reminders for every plant you own.">
      <div className="split-actions">
        <button className="btn primary" type="button">+ Add New Plant</button>
        <button className="btn secondary" type="button">Bought from MittiLok</button>
        <button className="btn secondary" type="button">Existing plant</button>
        <button className="btn secondary" type="button">Manually add plant</button>
      </div>
      <div className="plant-grid">
        {myPlants.map((plant) => (
          <Link to={`/my-plants/${plant.id}`} className="plant-card" key={plant.id}>
            <img src={plant.image} alt={plant.name} />
            <h3>{plant.name}</h3>
            <p>{plant.location} • {plant.potSize}</p>
            <span>Next watering: {plant.name === "Snake Plant" ? "In 3 days" : "Tomorrow"}</span>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}

export function PlantProfilePage() {
  const { id } = useParams();
  const plant = myPlants.find((item) => item.id === id) ?? myPlants[0];
  usePageTitle(plant.name);
  return (
    <PageShell eyebrow="Plant Profile" title={plant.name} text={`${plant.location} • ${plant.potSize} • Added ${plant.dateAdded}`}>
      <div className="profile-layout">
        <img src={plant.image} alt={plant.name} />
        <div className="care-guide">
          <div><span>Sunlight</span><strong>{plant.sunlightCondition}</strong></div>
          <div><span>Watering</span><strong>{plant.wateringFrequency}</strong></div>
          <div><span>Care</span><strong>{plant.careLevel}</strong></div>
          <div><span>Fertilizer</span><strong>{plant.fertilizerSchedule}</strong></div>
        </div>
      </div>
      <div className="tabs">{["Overview", "Care", "Watering", "Fertilizer", "Growth", "Notes"].map((tab) => <button key={tab} type="button">{tab}</button>)}</div>
      <p className="note">{plant.notes}</p>
    </PageShell>
  );
}

export function CarePage() {
  usePageTitle("Plant Care");
  const reminders = myPlants.flatMap((plant) =>
    ["Water", "Sunlight", "Fertilizer", "Pruning", "Repotting"].map((type, index) => ({
      plant,
      type,
      due: index === 0 ? (plant.id === "mp1" ? "Tomorrow" : "In 3 days") : "This week",
    })));
  return (
    <PageShell eyebrow="Plant Care Dashboard" title="Today's Care" text="Smart reminders built from plant type and your own routine.">
      <div className="care-list">
        {reminders.map((item) => (
          <article key={`${item.plant.id}-${item.type}`}>
            <strong>{item.type}</strong>
            <span>{item.plant.name}</span>
            <b>{item.due}</b>
            <button type="button">Mark as done</button>
            <button type="button">Snooze</button>
            <button type="button">Edit schedule</button>
          </article>
        ))}
      </div>
      <div className="calendar">
        <h2>Plant Care Calendar</h2>
        {Array.from({ length: 14 }, (_, i) => (
          <div key={i}><span>Day {i + 1}</span><b>{i % 3 === 0 ? "Water" : i % 5 === 0 ? "Fertilizer" : "Check"}</b></div>
        ))}
      </div>
    </PageShell>
  );
}
