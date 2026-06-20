import { useEffect, useMemo, useState } from "react";
import MenuItemCard from "./MenuItemCard.jsx";

function capitalize(value) {
  const text = String(value || "");

  return text ? `${text.charAt(0).toUpperCase()}${text.slice(1)}` : "";
}

function formatNumber(value) {
  const numericValue = Number(value || 0);

  return Number.isFinite(numericValue) ? numericValue.toFixed(1) : value;
}

function MenuPanel({ favoriteMenuItemIds, getCartQuantity, menuItems, onAddToCart, onClose, onFavoriteToggle, onQuantityChange, restaurant, status }) {
  const [activeFilter, setActiveFilter] = useState("all");
  const isLoading = status === "loading";
  const isError = status !== "idle" && status !== "loading" && status !== "ready";
  const menuCategories = useMemo(() => {
    return [...new Set(menuItems.map((item) => item.category).filter(Boolean))];
  }, [menuItems]);
  const visibleItems = activeFilter === "all"
    ? menuItems
    : menuItems.filter((item) => item.category === activeFilter);

  useEffect(() => {
    if (!restaurant) {
      return undefined;
    }

    document.body.classList.add("modal-open");

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [restaurant]);

  useEffect(() => {
    setActiveFilter("all");
  }, [restaurant?.id]);

  if (!restaurant) {
    return null;
  }

  return (
    <div className="modal open react-menu-modal" aria-label={`${restaurant.name} menu`} role="dialog" aria-modal="true">
      <div className="modal-content">
        <button className="close-btn" onClick={onClose} type="button" aria-label="Close menu">
          &times;
        </button>

        <section className="menu-hero">
          <img className="menu-hero-image" src={restaurant.image} alt={restaurant.name} />
          <div className="menu-hero-copy">
            <p className="menu-eyebrow">{capitalize(restaurant.category || "featured")} kitchen</p>
            <h2>{restaurant.name}</h2>
            <p className="menu-cuisine">{restaurant.cuisine || ""}</p>
            <div className="menu-stats">
              <span>&#9733; {formatNumber(restaurant.rating)}</span>
              <span>{restaurant.time || "Freshly prepared"}</span>
              {[restaurant.locality, restaurant.city].filter(Boolean).length ? (
                <span>{[restaurant.locality, restaurant.city].filter(Boolean).join(", ")}</span>
              ) : null}
            </div>
          </div>
        </section>

        <section className="menu-toolbar">
          <div className="menu-filter-row">
            <button
              className={`menu-chip ${activeFilter === "all" ? "active" : ""}`}
              onClick={() => setActiveFilter("all")}
              type="button"
            >
              All
            </button>
            {menuCategories.map((category) => (
              <button
                className={`menu-chip ${activeFilter === category ? "active" : ""}`}
                key={category}
                onClick={() => setActiveFilter(category)}
                type="button"
              >
                {category}
              </button>
            ))}
          </div>
          <div className="menu-toolbar-meta">
            <p className="menu-summary">
              {isLoading ? "Loading dishes..." : `${visibleItems.length} dishes available right now`}
            </p>
          </div>
        </section>

        <div className="menu-grid">
          {isLoading ? <p className="modal-loading">Loading menu...</p> : null}
          {isError ? <p className="modal-error">{status}</p> : null}
          {!isLoading && !isError && !visibleItems.length ? (
            <p className="modal-error">No available dishes found for this restaurant.</p>
          ) : null}

          {visibleItems.map((item) => (
            <MenuItemCard
              isFavorite={favoriteMenuItemIds.includes(item.itemId || item.id)}
              item={item}
              key={item.itemId || item.id}
              onAddToCart={(selectedItem) => onAddToCart(selectedItem, restaurant)}
              onFavoriteToggle={onFavoriteToggle}
              onQuantityChange={onQuantityChange}
              quantity={getCartQuantity(item)}
              restaurantImage={restaurant.image}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default MenuPanel;
