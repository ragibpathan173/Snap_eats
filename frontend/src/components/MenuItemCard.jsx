import React from "react";

function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", {
    currency: "INR",
    maximumFractionDigits: 0,
    style: "currency"
  }).format(value || 0);
}

const DietIcon = ({ vegetarian }) => {
  const color = vegetarian ? "#0f8a4f" : "#e43b2f";
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}>
      <rect x="0.5" y="0.5" width="13" height="13" rx="1.5" stroke={color} strokeWidth="1.2" />
      {vegetarian ? (
        <circle cx="7" cy="7" r="3.5" fill={color} />
      ) : (
        <polygon points="7,3 3,10 11,10" fill={color} />
      )}
    </svg>
  );
};

function MenuItemCard({ isFavorite, item, onAddToCart, onFavoriteToggle, onQuantityChange, quantity, restaurantImage }) {
  const hasDiscount = item.discountedPrice && item.discountedPrice < item.price;
  const itemKey = item.itemId || item.id;

  // Use rating from item or fallback to a dummy rating for visualization
  const displayRating = item.rating > 0 ? item.rating : 4.4;
  const displayReviewCount = item.reviewCount > 0 ? item.reviewCount : Math.floor(Math.random() * 150) + 20;

  return (
    <article className="menu-item-card">
      <div className="menu-item-copy">
        <div className="menu-item-topline">
          <DietIcon vegetarian={item.vegetarian} />
          {item.bestSeller ? (
            <span className="bestseller-badge">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '3px', verticalAlign: 'middle' }}>
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
              Bestseller
            </span>
          ) : null}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
          <h3>{item.name}</h3>
          <button className={`menu-favorite-toggle ${isFavorite ? "active" : ""}`} onClick={() => onFavoriteToggle(item)} type="button" aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}>
            {isFavorite ? "\u2665" : "\u2661"}
          </button>
        </div>
        <div className="menu-price-row">
          <span>{formatPrice(hasDiscount ? item.discountedPrice : item.price)}</span>
          {hasDiscount && (
            <span style={{ textDecoration: 'line-through', color: '#9aa2a6', fontSize: '13px', marginLeft: '8px' }}>
              {formatPrice(item.price)}
            </span>
          )}
        </div>
        <div className="menu-rating-row">
          <span className="star-icon">★</span>
          <span>{displayRating.toFixed(1)}</span>
          <span className="rating-count">({displayReviewCount >= 1000 ? `${(displayReviewCount/1000).toFixed(1)}K+` : displayReviewCount})</span>
        </div>
        <p>{item.description || "Freshly prepared and ready to order."}</p>
      </div>

      <div className="menu-item-aside">
        <div className="menu-item-img-wrapper">
          <img className="menu-item-image" src={item.image || restaurantImage} alt={item.name} loading="lazy" />
          <div className="menu-btn-overlay">
            {!quantity ? (
              <button className="swiggy-add-btn" onClick={() => onAddToCart(item)} type="button">
                ADD
              </button>
            ) : (
              <div className="swiggy-stepper">
                <button onClick={() => onQuantityChange(itemKey, quantity - 1)} type="button">
                  -
                </button>
                <span className="stepper-count">{quantity}</span>
                <button onClick={() => onQuantityChange(itemKey, quantity + 1)} type="button">
                  +
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="menu-cart-note">Customisable</div>
      </div>
    </article>
  );
}

export default MenuItemCard;
