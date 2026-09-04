/** Mock catalog product used by AI Plant Finder / My Plants (local data). */
export type CareLevel = "Easy" | "Moderate" | "Advanced";
export type Availability = "In stock" | "Low stock" | "Out of stock";

export interface CatalogProduct {
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

/** @deprecated Use CatalogProduct for mock data; prefer API product types for shop. */
export type Product = CatalogProduct;

export interface CatalogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
}

export type Category = CatalogCategory;

export interface CatalogReview {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  text: string;
  verified: boolean;
  image?: string;
}

export type Review = CatalogReview;

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
  product: CatalogProduct;
  score: number;
  reasons: string[];
}

/* ─── Auth ─── */
export interface UserDto {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  profileImage?: string | null;
  userType: string;
  roles: string[];
  permissions: string[];
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: UserDto;
}

export interface LoginRequest {
  emailOrPhone: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone?: string | null;
  password: string;
}

/* ─── Catalog ─── */
export interface CategoryDto {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  icon?: string | null;
  parentCategoryId?: number | null;
  type: number;
  displayOrder: number;
  isActive: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
}

export interface CategoryTreeDto {
  id: number;
  name: string;
  slug: string;
  image?: string | null;
  icon?: string | null;
  /** CategoryType: Product=0, Service=1, Podcast=2, Mixed=3 */
  type?: number;
  displayOrder: number;
  isActive: boolean;
  children: CategoryTreeDto[];
}

export interface ProductListDto {
  id: number;
  sku: string;
  name: string;
  slug: string;
  thumbnail?: string | null;
  brand?: string | null;
  price: number;
  mrp: number;
  sellingPrice: number;
  discountPercent: number;
  stockQuantity: number;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isOrganic: boolean;
  status: string;
  categoryId: number;
  categoryName?: string | null;
  averageRating?: number | null;
  reviewCount: number;
}

export interface ProductVariantDto {
  id: number;
  sku: string;
  name: string;
  attributesJson?: string | null;
  price: number;
  mrp: number;
  stock: number;
  weight?: number | null;
  image?: string | null;
}

export interface ProductImageDto {
  id: number;
  url: string;
  alt?: string | null;
  displayOrder: number;
  isPrimary: boolean;
}

export interface ProductSpecificationDto {
  id: number;
  name: string;
  value: string;
  displayOrder: number;
}

export interface ProductDetailDto {
  id: number;
  sku: string;
  name: string;
  slug: string;
  categoryId: number;
  categoryName?: string | null;
  subCategoryId?: number | null;
  brand?: string | null;
  shortDescription?: string | null;
  fullDescription?: string | null;
  thumbnail?: string | null;
  price: number;
  mrp: number;
  discountPercent: number;
  sellingPrice: number;
  taxPercent: number;
  stockQuantity: number;
  unit?: string | null;
  weight?: number | null;
  dimensions?: string | null;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isOrganic: boolean;
  careInstructions?: string | null;
  plantHeight?: string | null;
  potSize?: string | null;
  sunlightRequirement?: string | null;
  waterRequirement?: string | null;
  soilType?: string | null;
  deliveryInfo?: string | null;
  isReturnEligible: boolean;
  status: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  variants: ProductVariantDto[];
  images: ProductImageDto[];
  specifications: ProductSpecificationDto[];
  averageRating?: number | null;
  reviewCount: number;
}

export interface ProductSearchParams {
  query?: string;
  categoryId?: number;
  subCategoryId?: number;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isOrganic?: boolean;
  status?: string;
  sortBy?: string;
  sortDesc?: boolean;
  page?: number;
  pageSize?: number;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages?: number;
  extra?: unknown;
}

/* ─── Cart / Wishlist ─── */
export interface CartItemDto {
  id: number;
  productId: number;
  variantId?: number | null;
  productName: string;
  variantName?: string | null;
  imageUrl?: string | null;
  sku: string;
  quantity: number;
  unitPrice: number;
  mrp: number;
  lineTotal: number;
  availableStock: number;
}

export interface CartDto {
  id: number;
  items: CartItemDto[];
  subtotal: number;
  itemCount: number;
}

export interface WishlistItemDto {
  id: number;
  productId: number;
  productName: string;
  slug: string;
  thumbnail?: string | null;
  sellingPrice: number;
  mrp: number;
}

