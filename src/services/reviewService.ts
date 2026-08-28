import { reviews } from "../data/catalog";

export const reviewService = {
  async getProductReviews(productId: string) {
    return reviews.filter((review) => review.productId === productId);
  },
};
