import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { clearAuthSession, readStoredAuthSession, saveAuthSession } from "./auth/session.js";
import AppHeader from "./components/AppHeader.jsx";
import CartPanel from "./components/CartPanel.jsx";
import HeaderSearchStrip from "./components/HeaderSearchStrip.jsx";
import HelpModal from "./components/HelpModal.jsx";
import LocationPickerModal from "./components/LocationPickerModal.jsx";
import OffersModal from "./components/OffersModal.jsx";
import AccountPage from "./pages/AccountPage.jsx";
import AddressesPage from "./pages/AddressesPage.jsx";
import CatalogPage from "./pages/CatalogPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import "./styles.css";
import "../snap_eats.css";

const CART_STORAGE_KEY = "snap_eats_react_cart";
const LOCATION_STORAGE_KEY = "snap_eats_react_location";

function readStoredCartItems() {
  try {
    const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);
    const parsedCart = storedCart ? JSON.parse(storedCart) : [];

    return Array.isArray(parsedCart) ? parsedCart : [];
  } catch {
    return [];
  }
}

function readStoredLocation() {
  try {
    const storedLocation = window.localStorage.getItem(LOCATION_STORAGE_KEY);
    const parsedLocation = storedLocation ? JSON.parse(storedLocation) : null;

    return parsedLocation?.label ? parsedLocation : { label: "Other", subtitle: "" };
  } catch {
    return { label: "Other", subtitle: "" };
  }
}

function App() {
  const [status, setStatus] = useState("React routes ready");
  const [authSession, setAuthSession] = useState(readStoredAuthSession);
  const [cartItems, setCartItems] = useState(readStoredCartItems);
  const [cartOpen, setCartOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(readStoredLocation);
  const [locationOpen, setLocationOpen] = useState(false);
  const [offersOpen, setOffersOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [couponCode, setCouponCode] = useState("");

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
      const restaurantCode = restaurant.restaurantId || restaurant.id;
      const existingRestaurantCode = currentItems[0]?.restaurantCode;

      if (currentItems.length && existingRestaurantCode !== restaurantCode) {
        return [
          {
            item,
            key: itemKey,
            quantity: 1,
            restaurantCode,
            restaurantName: restaurant.name
          }
        ];
      }

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
          restaurantCode,
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

  function handleAuthSuccess(authResponse) {
    const session = saveAuthSession({
      token: authResponse?.token || "",
      user: authResponse?.user || null
    });

    setAuthSession(session);
    setStatus(`Signed in as ${session.user?.name?.split(" ")[0] || "customer"}`);
  }

  function handleLogout() {
    const session = clearAuthSession();
    setAuthSession(session);
    setStatus("Signed out");
  }

  function handleLocationSelect(location) {
    setSelectedLocation(location);
    setLocationOpen(false);

    try {
      window.localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
    } catch {
      // Location selection still updates the UI even if storage is unavailable.
    }
  }

  function handleCouponApply(coupon) {
    if (!cartItems.length) {
      return { message: "Add items to your cart before applying a coupon.", type: "error" };
    }

    if (cartSummary.total < coupon.minOrder) {
      return {
        message: `Coupon requires a minimum order of Rs ${coupon.minOrder}.`,
        type: "error"
      };
    }

    setCouponCode(coupon.code);

    return {
      message: `Coupon ${coupon.code} added to checkout.`,
      type: "success"
    };
  }

  function openOffers() {
    setCartOpen(false);
    setHelpOpen(false);
    setLocationOpen(false);
    setOffersOpen(true);
    setSearchOpen(false);
  }

  function openHelp() {
    setCartOpen(false);
    setHelpOpen(true);
    setLocationOpen(false);
    setOffersOpen(false);
    setSearchOpen(false);
  }

  const showStatusNotice = Boolean(status && /could not|failed|error/i.test(status));

  return (
    <>
      <AppHeader
        cartItemCount={cartSummary.count}
        currentUser={authSession.user}
        onCartOpen={() => setCartOpen(true)}
        onHelpOpen={openHelp}
        onLocationOpen={() => setLocationOpen(true)}
        onOffersOpen={openOffers}
        onSearchToggle={() => setSearchOpen((currentOpen) => !currentOpen)}
        selectedLocation={selectedLocation}
      />

      <HeaderSearchStrip
        onSearchTermChange={setSearchTerm}
        open={searchOpen}
        searchTerm={searchTerm}
      />

      <div className={`global-api-notice ${showStatusNotice ? "visible" : ""}`} role="status" aria-live="polite">
        {showStatusNotice ? status : ""}
      </div>

      <Routes>
        <Route path="/" element={<Navigate replace to="/restaurants" />} />
        <Route
          path="/restaurants"
          element={(
            <CatalogPage
              getCartQuantity={getCartQuantity}
              onAddToCart={addToCart}
              onCartQuantityChange={updateCartQuantity}
              onLocationSelect={handleLocationSelect}
              onStatusChange={setStatus}
              searchTerm={searchTerm}
            />
          )}
        />
        <Route
          path="/checkout"
          element={(
            <CheckoutPage
              onOrderPlaced={(orderResponse) => {
                setCartItems([]);
                setCouponCode("");
                setStatus(`Order ${orderResponse?.order?.orderNumber || ""} placed`.trim());
              }}
              couponCode={couponCode}
              onCouponCodeChange={setCouponCode}
              session={authSession}
              items={cartItems}
              onQuantityChange={updateCartQuantity}
              total={cartSummary.total}
            />
          )}
        />
        <Route
          path="/account"
          element={(
            <AccountPage
              onAuthSuccess={handleAuthSuccess}
              onLogout={handleLogout}
              onStatusChange={setStatus}
              session={authSession}
            />
          )}
        />
        <Route
          path="/addresses"
          element={(
            <AddressesPage
              onStatusChange={setStatus}
              session={authSession}
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

      <LocationPickerModal
        onClose={() => setLocationOpen(false)}
        onLocationSelect={handleLocationSelect}
        open={locationOpen}
        selectedLocation={selectedLocation}
      />

      <OffersModal
        appliedCouponCode={couponCode}
        onApplyCoupon={handleCouponApply}
        onClose={() => setOffersOpen(false)}
        onOpenCart={() => {
          setOffersOpen(false);
          setCartOpen(true);
        }}
        open={offersOpen}
      />

      <HelpModal
        onClose={() => setHelpOpen(false)}
        onOpenCart={() => {
          setHelpOpen(false);
          setCartOpen(true);
        }}
        open={helpOpen}
      />
    </>
  );
}

export default App;