export interface WishlistDto {
  id: number;
  items: WishlistItemDto[];
}

export interface LocalCartItem {
  productId: number;
  variantId?: number | null;
  quantity: number;
  productName: string;
  slug?: string;
  imageUrl?: string | null;
  unitPrice: number;
  mrp: number;
  variantName?: string | null;
}

export interface AddressDto {
  id: number;
  fullName: string;
  mobile: string;
  houseFlat: string;
  street?: string | null;
  area?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  addressType: number;
  isDefault: boolean;
}

export interface AddressRequest {
  fullName: string;
  mobile: string;
  houseFlat: string;
  street?: string | null;
  area?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  pincode: string;
  country?: string;
  addressType?: number;
  isDefault?: boolean;
}

/* ─── Checkout / Orders ─── */
export enum PaymentMethod {
  Razorpay = 0,
  Upi = 1,
  Card = 2,
  NetBanking = 3,
  Wallet = 4,
  Cod = 5,
}

export enum OrderStatus {
  Pending = 0,
  Confirmed = 1,
  Processing = 2,
  Packed = 3,
  Shipped = 4,
  OutForDelivery = 5,
  Delivered = 6,
  Cancelled = 7,
  Returned = 8,
  RefundInitiated = 9,
  Refunded = 10,
}

export enum PaymentStatus {
  Pending = 0,
  Processing = 1,
  Paid = 2,
  Failed = 3,
  Refunded = 4,
  PartiallyRefunded = 5,
}

export interface CheckoutPreviewRequest {
  addressId?: number | null;
  couponCode?: string | null;
  paymentMethod?: PaymentMethod;
  isBuyNow?: boolean;
  buyNowProductId?: number | null;
  buyNowVariantId?: number | null;
  buyNowQuantity?: number;
}

