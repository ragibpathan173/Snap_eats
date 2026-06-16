function RestaurantCard({ onSelect, restaurant }) {
  return (
    <article className="restaurant-card">
      <img src={restaurant.image} alt={restaurant.name} loading="lazy" />
      <div>
        <h3>{restaurant.name}</h3>
        <p>{restaurant.cuisine}</p>
        <div className="restaurant-meta">
          <span>{restaurant.rating} rating</span>
          <span>{restaurant.time}</span>
        </div>
        <button className="restaurant-action" onClick={() => onSelect(restaurant)} type="button">
          View menu
        </button>
      </div>
    </article>
  );
}

export default RestaurantCard;
