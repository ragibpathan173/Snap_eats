import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  addFavoriteMenuItem,
  addFavoriteRestaurant,
  fetchCategories,
  fetchFavoriteMenuItems,
  fetchFavoriteRestaurants,
  fetchRestaurantMenu,
  fetchRestaurants,
  removeFavoriteMenuItem,
  removeFavoriteRestaurant
} from "../api/client.js";
import AppDownloadSection from "../components/AppDownloadSection.jsx";
import AppFooter from "../components/AppFooter.jsx";
import CategoryChips from "../components/CategoryChips.jsx";
import MenuPanel from "../components/MenuPanel.jsx";
import RestaurantGrid from "../components/RestaurantGrid.jsx";
import SearchPanel from "../components/SearchPanel.jsx";

function CatalogPage({
  getCartQuantity,
  onAddToCart,
  onCartQuantityChange,
  onLocationSelect,
  onStatusChange,
  searchTerm,
  session
}) {
  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [menuStatus, setMenuStatus] = useState("idle");
  const [favoriteMenuItemIds, setFavoriteMenuItemIds] = useState([]);
  const [favoriteRestaurantIds, setFavoriteRestaurantIds] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const canManageFavorites = Boolean(session.user?.id && session.token);

  useEffect(() => {
    let ignore = false;
    onStatusChange("Loading live SnapEats API...");

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
        onStatusChange("Connected to the existing Spring Boot API");
      } catch (error) {
        if (!ignore) {
          onStatusChange(error.message || "Could not reach the API");
        }
      }
    }

    loadPreviewData();

    return () => {
      ignore = true;
    };
  }, [onStatusChange]);

  useEffect(() => {
    let ignore = false;

    async function loadFavorites() {
      if (!canManageFavorites) {
        setFavoriteRestaurantIds([]);
        setFavoriteMenuItemIds([]);
        return;
      }

      try {
        const [restaurants, menuItems] = await Promise.all([
          fetchFavoriteRestaurants(session.user.id, session.token),
          fetchFavoriteMenuItems(session.user.id, session.token)
        ]);

        if (!ignore) {
          setFavoriteRestaurantIds((Array.isArray(restaurants) ? restaurants : []).map((restaurant) => restaurant.restaurantId));
          setFavoriteMenuItemIds((Array.isArray(menuItems) ? menuItems : []).map((item) => item.itemId));
        }
      } catch (error) {
        if (!ignore) {
          onStatusChange(error.message || "Could not load favorites.");
        }
      }
    }

    loadFavorites();

    return () => {
      ignore = true;
    };
  }, [canManageFavorites, onStatusChange, session.token, session.user?.id]);

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

  async function handleRestaurantFavorite(restaurant) {
    if (!canManageFavorites) {
      onStatusChange("Login to save favorite restaurants");
      return;
    }

    const restaurantId = restaurant.restaurantId || restaurant.id;
    const isFavorite = favoriteRestaurantIds.includes(restaurantId);

    try {
      if (isFavorite) {
        await removeFavoriteRestaurant(restaurantId, session.user.id, session.token);
        setFavoriteRestaurantIds((currentIds) => currentIds.filter((id) => id !== restaurantId));
      } else {
        await addFavoriteRestaurant(restaurantId, session.user.id, session.token);
        setFavoriteRestaurantIds((currentIds) => [...currentIds, restaurantId]);
      }
    } catch (error) {
      onStatusChange(error.message || "Could not update favorite restaurant.");
    }
  }

  async function handleMenuItemFavorite(item) {
    if (!canManageFavorites) {
      onStatusChange("Login to save favorite dishes");
      return;
    }

    const itemId = item.itemId || item.id;
    const isFavorite = favoriteMenuItemIds.includes(itemId);

    try {
      if (isFavorite) {
        await removeFavoriteMenuItem(itemId, session.user.id, session.token);
        setFavoriteMenuItemIds((currentIds) => currentIds.filter((id) => id !== itemId));
      } else {
        await addFavoriteMenuItem(itemId, session.user.id, session.token);
        setFavoriteMenuItemIds((currentIds) => [...currentIds, itemId]);
      }
    } catch (error) {
      onStatusChange(error.message || "Could not update favorite dish.");
    }
  }

  useEffect(() => {
    const restaurantId = searchParams.get("restaurant");

    if (!restaurantId || !restaurants.length || selectedRestaurant?.restaurantId === restaurantId) {
      return;
    }

    const restaurant = restaurants.find((entry) => entry.restaurantId === restaurantId);

    if (restaurant) {
      handleRestaurantSelect(restaurant);
    }
  }, [restaurants, searchParams, selectedRestaurant?.restaurantId]);

  function closeMenu() {
    setSelectedRestaurant(null);

    if (searchParams.has("restaurant")) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("restaurant");
      setSearchParams(nextParams);
    }
  }

  return (
    <>
      <SearchPanel
        resultCount={filteredRestaurants.length}
        searchTerm={searchTerm}
      />

      <section className="categories-section">
        <div className="container">
          <h2 className="section-title">What's on your mind?</h2>
          <div className="categories-wrapper">
            <CategoryChips
              activeCategory={activeCategory}
              categories={categories}
              onCategoryChange={setActiveCategory}
            />
          </div>
        </div>
      </section>

      <div className="section-divider"></div>

      <section className="restaurants-section">
        <div className="container">
          <h2 className="section-title">
            {activeCategory === "all" ? "Top restaurant chains in your city" : `${activeCategory} restaurants`}
          </h2>
          <div className="restaurant-scroll-region" role="region" aria-label="Restaurant results">
            <RestaurantGrid
              favoriteRestaurantIds={favoriteRestaurantIds}
              onFavoriteToggle={handleRestaurantFavorite}
              onRestaurantSelect={handleRestaurantSelect}
              restaurants={featuredRestaurants}
            />
            <div className="restaurants-footer">
              <p className="restaurants-count">Showing {featuredRestaurants.length} of {filteredRestaurants.length} restaurants</p>
            </div>
          </div>
        </div>
      </section>

      <AppDownloadSection />
      <AppFooter onLocationSelect={onLocationSelect} />

      <MenuPanel
        getCartQuantity={getCartQuantity}
        favoriteMenuItemIds={favoriteMenuItemIds}
        menuItems={menuItems}
        onAddToCart={onAddToCart}
        onFavoriteToggle={handleMenuItemFavorite}
        onQuantityChange={onCartQuantityChange}
        onClose={closeMenu}
        restaurant={selectedRestaurant}
        status={menuStatus}
      />
    </>
  );
}

export default CatalogPage;
