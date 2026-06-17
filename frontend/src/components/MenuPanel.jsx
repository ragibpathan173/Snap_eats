import MenuItemCard from "./MenuItemCard.jsx";

function MenuPanel({ getCartQuantity, menuItems, onAddToCart, onClose, restaurant, status }) {
  if (!restaurant) {
    return null;
  }

  const isLoading = status === "loading";
  const isError = status !== "idle" && status !== "loading" && status !== "ready";

  return (
    <section className="menu-panel" aria-label={`${restaurant.name} menu`}>
      <div className="menu-panel-header">
        <div>
          <p className="eyebrow">{restaurant.locality}, {restaurant.city}</p>
          <h2>{restaurant.name}</h2>
          <p>{restaurant.cuisine}</p>
        </div>
        <button className="icon-button" onClick={onClose} type="button" aria-label="Close menu">
          X
        </button>
      </div>

      {isLoading ? <p className="empty-state">Loading menu...</p> : null}
      {isError ? <p className="empty-state">{status}</p> : null}
      {!isLoading && !isError && !menuItems.length ? (
        <p className="empty-state">No available dishes found for this restaurant.</p>
      ) : null}

      <div className="menu-list">
        {menuItems.map((item) => (
          <MenuItemCard
            item={item}
            key={item.itemId || item.id}
            onAddToCart={(selectedItem) => onAddToCart(selectedItem, restaurant)}
            quantity={getCartQuantity(item)}
          />
        ))}
      </div>
    </section>
  );
}

export default MenuPanel;
