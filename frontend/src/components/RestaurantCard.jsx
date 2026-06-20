function formatNumber(value) {
  const numericValue = Number(value || 0);

  return Number.isFinite(numericValue) ? numericValue.toFixed(1) : value;
}

function RestaurantCard({ isFavorite, onFavoriteToggle, onSelect, restaurant }) {
  return (
    <article
      className="restaurant-card"
      onClick={() => onSelect(restaurant)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(restaurant);
        }
      }}
      role="button"
      tabIndex="0"
    >
      <div className="restaurant-image">
        <img src={restaurant.image} alt={restaurant.name} loading="lazy" />
        {restaurant.discount ? <div className="discount-badge">{restaurant.discount}</div> : null}
        <button
          className={`favorite-toggle ${isFavorite ? "active" : ""}`}
          onClick={(event) => {
            event.stopPropagation();
            onFavoriteToggle(restaurant);
          }}
          type="button"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavorite ? "\u2665" : "\u2661"}
        </button>
      </div>
      <div className="restaurant-info">
        <div className="restaurant-name">
          {restaurant.name}
          {restaurant.verified ? <span className="verified-mark">Verified</span> : null}
        </div>
        <div className="restaurant-cuisine">{restaurant.cuisine || ""}</div>
        {restaurant.locality || restaurant.city ? (
          <div className="restaurant-serving">
            Serves {[restaurant.locality, restaurant.city].filter(Boolean).join(", ")}
          </div>
        ) : null}
        <div className="restaurant-meta">
          <div className="rating">&#9733; {formatNumber(restaurant.rating)}</div>
          <div className="delivery-time">{restaurant.time || ""}</div>
        </div>
      </div>
    </article>
  );
}

export default RestaurantCard;