export interface CheckoutLineDto {
  productId: number;
  variantId?: number | null;
  productName: string;
  variantName?: string | null;
  imageUrl?: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface CheckoutPreviewResponse {
  items: CheckoutLineDto[];
  subtotal: number;
  discount: number;
  couponDiscount: number;
  shipping: number;
  tax: number;
  grandTotal: number;
  couponCode?: string | null;
  couponMessage?: string | null;
  couponValid: boolean;
}

export interface PlaceOrderRequest {
  addressId: number;
  couponCode?: string | null;
  paymentMethod: PaymentMethod;
  notes?: string | null;
  isBuyNow?: boolean;
  buyNowProductId?: number | null;
  buyNowVariantId?: number | null;
  buyNowQuantity?: number;
}

export interface OrderItemDto {
  id: number;
  productId?: number | null;
  variantId?: number | null;
  productName: string;
  sku: string;
  variantName?: string | null;
  imageUrl?: string | null;
  unitPrice: number;
  mrp: number;
  discount: number;
  tax: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderStatusHistoryDto {
  status: OrderStatus;
  note?: string | null;
  createdAt: string;
}

export interface OrderDto {
  id: number;
  orderNumber: string;
  subtotal: number;
  discount: number;
  couponDiscount: number;
  shipping: number;
  tax: number;
  grandTotal: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  trackingNumber?: string | null;
  createdAt: string;
  itemCount: number;
}

export interface OrderDetailDto extends Omit<OrderDto, "itemCount"> {
  couponCodeSnapshot?: string | null;
  deliveryPartner?: string | null;
  notes?: string | null;
  fullName: string;
  mobile: string;
  houseFlat: string;
  street?: string | null;
  area?: string | null;
  landmark?: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isBuyNow: boolean;
  items: OrderItemDto[];
  statusHistory: OrderStatusHistoryDto[];
}

export interface PaymentOrderResult {
  orderId: number;
  orderNumber: string;
  gatewayOrderId?: string | null;
  amount: number;
  currency: string;
  method: string;
  requiresPayment: boolean;
}

/* ─── CMS / Content ─── */
export interface BannerDto {
  id: number;
  title: string;
  subtitle?: string | null;
  image: string;
  mobileImage?: string | null;
  buttonText?: string | null;
  buttonLink?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  displayOrder: number;
  isActive: boolean;
}

export interface HomepageSectionDto {
  id: number;
  key: string;
  title: string;
  sectionType: string;
  configJson?: string | null;
  displayOrder: number;
  isEnabled: boolean;
}

/* ─── Notifications ─── */
export interface NotificationDto {
  id: number;
  title: string;
  message: string;
  notificationType: number;
  entityType: number;
  entityId?: number | null;
  isRead: boolean;
  readAt?: string | null;
  referenceKey?: string | null;
  createdAt: string;
}

export interface NotificationListResponse {
  items: NotificationDto[];
  page: number;
  pageSize: number;
  totalCount: number;
  unreadCount: number;
}

/* ─── Services / Podcast ─── */
export interface ServiceDto {
  id: number;
  name: string;
  slug: string;
  categoryId: number;
  categoryName?: string | null;
  subCategoryId?: number | null;
  description?: string | null;
  imagesJson?: string | null;
  basePrice: number;
  pricingType: number;
  duration?: string | null;
  serviceArea?: string | null;
  isActive: boolean;
}

export interface ServiceBookingRequest {
  serviceId: number;
  addressId?: number | null;
  bookingDate: string;
  timeSlot?: string | null;
  notes?: string | null;
  photosJson?: string | null;
}

export interface ServiceBookingDto {
  id: number;
  bookingNumber: string;
  serviceId: number;
  serviceName?: string | null;
  bookingDate: string;
  timeSlot?: string | null;
  notes?: string | null;
  estimatedPrice: number;
  finalPrice?: number | null;
  paymentStatus: PaymentStatus;
  status: number;
  createdAt: string;
}

export interface EnquiryRequest {
  name: string;
  mobile: string;
  email?: string | null;
  projectType?: string | null;
  location?: string | null;
  propertyType?: string | null;
  areaSize?: string | null;
  requirement?: string | null;
  budgetRange?: string | null;
  preferredDate?: string | null;
  imagesJson?: string | null;
  additionalNotes?: string | null;
}

export interface EnquiryDto {
  id: number;
  name: string;
  mobile: string;
  email?: string | null;
  projectType?: string | null;
  location?: string | null;
  propertyType?: string | null;
  areaSize?: string | null;
  requirement?: string | null;
  budgetRange?: string | null;
  preferredDate?: string | null;
  status: number;
  createdAt: string;
}

export interface PodcastPackageDto {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  durationMinutes: number;
  featuresJson?: string | null;
  isActive: boolean;
}

export interface PodcastDto {
  id: number;
  title: string;
  description?: string | null;
  facilitiesJson?: string | null;
  photosJson?: string | null;
  faqsJson?: string | null;
  isActive: boolean;
  packages: PodcastPackageDto[];
}

export interface PodcastBookingRequest {
  name: string;
  mobile: string;
  email?: string | null;
  packageId?: number | null;
  bookingDate: string;
  preferredTime?: string | null;
  guestCount?: number;
  topic?: string | null;
  requirements?: string | null;
  additionalNotes?: string | null;
}

export interface PodcastBookingDto {
  id: number;
  bookingNumber: string;
  name: string;
  mobile: string;
  email?: string | null;
  packageId?: number | null;
  packageName?: string | null;
  bookingDate: string;
  preferredTime?: string | null;
  guestCount: number;
  topic?: string | null;
  amount: number;
  paymentStatus: PaymentStatus;
  status: number;
  createdAt: string;
}

/* Legacy mock auth / care types for unused local services */
export type Role = "customer" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
}

export interface PlantReminder {
  id: string;
  plantId: string;
  type: "Water" | "Sunlight" | "Fertilizer" | "Pruning" | "Repotting";
  dueDate: string;
  status: "Due" | "Done" | "Snoozed";
}

export interface ReviewDto {
  id: number;
  userId: number;
  userName?: string | null;
  productId?: number | null;
  serviceId?: number | null;
  orderId?: number | null;
  rating: number;
  title?: string | null;
  comment?: string | null;
  imagesJson?: string | null;
  isVerifiedPurchase: boolean;
  status: number;
  createdAt: string;
}

export interface CreateReviewRequest {
  productId?: number | null;
  serviceId?: number | null;
  orderId?: number | null;
  rating: number;
  title?: string | null;
  comment?: string | null;
  imagesJson?: string | null;
}

/* Legacy mock order shape kept for unused catalog exports */
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

export interface CartItem {
  productId: string;
  quantity: number;
  size: string;
}

export interface WishlistItem {
  productId: string;
  addedAt: string;
}
