import type { BlogPost, Category, Order, Plant, Product, Review } from "../types";

const img = (id: string, params = "auto=format&fit=crop&w=1100&q=80") =>
  `https://images.unsplash.com/${id}?${params}`;

export const categories: Category[] = [
  { id: "cat-flowering", name: "Flowering Plants", slug: "flowering-plants", description: "Colorful blooms for balconies, terraces, and gardens.", image: img("photo-1520412099551-62b6bafeb5bb") },
  { id: "cat-indoor", name: "Indoor Plants", slug: "indoor-plants", description: "Low-maintenance greens for calmer rooms and offices.", image: img("photo-1485955900006-10f4d324d411") },
  { id: "cat-outdoor", name: "Outdoor Plants", slug: "outdoor-plants", description: "Hardy plants that love Indian sun and open spaces.", image: img("photo-1416879595882-3373a0480b5b") },
  { id: "cat-fruit", name: "Fruit Plants", slug: "fruit-plants", description: "Grow lemons, guava, and seasonal fruit at home.", image: img("photo-1591857177580-dc82b9ac4e1e") },
  { id: "cat-climbers", name: "Climbers & Vines", slug: "climbers-vines", description: "Fast-growing greens for railings, arches, and walls.", image: img("photo-1599725111396-0a39f88617dc") },
  { id: "cat-rare", name: "Rare Plants", slug: "rare-plants", description: "Collector picks with distinctive foliage and character.", image: img("photo-1614594975525-e45190c55d0b") },
  { id: "cat-orchids", name: "Orchids", slug: "orchids", description: "Elegant blooming orchids with premium care guidance.", image: img("photo-1566907225472-3e4caa2d1a3f") },
  { id: "cat-succulents", name: "Succulents", slug: "succulents", description: "Compact, sculptural plants for bright corners.", image: img("photo-1459411621453-7b03977f4bfc") },
  { id: "cat-pots", name: "Pots & Planters", slug: "pots-planters", description: "Ceramic, terracotta, grow bags, and plant stands.", image: img("photo-1484694887424-9f5c0f3f6c53") },
  { id: "cat-fertilizers", name: "Fertilizers", slug: "fertilizers", description: "Soil mixes, compost, boosters, and plant nutrition.", image: img("photo-1591958911259-bee2173bdccc") },
  { id: "cat-tools", name: "Gardening Tools", slug: "gardening-tools", description: "Everyday tools for pruning, watering, and repotting.", image: img("photo-1617576683096-00fc8eecb3af") },
];

