import RestaurantCard from "./RestaurantCard.jsx";

function RestaurantGrid({ favoriteRestaurantIds, onFavoriteToggle, onRestaurantSelect, restaurants }) {
  if (!restaurants.length) {
    return <p className="empty-state">No restaurants match this search yet.</p>;
  }

  return (
    <div className="restaurants-grid">
      {restaurants.map((restaurant) => (
        <RestaurantCard
          isFavorite={favoriteRestaurantIds.includes(restaurant.restaurantId || restaurant.id)}
          onFavoriteToggle={onFavoriteToggle}
          onSelect={onRestaurantSelect}
          restaurant={restaurant}
          key={restaurant.restaurantId}
        />
      ))}
    </div>
  );
}

export default RestaurantGrid;
