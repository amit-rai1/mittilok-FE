import { myPlants } from "../data/catalog";
import type { Plant } from "../types";

export const plantService = {
  async getMyPlants() {
    return myPlants;
  },
  async addPlant(plant: Plant) {
    myPlants.push(plant);
    return plant;
  },
};
