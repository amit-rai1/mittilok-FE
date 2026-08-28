const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:5000/api";

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("mittilok-token");
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message ?? "Unable to load data");
  return body as T;
}

export interface ApiCategory {
  _id: string;
  name: string;
  slug: string;
  type: "service" | "product" | "podcast";
  status: string;
  subCategories?: Array<{ _id: string; name: string; slug: string; status: string }>;
}

export interface ApiProduct {
  _id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  status: string;
}

export interface ApiService {
  _id: string;
  name: string;
  priceType: string;
  status: string;
}

export const catalogApi = {
  categories: () => apiRequest<ApiCategory[]>("/categories"),
  adminCategories: () => apiRequest<{ categories: ApiCategory[]; subCategories: ApiCategory["subCategories"] }>("/categories/admin"),
  products: () => apiRequest<ApiProduct[]>("/products/admin/all"),
  services: () => apiRequest<ApiService[]>("/services/admin/all"),
};
