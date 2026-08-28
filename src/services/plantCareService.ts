import { myPlants } from "../data/catalog";
import type { PlantReminder } from "../types";

export const plantCareService = {
  async getReminders(): Promise<PlantReminder[]> {
    return myPlants.flatMap((plant, index) => [
      { id: `${plant.id}-water`, plantId: plant.id, type: "Water", dueDate: index === 0 ? "Tomorrow" : "In 3 days", status: "Due" },
      { id: `${plant.id}-fertilizer`, plantId: plant.id, type: "Fertilizer", dueDate: "Next week", status: "Due" },
    ]);
  },
};
