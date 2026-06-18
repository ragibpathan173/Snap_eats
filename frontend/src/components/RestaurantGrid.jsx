import RestaurantCard from "./RestaurantCard.jsx";

function RestaurantGrid({ onRestaurantSelect, restaurants }) {
  if (!restaurants.length) {
    return <p className="empty-state">No restaurants match this search yet.</p>;
  }

  return (
    <div className="restaurants-grid">
      {restaurants.map((restaurant) => (
        <RestaurantCard
          onSelect={onRestaurantSelect}
          restaurant={restaurant}
          key={restaurant.restaurantId}
        />
      ))}
    </div>
  );
}

export default RestaurantGrid;
