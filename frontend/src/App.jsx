import { useEffect, useMemo, useState } from "react";
import { fetchCategories, fetchRestaurantMenu, fetchRestaurants } from "./api/client.js";
import AppHeader from "./components/AppHeader.jsx";
import CategoryChips from "./components/CategoryChips.jsx";
import MenuPanel from "./components/MenuPanel.jsx";
import SearchPanel from "./components/SearchPanel.jsx";
import RestaurantGrid from "./components/RestaurantGrid.jsx";
import "./styles.css";

function App() {
  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [status, setStatus] = useState("Loading live SnapEats API...");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [menuStatus, setMenuStatus] = useState("idle");

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
    <main className="react-preview-shell">
      <AppHeader status={status} />

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
        menuItems={menuItems}
        onClose={() => setSelectedRestaurant(null)}
        restaurant={selectedRestaurant}
        status={menuStatus}
      />
    </main>
  );
}

export default App;
