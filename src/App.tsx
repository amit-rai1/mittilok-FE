import { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { SkeletonPage } from "./components/ui";
import AboutPage from "./pages/AboutPage";
import AccountPage from "./pages/AccountPage";
import AuthPage from "./pages/AuthPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import ContactPage from "./pages/ContactPage";
import { BlogArticlePage, BlogPage, PolicyPage } from "./pages/ContentPages";
import HomePage from "./pages/HomePage";
import LandscapingPage from "./pages/LandscapingPage";
import NotificationsPage from "./pages/NotificationsPage";
import { FestivalBookingDetailPage, OrdersPage, OrderTrackingPage } from "./pages/OrdersPage";
import { PlantFinderPage } from "./pages/PlantPages";
import PodcastPage from "./pages/PodcastPage";
import { FestivalBookPage, FestivalConfirmationPage, FestivalLandingPage, FestivalListPage } from "./pages/FestivalPages";
import ProductPage from "./pages/ProductPage";
import ServicesPage from "./pages/ServicesPage";
import ShopPage from "./pages/ShopPage";
import WishlistPage from "./pages/WishlistPage";

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

export default function App() {
  return (
    <Layout>
      <SEO />
      <Suspense fallback={<SkeletonPage />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/nursery" element={<ShopPage rootSlug="nursery" />} />
          <Route path="/nursery/:subSlug" element={<ShopPage rootSlug="nursery" />} />
          <Route path="/organics" element={<ShopPage rootSlug="organic-gardening-products" />} />
          <Route path="/organics/:subSlug" element={<ShopPage rootSlug="organic-gardening-products" />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/ai-plant-finder" element={<PlantFinderPage />} />
          <Route path="/my-plants" element={<Navigate to="/account" replace />} />
          <Route path="/my-plants/:id" element={<Navigate to="/account" replace />} />
          <Route path="/care" element={<Navigate to="/account" replace />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderTrackingPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/services/mali" element={<ServicesPage />} />
          <Route path="/mali" element={<ServicesPage />} />
          <Route path="/landscaping" element={<LandscapingPage />} />
          <Route path="/podcast" element={<PodcastPage />} />
          <Route path="/festival" element={<FestivalListPage />} />
          <Route path="/festival/bookings/:id" element={<FestivalBookingDetailPage />} />
          <Route path="/festival/:slug" element={<FestivalLandingPage />} />
          <Route path="/festival/:slug/book/:productSlug" element={<FestivalBookPage />} />
          <Route path="/festival/:slug/confirmation" element={<FestivalConfirmationPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogArticlePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/signup" element={<AuthPage mode="signup" />} />
          <Route path="/forgot-password" element={<AuthPage mode="forgot" />} />
          <Route path="/privacy-policy" element={<PolicyPage title="Privacy Policy" />} />
          <Route path="/terms" element={<PolicyPage title="Terms & Conditions" />} />
          <Route path="/refund-policy" element={<PolicyPage title="Refund Policy" />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