export const products: Product[] = [
  product("p1", "Snake Plant", "snake-plant", "Indoor Plants", 249, 349, "Best Seller", "photo-1593482892290-f54927ae2b98", ["Very Low Sunlight", "Low / Indirect Light"], "1-2 times a week", "Easy", true, false, false, "None", "Medium", true, true, "200-500", ["Bedroom", "Office", "Indoor"], true, 48),
  product("p2", "ZZ Plant", "zz-plant", "Indoor Plants", 399, 549, "Low Light", "photo-1632207691143-643e2a9a9361", ["Very Low Sunlight", "Low / Indirect Light"], "Very rarely", "Easy", true, false, false, "None", "Medium", true, true, "200-500", ["Bedroom", "Living Room", "Office"], false, 32),
  product("p3", "Aglaonema Red", "aglaonema-red", "Rare Plants", 599, 799, "Premium", "photo-1614594975525-e45190c55d0b", ["Low / Indirect Light", "Medium Sunlight"], "Every 2-3 days", "Easy", true, false, false, "None", "Medium", true, true, "500-1000", ["Living Room", "Office", "Indoor"], false, 18),
  product("p4", "Money Plant Marble", "money-plant-marble", "Climbers & Vines", 199, 299, "Easy Care", "photo-1622398925373-3f91b1e275f5", ["Low / Indirect Light", "Medium Sunlight"], "Every 2-3 days", "Easy", true, true, false, "None", "Small", true, true, "Under 200", ["Bedroom", "Balcony", "Office", "Indoor"], false, 56),
  product("p5", "Peace Lily", "peace-lily", "Flowering Plants", 449, 649, "Air Purifier", "photo-1593691509543-c55fb32d8de5", ["Low / Indirect Light", "Medium Sunlight"], "Every 2-3 days", "Moderate", true, false, true, "Occasional", "Medium", true, true, "200-500", ["Bedroom", "Living Room", "Office"], false, 22),
  product("p6", "Areca Palm", "areca-palm", "Indoor Plants", 699, 999, "Tall Green", "photo-1598880940080-ff9a29891b85", ["Medium Sunlight", "3-4 Hours Sunlight"], "A few times a week", "Moderate", true, true, false, "None", "Large", true, true, "500-1000", ["Living Room", "Balcony", "Office"], true, 14),
  product("p7", "Bougainvillea", "bougainvillea", "Flowering Plants", 349, 499, "Full Sun", "photo-1533392067585-ace6cf792b33", ["5-6+ Hours Direct Sunlight", "Full Sun"], "Every day", "Easy", false, true, true, "Lots", "Large", true, false, "200-500", ["Balcony", "Terrace", "Garden", "Outdoor"], true, 40),
  product("p8", "Hibiscus Red", "hibiscus-red", "Flowering Plants", 299, 449, "Daily Blooms", "photo-1597848212624-a19eb35e2651", ["5-6+ Hours Direct Sunlight", "Full Sun"], "Every day", "Easy", false, true, true, "Lots", "Medium", true, false, "200-500", ["Balcony", "Terrace", "Garden"], true, 36),
  product("p9", "Jasmine Mogra", "jasmine-mogra", "Climbers & Vines", 249, 399, "Fragrant", "photo-1562158070-57dc0519abef", ["3-4 Hours Sunlight", "5-6+ Hours Direct Sunlight"], "Every day", "Moderate", false, true, true, "Lots", "Medium", true, false, "200-500", ["Balcony", "Terrace", "Garden"], true, 28),
  product("p10", "Adenium Desert Rose", "adenium-desert-rose", "Succulents", 499, 699, "Statement", "photo-1509587584298-0f3b3a3a1797", ["5-6+ Hours Direct Sunlight", "Full Sun"], "Very rarely", "Moderate", false, true, true, "Occasional", "Small", false, false, "200-500", ["Balcony", "Terrace", "Garden"], false, 19),
  product("p11", "Phalaenopsis Orchid", "phalaenopsis-orchid", "Orchids", 1299, 1699, "Gift Ready", "photo-1566907225472-3e4caa2d1a3f", ["Low / Indirect Light", "Medium Sunlight"], "1-2 times a week", "Advanced", true, false, true, "Occasional", "Medium", false, false, "1000+", ["Living Room", "Office", "Indoor"], false, 9),
  product("p12", "Dendrobium Orchid", "dendrobium-orchid", "Orchids", 999, 1399, "Blooming", "photo-1610809027249-86c649feacd5", ["Medium Sunlight", "3-4 Hours Sunlight"], "1-2 times a week", "Advanced", true, true, true, "Occasional", "Medium", false, false, "500-1000", ["Balcony", "Living Room"], false, 7),
  product("p13", "Lemon Plant", "lemon-plant", "Fruit Plants", 599, 849, "Fruit Plant", "photo-1590502593747-42a996133562", ["5-6+ Hours Direct Sunlight", "Full Sun"], "Every 2-3 days", "Moderate", false, true, true, "Occasional", "Large", true, false, "500-1000", ["Terrace", "Garden", "Outdoor"], true, 16),
  product("p14", "Guava Plant", "guava-plant", "Fruit Plants", 699, 999, "Edible Garden", "photo-1536511132770-e5058c7e8c46", ["Full Sun"], "Every 2-3 days", "Moderate", false, true, true, "Occasional", "Large", true, false, "500-1000", ["Terrace", "Garden", "Outdoor"], true, 12),
  product("p15", "Monstera Deliciosa", "monstera-deliciosa", "Rare Plants", 899, 1199, "Collector", "photo-1614594075924-6f65f1c64f53", ["Low / Indirect Light", "Medium Sunlight"], "Every 2-3 days", "Moderate", true, false, false, "None", "Large", false, true, "500-1000", ["Living Room", "Office", "Indoor"], false, 11),
  product("p16", "Rubber Plant", "rubber-plant", "Indoor Plants", 499, 699, "Glossy Leaves", "photo-1501004318641-b39e6451bec6", ["Medium Sunlight", "3-4 Hours Sunlight"], "1-2 times a week", "Easy", true, true, false, "None", "Medium", true, true, "200-500", ["Living Room", "Balcony", "Office"], false, 25),
  product("p17", "Aloe Vera", "aloe-vera", "Succulents", 179, 249, "Medicinal", "photo-1509423350716-97f9360b4e09", ["3-4 Hours Sunlight", "5-6+ Hours Direct Sunlight"], "Very rarely", "Easy", true, true, false, "None", "Small", true, true, "Under 200", ["Balcony", "Terrace", "Kitchen", "Office"], true, 62),
  product("p18", "Syngonium Pink", "syngonium-pink", "Indoor Plants", 299, 429, "Soft Foliage", "photo-1596724878582-76f1a5df2447", ["Low / Indirect Light", "Medium Sunlight"], "Every 2-3 days", "Easy", true, false, false, "None", "Small", true, true, "200-500", ["Bedroom", "Living Room", "Office"], false, 42),
  product("p19", "Fiddle Leaf Fig", "fiddle-leaf-fig", "Rare Plants", 1199, 1599, "Premium", "photo-1597055181300-e3633a917c05", ["Medium Sunlight", "3-4 Hours Sunlight"], "1-2 times a week", "Advanced", true, false, false, "None", "Large", false, true, "1000+", ["Living Room", "Office"], false, 6),
  product("p20", "Marigold Combo", "marigold-combo", "Flowering Plants", 149, 220, "Seasonal", "photo-1604762525958-d7f8518e4f0c", ["5-6+ Hours Direct Sunlight", "Full Sun"], "Every day", "Easy", false, true, true, "Lots", "Small", true, false, "Under 200", ["Balcony", "Terrace", "Garden"], true, 70),
  product("p21", "Terracotta Pot Set", "terracotta-pot-set", "Pots & Planters", 549, 799, "Handmade", "photo-1484694887424-9f5c0f3f6c53", ["Any"], "None", "Easy", true, true, false, "None", "Medium", true, false, "500-1000", ["Indoor", "Outdoor", "Balcony"], true, 30),
  product("p22", "Organic Plant Food", "organic-plant-food", "Fertilizers", 249, 329, "Organic", "photo-1591958911259-bee2173bdccc", ["Any"], "None", "Easy", true, true, false, "None", "Small", true, false, "200-500", ["Indoor", "Outdoor"], true, 80),
];
//functions
function product(
  id: string,
  name: string,
  slug: string,
  category: string,
  price: number,
  mrp: number,
  badge: string,
  imageId: string,
  lightRequirement: string[],
  waterRequirement: string,
  careLevel: Product["careLevel"],
  indoorSuitable: boolean,
  outdoorSuitable: boolean,
  flowering: boolean,
  floweringFrequency: Product["floweringFrequency"],
  plantSize: Product["plantSize"],
  beginnerFriendly: boolean,
  airPurifying: boolean,
  budgetRange: Product["budgetRange"],
  locationCompatibility: string[],
  petFriendly: boolean,
  stock: number,
): Product {
  return {
    id,
    name,
    slug,
    category,
    description: `${name} is a healthy MittiLok-selected ${category.toLowerCase()} option with nursery-packed roots, practical care guidance, and secure pan-India shipping.`,
    price,
    mrp,
    rating: Number((4.2 + (stock % 8) / 10).toFixed(1)),
    reviews: 18 + stock,
    images: [img(imageId), img(imageId, "auto=format&fit=crop&w=700&q=70")],
    badge,
    sizes: plantSize === "Large" ? ["Medium", "Large", "XL"] : plantSize === "Medium" ? ["Small", "Medium"] : ["Baby", "Small"],
    stock,
    sku: `ML-${id.toUpperCase()}`,
    availability: stock === 0 ? "Out of stock" : stock < 10 ? "Low stock" : "In stock",
    lightRequirement,
    waterRequirement,
    careLevel,
    indoorSuitable,
    outdoorSuitable,
    flowering,
    floweringFrequency,
    plantSize,
    beginnerFriendly,
    airPurifying,
    budgetRange,
    locationCompatibility,
    petFriendly,
  };
}

