import type { AIPlantFinderAnswers } from "../types";
import { recommendationService } from "./recommendationService";

export const plantFinderService = {
  async getNextQuestions(answers: AIPlantFinderAnswers) {
    return recommendationService.getQuestions(answers);
  },
  async getRecommendations(answers: AIPlantFinderAnswers) {
    return recommendationService.recommend(answers);
  },
  async sendFollowUp(message: string, answers: AIPlantFinderAnswers) {
    const recommendations = recommendationService.recommend(answers);
    return recommendationService.followUp(message, recommendations);
  },
};
