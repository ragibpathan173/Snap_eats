import { useEffect, useMemo, useState } from "react";
import { fetchCategories, fetchRestaurantMenu, fetchRestaurants } from "./api/client.js";
import AppHeader from "./components/AppHeader.jsx";
import CartPanel from "./components/CartPanel.jsx";
import CategoryChips from "./components/CategoryChips.jsx";
import MenuPanel from "./components/MenuPanel.jsx";
import SearchPanel from "./components/SearchPanel.jsx";
import RestaurantGrid from "./components/RestaurantGrid.jsx";
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
  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [status, setStatus] = useState("Loading live SnapEats API...");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [menuStatus, setMenuStatus] = useState("idle");
  const [cartItems, setCartItems] = useState(readStoredCartItems);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadPreviewData() {
      try {
        const [categoryData, restaurantData] = await Promise.all([
          fetchCategories(),
          fetchRestaurants()
        ]);

        if (ignore) {
          return;
        }

        setCategories(categoryData);
        setRestaurants(restaurantData);
        setStatus("Connected to the existing Spring Boot API");
      } catch (error) {
        if (!ignore) {
          setStatus(error.message || "Could not reach the API");
        }
      }
    }

    loadPreviewData();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // Cart persistence is a convenience; ordering flow can still work without it.
    }
  }, [cartItems]);

  const filteredRestaurants = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const normalizedCategory = activeCategory.trim().toLowerCase();

    return restaurants.filter((restaurant) => {
      const categoryMatches = normalizedCategory === "all" || restaurant.category === normalizedCategory;
      const searchableText = [
        restaurant.name,
        restaurant.cuisine,
        restaurant.locality,
        restaurant.city
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return categoryMatches && (!normalizedSearch || searchableText.includes(normalizedSearch));
    });
  }, [activeCategory, restaurants, searchTerm]);

  const featuredRestaurants = filteredRestaurants.slice(0, 12);
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

  async function handleRestaurantSelect(restaurant) {
    setSelectedRestaurant(restaurant);
    setMenuItems([]);
    setMenuStatus("loading");

    try {
      const items = await fetchRestaurantMenu(restaurant.restaurantId);
      setMenuItems(items);
      setMenuStatus("ready");
    } catch (error) {
      setMenuStatus(error.message || "Could not load this menu.");
    }
  }

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

      <SearchPanel
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        resultCount={filteredRestaurants.length}
      />

      <section className="preview-section">
        <div className="section-heading">
          <p className="eyebrow">Browse by craving</p>
          <h2>What's on your mind?</h2>
        </div>
        <CategoryChips
          activeCategory={activeCategory}
          categories={categories}
          onCategoryChange={setActiveCategory}
        />
      </section>

      <section className="preview-section">
        <div className="section-heading">
          <p className="eyebrow">Live restaurant catalog</p>
          <h2>{activeCategory === "all" ? "Top restaurants near you" : `${activeCategory} restaurants`}</h2>
        </div>
        <RestaurantGrid restaurants={featuredRestaurants} onRestaurantSelect={handleRestaurantSelect} />
      </section>

      <MenuPanel
        getCartQuantity={getCartQuantity}
        menuItems={menuItems}
        onAddToCart={addToCart}
        onClose={() => setSelectedRestaurant(null)}
        restaurant={selectedRestaurant}
        status={menuStatus}
      />

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