export const reviews: Review[] = [
  { id: "r1", productId: "p1", customerName: "Nisha Verma", rating: 5, text: "Healthy leaves, careful packaging, and clear watering instructions.", verified: true },
  { id: "r2", productId: "p7", customerName: "Rahul Menon", rating: 5, text: "The bougainvillea settled into my balcony within a week.", verified: true },
  { id: "r3", productId: "p11", customerName: "Ananya Rao", rating: 4, text: "Beautiful orchid spike and very premium presentation.", verified: true },
];

export const myPlants: Plant[] = [
  {
    id: "mp1",
    name: "Bougainvillea",
    productId: "p7",
    image: products.find((item) => item.id === "p7")!.images[0],
    location: "Balcony",
    potSize: "12 inch",
    dateAdded: "2026-08-10",
    purchaseDate: "2026-08-08",
    notes: "Training along railing. Loves direct morning sun.",
    sunlightCondition: "5-6+ Hours Direct Sunlight",
    wateringFrequency: "Every day",
    fertilizerSchedule: "Every 21 days",
    careLevel: "Easy",
  },
  {
    id: "mp2",
    name: "Snake Plant",
    productId: "p1",
    image: products.find((item) => item.id === "p1")!.images[0],
    location: "Bedroom",
    potSize: "8 inch",
    dateAdded: "2026-08-14",
    notes: "Rotate once a month for even growth.",
    sunlightCondition: "Low / Indirect Light",
    wateringFrequency: "1-2 times a week",
    fertilizerSchedule: "Monthly",
    careLevel: "Easy",
  },
];

