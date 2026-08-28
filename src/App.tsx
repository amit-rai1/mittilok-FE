import {
  BarChart3,
  CalendarDays,
  ChevronRight,
  CreditCard,
  Heart,
  Home,
  Leaf,
  Menu,
  MessageCircle,
  PackageCheck,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Sprout,
  Star,
  Truck,
  User,
  X,
} from "lucide-react";
import { lazy, Suspense, useMemo, useState } from "react";
import { Link, NavLink, Route, Routes, useParams } from "react-router-dom";
import { blogPosts, categories, myPlants, orders, products, reviews } from "./data/catalog";
import { recommendationService } from "./services/recommendationService";
import type { AIPlantFinderAnswers, PlantRecommendation, Product } from "./types";
import { useCart } from "./context/CartContext";
import { useWishlist } from "./context/WishlistContext";

const AdminDashboard = lazy(() => Promise.resolve({ default: Admin }));

const money = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

function App() {
  return (
    <>
      <SEO />
      <Header />
      <main>
        <Suspense fallback={<SkeletonPage />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/shop/:categorySlug" element={<ShopPage />} />
            <Route path="/product/:slug" element={<ProductPage />} />
            <Route path="/ai-plant-finder" element={<PlantFinderPage />} />
            <Route path="/my-plants" element={<MyPlantsPage />} />
            <Route path="/my-plants/:id" element={<PlantProfilePage />} />
            <Route path="/care" element={<CarePage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/orders/:id" element={<OrderTrackingPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogArticlePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/signup" element={<AuthPage mode="signup" />} />
            <Route path="/privacy-policy" element={<PolicyPage title="Privacy Policy" />} />
            <Route path="/terms" element={<PolicyPage title="Terms & Conditions" />} />
            <Route path="/refund-policy" element={<PolicyPage title="Refund Policy" />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
          </Routes>
        </Suspense>
      </main>
      <MobileBottomNav />
      <FloatingWhatsApp />
      <Footer />
    </>
  );
}

function SEO() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "MittiLok Nursery",
          slogan: "Bring Nature Home",
          areaServed: "India",
          url: "https://mittilok.example",
        }),
      }}
    />
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const { ids } = useWishlist();
  const links = [
    ["Home", "/"],
    ["Shop", "/shop"],
    ["AI Plant Finder", "/ai-plant-finder"],
    ["My Plants", "/my-plants"],
    ["Blog", "/blog"],
    ["About", "/about"],
    ["Contact", "/contact"],
  ];
  return (
    <header className="site-header">
      <div className="announcement">Healthy Plants • Secure Packaging • Delivered Across India</div>
      <div className="nav-shell">
        <Link to="/" className="brand" aria-label="MittiLok Nursery home">
          <span className="brand-mark"><Sprout size={23} /></span>
          <span><strong>MittiLok</strong><small>Nursery</small></span>
        </Link>
        <nav className="desktop-nav" aria-label="Primary navigation">
          {links.map(([label, to]) => <NavLink key={to} to={to}>{label}</NavLink>)}
        </nav>
        <div className="nav-actions">
          <Link to="/shop" className="icon-btn" aria-label="Search"><Search size={19} /></Link>
          <Link to="/wishlist" className="icon-btn badge-btn" aria-label="Wishlist"><Heart size={19} /><span>{ids.length}</span></Link>
          <Link to="/cart" className="icon-btn badge-btn" aria-label="Cart"><ShoppingCart size={19} /><span>{count}</span></Link>
          <Link to="/account" className="icon-btn desktop-only" aria-label="Account"><User size={19} /></Link>
          <button className="icon-btn mobile-only" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={21} /></button>
        </div>
      </div>
      {open && (
        <div className="drawer" role="dialog" aria-modal="true">
          <button className="icon-btn close" onClick={() => setOpen(false)} aria-label="Close menu"><X /></button>
          {links.map(([label, to]) => <Link key={to} to={to} onClick={() => setOpen(false)}>{label}</Link>)}
          <Link to="/login" onClick={() => setOpen(false)}>Login</Link>
          <Link to="/admin" onClick={() => setOpen(false)}>Admin</Link>
        </div>
      )}
    </header>
  );
}

