import { mediaUrl } from "../lib/api";
import type { AIPlantFinderAnswers, PlantRecommendation, ProductListDto } from "../types";

const budgetMap = new Map([
  ["Under Rs 200", [0, 200]],
  ["Rs 200-Rs 500", [200, 500]],
  ["Rs 500-Rs 1,000", [500, 1000]],
  ["Rs 1,000+", [1000, Number.POSITIVE_INFINITY]],
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
  recommend(products: ProductListDto[], answers: AIPlantFinderAnswers): PlantRecommendation[] {
    return products
      .map((product) => scoreProduct(product, answers))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  },
  followUp(action: string, recommendations: PlantRecommendation[]) {
    const filters: Record<string, (item: PlantRecommendation) => boolean> = {
      "Show flowering plants": (item) => /flower|rose|hibiscus|bougainvillea/i.test(`${item.product.name} ${item.product.categoryName ?? ""}`),
      "Show low-maintenance plants": (item) => item.product.isBestSeller || item.score >= 70,
      "Show cheaper options": (item) => item.product.sellingPrice <= 500,
      "Show pet-friendly options": (item) => item.product.isOrganic || /pet|safe|non.?toxic/i.test(item.product.name),
    };
    const filtered = filters[action] ? recommendations.filter(filters[action]) : recommendations;
    return {
      text: action === "Explain this plant"
        ? "Open any recommendation to see full plant details, light, and care tips from the live catalog."
        : `Sure. Based on your answers, these ${filtered.length || recommendations.length} plants fit that request best.`,
      recommendations: filtered.length ? filtered : recommendations,
    };
  },
};

function scoreProduct(product: ProductListDto, answers: AIPlantFinderAnswers): PlantRecommendation {
  let points = 40;
  const reasons: string[] = [];
  const haystack = `${product.name} ${product.categoryName ?? ""} ${product.brand ?? ""}`.toLowerCase();
  const price = product.sellingPrice || product.price;

  if (answers.location === "Indoor" && /indoor|house|shade|snake|zz|pothos|money/i.test(haystack)) {
    points += 14;
    reasons.push("Indoor friendly");
  }
  if (answers.location === "Outdoor" && /outdoor|garden|terrace|sun|bougainvillea|hibiscus|tree/i.test(haystack)) {
    points += 14;
    reasons.push("Outdoor friendly");
  }
  if (answers.location && /balcony|terrace|garden|office|bedroom|living/i.test(answers.location)) {
    points += 6;
  }

  if (answers.sunlight && /low|indirect|very low/i.test(answers.sunlight) && /shade|indirect|low|indoor/i.test(haystack)) {
    points += 12;
    reasons.push("Low light match");
  }
  if (answers.sunlight && /full sun|5-6|direct/i.test(answers.sunlight) && /sun|outdoor|flower/i.test(haystack)) {
    points += 12;
    reasons.push("Sunlight match");
  }

  if (answers.careTime === "Very little time" && (product.isBestSeller || /easy|snake|zz|succulent/i.test(haystack))) {
    points += 12;
    reasons.push("Low maintenance");
  }

  if (answers.plantType && answers.plantType !== "Any") {
    const typeKey = answers.plantType.toLowerCase().replace(" plant", "");
    if (haystack.includes(typeKey) || (product.categoryName ?? "").toLowerCase().includes(typeKey)) {
      points += 14;
      reasons.push(`${answers.plantType} match`);
    }
  }

  if (answers.flowers && /lots|occasional/i.test(answers.flowers) && /flower|rose|hibiscus|bougainvillea/i.test(haystack)) {
    points += 10;
    reasons.push("Flowering");
  }

  const budget = answers.budget ? budgetMap.get(answers.budget) : undefined;
  if (budget && price >= budget[0] && price < budget[1]) {
    points += 12;
    reasons.push("Fits your budget");
  }
  if (answers.budget === "No fixed budget") points += 4;

  if (answers.experience === "Beginner" && (product.isBestSeller || product.isFeatured)) {
    points += 10;
    reasons.push("Beginner friendly");
  }

  if (product.isOrganic) {
    points += 4;
    reasons.push("Organic");
  }
  if (product.isFeatured || product.isBestSeller) points += 6;

  const score = Math.min(99, Math.max(42, Math.round(points)));
  return {
    product: {
      id: product.id,
      slug: product.slug,
      name: product.name,
      categoryName: product.categoryName,
      price,
      mrp: product.mrp,
      thumbnail: mediaUrl(product.thumbnail),
      isBestSeller: product.isBestSeller,
      isOrganic: product.isOrganic,
      isFeatured: product.isFeatured,
    },
    score,
    reasons: [...new Set(reasons)].slice(0, 4),
  };
}
