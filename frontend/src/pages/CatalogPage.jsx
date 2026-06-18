import { useEffect, useMemo, useState } from "react";
import { fetchCategories, fetchRestaurantMenu, fetchRestaurants } from "../api/client.js";
import CategoryChips from "../components/CategoryChips.jsx";
import MenuPanel from "../components/MenuPanel.jsx";
import RestaurantGrid from "../components/RestaurantGrid.jsx";
import SearchPanel from "../components/SearchPanel.jsx";

function CatalogPage({ getCartQuantity, onAddToCart, onCartQuantityChange, onStatusChange }) {
  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [menuStatus, setMenuStatus] = useState("idle");

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

  return (
    <>
      <SearchPanel
        onSearchTermChange={setSearchTerm}
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
          <RestaurantGrid restaurants={featuredRestaurants} onRestaurantSelect={handleRestaurantSelect} />
          <div className="restaurants-footer">
            <p className="restaurants-count">Showing {featuredRestaurants.length} of {filteredRestaurants.length} restaurants</p>
          </div>
        </div>
      </section>

      <MenuPanel
        getCartQuantity={getCartQuantity}
        menuItems={menuItems}
        onAddToCart={onAddToCart}
        onQuantityChange={onCartQuantityChange}
        onClose={() => setSelectedRestaurant(null)}
        restaurant={selectedRestaurant}
        status={menuStatus}
      />
    </>
  );
}

export default CatalogPage;
