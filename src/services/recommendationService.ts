import { products } from "../data/catalog";
import type { AIPlantFinderAnswers, PlantRecommendation, Product } from "../types";

const careMap = new Map([
  ["Very little time", ["Easy"]],
  ["A little time every day", ["Easy", "Moderate"]],
  ["A few times a week", ["Easy", "Moderate"]],
  ["I can regularly care for my plants", ["Easy", "Moderate", "Advanced"]],
]);

const budgetMap = new Map([
  ["Under Rs 200", "Under 200"],
  ["Rs 200-Rs 500", "200-500"],
  ["Rs 500-Rs 1,000", "500-1000"],
  ["Rs 1,000+", "1000+"],
]);

export const recommendationService = {
  getQuestions(currentAnswers: AIPlantFinderAnswers) {
    const wantsFlowers = currentAnswers.plantType === "Flowering Plant";
    return [
      { key: "location", text: "Where do you want to keep the plant?", options: ["Bedroom", "Living Room", "Balcony", "Terrace", "Garden", "Office", "Indoor", "Outdoor"] },
      { key: "sunlight", text: "How much sunlight does the location receive?", options: ["Very Low Sunlight", "Low / Indirect Light", "Medium Sunlight", "3-4 Hours Sunlight", "5-6+ Hours Direct Sunlight", "Full Sun"] },
      { key: "careTime", text: "How much time can you give to plant care?", options: ["Very little time", "A little time every day", "A few times a week", "I can regularly care for my plants"] },
      { key: "plantType", text: "What type of plant are you looking for?", options: ["Flowering Plant", "Indoor Plant", "Outdoor Plant", "Fruit Plant", "Tree", "Climber", "Decorative Plant", "Air Purifying Plant", "Any"] },
      ...(wantsFlowers ? [{ key: "flowers", text: "Do you want flowers?", options: ["Lots of flowers", "Occasional flowers", "Flowers are not important"] }] : []),
      { key: "size", text: "Preferred plant size?", options: ["Small", "Medium", "Large", "No preference"] },
      { key: "budget", text: "Budget?", options: ["Under Rs 200", "Rs 200-Rs 500", "Rs 500-Rs 1,000", "Rs 1,000+", "No fixed budget"] },
      { key: "experience", text: "Plant-care experience?", options: ["Beginner", "Some experience", "Experienced gardener"] },
      { key: "watering", text: "How often can you water?", options: ["Every day", "Every 2-3 days", "1-2 times a week", "Very rarely"] },
    ] as const;
  },
  recommend(answers: AIPlantFinderAnswers): PlantRecommendation[] {
    return products
      .filter((product) => !["Pots & Planters", "Fertilizers", "Gardening Tools"].includes(product.category))
      .map((product) => scoreProduct(product, answers))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  },
  followUp(action: string, recommendations: PlantRecommendation[]) {
    const filters: Record<string, (item: PlantRecommendation) => boolean> = {
      "Show flowering plants": (item) => item.product.flowering,
      "Show low-maintenance plants": (item) => item.product.careLevel === "Easy",
      "Show cheaper options": (item) => item.product.price <= 500,
      "Show pet-friendly options": (item) => item.product.petFriendly,
    };
    const filtered = filters[action] ? recommendations.filter(filters[action]) : recommendations;
    return {
      text: action === "Explain this plant"
        ? "Pick any recommendation and I can explain its light, water, and care match using the local plant profile."
        : `Sure. Based on your answers, these ${filtered.length || recommendations.length} plants fit that request best.`,
      recommendations: filtered.length ? filtered : recommendations,
    };
  },
};

function scoreProduct(product: Product, answers: AIPlantFinderAnswers): PlantRecommendation {
  let points = 35;
  const reasons: string[] = [];

  if (answers.location && product.locationCompatibility.includes(answers.location)) {
    points += 14;
    reasons.push(`${answers.location} friendly`);
  }
  if (answers.location === "Indoor" && product.indoorSuitable) points += 8;
  if (answers.location === "Outdoor" && product.outdoorSuitable) points += 8;

  if (answers.sunlight && product.lightRequirement.includes(answers.sunlight)) {
    points += 16;
    reasons.push(product.lightRequirement.includes("Very Low Sunlight") ? "Low light friendly" : `${answers.sunlight} match`);
  }

  if (answers.careTime && careMap.get(answers.careTime)?.includes(product.careLevel)) {
    points += 12;
    reasons.push(product.careLevel === "Easy" ? "Low maintenance" : `${product.careLevel} care match`);
  }

  if (answers.plantType && answers.plantType !== "Any") {
    if (answers.plantType === "Air Purifying Plant" && product.airPurifying) points += 12;
    if (answers.plantType === "Flowering Plant" && product.flowering) points += 12;
    if (answers.plantType === "Indoor Plant" && product.indoorSuitable) points += 12;
    if (answers.plantType === "Outdoor Plant" && product.outdoorSuitable) points += 12;
    if (answers.plantType === "Fruit Plant" && product.category === "Fruit Plants") points += 12;
    if (answers.plantType === "Climber" && product.category === "Climbers & Vines") points += 12;
  }

  if (answers.flowers === "Lots of flowers" && product.floweringFrequency === "Lots") {
    points += 9;
    reasons.push("Lots of flowers");
  }
  if (answers.flowers === "Occasional flowers" && product.flowering) points += 6;
  if (answers.size && answers.size !== "No preference" && product.plantSize === answers.size) points += 7;

  const budget = answers.budget ? budgetMap.get(answers.budget) : undefined;
  if (budget && product.budgetRange === budget) {
    points += 10;
    reasons.push("Fits your budget");
  }

  if (answers.experience === "Beginner" && product.beginnerFriendly) {
    points += 12;
    reasons.push("Beginner friendly");
  }
  if (answers.watering && product.waterRequirement === answers.watering) {
    points += 10;
    reasons.push(`${answers.watering} watering`);
  }
  if (product.airPurifying) reasons.push("Air purifying");

  const score = Math.min(99, Math.max(42, Math.round(points)));
  return { product, score, reasons: [...new Set(reasons)].slice(0, 4) };
}
