function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", {
    currency: "INR",
    maximumFractionDigits: 0,
    style: "currency"
  }).format(value || 0);
}

function MenuItemCard({ item, onAddToCart, quantity }) {
  const hasDiscount = item.discountedPrice && item.discountedPrice < item.price;

  return (
    <article className="menu-item-card">
      <img src={item.image} alt={item.name} loading="lazy" />
      <div>
        <div className="menu-item-heading">
          <h3>{item.name}</h3>
          <span className={item.vegetarian ? "food-type veg" : "food-type non-veg"}>
            {item.vegetarian ? "Veg" : "Non-veg"}
          </span>
        </div>
        <p>{item.description}</p>
        <div className="menu-item-meta">
          <span>{item.rating?.toFixed?.(1) || item.rating} rating</span>
          <span>{item.prepTime}</span>
        </div>
        <div className="price-row">
          <strong>{formatPrice(hasDiscount ? item.discountedPrice : item.price)}</strong>
          {hasDiscount ? <span>{formatPrice(item.price)}</span> : null}
        </div>
        <button className="add-item-button" onClick={() => onAddToCart(item)} type="button">
          {quantity ? `Add more (${quantity} in cart)` : "Add to cart"}
        </button>
      </div>
    </article>
  );
}

export default MenuItemCard;
