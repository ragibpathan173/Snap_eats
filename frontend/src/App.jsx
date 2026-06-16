import { useEffect, useState } from "react";
import { fetchCategories, fetchRestaurants } from "./api/client.js";
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
      <section className="preview-hero">
        <p className="eyebrow">React migration preview</p>
        <h1>SnapEats is moving to React one feature at a time.</h1>
        <p>
          This page is separate from the current vanilla app, so every migration
          commit can be reviewed safely before replacing the live experience.
        </p>
        <div className="status-pill">{status}</div>
      </section>

      <section className="preview-section">
        <div className="section-heading">
          <p className="eyebrow">Live API</p>
          <h2>Categories</h2>
        </div>
        <div className="category-list">
          {categories.map((category) => (
            <span className="category-chip" key={category.categoryId || category.id}>
              {category.name}
            </span>
          ))}
        </div>
      </section>

      <section className="preview-section">
        <div className="section-heading">
          <p className="eyebrow">First migrated surface</p>
          <h2>Restaurant cards</h2>
        </div>
        <div className="restaurant-grid">
          {restaurants.map((restaurant) => (
            <article className="restaurant-card" key={restaurant.restaurantId}>
              <img src={restaurant.image} alt={restaurant.name} loading="lazy" />
              <div>
                <h3>{restaurant.name}</h3>
                <p>{restaurant.cuisine}</p>
                <div className="restaurant-meta">
                  <span>{restaurant.rating} rating</span>
                  <span>{restaurant.time}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default App;