function HomePage() {
  const heroImage = "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1800&q=80";
  return (
    <>
      <section className="hero" style={{ backgroundImage: `linear-gradient(90deg, rgba(8,42,20,.78), rgba(8,42,20,.18)), url(${heroImage})` }}>
        <div className="hero-content">
          <p className="eyebrow">MittiLok Nursery</p>
          <h1>Bring Nature Home</h1>
          <p>Healthy Plants Delivered Across India</p>
          <div className="button-row">
            <Link className="btn primary" to="/shop">Shop Plants</Link>
            <Link className="btn ghost-light" to="/ai-plant-finder">Find Your Perfect Plant</Link>
          </div>
        </div>
        <Link className="finder-callout" to="/ai-plant-finder">
          <Sparkles />
          <strong>AI Plant Finder</strong>
          <span>Not sure which plant is right for you?</span>
          <b>Find Your Perfect Plant</b>
        </Link>
      </section>
      <TrustBand />
      <CategoryGrid />
      <ProductRail title="Best Selling Plants" items={products.slice(0, 8)} />
      <ProductRail title="New Arrivals" items={products.slice(8, 16)} />
      <ProductRail title="Featured Flowering Plants" items={products.filter((p) => p.flowering).slice(0, 8)} />
      <ProductRail title="Rare Plant Collection" items={products.filter((p) => p.category === "Rare Plants")} />
      <ProductRail title="Top Orchids" items={products.filter((p) => p.category === "Orchids")} />
      <ProductRail title="Indoor Plant Collection" items={products.filter((p) => p.indoorSuitable).slice(0, 8)} />
      <ProductRail title="Gardening Essentials" items={products.filter((p) => ["Pots & Planters", "Fertilizers", "Gardening Tools"].includes(p.category))} />
      <Reviews />
    </>
  );
}

function TrustBand() {
  const items = [[Leaf, "Healthy Plants"], [PackageCheck, "Secure Packaging"], [Truck, "Delivery Across India"], [MessageCircle, "Gardening Support"], [ShieldCheck, "Secure Payments"]];
  return <section className="trust-band">{items.map(([Icon, label]) => <div key={label as string}><Icon /><span>{label as string}</span></div>)}</section>;
}

