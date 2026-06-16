import { useEffect, useState } from "react";
import { fetchCategories, fetchRestaurants } from "./api/client.js";
import CategoryChips from "./components/CategoryChips.jsx";
import PreviewHeader from "./components/PreviewHeader.jsx";
import RestaurantGrid from "./components/RestaurantGrid.jsx";
import "./styles.css";

function App() {
  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [status, setStatus] = useState("Loading live SnapEats API...");

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

        setCategories(categoryData.slice(0, 8));
        setRestaurants(restaurantData.slice(0, 6));
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

  return (
    <main className="react-preview-shell">
      <PreviewHeader status={status} />

      <section className="preview-section">
        <div className="section-heading">
          <p className="eyebrow">Live API</p>
          <h2>Categories</h2>
        </div>
        <CategoryChips categories={categories} />
      </section>

      <section className="preview-section">
        <div className="section-heading">
          <p className="eyebrow">First migrated surface</p>
          <h2>Restaurant cards</h2>
        </div>
        <RestaurantGrid restaurants={restaurants} />
      </section>
    </main>
  );
}

export default App;
