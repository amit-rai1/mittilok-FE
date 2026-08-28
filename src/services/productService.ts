import { categories, products, reviews } from "../data/catalog";

export const productService = {
  async getProducts() {
    return products;
  },
  async getProductBySlug(slug: string) {
    return products.find((product) => product.slug === slug) ?? null;
  },
  async getCategories() {
    return categories;
  },
  async getProductsByCategory(slug: string) {
    const category = categories.find((item) => item.slug === slug);
    return category ? products.filter((product) => product.category === category.name) : [];
  },
  async searchProducts(query: string) {
    const normalized = query.toLowerCase();
    return products.filter((product) => `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(normalized));
  },
  async getReviews(productId: string) {
    return reviews.filter((review) => review.productId === productId);
  },
};