export const orders: Order[] = [
  {
    id: "o1",
    orderNumber: "ML2026082701",
    userId: "u1",
    items: [
      { productId: "p1", quantity: 1, size: "Medium", price: 249 },
      { productId: "p22", quantity: 1, size: "Small", price: 249 },
    ],
    status: "Shipped",
    total: 498,
    estimatedDelivery: "2026-08-30",
    paymentStatus: "Paid",
    address: { id: "a1", name: "Amit", mobile: "6394060938", line1: "Pachperwa", city: "Pachperwa", state: "Uttar Pradesh", pinCode: "" },
  },
];

export const blogPosts: BlogPost[] = [
  { id: "b1", slug: "monsoon-balcony-care", title: "Monsoon Balcony Plant Care", category: "Seasonal Gardening", excerpt: "Drainage, pruning, and fungus prevention for rainy weeks.", content: "Keep pots raised, prune crowded stems, and water only when the top soil begins to dry.", coverImage: img("photo-1591857177580-dc82b9ac4e1e"), readingTime: "4 min", date: "2026-08-18" },
  { id: "b2", slug: "orchid-care-india", title: "Orchid Care for Indian Homes", category: "Orchid Care", excerpt: "Light, humidity, watering, and bloom support for beginner orchid owners.", content: "Use bright indirect light, airy media, and a measured weekly watering routine.", coverImage: img("photo-1566907225472-3e4caa2d1a3f"), readingTime: "6 min", date: "2026-08-12" },
  { id: "b3", slug: "low-light-indoor-plants", title: "Best Low-Light Indoor Plants", category: "Indoor Gardening", excerpt: "Snake plant, ZZ, aglaonema, and money plant picks for calmer interiors.", content: "Choose plants with flexible light tolerance and water sparingly in shaded rooms.", coverImage: img("photo-1485955900006-10f4d324d411"), readingTime: "5 min", date: "2026-08-06" },
];
