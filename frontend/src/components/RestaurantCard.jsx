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
        <div className="restaurant-title-row">
          <h3 className="restaurant-name">{restaurant.name}</h3>
          {restaurant.verified ? (
            <span className="verified-mark" title="Verified restaurant" aria-label="Verified restaurant">
              &#10003;
            </span>
          ) : null}
        </div>
        <div className="restaurant-meta">
          <div className="rating">
            <span className="restaurant-rating-star" aria-hidden="true">&#9733;</span>
            <span>{formatNumber(restaurant.rating)}</span>
          </div>
          <span className="restaurant-meta-separator" aria-hidden="true">&bull;</span>
          <div className="delivery-time">{restaurant.time || ""}</div>
        </div>
        <div className="restaurant-cuisine" title={restaurant.cuisine || ""}>{restaurant.cuisine || ""}</div>
        {restaurant.locality || restaurant.city ? (
          <div className="restaurant-serving">
            {[restaurant.locality, restaurant.city].filter(Boolean).join(", ")}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default RestaurantCard;
