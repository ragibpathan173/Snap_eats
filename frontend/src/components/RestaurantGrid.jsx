import RestaurantCard from "./RestaurantCard.jsx";

function RestaurantGrid({ restaurants }) {
  if (!restaurants.length) {
    return <p className="empty-state">No restaurants match this search yet.</p>;
  }

  return (
    <div className="restaurant-grid">
      {restaurants.map((restaurant) => (
        <RestaurantCard restaurant={restaurant} key={restaurant.restaurantId} />
      ))}
    </div>
  );
}

export default RestaurantGrid;
