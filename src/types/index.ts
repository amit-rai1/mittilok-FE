export type Role = "customer" | "admin";
export type CareLevel = "Easy" | "Moderate" | "Advanced";
export type Availability = "In stock" | "Low stock" | "Out of stock";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  price: number;
  mrp: number;
  rating: number;
  reviews: number;
  images: string[];
  badge?: string;
  sizes: string[];
  stock: number;
  sku: string;
  availability: Availability;
  lightRequirement: string[];
  waterRequirement: string;
  careLevel: CareLevel;
  indoorSuitable: boolean;
  outdoorSuitable: boolean;
  flowering: boolean;
  floweringFrequency: "Lots" | "Occasional" | "None";
  plantSize: "Small" | "Medium" | "Large";
  beginnerFriendly: boolean;
  airPurifying: boolean;
  budgetRange: "Under 200" | "200-500" | "500-1000" | "1000+";
  locationCompatibility: string[];
  petFriendly: boolean;
}

export interface Review {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  text: string;
  verified: boolean;
  image?: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  size: string;
}

export interface WishlistItem {
  productId: string;
  addedAt: string;
}

export interface Address {
  id: string;
  name: string;
  mobile: string;
  line1: string;
  city: string;
  state: string;
  pinCode: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  size: string;
  price: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  status: "Placed" | "Confirmed" | "Packed" | "Shipped" | "Out for Delivery" | "Delivered";
  total: number;
  address: Address;
  estimatedDelivery: string;
  paymentStatus: "Pending" | "Paid" | "Refunded";
}

export interface Plant {
  id: string;
  name: string;
  productId?: string;
  image: string;
  location: string;
  potSize: string;
  dateAdded: string;
  purchaseDate?: string;
  notes: string;
  sunlightCondition: string;
  wateringFrequency: string;
  fertilizerSchedule: string;
  careLevel: CareLevel;
}

export interface PlantCareSchedule {
  plantId: string;
  waterEveryDays: number;
  fertilizeEveryDays: number;
  pruneEveryDays: number;
  repotEveryMonths: number;
}

export interface PlantReminder {
  id: string;
  plantId: string;
  type: "Water" | "Sunlight" | "Fertilizer" | "Pruning" | "Repotting";
  dueDate: string;
  status: "Due" | "Done" | "Snoozed";
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  coverImage: string;
  readingTime: string;
  date: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderAmount: number;
  expiryDate: string;
  usageLimit: number;
}

export interface AIPlantFinderAnswers {
  location?: string;
  sunlight?: string;
  careTime?: string;
  plantType?: string;
  flowers?: string;
  size?: string;
  budget?: string;
  experience?: string;
  watering?: string;
}

export interface PlantRecommendation {
  product: Product;
  score: number;
  reasons: string[];
}