function CategoryGrid() {
  return (
    <section className="section">
      <SectionHeader eyebrow="Shop by need" title="Featured Categories" cta="/shop" />
      <div className="category-grid">
        {categories.map((category) => (
          <Link className="category-card" to={`/shop/${category.slug}`} key={category.id}>
            <img src={category.image} alt={category.name} loading="lazy" />
            <div>
              <h3>{category.name}</h3>
              <p>{category.description}</p>
              <span>Explore <ChevronRight size={16} /></span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ProductRail({ title, items }: { title: string; items: Product[] }) {
  if (!items.length) return null;
  return (
    <section className="section">
      <SectionHeader eyebrow="MittiLok picks" title={title} cta="/shop" />
      <div className="product-rail">
        {items.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { has, toggleWishlist } = useWishlist();
  return (
    <article className="product-card">
      <Link to={`/product/${product.slug}`} className="product-image">
        <img src={product.images[0]} alt={product.name} loading="lazy" />
        {product.badge && <span className="pill">{product.badge}</span>}
      </Link>
      <div className="product-body">
        <div className="rating"><Star size={15} fill="currentColor" /> {product.rating} <span>({product.reviews})</span></div>
        <Link to={`/product/${product.slug}`}><h3>{product.name}</h3></Link>
        <p>{product.category}</p>
        <div className="price"><strong>{money(product.price)}</strong><span>{money(product.mrp)}</span></div>
        <div className="card-actions">
          <button className="btn compact" onClick={() => addToCart(product)}>Add to Cart</button>
          <button className={`icon-btn ${has(product.id) ? "active" : ""}`} onClick={() => toggleWishlist(product)} aria-label="Toggle wishlist"><Heart size={18} /></button>
        </div>
      </div>
    </article>
  );
}

function SectionHeader({ eyebrow, title, cta }: { eyebrow: string; title: string; cta?: string }) {
  return <div className="section-header"><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div>{cta && <Link to={cta}>View all <ChevronRight size={16} /></Link>}</div>;
}

function ShopPage() {
  const { categorySlug } = useParams();
  const [query, setQuery] = useState("");
  const [care, setCare] = useState("All");
  const [light, setLight] = useState("All");
  const [sort, setSort] = useState("Featured");
  const activeCategory = categories.find((category) => category.slug === categorySlug);
  const filtered = useMemo(() => {
    let items = activeCategory ? products.filter((p) => p.category === activeCategory.name) : products;
    if (query) items = items.filter((p) => `${p.name} ${p.category}`.toLowerCase().includes(query.toLowerCase()));
    if (care !== "All") items = items.filter((p) => p.careLevel === care);
    if (light !== "All") items = items.filter((p) => p.lightRequirement.includes(light));
    if (sort === "Price Low to High") items = [...items].sort((a, b) => a.price - b.price);
    if (sort === "Price High to Low") items = [...items].sort((a, b) => b.price - a.price);
    if (sort === "Rating") items = [...items].sort((a, b) => b.rating - a.rating);
    return items;
  }, [activeCategory, care, light, query, sort]);
  return (
    <PageShell eyebrow="Shop" title={activeCategory?.name ?? "Plants, Pots & Gardening Essentials"} text="Search, filter, compare, and build a healthier home garden.">
      <div className="shop-layout">
        <aside className="filters">
          <label>Search<input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Snake plant, orchid..." /></label>
          <label>Care level<select value={care} onChange={(e) => setCare(e.target.value)}><option>All</option><option>Easy</option><option>Moderate</option><option>Advanced</option></select></label>
          <label>Light<select value={light} onChange={(e) => setLight(e.target.value)}><option>All</option><option>Very Low Sunlight</option><option>Low / Indirect Light</option><option>Medium Sunlight</option><option>Full Sun</option></select></label>
          <label>Sort<select value={sort} onChange={(e) => setSort(e.target.value)}><option>Featured</option><option>Price Low to High</option><option>Price High to Low</option><option>Rating</option></select></label>
        </aside>
        <div className="product-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      </div>
    </PageShell>
  );
}

function ProductPage() {
  const { slug } = useParams();
  const product = products.find((item) => item.slug === slug) ?? products[0];
  const [size, setSize] = useState(product.sizes[0]);
  const { addToCart } = useCart();
  const { toggleWishlist } = useWishlist();
  const compatible = products.filter((item) => item.id !== product.id && (item.category === "Pots & Planters" || item.category === "Fertilizers" || item.lightRequirement.some((light) => product.lightRequirement.includes(light)))).slice(0, 4);
  return (
    <PageShell eyebrow={product.category} title={product.name} text={product.description}>
      <div className="product-detail">
        <div className="gallery">{product.images.map((image) => <img key={image} src={image} alt={product.name} />)}</div>
        <div className="buy-panel">
          <div className="rating"><Star size={16} fill="currentColor" /> {product.rating} from {product.reviews} reviews</div>
          <div className="price large"><strong>{money(product.price)}</strong><span>{money(product.mrp)}</span></div>
          <label>Available sizes<select value={size} onChange={(e) => setSize(e.target.value)}>{product.sizes.map((item) => <option key={item}>{item}</option>)}</select></label>
          <div className="button-row">
            <button className="btn primary" onClick={() => addToCart(product, size)}>Add to Cart</button>
            <Link className="btn secondary" to="/checkout">Buy Now</Link>
            <button className="icon-btn" onClick={() => toggleWishlist(product)} aria-label="Add to wishlist"><Heart /></button>
          </div>
          <div className="care-guide">
            <Metric label="Light" value={product.lightRequirement.join(", ")} />
            <Metric label="Water" value={product.waterRequirement} />
            <Metric label="Care Level" value={product.careLevel} />
            <Metric label="Delivery" value="3-6 days across India" />
          </div>
          <Link className="btn full" to="/ai-plant-finder">Ask AI About This Plant</Link>
        </div>
      </div>
      <ProductRail title="Complete Your Garden" items={compatible} />
      <Reviews productId={product.id} />
    </PageShell>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div><span>{label}</span><strong>{value}</strong></div>;
}

function PlantFinderPage() {
  const [answers, setAnswers] = useState<AIPlantFinderAnswers>({});
  const [step, setStep] = useState(0);
  const [sort, setSort] = useState("Best Match");
  const [assistantText, setAssistantText] = useState("Answer a few simple questions and I will recommend plants that match your lifestyle and growing conditions.");
  const questions = recommendationService.getQuestions(answers);
  const done = step >= questions.length;
  const recs = useMemo(() => recommendationService.recommend(answers), [answers]);
  const sorted = [...recs].sort((a, b) => sort === "Price Low to High" ? a.product.price - b.product.price : sort === "Price High to Low" ? b.product.price - a.product.price : sort === "Beginner Friendly" ? Number(b.product.beginnerFriendly) - Number(a.product.beginnerFriendly) : b.score - a.score);
  const question = questions[step];

  const choose = (key: string, value: string) => {
    setAnswers((current) => ({ ...current, [key]: value }));
    setStep((current) => current + 1);
  };

  return (
    <PageShell eyebrow="AI Plant Finder" title="Let's find the perfect plant for you!" text={assistantText}>
      <div className="finder-layout">
        <section className="chat-panel">
          <div className="avatar"><Sprout /> MittiLok Assistant</div>
          <div className="progress"><span style={{ width: `${Math.min(100, (step / questions.length) * 100)}%` }} /></div>
          {!done && question ? (
            <div className="question-card">
              <p className="bubble">{question.text}</p>
              <div className="option-grid">{question.options.map((option) => <button key={option} onClick={() => choose(question.key, option)}>{option}</button>)}</div>
              <div className="button-row"><button className="btn secondary" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</button><button className="btn secondary" onClick={() => setStep(step + 1)}>Next</button><button className="btn ghost" onClick={() => { setAnswers({}); setStep(0); }}>Restart</button></div>
            </div>
          ) : (
            <div className="question-card"><p className="bubble">We found plants that match your lifestyle.</p><button className="btn secondary" onClick={() => { setAnswers({}); setStep(0); }}>Start again</button></div>
          )}
        </section>
        <section className="results-panel">
          <div className="section-header"><div><p className="eyebrow">Recommendations</p><h2>We found plants that match your lifestyle</h2></div><select value={sort} onChange={(e) => setSort(e.target.value)}><option>Best Match</option><option>Price Low to High</option><option>Price High to Low</option><option>Beginner Friendly</option></select></div>
          <div className="recommendations">{sorted.map((item) => <RecommendationCard key={item.product.id} item={item} />)}</div>
          <div className="quick-actions">{["Show flowering plants", "Show low-maintenance plants", "Show cheaper options", "Show pet-friendly options", "Explain this plant"].map((action) => <button key={action} onClick={() => setAssistantText(recommendationService.followUp(action, recs).text)}>{action}</button>)}</div>
        </section>
      </div>
    </PageShell>
  );
}

function RecommendationCard({ item }: { item: PlantRecommendation }) {
  const { addToCart } = useCart();
  const { toggleWishlist } = useWishlist();
  return (
    <article className="recommend-card">
      <img src={item.product.images[0]} alt={item.product.name} />
      <div>
        <strong>{item.score}% Match</strong>
        <h3>{item.product.name}</h3>
        <ul>{item.reasons.map((reason) => <li key={reason}>✓ {reason}</li>)}</ul>
        <p>{item.product.lightRequirement.join(", ")} • {item.product.waterRequirement} • {item.product.careLevel}</p>
        <p>{money(item.product.price)} • {item.product.sizes.join(", ")} • {item.product.availability}</p>
        <div className="button-row"><Link className="btn compact" to={`/product/${item.product.slug}`}>View Plant</Link><button className="btn compact" onClick={() => addToCart(item.product)}>Add to Cart</button><button className="icon-btn" onClick={() => toggleWishlist(item.product)}><Heart size={17} /></button></div>
      </div>
    </article>
  );
}

function MyPlantsPage() {
  return (
    <PageShell eyebrow="My Plants" title="Your personal digital garden." text="Maintain records, care settings, growth notes, and reminders for every plant you own.">
      <div className="split-actions"><button className="btn primary">+ Add New Plant</button><button className="btn secondary">Bought from MittiLok</button><button className="btn secondary">Existing plant</button><button className="btn secondary">Manually add plant</button></div>
      <div className="plant-grid">{myPlants.map((plant) => <Link to={`/my-plants/${plant.id}`} className="plant-card" key={plant.id}><img src={plant.image} alt={plant.name} /><h3>{plant.name}</h3><p>{plant.location} • {plant.potSize}</p><span>Next watering: {plant.name === "Snake Plant" ? "In 3 days" : "Tomorrow"}</span></Link>)}</div>
    </PageShell>
  );
}

function PlantProfilePage() {
  const { id } = useParams();
  const plant = myPlants.find((item) => item.id === id) ?? myPlants[0];
  return (
    <PageShell eyebrow="Plant Profile" title={plant.name} text={`${plant.location} • ${plant.potSize} • Added ${plant.dateAdded}`}>
      <div className="profile-layout"><img src={plant.image} alt={plant.name} /><div className="care-guide"><Metric label="Sunlight" value={plant.sunlightCondition} /><Metric label="Watering" value={plant.wateringFrequency} /><Metric label="Care" value={plant.careLevel} /><Metric label="Fertilizer" value={plant.fertilizerSchedule} /></div></div>
      <div className="tabs">{["Overview", "Care", "Watering", "Fertilizer", "Growth", "Notes"].map((tab) => <button key={tab}>{tab}</button>)}</div>
      <p className="note">{plant.notes}</p>
    </PageShell>
  );
}

function CarePage() {
  const reminders = myPlants.flatMap((plant) => ["Water", "Sunlight", "Fertilizer", "Pruning", "Repotting"].map((type, index) => ({ plant, type, due: index === 0 ? (plant.id === "mp1" ? "Tomorrow" : "In 3 days") : "This week" })));
  return (
    <PageShell eyebrow="Plant Care Dashboard" title="Today's Care" text="Smart reminders built from plant type and your own routine.">
      <div className="care-list">{reminders.map((item) => <article key={`${item.plant.id}-${item.type}`}><strong>{item.type}</strong><span>{item.plant.name}</span><b>{item.due}</b><button>Mark as done</button><button>Snooze</button><button>Edit schedule</button></article>)}</div>
      <div className="calendar"><h2>Plant Care Calendar</h2>{Array.from({ length: 14 }, (_, i) => <div key={i}><span>Aug {18 + i}</span><b>{i % 3 === 0 ? "Water" : i % 5 === 0 ? "Fertilizer" : "Check"}</b></div>)}</div>
    </PageShell>
  );
}

function WishlistPage() {
  const { ids } = useWishlist();
  const items = products.filter((p) => ids.includes(p.id));
  return <PageShell eyebrow="Wishlist" title="Plants you love" text={items.length ? "Move favorites to cart whenever your garden is ready." : "Save plants you love and find them here later."}>{items.length ? <div className="product-grid">{items.map((p) => <ProductCard key={p.id} product={p} />)}</div> : <EmptyState text="Save plants you love and find them here later." action="Browse Plants" to="/shop" />}</PageShell>;
}

function CartPage() {
  const { items, subtotal, removeFromCart, updateQuantity } = useCart();
  const delivery = subtotal > 999 || subtotal === 0 ? 0 : 79;
  const tax = Math.round(subtotal * 0.05);
  return (
    <PageShell eyebrow="Cart" title="Your garden basket" text="Review plant sizes, quantities, coupon, shipping, and taxes.">
      <div className="cart-layout">
        <div>{items.length ? items.map((item) => {
          const product = products.find((p) => p.id === item.productId)!;
          return <article className="cart-item" key={`${item.productId}-${item.size}`}><img src={product.images[0]} alt={product.name} /><div><h3>{product.name}</h3><p>{item.size}</p><button onClick={() => removeFromCart(product.id)}>Remove</button></div><input type="number" min={1} value={item.quantity} onChange={(e) => updateQuantity(product.id, Number(e.target.value))} /><strong>{money(product.price * item.quantity)}</strong></article>;
        }) : <EmptyState text="Your cart is waiting for something green." action="Continue Shopping" to="/shop" />}</div>
        <aside className="summary"><h2>Order Summary</h2><Metric label="Subtotal" value={money(subtotal)} /><Metric label="Coupon" value="MITTI10 ready" /><Metric label="Shipping" value={delivery ? money(delivery) : "Free"} /><Metric label="Tax" value={money(tax)} /><Metric label="Total" value={money(subtotal + delivery + tax)} /><Link className="btn primary full" to="/checkout">Proceed to Checkout</Link></aside>
      </div>
    </PageShell>
  );
}

function CheckoutPage() {
  return (
    <PageShell eyebrow="Checkout" title="Secure checkout" text="Multi-step checkout with payment provider abstraction ready for Razorpay.">
      <div className="checkout-steps">
        {["Address", "Delivery", "Payment"].map((step, index) => <section key={step}><span>Step {index + 1}</span><h2>{step}</h2>{index === 0 ? <div className="form-grid"><input placeholder="Name" /><input placeholder="Mobile" /><input placeholder="Address" /><input placeholder="City" /><input placeholder="State" /><input placeholder="PIN code" /></div> : index === 1 ? <p>Estimated delivery: 3-6 days with secure nursery packaging.</p> : <div className="payment-options">{["UPI", "Razorpay", "Credit/Debit Card", "Net Banking", "Cash on Delivery"].map((item) => <button key={item}><CreditCard size={18} />{item}</button>)}</div>}</section>)}
      </div>
    </PageShell>
  );
}

function OrdersPage() {
  return <PageShell eyebrow="Orders" title="Your orders" text="Track purchases, invoices, delivery status, and support.">{orders.map((order) => <Link className="order-card" to={`/orders/${order.orderNumber}`} key={order.id}><strong>{order.orderNumber}</strong><span>{order.status}</span><b>{money(order.total)}</b></Link>)}</PageShell>;
}

function OrderTrackingPage() {
  const { id } = useParams();
  const order = orders.find((item) => item.orderNumber === id) ?? orders[0];
  const stages = ["Order Placed", "Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered"];
  const active = stages.indexOf(order.status);
  return <PageShell eyebrow="Order Tracking" title={order.orderNumber} text={`Estimated delivery ${order.estimatedDelivery}`}>{stages.map((stage, index) => <div className={`tracking-stage ${index <= active ? "done" : ""}`} key={stage}><span>{index + 1}</span><strong>{stage}</strong></div>)}<Link className="btn secondary" to="/contact">Support</Link></PageShell>;
}

function AccountPage() {
  return <PageShell eyebrow="Customer Account" title="Welcome back, Amit" text="Profile, orders, wishlist, My Plants, care reminders, addresses, saved payments, and notifications."><div className="dashboard-grid">{["Profile", "Orders", "Wishlist", "My Plants", "Care Reminders", "Addresses", "Saved Payments", "Notifications", "Logout"].map((item) => <Link to={item === "Orders" ? "/orders" : item === "Wishlist" ? "/wishlist" : item === "My Plants" ? "/my-plants" : "#"} key={item}>{item}<ChevronRight size={16} /></Link>)}</div></PageShell>;
}

function BlogPage() {
  return <PageShell eyebrow="Gardening Blog" title="Care tips for Indian homes" text="SEO-friendly articles for seasonal gardening, balcony care, orchids, indoor plants, and fertilizers."><div className="blog-grid">{blogPosts.map((post) => <Link className="blog-card" to={`/blog/${post.slug}`} key={post.id}><img src={post.coverImage} alt={post.title} /><span>{post.category}</span><h3>{post.title}</h3><p>{post.excerpt}</p><small>{post.date} • {post.readingTime}</small></Link>)}</div></PageShell>;
}

function BlogArticlePage() {
  const { slug } = useParams();
  const post = blogPosts.find((item) => item.slug === slug) ?? blogPosts[0];
  return <PageShell eyebrow={post.category} title={post.title} text={`${post.date} • ${post.readingTime}`}><img className="article-image" src={post.coverImage} alt={post.title} /><p className="article-copy">{post.content}</p></PageShell>;
}

function AboutPage() {
  return <PageShell eyebrow="About MittiLok" title="Premium nursery experience, rooted in trust" text="MittiLok Nursery brings healthy plants, careful packaging, and friendly gardening support to homes across India."><div className="story-grid">{["MittiLok story", "Mission", "Vision", "Why choose us", "Nursery experience", "Founder journey", "Quality promise"].map((item) => <article key={item}><h3>{item}</h3><p>We select strong plants, pack them securely, and help customers grow with confidence after delivery.</p></article>)}</div></PageShell>;
}

function ContactPage() {
  return <PageShell eyebrow="Contact" title="We are here for your garden" text="Call, WhatsApp, email, or send a plant-care question."><div className="contact-layout"><form className="form-grid"><input placeholder="Name" /><input placeholder="Phone" /><input placeholder="Email" /><textarea placeholder="How can we help?" /><button className="btn primary">Send Message</button></form><aside className="summary"><Metric label="WhatsApp" value="+91 98765 43210" /><Metric label="Email" value="care@mittilok.in" /><Metric label="Location" value="Bengaluru nursery dispatch hub" /><div className="map">Google Maps section</div></aside></div></PageShell>;
}

function AuthPage({ mode }: { mode: "login" | "signup" }) {
  return <PageShell eyebrow={mode === "login" ? "Login" : "Signup"} title={mode === "login" ? "Welcome back" : "Create your MittiLok account"} text="Protected customer and admin route structure is ready for real authentication."><form className="auth-box"><input placeholder="Email" />{mode === "signup" && <input placeholder="Name" />}<input placeholder="Password" type="password" /><button className="btn primary">{mode === "login" ? "Login" : "Signup"}</button><Link to={mode === "login" ? "/signup" : "/login"}>{mode === "login" ? "Create account" : "Already have an account?"}</Link><Link to="/login">Forgot password?</Link></form></PageShell>;
}

function PolicyPage({ title }: { title: string }) {
  return <PageShell eyebrow="Policy" title={title} text="Clear, customer-friendly policy content ready for legal review."><p className="article-copy">MittiLok protects customer information, handles orders transparently, and resolves plant delivery issues through documented support workflows.</p></PageShell>;
}

function Admin() {
  const cards = [["Total Revenue", "Rs 2,86,098"], ["Orders", "148"], ["Customers", "1,240"], ["Products", String(products.length)], ["Low Stock", String(products.filter((p) => p.stock < 12).length)], ["Pending Orders", "23"]];
  const tabs = ["Products", "Orders", "Customers", "Inventory", "Coupons", "Blog", "Analytics"];
  return <PageShell eyebrow="Admin" title="MittiLok operations dashboard" text="Product, inventory, order, customer, coupon, blog, and analytics management."><div className="admin-cards">{cards.map(([label, value]) => <article key={label}><span>{label}</span><strong>{value}</strong></article>)}</div><div className="admin-tabs">{tabs.map((tab) => <Link key={tab} to={`/admin/${tab.toLowerCase()}`}>{tab}</Link>)}</div><div className="chart-grid"><div><BarChart3 /><h3>Revenue chart</h3></div><div><CalendarDays /><h3>Orders chart</h3></div></div><InventoryTable /></PageShell>;
}

function InventoryTable() {
  return <div className="table-wrap"><table><thead><tr><th>Product</th><th>SKU</th><th>Stock</th><th>Reserved</th><th>Available</th><th>Status</th></tr></thead><tbody>{products.slice(0, 10).map((product) => <tr key={product.id}><td>{product.name}</td><td>{product.sku}</td><td>{product.stock}</td><td>{Math.min(5, Math.floor(product.stock / 6))}</td><td>{product.stock - Math.min(5, Math.floor(product.stock / 6))}</td><td>{product.availability}</td></tr>)}</tbody></table></div>;
}

function Reviews({ productId }: { productId?: string }) {
  const items = productId ? reviews.filter((review) => review.productId === productId) : reviews;
  return <section className="section"><SectionHeader eyebrow="Reviews" title="Verified plant stories" /><div className="review-grid">{items.map((review) => <article key={review.id}><div className="rating"><Star size={15} fill="currentColor" /> {review.rating}</div><p>{review.text}</p><strong>{review.customerName}</strong><span>Verified purchase</span></article>)}</div></section>;
}

function EmptyState({ text, action, to }: { text: string; action: string; to: string }) {
  return <div className="empty"><Sprout size={38} /><p>{text}</p><Link className="btn primary" to={to}>{action}</Link></div>;
}

function PageShell({ eyebrow, title, text, children }: { eyebrow: string; title: string; text: string; children: React.ReactNode }) {
  return <section className="page-shell"><div className="page-intro"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{text}</p></div>{children}</section>;
}

function SkeletonPage() {
  return <div className="page-shell"><div className="skeleton" /><div className="skeleton grid" /></div>;
}

function MobileBottomNav() {
  return <nav className="bottom-nav"><Link to="/"><Home /></Link><Link to="/shop"><ShoppingBag /></Link><Link to="/ai-plant-finder"><Sparkles /></Link><Link to="/my-plants"><Sprout /></Link><Link to="/cart"><ShoppingCart /></Link></nav>;
}

function FloatingWhatsApp() {
  return <a className="whatsapp" href="https://wa.me/919876543210" aria-label="WhatsApp support"><MessageCircle /></a>;
}

function Footer() {
  return (
    <footer className="footer">
      <div><h2>MittiLok Nursery</h2><p>Bring Nature Home.</p><form><input placeholder="Enter your email" /><button>Subscribe</button></form></div>
      <div><h3>Quick Links</h3>{["Home", "Shop", "AI Plant Finder", "My Plants", "Blog", "About", "Contact"].map((label) => <Link key={label} to={label === "Home" ? "/" : `/${label.toLowerCase().replaceAll(" ", "-")}`}>{label}</Link>)}</div>
      <div><h3>Customer Support</h3>{["WhatsApp", "Contact", "Order Tracking", "Shipping", "Returns"].map((label) => <Link key={label} to="/contact">{label}</Link>)}</div>
      <div><h3>Policies</h3><Link to="/privacy-policy">Privacy Policy</Link><Link to="/terms">Terms & Conditions</Link><Link to="/refund-policy">Refund Policy</Link><Link to="/refund-policy">Shipping Policy</Link></div>
    </footer>
  );
}

export default App;
