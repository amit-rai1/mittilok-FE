import { createContext, useContext, useEffect, useState } from "react";
import { categories as demoCategories, products as demoProducts } from "../data/catalog";
import { productService } from "../services/productService";
import type { Category, Product } from "../types";

interface CatalogContextValue { products: Product[]; categories: Category[]; loading: boolean; error: string; }
const CatalogContext = createContext<CatalogContextValue | null>(null);

export function CatalogProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(demoProducts);
  const [categories, setCategories] = useState<Category[]>(demoCategories);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => { Promise.all([productService.getProducts(), productService.getCategories()]).then(([nextProducts, nextCategories]) => { setProducts(nextProducts); setCategories(nextCategories); }).catch(() => setError("Live catalog is temporarily unavailable; showing the demo catalog." )).finally(() => setLoading(false)); }, []);
  return <CatalogContext.Provider value={{ products, categories, loading, error }}>{children}</CatalogContext.Provider>;
}

export function useCatalog() { const value = useContext(CatalogContext); if (!value) throw new Error("useCatalog must be used inside CatalogProvider"); return value; }
