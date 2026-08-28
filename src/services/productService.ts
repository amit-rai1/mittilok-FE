import { categories, products, reviews } from "../data/catalog";
import type { Category, Product } from "../types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000/api";

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`);
  if (!response.ok) throw new Error("Catalog API unavailable");
  return response.json() as Promise<T>;
}

function mapProduct(item: any): Product {
  const metadata = item.plantMetadata ?? {};
  const image = item.images?.[0]?.url ?? item.images?.[0] ?? "";
  return { id: item._id, name: item.name, slug: item.slug, category: item.categoryName ?? "MittiLok Nursery", description: item.description ?? "", price: item.salePrice ?? item.price ?? 0, mrp: item.price ?? 0, rating: 4.5, reviews: 0, images: image ? [image] : [], badge: item.featured ? "Featured" : undefined, sizes: ["Standard"], stock: item.stock ?? 0, sku: item.sku, availability: item.stock > 0 ? item.stock < 10 ? "Low stock" : "In stock" : "Out of stock", lightRequirement: metadata.lightRequirement ?? ["Medium Sunlight"], waterRequirement: metadata.waterRequirement ?? "Every 2-3 days", careLevel: metadata.careLevel ?? "Easy", indoorSuitable: metadata.indoorSuitable ?? true, outdoorSuitable: metadata.outdoorSuitable ?? true, flowering: metadata.flowering ?? false, floweringFrequency: metadata.floweringFrequency ?? "None", plantSize: metadata.plantSize ?? "Medium", beginnerFriendly: metadata.beginnerFriendly ?? true, airPurifying: metadata.airPurifying ?? false, budgetRange: "200-500", locationCompatibility: ["Indoor", "Outdoor", "Balcony"], petFriendly: false };
}

export const productService = {
  async getProducts() {
    try { const result = await getJson<any[]>("/products"); return result.length ? result.map(mapProduct) : products; } catch { return products; }
  },
  async getProductBySlug(slug: string) {
    try { const result = await getJson<any>(`/products/${slug}`); return mapProduct(result); } catch { return products.find((product) => product.slug === slug) ?? null; }
  },
  async getCategories() {
    try { const result = await getJson<any[]>("/categories"); const dynamic = result.flatMap((category) => (category.subCategories ?? []).map((sub: any) => ({ id: sub._id, name: sub.name, slug: sub.slug, description: sub.description ?? category.name, image: sub.image ?? category.image ?? "" } as Category))); return dynamic.length ? dynamic : categories; } catch { return categories; }
  },
  async getProductsByCategory(slug: string) {
    const category = categories.find((item) => item.slug === slug);
    if (!category) return [];
    try { const result = await getJson<any[]>(`/products?search=${encodeURIComponent(category.name)}`); return result.map(mapProduct); } catch { return products.filter((product) => product.category === category.name); }
  },
  async searchProducts(query: string) {
    const normalized = query.toLowerCase();
    try { const result = await getJson<any[]>(`/products?search=${encodeURIComponent(query)}`); return result.map(mapProduct); } catch { return products.filter((product) => `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(normalized)); }
  },
  async getReviews(productId: string) {
    return reviews.filter((review) => review.productId === productId);
  },
};
