import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import "./styles.css";

// HashRouter routes live in the hash; clear leftover pathnames like /login#/...
if (typeof window !== "undefined" && window.location.pathname !== "/") {
  const { hash, search } = window.location;
  window.history.replaceState(null, "", `/${search}${hash}`);
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <App />
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>,
);
