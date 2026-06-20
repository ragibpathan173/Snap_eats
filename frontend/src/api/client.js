export const API_BASE_URL = (window.__SNAP_EATS_API_BASE_URL__ || "/api").replace(/\/$/, "");

async function readJsonResponse(response) {
  const responseText = await response.text();

  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText);
  } catch {
    return { message: responseText };
  }
}

export async function fetchJson(path, options = {}) {
  const { token, userId, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers || {});

  if (fetchOptions.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (userId) {
    headers.set("X-User-Id", String(userId));
  }

  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  const response = await fetch(url, {
    ...fetchOptions,
    headers
  });
  const data = await readJsonResponse(response);

  if (!response.ok) {
    throw new Error(data?.error || data?.message || `API request failed with ${response.status}`);
  }

  return data;
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

export function requestAuthOtp(identifier) {
  return fetchJson("/users/auth/otp/request", {
    body: JSON.stringify({ identifier }),
    method: "POST"
  });
}

export function verifyAuthOtp(payload) {
  return fetchJson("/users/auth/otp/verify", {
    body: JSON.stringify(payload),
    method: "POST"
  });
}

export function fetchCurrentUser(userId, token) {
  return fetchJson("/users/me", {
    token,
    userId
  });
}

export function fetchAddresses(userId, token) {
  return fetchJson("/addresses", {
    token,
    userId
  });
}

export function createAddress(payload, userId, token) {
  return fetchJson("/addresses", {
    body: JSON.stringify(payload),
    method: "POST",
    token,
    userId
  });
}

export function updateAddress(addressId, payload, userId, token) {
  return fetchJson(`/addresses/${encodeURIComponent(addressId)}`, {
    body: JSON.stringify(payload),
    method: "PUT",
    token,
    userId
  });
}

export function setDefaultAddress(addressId, userId, token) {
  return fetchJson(`/addresses/${encodeURIComponent(addressId)}/default`, {
    method: "PATCH",
    token,
    userId
  });
}

export function deleteAddress(addressId, userId, token) {
  return fetchJson(`/addresses/${encodeURIComponent(addressId)}`, {
    method: "DELETE",
    token,
    userId
  });
}

export function fetchMyOrders(userId, token) {
  return fetchJson("/orders/mine", {
    token,
    userId
  });
}

export function cancelMyOrder(orderId, userId, token) {
  return fetchJson(`/orders/mine/${encodeURIComponent(orderId)}/cancel`, {
    method: "PATCH",
    token,
    userId
  });
}

export function placeCheckoutOrder(payload, userId, token) {
  return fetchJson("/orders/checkout", {
    body: JSON.stringify(payload),
    method: "POST",
    token,
    userId
  });
}
