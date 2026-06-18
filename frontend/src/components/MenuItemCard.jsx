function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", {
    currency: "INR",
    maximumFractionDigits: 0,
    style: "currency"
  }).format(value || 0);
}

function MenuItemCard({ item, onAddToCart, onQuantityChange, quantity, restaurantImage }) {
  const hasDiscount = item.discountedPrice && item.discountedPrice < item.price;
  const itemKey = item.itemId || item.id;

  return (
    <article className="menu-item-card">
      <div className="menu-item-copy">
        <div className="menu-item-topline">
          <span className="menu-item-category">{item.category || "Special"}</span>
          {item.bestSeller ? <span className="menu-badge">Popular</span> : null}
          <button className="menu-favorite-toggle" type="button" aria-label="Add to favorites">
            &#9825;
          </button>
        </div>
        <h3>{item.name}</h3>
        <p>{item.description || "Freshly prepared and ready to order."}</p>
        <div className="menu-item-meta">
          <span className="menu-price">{formatPrice(hasDiscount ? item.discountedPrice : item.price)}</span>
          {item.discount ? <span className="menu-discount">{item.discount}% off</span> : null}
          {item.vegetarian ? <span className="diet-pill">Veg</span> : null}
          {item.vegan ? <span className="diet-pill">Vegan</span> : null}
        </div>
      </div>

      <div className="menu-item-aside">
        <img className="menu-item-image" src={item.image || restaurantImage} alt={item.name} loading="lazy" />
        {!quantity ? (
          <button className="primary-button add-button" onClick={() => onAddToCart(item)} type="button">
            Add to cart
          </button>
        ) : (
          <>
            <div className="menu-cart-stepper" aria-label="Cart quantity controls">
              <button className="menu-cart-stepper-btn" onClick={() => onQuantityChange(itemKey, quantity - 1)} type="button">
                -
              </button>
              <span className="menu-cart-stepper-count">{quantity}</span>
              <button className="menu-cart-stepper-btn" onClick={() => onQuantityChange(itemKey, quantity + 1)} type="button">
                +
              </button>
            </div>
            <p className="menu-cart-note">Customisable</p>
          </>
        )}
      </div>
    </article>
  );
}

export default MenuItemCard;
