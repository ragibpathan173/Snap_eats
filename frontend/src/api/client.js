const API_BASE_URL = (window.__SNAP_EATS_API_BASE_URL__ || "/api").replace(/\/$/, "");

async function fetchJson(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error(`API request failed with ${response.status}`);
  }

  return response.json();
}

export function fetchCategories() {
  return fetchJson("/categories/active");
}

export function fetchRestaurants() {
  return fetchJson("/restaurants/active");
}

export async function fetchRestaurantMenu(restaurantCode) {
  const response = await fetchJson(
    `/menu-items/restaurant-code/${encodeURIComponent(restaurantCode)}?activeOnly=true&availableOnly=true&size=100&sortBy=popular`
  );

  return Array.isArray(response) ? response : response.items || [];
}
