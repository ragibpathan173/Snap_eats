import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppHeader from "./components/AppHeader.jsx";
import CartPanel from "./components/CartPanel.jsx";
import CatalogPage from "./pages/CatalogPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import "./styles.css";

const CART_STORAGE_KEY = "snap_eats_react_cart";

function readStoredCartItems() {
  try {
    const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);
    const parsedCart = storedCart ? JSON.parse(storedCart) : [];

    return Array.isArray(parsedCart) ? parsedCart : [];
  } catch {
    return [];
  }
}

function App() {
  const [status, setStatus] = useState("React routes ready");
  const [cartItems, setCartItems] = useState(readStoredCartItems);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // Cart persistence is a convenience; ordering flow can still work without it.
    }
  }, [cartItems]);

  const cartSummary = useMemo(() => {
    return cartItems.reduce(
      (summary, lineItem) => {
        const itemPrice = lineItem.item.discountedPrice || lineItem.item.price || 0;

        return {
          count: summary.count + lineItem.quantity,
          total: summary.total + itemPrice * lineItem.quantity
        };
      },
      { count: 0, total: 0 }
    );
  }, [cartItems]);

  function addToCart(item, restaurant) {
    setCartItems((currentItems) => {
      const itemKey = item.itemId || item.id;
      const existingItem = currentItems.find((lineItem) => lineItem.key === itemKey);

      if (existingItem) {
        return currentItems.map((lineItem) =>
          lineItem.key === itemKey
            ? { ...lineItem, quantity: lineItem.quantity + 1 }
            : lineItem
        );
      }

      return [
        ...currentItems,
        {
          item,
          key: itemKey,
          quantity: 1,
          restaurantName: restaurant.name
        }
      ];
    });
    setCartOpen(true);
  }

  function updateCartQuantity(itemKey, quantity) {
    setCartItems((currentItems) => {
      if (quantity <= 0) {
        return currentItems.filter((lineItem) => lineItem.key !== itemKey);
      }

      return currentItems.map((lineItem) =>
        lineItem.key === itemKey ? { ...lineItem, quantity } : lineItem
      );
    });
  }

  function getCartQuantity(item) {
    const itemKey = item.itemId || item.id;
    return cartItems.find((lineItem) => lineItem.key === itemKey)?.quantity || 0;
  }

  return (
    <main className="react-preview-shell">
      <AppHeader
        cartItemCount={cartSummary.count}
        onCartOpen={() => setCartOpen(true)}
        status={status}
      />

      <Routes>
        <Route path="/" element={<Navigate replace to="/restaurants" />} />
        <Route
          path="/restaurants"
          element={(
            <CatalogPage
              getCartQuantity={getCartQuantity}
              onAddToCart={addToCart}
              onStatusChange={setStatus}
            />
          )}
        />
        <Route
          path="/checkout"
          element={(
            <CheckoutPage
              items={cartItems}
              onQuantityChange={updateCartQuantity}
              total={cartSummary.total}
            />
          )}
        />
        <Route path="*" element={<Navigate replace to="/restaurants" />} />
      </Routes>

      <CartPanel
        items={cartItems}
        onClear={() => setCartItems([])}
        onClose={() => setCartOpen(false)}
        onQuantityChange={updateCartQuantity}
        open={cartOpen}
        total={cartSummary.total}
      />
    </main>
  );
}

export default App;
