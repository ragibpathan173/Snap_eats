const API_BASE_URL = "/api";
const CART_STORAGE_KEY = "snap_eats_cart";
const AUTH_STORAGE_KEY = "snap_eats_current_user";
const LOCATION_STORAGE_KEY = "snap_eats_selected_location";
const RECENT_LOCATIONS_STORAGE_KEY = "snap_eats_recent_locations";
const PINCODE_LOOKUP_BASE_URL = "https://api.postalpincode.in/pincode/";
const REVERSE_GEOCODE_BASE_URL = "https://nominatim.openstreetmap.org/reverse";

let categories = [];
let restaurants = [];
let activeCategory = "all";
let activeRestaurant = null;
let activeMenuItems = [];
let savedAddresses = [];
let favoriteRestaurants = [];
let favoriteMenuItems = [];
let savedPaymentMethods = [];
let editingAddressId = null;
let orderHistory = [];
let activeAccountSection = "orders";
let paymentFormType = "CARD";
let checkoutPaymentChoice = "CASH";
let latestOrderSuccess = null;
let currentUser = loadCurrentUser();
let selectedLocation = loadSelectedLocation();
let recentLocations = loadRecentLocations();
let cart = loadCart();
let locationGpsStatus = { type: "idle", message: "" };
const pincodeLookupCache = new Map();

async function fetchJson(url, options = {}) {
    const headers = new Headers(options.headers || {});
    if (currentUser?.id) {
        headers.set("X-User-Id", String(currentUser.id));
    }

    const response = await fetch(url, {
        ...options,
        headers
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
    }
    return data;
}

function loadCurrentUser() {
    try {
        const raw = localStorage.getItem(AUTH_STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

function loadCart() {
    try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        return raw ? JSON.parse(raw) : createEmptyCart();
    } catch {
        return createEmptyCart();
    }
}

function loadSelectedLocation() {
    try {
        const raw = localStorage.getItem(LOCATION_STORAGE_KEY);
        return raw ? JSON.parse(raw) : { label: "Other", subtitle: "" };
    } catch {
        return { label: "Other", subtitle: "" };
    }
}

function loadRecentLocations() {
    try {
        const raw = localStorage.getItem(RECENT_LOCATIONS_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function createEmptyCart() {
    return {
        restaurantCode: null,
        restaurantName: "",
        items: []
    };
}

function saveCart() {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateCartCount();
    renderCart();
}

function saveCurrentUser(user) {
    currentUser = user || null;
    if (currentUser) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
    } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    updateAuthNav();
}

function saveSelectedLocation(location) {
    selectedLocation = location;
    localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
    updateLocationChip();
}

function saveRecentLocations(locations) {
    recentLocations = locations.slice(0, 5);
    localStorage.setItem(RECENT_LOCATIONS_STORAGE_KEY, JSON.stringify(recentLocations));
}

function updateCartCount() {
    const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const cartCount = document.getElementById("cartCount");
    if (cartCount) {
        cartCount.textContent = String(count);
    }
}

function updateAuthNav() {
    const authNavLabel = document.getElementById("authNavLabel");
    if (!authNavLabel) {
        return;
    }
    authNavLabel.textContent = currentUser?.name ? currentUser.name.split(" ")[0] : "Profile";
}

function updateLocationChip() {
    const locationChipLabel = document.getElementById("locationChipLabel");
    if (!locationChipLabel) {
        return;
    }
    locationChipLabel.textContent = selectedLocation?.label || "Other";
}

function openSearchBar() {
    const searchStrip = document.getElementById("headerSearchStrip");
    const searchInput = document.getElementById("searchInput");
    if (!searchStrip || !searchInput) {
        return;
    }

    searchStrip.classList.add("open");
    searchInput.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => searchInput.focus(), 160);
}

function closeSearchBar() {
    const searchStrip = document.getElementById("headerSearchStrip");
    if (!searchStrip) {
        return;
    }

    searchStrip.classList.remove("open");
}

function toggleSearchBar(event) {
    if (event) {
        event.preventDefault();
    }

    const searchStrip = document.getElementById("headerSearchStrip");
    const searchInput = document.getElementById("searchInput");
    if (!searchStrip || !searchInput) {
        return;
    }

    if (searchStrip.classList.contains("open")) {
        closeSearchBar();
        return;
    }

    openSearchBar();
}

function runSearch() {
    const searchInput = document.getElementById("searchInput");
    if (!searchInput) {
        return;
    }

    searchRestaurants(searchInput.value);
}

function getDefaultAddress() {
    return savedAddresses.find((address) => address.defaultAddress) || null;
}

function getDefaultSavedPaymentMethod() {
    return savedPaymentMethods.find((method) => method.defaultMethod) || savedPaymentMethods[0] || null;
}

function getAddressById(addressId) {
    return savedAddresses.find((address) => address.id === addressId) || null;
}

function getCartItemQuantity(itemId) {
    return cart.items.find((item) => item.itemId === itemId)?.quantity || 0;
}

function ensureCheckoutPaymentChoice() {
    if (!savedPaymentMethods.length) {
        checkoutPaymentChoice = "CASH";
        return;
    }

    const hasSelectedSavedMethod = savedPaymentMethods.some((method) => `saved:${method.id}` === checkoutPaymentChoice);
    if (checkoutPaymentChoice === "CASH" || hasSelectedSavedMethod) {
        return;
    }

    const defaultMethod = getDefaultSavedPaymentMethod();
    checkoutPaymentChoice = defaultMethod ? `saved:${defaultMethod.id}` : "CASH";
}

function setCheckoutPaymentChoice(choice) {
    checkoutPaymentChoice = choice;
    renderCart();
}

function getCheckoutPaymentSelection() {
    ensureCheckoutPaymentChoice();

    if (checkoutPaymentChoice === "CASH") {
        return {
            type: "CASH",
            label: "Cash on delivery"
        };
    }

    const selectedMethod = savedPaymentMethods.find((method) => `saved:${method.id}` === checkoutPaymentChoice);
    if (!selectedMethod) {
        return {
            type: "CASH",
            label: "Cash on delivery"
        };
    }

    return {
        type: selectedMethod.methodType,
        label: formatPaymentMethodLabel(selectedMethod),
        methodId: selectedMethod.id
    };
}

function setPaymentFormType(type) {
    paymentFormType = type;
    renderAuthModal();
}

function getLocationSuggestions(query = "") {
    const normalizedQuery = query.trim().toLowerCase();
    const savedAddressLocations = savedAddresses.map((address) => ({
        label: address.label,
        subtitle: formatAddressLine(address)
    }));
    const curatedLocations = [
        { label: "Jamia Nagar", subtitle: "Okhla, New Delhi, Delhi, India" },
        { label: "Koramangala", subtitle: "Bengaluru, Karnataka, India" },
        { label: "Bandra West", subtitle: "Mumbai, Maharashtra, India" },
        { label: "Salt Lake", subtitle: "Kolkata, West Bengal, India" }
    ];

    const deduped = [];
    [...recentLocations, ...savedAddressLocations, ...curatedLocations].forEach((location) => {
        const key = `${location.label}|${location.subtitle}`;
        if (!deduped.some((entry) => `${entry.label}|${entry.subtitle}` === key)) {
            deduped.push(location);
        }
    });

    if (!normalizedQuery) {
        return deduped;
    }

    return deduped.filter((location) =>
        location.label.toLowerCase().includes(normalizedQuery)
        || location.subtitle.toLowerCase().includes(normalizedQuery)
    );
}

function pushRecentLocation(location) {
    const nextLocations = [
        location,
        ...recentLocations.filter((entry) => `${entry.label}|${entry.subtitle}` !== `${location.label}|${location.subtitle}`)
    ];
    saveRecentLocations(nextLocations);
}

function applyLocationSelection(location) {
    saveSelectedLocation(location);
    pushRecentLocation(location);
    closeLocationPicker();
    fetchRestaurants(activeCategory, document.getElementById("searchInput")?.value || "").catch(() => {});
}

function handleLocationChipKeydown(event) {
    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLocationPicker();
    }
}

function formatAddressLine(address) {
    if (!address) {
        return "";
    }

    return [
        address.addressLine,
        address.landmark,
        address.city,
        address.state,
        address.pincode
    ].filter(Boolean).join(", ");
}

function normalizeTextForMatching(value) {
    return String(value || "")
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function getSelectedLocationFilters() {
    const label = String(selectedLocation?.label || "").trim();
    const subtitle = String(selectedLocation?.subtitle || "").trim();
    if (!label || label.toLowerCase() === "other") {
        return {};
    }

    const normalizedSource = normalizeTextForMatching(`${label} ${subtitle}`);
    const cityAliases = [
        { canonical: "New Delhi", patterns: ["new delhi", "delhi"] },
        { canonical: "Mumbai", patterns: ["mumbai", "bombay"] },
        { canonical: "Pune", patterns: ["pune"] },
        { canonical: "Bengaluru", patterns: ["bengaluru", "bangalore"] },
        { canonical: "Hyderabad", patterns: ["hyderabad"] },
        { canonical: "Kolkata", patterns: ["kolkata", "calcutta"] },
        { canonical: "Chennai", patterns: ["chennai"] },
        { canonical: "Ahmedabad", patterns: ["ahmedabad"] }
    ];

    let detectedCity = "";
    for (const entry of cityAliases) {
        if (entry.patterns.some((pattern) => normalizedSource.includes(pattern))) {
            detectedCity = entry.canonical;
            break;
        }
    }

    const genericLabels = new Set(["other", "current location"]);
    const locality = genericLabels.has(label.toLowerCase()) ? "" : label;
    return {
        city: detectedCity,
        locality
    };
}

async function lookupPincodeDetails(pincode) {
    const normalizedPincode = String(pincode || "").trim();
    if (pincodeLookupCache.has(normalizedPincode)) {
        return pincodeLookupCache.get(normalizedPincode);
    }

    const response = await fetch(`${PINCODE_LOOKUP_BASE_URL}${encodeURIComponent(normalizedPincode)}`);
    const result = await response.json();
    const payload = Array.isArray(result) ? result[0] : null;

    if (!response.ok || !payload || payload.Status !== "Success" || !Array.isArray(payload.PostOffice) || !payload.PostOffice.length) {
        throw new Error("We couldn't find address details for that pincode.");
    }

    const details = {
        city: payload.PostOffice[0].District || "",
        state: payload.PostOffice[0].State || "",
        areas: payload.PostOffice
            .map((office) => office.Name)
            .filter(Boolean)
            .filter((value, index, all) => all.indexOf(value) === index)
    };

    pincodeLookupCache.set(normalizedPincode, details);
    return details;
}

function renderAreaOptions(areas, selectedArea = "") {
    if (!Array.isArray(areas) || !areas.length) {
        return selectedArea ? `<option value="${escapeAttribute(selectedArea)}"></option>` : "";
    }

    const normalizedSelected = String(selectedArea || "").trim();
    const values = normalizedSelected && !areas.includes(normalizedSelected)
        ? [normalizedSelected, ...areas]
        : areas;

    return values.map((area) => `<option value="${escapeAttribute(area)}"></option>`).join("");
}

function setAddressLookupFeedback(message, type = "") {
    const feedback = document.getElementById("addressLookupFeedback");
    if (!feedback) {
        return;
    }

    feedback.textContent = message || "";
    feedback.className = `address-lookup-feedback ${type}`.trim();
}

async function handlePincodeInput() {
    const pincodeInput = document.getElementById("addressPincode");
    const cityInput = document.getElementById("addressCity");
    const stateInput = document.getElementById("addressState");
    const areaInput = document.getElementById("addressLandmark");
    const areaOptions = document.getElementById("addressAreaOptions");

    if (!pincodeInput || !cityInput || !stateInput || !areaInput || !areaOptions) {
        return;
    }

    const normalizedPincode = pincodeInput.value.replace(/\D/g, "").slice(0, 6);
    pincodeInput.value = normalizedPincode;

    if (normalizedPincode.length < 6) {
        setAddressLookupFeedback("Enter a 6-digit pincode to auto-fill city, state, and area.");
        return;
    }

    setAddressLookupFeedback("Fetching city, state, and area...", "loading");

    try {
        const details = await lookupPincodeDetails(normalizedPincode);
        cityInput.value = details.city;
        stateInput.value = details.state;
        if (!areaInput.value.trim() && details.areas.length) {
            areaInput.value = details.areas[0];
        }
        areaOptions.innerHTML = renderAreaOptions(details.areas, areaInput.value.trim());
        setAddressLookupFeedback("City and state auto-filled. You can choose an area/locality suggestion too.", "success");
    } catch (error) {
        areaOptions.innerHTML = "";
        setAddressLookupFeedback(error.message || "Unable to fetch pincode details right now.", "error");
    }
}

async function fetchCategories() {
    categories = await fetchJson(`${API_BASE_URL}/categories/active`);
    renderCategories();
}

async function fetchRestaurants(category = activeCategory, searchQuery = "") {
    const params = new URLSearchParams();
    const location = getSelectedLocationFilters();
    if (location.city) {
        params.set("city", location.city);
    }
    if (location.locality) {
        params.set("locality", location.locality);
    }
    if (category && category !== "all") {
        params.set("category", category);
    }
    if (searchQuery.trim()) {
        params.set("query", searchQuery.trim());
    }
    const endpoint = `${API_BASE_URL}/restaurants/active${params.toString() ? `?${params.toString()}` : ""}`;

    restaurants = await fetchJson(endpoint);
    renderRestaurants();
}

async function fetchAddresses() {
    try {
        const addresses = await fetchJson(`${API_BASE_URL}/addresses`);
        savedAddresses = Array.isArray(addresses) ? addresses : [];
    } catch {
        savedAddresses = [];
    }
    renderCart();
    renderAddressBook();
}

async function fetchFavoriteRestaurants() {
    try {
        const favorites = await fetchJson(`${API_BASE_URL}/favorites/restaurants`);
        favoriteRestaurants = Array.isArray(favorites) ? favorites : [];
    } catch {
        favoriteRestaurants = [];
    }
    renderRestaurants();
    if (currentUser) {
        renderAuthModal();
    }
}

async function fetchFavoriteMenuItems() {
    try {
        const favorites = await fetchJson(`${API_BASE_URL}/favorites/menu-items`);
        favoriteMenuItems = Array.isArray(favorites) ? favorites : [];
    } catch {
        favoriteMenuItems = [];
    }
    if (activeRestaurant) {
        renderMenuModal();
    }
    if (currentUser) {
        renderAuthModal();
    }
}

async function fetchPaymentMethods() {
    try {
        const methods = await fetchJson(`${API_BASE_URL}/payments/methods`);
        savedPaymentMethods = Array.isArray(methods) ? methods : [];
    } catch {
        savedPaymentMethods = [];
    }
    ensureCheckoutPaymentChoice();
    renderCart();
    if (currentUser) {
        renderAuthModal();
    }
}

async function fetchOrders() {
    try {
        const orders = await fetchJson(`${API_BASE_URL}/orders/mine`);
        orderHistory = Array.isArray(orders) ? orders : [];
    } catch {
        orderHistory = [];
    }
    renderOrders();
}

async function refreshCurrentUser() {
    try {
        const user = await fetchJson(`${API_BASE_URL}/users/me`);
        saveCurrentUser(user);
    } catch {
        saveCurrentUser(null);
    }
}

function renderCategories() {
    const container = document.getElementById("categoriesContainer");
    if (!container) {
        return;
    }

    container.innerHTML = categories.map((category) => `
        <button
            class="category-card ${activeCategory === (category.filter || "all") ? "active" : ""}"
            type="button"
            onclick="filterByCategory('${escapeAttribute(category.filter || "all")}')"
        >
            <img src="${category.image}" alt="${escapeHtml(category.name)}" class="category-image">
            <div class="category-overlay">
                <div class="category-name">${escapeHtml(category.name)}</div>
            </div>
        </button>
    `).join("");
}

function renderRestaurants() {
    const grid = document.getElementById("restaurantsGrid");
    if (!grid) {
        return;
    }

    if (!restaurants.length) {
        const hasLocation = Boolean(selectedLocation?.label && selectedLocation.label.toLowerCase() !== "other");
        grid.innerHTML = `<p class="empty-state">${hasLocation ? "Not serviceable in this area." : "No restaurants found for this selection."}</p>`;
        return;
    }

    grid.innerHTML = `
        ${restaurants.map((restaurant) => `
        <article
            class="restaurant-card"
            role="button"
            tabindex="0"
            onclick="openRestaurantMenu('${escapeAttribute(restaurant.restaurantId)}')"
            onkeydown="handleRestaurantKeydown(event, '${escapeAttribute(restaurant.restaurantId)}')"
        >
            <div class="restaurant-image">
                <img src="${restaurant.image}" alt="${escapeHtml(restaurant.name)}">
                ${restaurant.discount ? `<div class="discount-badge">${escapeHtml(restaurant.discount)}</div>` : ""}
                <button
                    class="favorite-toggle ${isRestaurantFavorite(restaurant.restaurantId) ? "active" : ""}"
                    type="button"
                    onclick="toggleRestaurantFavorite(event, '${escapeAttribute(restaurant.restaurantId)}')"
                    aria-label="${isRestaurantFavorite(restaurant.restaurantId) ? "Remove from favorites" : "Add to favorites"}"
                >
                    ${isRestaurantFavorite(restaurant.restaurantId) ? "♥" : "♡"}
                </button>
            </div>
            <div class="restaurant-info">
                <div class="restaurant-name">
                    ${escapeHtml(restaurant.name)}
                    ${restaurant.verified ? ' <span class="verified-mark">Verified</span>' : ""}
                </div>
                <div class="restaurant-cuisine">${escapeHtml(restaurant.cuisine || "")}</div>
                ${(restaurant.locality || restaurant.city) ? `
                    <div class="restaurant-serving">
                        Serves ${escapeHtml([restaurant.locality, restaurant.city].filter(Boolean).join(", "))}
                    </div>
                ` : ""}
                <div class="restaurant-meta">
                    <div class="rating">★ ${formatNumber(restaurant.rating)}</div>
                    <div class="delivery-time">${escapeHtml(restaurant.time || "")}</div>
                </div>
            </div>
        </article>
    `).join("")}
    `;
}

function isRestaurantFavorite(restaurantId) {
    return favoriteRestaurants.some((favorite) => favorite.restaurantId === restaurantId);
}

async function toggleRestaurantFavorite(event, restaurantId) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    try {
        if (isRestaurantFavorite(restaurantId)) {
            await fetchJson(`${API_BASE_URL}/favorites/restaurants/${encodeURIComponent(restaurantId)}`, {
                method: "DELETE"
            });
        } else {
            await fetchJson(`${API_BASE_URL}/favorites/restaurants/${encodeURIComponent(restaurantId)}`, {
                method: "POST"
            });
        }
        await fetchFavoriteRestaurants();
    } catch (error) {
        alert(error.message || "Failed to update favorites.");
    }
}

async function filterByCategory(category) {
    activeCategory = category;
    const title = document.getElementById("restaurantSectionTitle");
    if (title) {
        title.textContent = category === "all"
            ? "Top restaurant chains in your city"
            : `${capitalize(category)} restaurants`;
    }
    renderCategories();
    await fetchRestaurants(category, document.getElementById("searchInput")?.value || "");
}

async function searchRestaurants(query) {
    await fetchRestaurants(activeCategory, query);
}

async function openRestaurantMenu(restaurantCode) {
    const modal = document.getElementById("menuModal");
    const content = document.getElementById("menuModalContent");
    if (!modal || !content) {
        return;
    }

    modal.classList.add("open");
    document.body.classList.add("modal-open");
    content.innerHTML = `<div class="modal-loading">Loading restaurant menu...</div>`;

    try {
        const [restaurant, menuResponse] = await Promise.all([
            fetchJson(`${API_BASE_URL}/restaurants/restaurantId/${encodeURIComponent(restaurantCode)}`),
            fetchJson(`${API_BASE_URL}/menu-items/restaurant-code/${encodeURIComponent(restaurantCode)}?activeOnly=true&availableOnly=true&size=100&sortBy=popular`)
        ]);

        activeRestaurant = restaurant;
        activeMenuItems = menuResponse.items || [];
        renderMenuModal();
        window.location.hash = restaurantCode;
    } catch (error) {
        content.innerHTML = `
            <div class="modal-error">
                <h3>Unable to load restaurant details</h3>
                <p>${escapeHtml(error.message)}</p>
            </div>`;
    }
}

function renderMenuModal(filter = "all") {
    const content = document.getElementById("menuModalContent");
    if (!content || !activeRestaurant) {
        return;
    }

    const menuCategories = [...new Set(activeMenuItems.map((item) => item.category).filter(Boolean))];
    const items = filter === "all"
        ? activeMenuItems
        : activeMenuItems.filter((item) => item.category === filter);

    const currentCartRestaurant = cart.restaurantCode && cart.restaurantCode !== activeRestaurant.restaurantId
        ? `<p class="cart-restaurant-warning">Your cart currently has items from ${escapeHtml(cart.restaurantName)}. Adding from this restaurant will replace them.</p>`
        : "";

    content.innerHTML = `
        <section class="menu-hero">
            <img class="menu-hero-image" src="${activeRestaurant.image}" alt="${escapeHtml(activeRestaurant.name)}">
            <div class="menu-hero-copy">
                <p class="menu-eyebrow">${capitalize(activeRestaurant.category || "featured")} kitchen</p>
                <h2>${escapeHtml(activeRestaurant.name)}</h2>
                <p class="menu-cuisine">${escapeHtml(activeRestaurant.cuisine || "")}</p>
                <div class="menu-stats">
                    <span>★ ${formatNumber(activeRestaurant.rating)}</span>
                    <span>${escapeHtml(activeRestaurant.time || "Fast delivery")}</span>
                    <span>${activeRestaurant.discount ? escapeHtml(activeRestaurant.discount) : "Fresh daily offers"}</span>
                </div>
                ${currentCartRestaurant}
            </div>
        </section>

        <section class="menu-toolbar">
            <div class="menu-filter-row">
                <button class="menu-chip ${filter === "all" ? "active" : ""}" type="button" onclick="renderMenuModal('all')">All</button>
                ${menuCategories.map((category) => `
                    <button class="menu-chip ${filter === category ? "active" : ""}" type="button" onclick="renderMenuModal('${escapeAttribute(category)}')">
                        ${escapeHtml(category)}
                    </button>
                `).join("")}
            </div>
            <div class="menu-toolbar-meta">
                <p class="menu-summary">${items.length} dishes available right now</p>
                <button class="secondary-button" type="button" onclick="openCart()">Open cart</button>
            </div>
        </section>

        <section class="menu-grid">
            ${items.map((item) => `
                <article class="menu-item-card">
                    <div class="menu-item-copy">
                        <div class="menu-item-topline">
                            <span class="menu-item-category">${escapeHtml(item.category || "Special")}</span>
                            ${item.bestSeller ? '<span class="menu-badge">Popular</span>' : ""}
                            <button
                                class="menu-favorite-toggle ${isMenuItemFavorite(item.itemId) ? "active" : ""}"
                                type="button"
                                onclick="toggleMenuItemFavorite(event, '${escapeAttribute(item.itemId)}')"
                                aria-label="${isMenuItemFavorite(item.itemId) ? "Remove from favorites" : "Add to favorites"}"
                            >
                                ${isMenuItemFavorite(item.itemId) ? "♥" : "♡"}
                            </button>
                        </div>
                        <h3>${escapeHtml(item.name)}</h3>
                        <p>${escapeHtml(item.description || "Freshly prepared and ready to order.")}</p>
                        <div class="menu-item-meta">
                            <span class="menu-price">${formatCurrency(item.discountedPrice || item.price)}</span>
                            ${item.discount && item.discount > 0 ? `<span class="menu-discount">${item.discount}% off</span>` : ""}
                            ${item.vegetarian ? '<span class="diet-pill">Veg</span>' : ""}
                            ${item.vegan ? '<span class="diet-pill">Vegan</span>' : ""}
                        </div>
                    </div>
                    <div class="menu-item-aside">
                        <img class="menu-item-image" src="${item.image || activeRestaurant.image}" alt="${escapeHtml(item.name)}">
                        ${renderMenuItemCartAction(item)}
                    </div>
                </article>
            `).join("")}
        </section>
    `;
}

function isMenuItemFavorite(itemId) {
    return favoriteMenuItems.some((item) => item.itemId === itemId);
}

async function toggleMenuItemFavorite(event, itemId) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    try {
        if (isMenuItemFavorite(itemId)) {
            await fetchJson(`${API_BASE_URL}/favorites/menu-items/${encodeURIComponent(itemId)}`, {
                method: "DELETE"
            });
        } else {
            await fetchJson(`${API_BASE_URL}/favorites/menu-items/${encodeURIComponent(itemId)}`, {
                method: "POST"
            });
        }
        await fetchFavoriteMenuItems();
    } catch (error) {
        alert(error.message || "Failed to update favorite dish.");
    }
}

function renderMenuItemCartAction(item) {
    const quantity = getCartItemQuantity(item.itemId);
    if (!quantity) {
        return `<button class="primary-button add-button" type="button" onclick="addToCart('${escapeAttribute(item.itemId)}')">Add to cart</button>`;
    }

    return `
        <div class="menu-cart-stepper" aria-label="Cart quantity controls">
            <button class="menu-cart-stepper-btn" type="button" onclick="changeCartQuantity('${escapeAttribute(item.itemId)}', -1)">-</button>
            <span class="menu-cart-stepper-count">${quantity}</span>
            <button class="menu-cart-stepper-btn" type="button" onclick="changeCartQuantity('${escapeAttribute(item.itemId)}', 1)">+</button>
        </div>
        <p class="menu-cart-note">Customisable</p>
    `;
}

function addToCart(itemId) {
    const item = activeMenuItems.find((menuItem) => menuItem.itemId === itemId);
    if (!item || !activeRestaurant) {
        return;
    }

    if (cart.restaurantCode && cart.restaurantCode !== activeRestaurant.restaurantId) {
        const shouldReplace = window.confirm(`Your cart has items from ${cart.restaurantName}. Replace them with items from ${activeRestaurant.name}?`);
        if (!shouldReplace) {
            return;
        }
        cart = createEmptyCart();
    }

    cart.restaurantCode = activeRestaurant.restaurantId;
    cart.restaurantName = activeRestaurant.name;

    const existing = cart.items.find((cartItem) => cartItem.itemId === item.itemId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.items.push({
            itemId: item.itemId,
            name: item.name,
            price: item.discountedPrice || item.price,
            basePrice: item.price,
            quantity: 1,
            image: item.image || activeRestaurant.image,
            notes: ""
        });
    }

    saveCart();
    renderMenuModal();
}

function changeCartQuantity(itemId, delta) {
    const cartItem = cart.items.find((item) => item.itemId === itemId);
    if (!cartItem) {
        return;
    }

    cartItem.quantity += delta;
    if (cartItem.quantity <= 0) {
        cart.items = cart.items.filter((item) => item.itemId !== itemId);
    }

    if (!cart.items.length) {
        cart = createEmptyCart();
    }

    saveCart();
    if (activeRestaurant) {
        renderMenuModal();
    }
}

function openCart(event) {
    if (event) {
        event.preventDefault();
    }

    const modal = document.getElementById("cartModal");
    if (!modal) {
        return;
    }

    modal.classList.add("open");
    document.body.classList.add("modal-open");
    renderCart();
}

function dismissOrderSuccess() {
    latestOrderSuccess = null;
    renderCart();
}

function parseOrderDate(value) {
    if (!value) {
        return null;
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function plusMinutes(date, minutes) {
    if (!date) {
        return null;
    }
    return new Date(date.getTime() + (minutes * 60000));
}

function getTrackedOrderStage(order) {
    const status = String(order?.status || "").toUpperCase();

    if (status === "CANCELLED" || status === "DELIVERED") {
        return status;
    }

    const createdAt = parseOrderDate(order?.createdAt) || new Date();
    const estimatedDelivery = parseOrderDate(order?.estimatedDeliveryTime) || plusMinutes(createdAt, 35);
    const elapsedMinutes = Math.max(0, Math.floor((Date.now() - createdAt.getTime()) / 60000));

    if (status === "OUT_FOR_DELIVERY") {
        if (estimatedDelivery && Date.now() >= estimatedDelivery.getTime() + (5 * 60000)) {
            return "DELIVERED";
        }
        return "OUT_FOR_DELIVERY";
    }

    if (elapsedMinutes < 5) {
        return "CONFIRMED";
    }
    if (elapsedMinutes < 16) {
        return "PREPARING";
    }
    if (estimatedDelivery && Date.now() >= estimatedDelivery.getTime() + (5 * 60000)) {
        return "DELIVERED";
    }
    return "OUT_FOR_DELIVERY";
}

function getEtaLabel(order) {
    const stage = getTrackedOrderStage(order);
    if (stage === "CANCELLED") {
        return "Cancelled";
    }
    if (stage === "DELIVERED") {
        const deliveredAt = parseOrderDate(order?.actualDeliveryTime);
        return deliveredAt ? `Delivered at ${formatTime(deliveredAt)}` : "Delivered";
    }

    const createdAt = parseOrderDate(order?.createdAt) || new Date();
    const estimatedDelivery = parseOrderDate(order?.estimatedDeliveryTime) || plusMinutes(createdAt, 35);
    if (!estimatedDelivery) {
        return "ETA TBD";
    }
    if (stage === "OUT_FOR_DELIVERY") {
        return `Arriving by ${formatTime(estimatedDelivery)}`;
    }
    return `ETA ${formatTime(estimatedDelivery)}`;
}

function getTrackingHeadline(order) {
    const stage = getTrackedOrderStage(order);
    if (stage === "CANCELLED") {
        return "This order was cancelled";
    }
    if (stage === "DELIVERED") {
        return "Delivered to your doorstep";
    }
    if (stage === "OUT_FOR_DELIVERY") {
        return "Rider is heading your way";
    }
    if (stage === "PREPARING") {
        return "Your food is being prepared";
    }
    return "Order confirmed by restaurant";
}

function getTrackingCopy(order) {
    const stage = getTrackedOrderStage(order);
    if (stage === "CANCELLED") {
        return "You can place a fresh order anytime from your favorites.";
    }
    if (stage === "DELIVERED") {
        return "Enjoy your meal. You can reorder this basket anytime.";
    }
    if (stage === "OUT_FOR_DELIVERY") {
        return "Packing is complete and your rider is on the route.";
    }
    if (stage === "PREPARING") {
        return "The kitchen has started cooking your items right now.";
    }
    return "We are locking your order details and assigning the kitchen.";
}

function getTrackingSubcopy(order) {
    const stage = getTrackedOrderStage(order);
    if (stage === "CANCELLED") {
        return "Refund status will reflect in your payment history.";
    }
    if (stage === "DELIVERED") {
        return "Thanks for ordering with SnapEats.";
    }
    if (stage === "OUT_FOR_DELIVERY") {
        return "Keep your phone handy for rider updates.";
    }
    if (stage === "PREPARING") {
        return "We will update you when it leaves the restaurant.";
    }
    return "Next update: preparing starts shortly.";
}

function buildSuccessTimeline(order) {
    const stage = getTrackedOrderStage(order);
    const stages = ["CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"];
    const activeIndex = stages.indexOf(stage);
    const effectiveIndex = activeIndex === -1 ? 0 : activeIndex;
    const copyByStep = {
        CONFIRMED: "Restaurant accepted your order.",
        PREPARING: "Kitchen is preparing your food.",
        OUT_FOR_DELIVERY: "Packed and out for delivery.",
        DELIVERED: "Delivered to your selected address."
    };

    return stages.map((entry, index) => ({
        title: formatStatus(entry),
        copy: copyByStep[entry],
        active: stage === "CANCELLED" ? false : index <= effectiveIndex
    }));
}

function buildOrderMilestones(order) {
    const stage = getTrackedOrderStage(order);
    const createdAt = parseOrderDate(order?.createdAt) || new Date();
    const confirmedAt = createdAt;
    const preparingAt = plusMinutes(createdAt, 8);
    const outForDeliveryAt = plusMinutes(createdAt, 18);
    const deliveredAt = parseOrderDate(order?.actualDeliveryTime)
        || parseOrderDate(order?.estimatedDeliveryTime)
        || plusMinutes(createdAt, 35);

    const steps = [
        { key: "CONFIRMED", label: "Confirmed", time: formatTime(confirmedAt) },
        { key: "PREPARING", label: "Preparing", time: formatTime(preparingAt) },
        { key: "OUT_FOR_DELIVERY", label: "Out for delivery", time: formatTime(outForDeliveryAt) },
        { key: "DELIVERED", label: "Delivered", time: stage === "DELIVERED" ? formatTime(deliveredAt) : "Pending" }
    ];

    if (stage === "CANCELLED") {
        return steps.map((step, index) => ({ ...step, active: index === 0 }));
    }

    const activeIndex = Math.max(0, steps.findIndex((step) => step.key === stage));
    return steps.map((step, index) => ({ ...step, active: index <= activeIndex }));
}

function openAddressBook(event) {
    if (event) {
        event.preventDefault();
    }

    const modal = document.getElementById("addressModal");
    if (!modal) {
        return;
    }

    modal.classList.add("open");
    document.body.classList.add("modal-open");
    renderAddressBook();
}

function openOrders(event) {
    if (event) {
        event.preventDefault();
    }

    const modal = document.getElementById("ordersModal");
    if (!modal) {
        return;
    }

    modal.classList.add("open");
    document.body.classList.add("modal-open");
    renderOrders(true);
    fetchOrders();
}

function openAuthModal(event) {
    if (event) {
        event.preventDefault();
    }

    const modal = document.getElementById("authModal");
    if (!modal) {
        return;
    }

    modal.classList.add("open");
    document.body.classList.add("modal-open");
    renderAuthModal();
}

function openLocationPicker(event) {
    if (event) {
        event.preventDefault();
    }

    const modal = document.getElementById("locationModal");
    if (!modal) {
        return;
    }

    locationGpsStatus = { type: "idle", message: "" };
    modal.classList.add("open");
    document.body.classList.add("modal-open");
    renderLocationPicker();
}

function closeCart() {
    const modal = document.getElementById("cartModal");
    if (!modal) {
        return;
    }

    modal.classList.remove("open");
    if (!anyModalOpen()) {
        document.body.classList.remove("modal-open");
    }
}

function closeAddressBook() {
    const modal = document.getElementById("addressModal");
    if (!modal) {
        return;
    }

    modal.classList.remove("open");
    editingAddressId = null;
    if (!anyModalOpen()) {
        document.body.classList.remove("modal-open");
    }
}

function closeOrders() {
    const modal = document.getElementById("ordersModal");
    if (!modal) {
        return;
    }

    modal.classList.remove("open");
    if (!anyModalOpen()) {
        document.body.classList.remove("modal-open");
    }
}

function closeAuthModal() {
    const modal = document.getElementById("authModal");
    if (!modal) {
        return;
    }

    modal.classList.remove("open");
    if (!anyModalOpen()) {
        document.body.classList.remove("modal-open");
    }
}

function closeLocationPicker() {
    const modal = document.getElementById("locationModal");
    if (!modal) {
        return;
    }

    modal.classList.remove("open");
    locationGpsStatus = { type: "idle", message: "" };
    if (!anyModalOpen()) {
        document.body.classList.remove("modal-open");
    }
}

function setLocationGpsStatus(type, message) {
    locationGpsStatus = { type, message };
    const status = document.getElementById("locationGpsStatus");
    if (!status) {
        return;
    }
    status.className = `location-gps-status ${type}`;
    status.textContent = message || "";
}

function renderLocationPicker(query = "") {
    const content = document.getElementById("locationModalContent");
    if (!content) {
        return;
    }

    const suggestions = getLocationSuggestions(query);

    content.innerHTML = `
        <div class="location-picker-shell">
            <button class="close-btn-inline" type="button" onclick="closeLocationPicker()">&times;</button>
            <div class="location-search-box">
                <input
                    class="location-search-input"
                    id="locationSearchInput"
                    type="text"
                    value="${escapeAttribute(query)}"
                    placeholder="Search for area, street name..."
                    oninput="renderLocationPicker(this.value)"
                >
                <p id="locationGpsStatus" class="location-gps-status ${locationGpsStatus.type}">${escapeHtml(locationGpsStatus.message || "")}</p>
            </div>

            <section class="location-panel">
                <div class="location-action-card" onclick="useCurrentLocation()">
                    <span class="location-action-icon">◎</span>
                    <div>
                        <strong>Get current location</strong>
                        <p>Using GPS</p>
                    </div>
                </div>
                <div class="location-action-card" onclick="toggleManualLocationForm()">
                    <span class="location-action-icon">+</span>
                    <div>
                        <strong>Add address manually</strong>
                        <p>Enter an area, landmark, or street</p>
                    </div>
                </div>
                <div id="manualLocationFormHost"></div>
            </section>

            <section class="location-panel">
                <p class="location-panel-title">Recent searches</p>
                ${suggestions.length ? suggestions.map((location) => `
                    <div class="location-history-card" onclick="applyLocationSelection({ label: '${escapeAttribute(location.label)}', subtitle: '${escapeAttribute(location.subtitle)}' })">
                        <span class="location-history-icon">◔</span>
                        <div>
                            <strong>${escapeHtml(location.label)}</strong>
                            <p>${escapeHtml(location.subtitle)}</p>
                            ${selectedLocation?.label === location.label && selectedLocation?.subtitle === location.subtitle ? '<span class="location-selected-badge">Selected</span>' : ''}
                        </div>
                    </div>
                `).join("") : `
                    <div class="location-history-card">
                        <span class="location-history-icon">◔</span>
                        <div>
                            <strong>No matching places</strong>
                            <p class="location-empty-note">Try a different area name or add it manually.</p>
                        </div>
                    </div>
                `}
            </section>
        </div>
    `;

    const locationSearchInput = document.getElementById("locationSearchInput");
    if (locationSearchInput) {
        locationSearchInput.focus();
        locationSearchInput.setSelectionRange(locationSearchInput.value.length, locationSearchInput.value.length);
    }
}

function toggleManualLocationForm() {
    const host = document.getElementById("manualLocationFormHost");
    if (!host) {
        return;
    }

    if (host.innerHTML.trim()) {
        host.innerHTML = "";
        return;
    }

    host.innerHTML = `
        <form class="location-manual-form" onsubmit="saveManualLocation(event)">
            <input id="manualLocationLabel" type="text" placeholder="Area or place name" required>
            <input id="manualLocationSubtitle" type="text" placeholder="Street, city, state" required>
            <div class="location-manual-actions">
                <button class="primary-button" type="submit">Save location</button>
                <button class="secondary-button" type="button" onclick="toggleManualLocationForm()">Cancel</button>
            </div>
        </form>
    `;
}

function saveManualLocation(event) {
    event.preventDefault();

    const label = document.getElementById("manualLocationLabel")?.value.trim();
    const subtitle = document.getElementById("manualLocationSubtitle")?.value.trim();
    if (!label || !subtitle) {
        return;
    }

    applyLocationSelection({ label, subtitle });
}

function getCurrentPosition(options = {}) {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
}

function getAddressLineFromReverseGeocode(address) {
    const primaryLabel = [
        address.suburb,
        address.neighbourhood,
        address.quarter,
        address.city_district,
        address.town,
        address.village,
        address.city
    ].find(Boolean) || "Current location";

    const detailParts = [
        address.city || address.town || address.village,
        address.state_district,
        address.state,
        address.postcode
    ].filter(Boolean);

    const subtitle = detailParts.length ? detailParts.join(", ") : "Detected from GPS";
    return {
        label: primaryLabel,
        subtitle
    };
}

async function resolveReadableCurrentLocation(latitude, longitude) {
    const fallbackLocation = {
        label: "Current location",
        subtitle: `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`
    };

    const params = new URLSearchParams({
        format: "jsonv2",
        lat: String(latitude),
        lon: String(longitude),
        zoom: "18",
        addressdetails: "1"
    });

    try {
        const response = await fetch(`${REVERSE_GEOCODE_BASE_URL}?${params.toString()}`, {
            headers: {
                Accept: "application/json"
            }
        });
        if (!response.ok) {
            throw new Error("Reverse geocode failed");
        }

        const payload = await response.json();
        const address = payload?.address;
        if (!address) {
            throw new Error("No address found");
        }

        const readableLocation = getAddressLineFromReverseGeocode(address);
        return {
            location: readableLocation,
            usedFallback: false
        };
    } catch {
        return {
            location: fallbackLocation,
            usedFallback: true
        };
    }
}

async function useCurrentLocation() {
    if (!navigator.geolocation) {
        setLocationGpsStatus("error", "Geolocation is not supported in this browser.");
        return;
    }

    setLocationGpsStatus("loading", "Detecting your current location...");

    try {
        const position = await getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 10000
        });
        const { latitude, longitude } = position.coords;
        const { location, usedFallback } = await resolveReadableCurrentLocation(latitude, longitude);
        if (usedFallback) {
            setLocationGpsStatus("error", "Could not fetch address details. Using GPS coordinates.");
        } else {
            setLocationGpsStatus("success", `Location found: ${location.label}`);
        }
        applyLocationSelection(location);
    } catch {
        setLocationGpsStatus("error", "Unable to fetch your current location. Please allow location access.");
    }
}

function renderCart() {
    const content = document.getElementById("cartModalContent");
    if (!content) {
        return;
    }

    ensureCheckoutPaymentChoice();

    if (latestOrderSuccess && !cart.items.length) {
        const successTimeline = buildSuccessTimeline(latestOrderSuccess.order);
        content.innerHTML = `
            <div class="cart-shell order-success-shell">
                <div class="order-success-card">
                    <div class="order-success-badge">Order placed</div>
                    <h2>${escapeHtml(latestOrderSuccess.order.restaurantName || "Your order is confirmed")}</h2>
                    <p class="order-success-copy">
                        Order <strong>${escapeHtml(latestOrderSuccess.order.orderNumber || "")}</strong> is confirmed and headed to
                        <strong>${escapeHtml(latestOrderSuccess.addressLabel || "your address")}</strong>.
                    </p>
                    <div class="order-success-grid">
                        <div class="account-card">
                            <span>ETA</span>
                            <strong>${escapeHtml(getEtaLabel(latestOrderSuccess.order))}</strong>
                        </div>
                        <div class="account-card">
                            <span>Payment</span>
                            <strong>${escapeHtml(latestOrderSuccess.paymentLabel || "Cash on delivery")}</strong>
                        </div>
                        <div class="account-card">
                            <span>Total paid</span>
                            <strong>${formatCurrency(latestOrderSuccess.order.finalAmount)}</strong>
                        </div>
                        <div class="account-card">
                            <span>Items</span>
                            <strong>${latestOrderSuccess.itemCount} item${latestOrderSuccess.itemCount === 1 ? "" : "s"}</strong>
                        </div>
                    </div>
                    <div class="order-success-timeline">
                        ${successTimeline.map((step) => `
                            <div class="order-success-step ${step.active ? "active" : ""}">
                                <span class="order-success-step-dot"></span>
                                <div>
                                    <strong>${escapeHtml(step.title)}</strong>
                                    <p>${escapeHtml(step.copy)}</p>
                                </div>
                            </div>
                        `).join("")}
                    </div>
                    <div class="order-success-actions">
                        <button class="primary-button" type="button" onclick="dismissOrderSuccess(); openOrders()">Track this order</button>
                        <button class="secondary-button" type="button" onclick="dismissOrderSuccess()">Continue browsing</button>
                    </div>
                </div>
            </div>`;
        return;
    }

    if (!cart.items.length) {
        content.innerHTML = `
            <div class="cart-shell">
                <div class="cart-empty">
                    <h2>Your cart is empty</h2>
                    <p>Add a few dishes from a restaurant to start your order.</p>
                </div>
            </div>`;
        return;
    }

    const subtotal = getCartSubtotal();
    const deliveryFee = getDeliveryFee();
    const finalAmount = subtotal + deliveryFee;
    const defaultAddress = getDefaultAddress();
    const canCheckout = Boolean(defaultAddress);

    content.innerHTML = `
        <div class="cart-shell">
            <div class="cart-header">
                <div>
                    <p class="menu-eyebrow">Ready to order</p>
                    <h2>${escapeHtml(cart.restaurantName)}</h2>
                </div>
                <button class="text-button" type="button" onclick="clearCart()">Clear cart</button>
            </div>

            <div class="cart-layout">
                <section class="cart-items-list">
                    ${cart.items.map((item) => `
                        <article class="cart-item-card">
                            <img src="${item.image}" alt="${escapeHtml(item.name)}" class="cart-item-image">
                            <div class="cart-item-copy">
                                <h3>${escapeHtml(item.name)}</h3>
                                <p>${formatCurrency(item.price)} each</p>
                            </div>
                            <div class="cart-item-controls">
                                <button type="button" onclick="changeCartQuantity('${escapeAttribute(item.itemId)}', -1)">-</button>
                                <span>${item.quantity}</span>
                                <button type="button" onclick="changeCartQuantity('${escapeAttribute(item.itemId)}', 1)">+</button>
                            </div>
                            <div class="cart-item-total">${formatCurrency(item.price * item.quantity)}</div>
                        </article>
                    `).join("")}
                </section>

                <section class="checkout-panel">
                    <div class="checkout-summary">
                        <div><span>Subtotal</span><strong>${formatCurrency(subtotal)}</strong></div>
                        <div><span>Delivery fee</span><strong>${formatCurrency(deliveryFee)}</strong></div>
                        <div class="checkout-total"><span>Total</span><strong>${formatCurrency(finalAmount)}</strong></div>
                    </div>

                    <section class="address-summary-card">
                        <div class="address-summary-head">
                            <div>
                                <p class="menu-eyebrow">Delivery address</p>
                                <h3>${defaultAddress ? escapeHtml(defaultAddress.label) : "No default address set"}</h3>
                            </div>
                            <button class="secondary-button" type="button" onclick="openAddressBook()">
                                ${defaultAddress ? "Manage addresses" : "Add address"}
                            </button>
                        </div>
                        ${defaultAddress ? `
                            <p class="address-recipient">${escapeHtml(defaultAddress.recipientName)} · ${escapeHtml(defaultAddress.phoneNumber)}</p>
                            <p class="address-line">${escapeHtml(formatAddressLine(defaultAddress))}</p>
                        ` : `
                            <p class="address-empty-note">Save at least one address and mark it as default before placing an order.</p>
                        `}
                    </section>

                    <form class="checkout-form" onsubmit="submitOrder(event)">
                        <div class="checkout-payment-section">
                            <div class="checkout-payment-head">
                                <div>
                                    <p class="menu-eyebrow">Payment</p>
                                    <h3>Choose how you want to pay</h3>
                                </div>
                                <button class="secondary-button" type="button" onclick="openAuthModal(); setAccountSection('payments')">Manage payments</button>
                            </div>
                            <div class="checkout-payment-list">
                                ${savedPaymentMethods.map((method) => `
                                    <label class="checkout-payment-card ${checkoutPaymentChoice === `saved:${method.id}` ? "selected" : ""}">
                                        <input
                                            type="radio"
                                            name="checkoutPaymentChoice"
                                            value="saved:${method.id}"
                                            ${checkoutPaymentChoice === `saved:${method.id}` ? "checked" : ""}
                                            onchange="setCheckoutPaymentChoice(this.value)"
                                        >
                                        <div>
                                            <strong>${escapeHtml(formatPaymentMethodLabel(method))}</strong>
                                            <p>${escapeHtml(formatPaymentMethodSubtitle(method))}</p>
                                        </div>
                                        <span class="payment-type-pill">${escapeHtml(formatPaymentMethodType(method.methodType))}</span>
                                    </label>
                                `).join("")}
                                <label class="checkout-payment-card ${checkoutPaymentChoice === "CASH" ? "selected" : ""}">
                                    <input
                                        type="radio"
                                        name="checkoutPaymentChoice"
                                        value="CASH"
                                        ${checkoutPaymentChoice === "CASH" ? "checked" : ""}
                                        onchange="setCheckoutPaymentChoice(this.value)"
                                    >
                                    <div>
                                        <strong>Cash on delivery</strong>
                                        <p>Pay in cash when your order arrives.</p>
                                    </div>
                                    <span class="payment-type-pill">Cash</span>
                                </label>
                            </div>
                        </div>
                        <label>
                            Notes
                            <textarea id="checkoutNotes" rows="2" placeholder="Add delivery notes (optional)"></textarea>
                        </label>
                        <button class="primary-button checkout-button" type="submit" ${canCheckout ? "" : "disabled"}>
                            ${canCheckout ? "Place order to default address" : "Add a default address first"}
                        </button>
                    </form>
                    <div id="checkoutFeedback" class="checkout-feedback"></div>
                </section>
            </div>
        </div>`;
}

function renderAddressBook() {
    const content = document.getElementById("addressModalContent");
    if (!content) {
        return;
    }

    const editingAddress = editingAddressId ? getAddressById(editingAddressId) : null;
    const heading = editingAddress ? "Edit saved address" : "Save a new address";

    content.innerHTML = `
        <div class="address-book-shell">
            <div class="address-book-header">
                <div>
                    <p class="menu-eyebrow">Address book</p>
                    <h2>Choose where SnapEats delivers</h2>
                    <p class="address-book-subtitle">Save multiple addresses and mark one as your default for quick checkout.</p>
                </div>
            </div>

            <div class="address-book-layout">
                <section class="address-list-panel">
                    ${savedAddresses.length ? savedAddresses.map((address) => `
                        <article class="address-card ${address.defaultAddress ? "default" : ""}">
                            <div class="address-card-head">
                                <div>
                                    <h3>${escapeHtml(address.label)}</h3>
                                    <p>${escapeHtml(address.recipientName)} · ${escapeHtml(address.phoneNumber)}</p>
                                </div>
                                ${address.defaultAddress ? '<span class="address-default-pill">Default</span>' : ""}
                            </div>
                            <p class="address-line">${escapeHtml(formatAddressLine(address))}</p>
                            <div class="address-card-actions">
                                ${address.defaultAddress ? "" : `<button class="secondary-button" type="button" onclick="setDefaultAddress(${address.id})">Make default</button>`}
                                <button class="text-button" type="button" onclick="startAddressEdit(${address.id})">Edit</button>
                                <button class="text-button danger-button" type="button" onclick="deleteAddress(${address.id})">Delete</button>
                            </div>
                        </article>
                    `).join("") : `
                        <div class="address-empty-state">
                            <h3>No saved addresses yet</h3>
                            <p>Add your first address here. You can save multiple places and switch the default anytime.</p>
                        </div>
                    `}
                </section>

                <section class="address-form-panel">
                    <div class="address-form-head">
                        <h3>${heading}</h3>
                        ${editingAddress ? '<button class="text-button" type="button" onclick="resetAddressForm()">Cancel editing</button>' : ""}
                    </div>
                    <form class="address-form" onsubmit="saveAddress(event)">
                        <label>
                            Address label
                            <input type="text" id="addressLabel" placeholder="Home, Work, Hostel" value="${editingAddress ? escapeHtml(editingAddress.label) : ""}" required>
                        </label>
                        <label>
                            Recipient name
                            <input type="text" id="addressRecipientName" placeholder="Name for delivery" value="${editingAddress ? escapeHtml(editingAddress.recipientName) : ""}" required>
                        </label>
                        <label>
                            Phone number
                            <input type="tel" id="addressPhoneNumber" placeholder="10-digit phone" value="${editingAddress ? escapeHtml(editingAddress.phoneNumber) : ""}" required>
                        </label>
                        <label>
                            Address line
                            <textarea id="addressLine" rows="3" placeholder="House number, apartment, street" required>${editingAddress ? escapeHtml(editingAddress.addressLine) : ""}</textarea>
                        </label>
                        <label>
                            Area / Locality
                            <input
                                type="text"
                                id="addressLandmark"
                                list="addressAreaOptions"
                                placeholder="Area or locality"
                                value="${editingAddress ? escapeHtml(editingAddress.landmark || "") : ""}"
                            >
                            <datalist id="addressAreaOptions">
                                ${renderAreaOptions([], editingAddress?.landmark || "")}
                            </datalist>
                        </label>
                        <div class="address-form-row">
                            <label>
                                City
                                <input type="text" id="addressCity" placeholder="City" value="${editingAddress ? escapeHtml(editingAddress.city) : ""}" required>
                            </label>
                            <label>
                                State
                                <input type="text" id="addressState" placeholder="State" value="${editingAddress ? escapeHtml(editingAddress.state) : ""}" required>
                            </label>
                        </div>
                        <div class="address-form-row">
                            <label>
                                Pincode
                                <input
                                    type="text"
                                    id="addressPincode"
                                    inputmode="numeric"
                                    maxlength="6"
                                    placeholder="Pincode"
                                    value="${editingAddress ? escapeHtml(editingAddress.pincode) : ""}"
                                    oninput="handlePincodeInput()"
                                    required
                                >
                            </label>
                            <label class="address-default-toggle">
                                <input type="checkbox" id="addressDefault" ${editingAddress?.defaultAddress ? "checked" : ""}>
                                <span>Make this my default delivery address</span>
                            </label>
                        </div>
                        <div id="addressLookupFeedback" class="address-lookup-feedback">
                            Enter a 6-digit pincode to auto-fill city, state, and area.
                        </div>
                        <button class="primary-button" type="submit">${editingAddress ? "Update address" : "Save address"}</button>
                        <div id="addressFeedback" class="checkout-feedback"></div>
                    </form>
                </section>
            </div>
        </div>`;

    const existingPincode = document.getElementById("addressPincode")?.value.trim();
    if (existingPincode && existingPincode.length === 6) {
        handlePincodeInput();
    }
}

function renderAuthModal(mode = "login") {
    const content = document.getElementById("authModalContent");
    if (!content) {
        return;
    }

    if (currentUser) {
        content.innerHTML = `
            <div class="account-shell">
                <section class="account-hero">
                    <div class="account-hero-copy">
                        <p class="menu-eyebrow">My account</p>
                        <h2>${escapeHtml(currentUser.name || "SnapEats User")}</h2>
                        <p class="account-hero-meta">${escapeHtml(currentUser.phoneNumber || "-")} <span>&bull;</span> ${escapeHtml(currentUser.email || "-")}</p>
                    </div>
                    <button class="account-edit-button" type="button" onclick="setAccountSection('settings')">Edit profile</button>
                </section>

                <section class="account-layout">
                    <aside class="account-sidebar">
                        ${renderAccountSidebar()}
                    </aside>
                    <div class="account-main">
                        ${renderAccountPanel()}
                    </div>
                </section>
            </div>`;
        return;
    }

    content.innerHTML = `
        <div class="auth-shell">
            <div class="auth-header">
                <div>
                    <p class="menu-eyebrow">Account</p>
                    <h2>${mode === "signup" ? "Create your SnapEats account" : "Welcome back"}</h2>
                    <p class="auth-subtitle">${mode === "signup" ? "Sign up to save addresses and track orders." : "Log in to manage addresses and order history."}</p>
                </div>
            </div>

            <div class="auth-tabs">
                <button class="menu-chip ${mode === "login" ? "active" : ""}" type="button" onclick="renderAuthModal('login')">Login</button>
                <button class="menu-chip ${mode === "signup" ? "active" : ""}" type="button" onclick="renderAuthModal('signup')">Sign Up</button>
            </div>

            <form class="auth-form" onsubmit="${mode === "signup" ? "signupUser(event)" : "loginUser(event)"}">
                ${mode === "signup" ? `
                    <label>
                        Full name
                        <input type="text" id="authName" placeholder="Your full name" required>
                    </label>
                    <label>
                        Phone number
                        <input type="tel" id="authPhone" placeholder="10-digit phone" required>
                    </label>
                ` : ""}
                <label>
                    Email
                    <input type="email" id="authEmail" placeholder="you@example.com" required>
                </label>
                <label>
                    Password
                    <input type="password" id="authPassword" placeholder="Enter password" required>
                </label>
                <button class="primary-button" type="submit">${mode === "signup" ? "Create account" : "Login"}</button>
                <div id="authFeedback" class="checkout-feedback"></div>
            </form>
        </div>`;
}

function setAccountSection(section) {
    activeAccountSection = section;
    renderAuthModal();
}

function renderAccountSidebar() {
    const items = [
        { id: "orders", label: "Orders", icon: "◔" },
        { id: "subscription", label: "SnapSubscription", icon: "✦" },
        { id: "favorites", label: "Favorites", icon: "♥" },
        { id: "payments", label: "Payments", icon: "▣" },
        { id: "addresses", label: "Addresses", icon: "⌖" },
        { id: "settings", label: "Settings", icon: "⚙" }
    ];

    return items.map((item) => `
        <button
            class="account-nav-item ${activeAccountSection === item.id ? "active" : ""}"
            type="button"
            onclick="setAccountSection('${item.id}')"
        >
            <span class="account-nav-icon" aria-hidden="true">${item.icon}</span>
            <span>${item.label}</span>
        </button>
    `).join("");
}

function renderAccountPanel() {
    if (activeAccountSection === "orders") {
        return renderOrdersAccountPanel();
    }
    if (activeAccountSection === "subscription") {
        return `
            <div class="account-panel">
                <p class="menu-eyebrow">SnapSubscription</p>
                <h3>Save more on every meal</h3>
                <p class="account-panel-copy">Unlock free deliveries, member-only deals, and faster support when your subscription goes live.</p>
                <div class="account-placeholder-card">
                    <strong>No active plan yet</strong>
                    <p>We can add subscription plans here next if you want a full Swiggy One style screen.</p>
                </div>
            </div>
        `;
    }
    if (activeAccountSection === "favorites") {
        return `
            <div class="account-panel">
                <p class="menu-eyebrow">Favorites</p>
                <h3>Your favorite picks</h3>
                <p class="account-panel-copy">Save restaurants and dishes you love so they stay one tap away.</p>
                ${favoriteRestaurants.length || favoriteMenuItems.length ? `
                    <div class="favorite-restaurant-grid">
                        ${favoriteRestaurants.map((restaurant) => `
                            <article class="favorite-restaurant-card">
                                <img src="${restaurant.image}" alt="${escapeHtml(restaurant.name)}" class="favorite-restaurant-image">
                                <div class="favorite-restaurant-copy">
                                    <h4>${escapeHtml(restaurant.name)}</h4>
                                    <p>${escapeHtml(restaurant.cuisine || "")}</p>
                                    <div class="favorite-restaurant-meta">
                                        <span>★ ${formatNumber(restaurant.rating)}</span>
                                        <span>${escapeHtml(restaurant.time || "")}</span>
                                    </div>
                                </div>
                                <div class="favorite-restaurant-actions">
                                    <button class="secondary-button" type="button" onclick="closeAuthModal(); openRestaurantMenu('${escapeAttribute(restaurant.restaurantId)}')">Open menu</button>
                                    <button class="text-button danger-button" type="button" onclick="removeFavoriteFromAccount('${escapeAttribute(restaurant.restaurantId)}')">Remove</button>
                                </div>
                            </article>
                        `).join("")}
                    </div>
                    ${favoriteMenuItems.length ? `
                        <div class="favorite-section-divider"></div>
                        <div class="favorite-dish-grid">
                            ${favoriteMenuItems.map((item) => `
                                <article class="favorite-dish-card">
                                    <img src="${item.image || item.restaurantImage || ""}" alt="${escapeHtml(item.name)}" class="favorite-dish-image">
                                    <div class="favorite-dish-copy">
                                        <p class="favorite-dish-restaurant">${escapeHtml(item.restaurantName)}</p>
                                        <h4>${escapeHtml(item.name)}</h4>
                                        <p>${escapeHtml(item.description || "Saved favorite dish")}</p>
                                        <div class="favorite-dish-meta">
                                            <span>${formatCurrency(item.price)}</span>
                                            ${item.vegetarian ? '<span class="diet-pill">Veg</span>' : ""}
                                            ${item.vegan ? '<span class="diet-pill">Vegan</span>' : ""}
                                        </div>
                                    </div>
                                    <div class="favorite-dish-actions">
                                        <button class="secondary-button" type="button" onclick="closeAuthModal(); openRestaurantMenu('${escapeAttribute(item.restaurantId)}')">Open restaurant</button>
                                        <button class="text-button danger-button" type="button" onclick="removeFavoriteMenuItemFromAccount('${escapeAttribute(item.itemId)}')">Remove</button>
                                    </div>
                                </article>
                            `).join("")}
                        </div>
                    ` : ""}
                ` : `
                    <div class="account-placeholder-card">
                        <strong>No favorites saved yet</strong>
                        <p>Tap the heart on any restaurant or dish to save it here.</p>
                    </div>
                `}
            </div>
        `;
    }
    if (activeAccountSection === "payments") {
        const defaultMethod = getDefaultSavedPaymentMethod();
        const savedCardsCount = savedPaymentMethods.filter((method) => method.methodType === "CARD").length;
        return `
            <div class="account-panel">
                <div class="account-panel-head">
                    <div>
                        <p class="menu-eyebrow">Payments</p>
                        <h3>Payment methods</h3>
                        <p class="account-panel-copy">Save cards, wallets, and UPI handles so checkout is faster.</p>
                    </div>
                </div>
                <div class="account-stat-grid">
                    <div class="account-card">
                        <span>Default method</span>
                        <strong>${defaultMethod ? escapeHtml(formatPaymentMethodLabel(defaultMethod)) : "Cash on delivery"}</strong>
                    </div>
                    <div class="account-card">
                        <span>Saved methods</span>
                        <strong>${savedPaymentMethods.length} total · ${savedCardsCount} cards</strong>
                    </div>
                </div>
                <div class="payment-management-grid">
                    <section class="payment-method-list">
                        ${savedPaymentMethods.length ? savedPaymentMethods.map((method) => `
                            <article class="payment-method-card ${method.defaultMethod ? "default" : ""}">
                                <div class="payment-method-top">
                                    <div>
                                        <div class="payment-method-label-row">
                                            <h4>${escapeHtml(formatPaymentMethodLabel(method))}</h4>
                                            <span class="payment-type-pill">${escapeHtml(formatPaymentMethodType(method.methodType))}</span>
                                        </div>
                                        <p>${escapeHtml(formatPaymentMethodSubtitle(method))}</p>
                                    </div>
                                    ${method.defaultMethod ? '<span class="address-default-pill">Default</span>' : ""}
                                </div>
                                <div class="payment-method-actions">
                                    ${method.defaultMethod ? "" : `<button class="secondary-button" type="button" onclick="markPaymentMethodDefault(${method.id})">Set default</button>`}
                                    <button class="text-button danger-button" type="button" onclick="deletePaymentMethod(${method.id})">Remove</button>
                                </div>
                            </article>
                        `).join("") : `
                            <div class="account-placeholder-card compact">
                                <strong>No digital methods saved</strong>
                                <p>Add a card, UPI ID, or wallet here and it will show up during checkout too.</p>
                            </div>
                        `}
                    </section>

                    <section class="payment-form-panel">
                        <div class="payment-form-header">
                            <strong>Add a payment method</strong>
                            <p>Only masked card details are stored. Full card numbers are never saved.</p>
                        </div>
                        <form class="account-settings-form payment-settings-form" onsubmit="savePaymentMethod(event)">
                            <label class="account-form-field account-form-field-full">
                                <span>Method type</span>
                                <select id="paymentType" onchange="setPaymentFormType(this.value)">
                                    <option value="CARD" ${paymentFormType === "CARD" ? "selected" : ""}>Card</option>
                                    <option value="UPI" ${paymentFormType === "UPI" ? "selected" : ""}>UPI</option>
                                    <option value="WALLET" ${paymentFormType === "WALLET" ? "selected" : ""}>Wallet</option>
                                </select>
                            </label>
                            ${paymentFormType === "CARD" ? `
                                <label class="account-form-field">
                                    <span>Card holder</span>
                                    <input id="paymentCardHolder" type="text" placeholder="Name on card" required>
                                </label>
                                <label class="account-form-field">
                                    <span>Card number</span>
                                    <input id="paymentCardNumber" type="text" inputmode="numeric" maxlength="19" placeholder="1234 5678 9012 3456" required>
                                </label>
                                <label class="account-form-field">
                                    <span>Expiry month</span>
                                    <input id="paymentExpiryMonth" type="text" inputmode="numeric" maxlength="2" placeholder="MM" required>
                                </label>
                                <label class="account-form-field">
                                    <span>Expiry year</span>
                                    <input id="paymentExpiryYear" type="text" inputmode="numeric" maxlength="4" placeholder="YYYY" required>
                                </label>
                            ` : ""}
                            ${paymentFormType === "UPI" ? `
                                <label class="account-form-field account-form-field-full">
                                    <span>UPI ID</span>
                                    <input id="paymentUpiId" type="text" placeholder="name@upi" required>
                                </label>
                            ` : ""}
                            ${paymentFormType === "WALLET" ? `
                                <label class="account-form-field account-form-field-full">
                                    <span>Wallet provider</span>
                                    <input id="paymentWalletProvider" type="text" placeholder="Paytm, PhonePe, Amazon Pay..." required>
                                </label>
                            ` : ""}
                            <label class="address-default-toggle payment-default-toggle account-form-field-full">
                                <input id="paymentDefault" type="checkbox" ${!savedPaymentMethods.length ? "checked" : ""}>
                                <span>Make this my default digital method</span>
                            </label>
                            <button class="primary-button" type="submit">Save payment method</button>
                            <div id="paymentFeedback" class="checkout-feedback"></div>
                        </form>
                    </section>
                </div>
            </div>
        `;
    }
    if (activeAccountSection === "addresses") {
        return `
            <div class="account-panel">
                <div class="account-panel-head">
                    <div>
                        <p class="menu-eyebrow">Addresses</p>
                        <h3>Manage saved addresses</h3>
                    </div>
                    <button class="secondary-button" type="button" onclick="closeAuthModal(); openAddressBook()">Open address book</button>
                </div>
                <div class="account-address-list">
                    ${savedAddresses.length ? savedAddresses.map((address) => `
                        <article class="account-address-card ${address.defaultAddress ? "default" : ""}">
                            <div class="address-card-head">
                                <div>
                                    <h3>${escapeHtml(address.label)}</h3>
                                    <p>${escapeHtml(address.recipientName)} · ${escapeHtml(address.phoneNumber)}</p>
                                </div>
                                ${address.defaultAddress ? '<span class="address-default-pill">Default</span>' : ""}
                            </div>
                            <p class="address-line">${escapeHtml(formatAddressLine(address))}</p>
                        </article>
                    `).join("") : `
                        <div class="account-placeholder-card">
                            <strong>No addresses saved</strong>
                            <p>Add an address so checkout can use it instantly.</p>
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    return `
        <div class="account-panel">
            <div class="account-panel-head">
                <div>
                    <p class="menu-eyebrow">Settings</p>
                    <h3>Profile and app settings</h3>
                </div>
            </div>
            <form class="account-settings-form" onsubmit="saveProfileSettings(event)">
                <div class="account-stat-grid">
                    <label class="account-form-field">
                        <span>Name</span>
                        <input id="settingsName" type="text" value="${escapeAttribute(currentUser.name || "")}" required>
                    </label>
                    <label class="account-form-field">
                        <span>Email</span>
                        <input id="settingsEmail" type="email" value="${escapeAttribute(currentUser.email || "")}" required>
                    </label>
                    <label class="account-form-field">
                        <span>Phone</span>
                        <input id="settingsPhone" type="tel" value="${escapeAttribute(currentUser.phoneNumber || "")}">
                    </label>
                    <label class="account-form-field">
                        <span>City</span>
                        <input id="settingsCity" type="text" value="${escapeAttribute(currentUser.city || "")}">
                    </label>
                    <label class="account-form-field">
                        <span>State</span>
                        <input id="settingsState" type="text" value="${escapeAttribute(currentUser.state || "")}">
                    </label>
                    <label class="account-form-field">
                        <span>Pincode</span>
                        <input id="settingsPincode" type="text" value="${escapeAttribute(currentUser.pincode || "")}">
                    </label>
                </div>
                <label class="account-form-field account-form-field-full">
                    <span>Address</span>
                    <textarea id="settingsAddress" rows="3" placeholder="House number, street, landmark">${escapeHtml(currentUser.address || "")}</textarea>
                </label>
                <div class="auth-actions">
                    <button class="primary-button" type="submit">Save profile</button>
                    <button class="secondary-button" type="button" onclick="setAccountSection('addresses')">Manage addresses</button>
                    <button class="text-button danger-button" type="button" onclick="logoutUser()">Log out</button>
                </div>
                <div id="settingsFeedback" class="checkout-feedback"></div>
            </form>
            <div class="auth-actions">
                <button class="secondary-button" type="button" onclick="setAccountSection('orders')">View orders</button>
            </div>
        </div>
    `;
}

async function saveProfileSettings(event) {
    event.preventDefault();

    const feedback = document.getElementById("settingsFeedback");
    const payload = {
        name: document.getElementById("settingsName")?.value.trim(),
        email: document.getElementById("settingsEmail")?.value.trim(),
        phoneNumber: document.getElementById("settingsPhone")?.value.trim(),
        city: document.getElementById("settingsCity")?.value.trim(),
        state: document.getElementById("settingsState")?.value.trim(),
        pincode: document.getElementById("settingsPincode")?.value.trim(),
        address: document.getElementById("settingsAddress")?.value.trim()
    };

    if (feedback) {
        feedback.textContent = "Saving profile...";
        feedback.className = "checkout-feedback";
    }

    try {
        const user = await fetchJson(`${API_BASE_URL}/users/me`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        saveCurrentUser(user);
        renderAuthModal();

        const updatedFeedback = document.getElementById("settingsFeedback");
        if (updatedFeedback) {
            updatedFeedback.textContent = "Profile updated successfully.";
            updatedFeedback.className = "checkout-feedback success";
        }
    } catch (error) {
        if (feedback) {
            feedback.textContent = error.message || "Failed to update profile.";
            feedback.className = "checkout-feedback error";
        }
    }
}

function renderOrdersAccountPanel() {
    const latestOrders = orderHistory.slice(0, 3);

    return `
        <div class="account-panel">
            <div class="account-panel-head">
                <div>
                    <p class="menu-eyebrow">Orders</p>
                    <h3>Your recent orders</h3>
                    <p class="account-panel-copy">Your SnapEats orders will be listed here.</p>
                </div>
                <button class="secondary-button" type="button" onclick="closeAuthModal(); openOrders()">Open full orders</button>
            </div>
            ${latestOrders.length ? `
                <div class="account-order-list">
                    ${latestOrders.map((order) => `
                        <article class="account-order-card">
                            <div>
                                <strong>${escapeHtml(order.restaurantName)}</strong>
                                <p>${escapeHtml(order.orderNumber)} · ${formatDateTime(order.createdAt)}</p>
                            </div>
                            <div class="account-order-meta">
                                <span class="order-status-badge ${statusClassName(order.status)}">${formatStatus(order.status)}</span>
                                <strong>${formatCurrency(order.finalAmount)}</strong>
                            </div>
                        </article>
                    `).join("")}
                </div>
            ` : `
                <div class="account-empty-state">
                    <p class="account-empty-note">Go ahead and find some awesome restaurants near you.</p>
                    <h3>No Orders</h3>
                    <p>You haven't placed any order yet.</p>
                </div>
            `}
        </div>
    `;
}

async function loginUser(event) {
    event.preventDefault();

    const feedback = document.getElementById("authFeedback");
    const email = document.getElementById("authEmail")?.value.trim();
    const password = document.getElementById("authPassword")?.value;

    if (feedback) {
        feedback.textContent = "Signing you in...";
        feedback.className = "checkout-feedback";
    }

    try {
        const user = await fetchJson(`${API_BASE_URL}/users/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        saveCurrentUser(user);
        await Promise.all([fetchAddresses(), fetchOrders(), fetchFavoriteRestaurants(), fetchFavoriteMenuItems(), fetchPaymentMethods()]);
        renderAuthModal();
    } catch (error) {
        if (feedback) {
            feedback.textContent = error.message || "Login failed.";
            feedback.className = "checkout-feedback error";
        }
    }
}

async function signupUser(event) {
    event.preventDefault();

    const feedback = document.getElementById("authFeedback");
    const payload = {
        name: document.getElementById("authName")?.value.trim(),
        phoneNumber: document.getElementById("authPhone")?.value.trim(),
        email: document.getElementById("authEmail")?.value.trim(),
        password: document.getElementById("authPassword")?.value,
        role: "USER",
        active: true
    };

    if (feedback) {
        feedback.textContent = "Creating your account...";
        feedback.className = "checkout-feedback";
    }

    try {
        const user = await fetchJson(`${API_BASE_URL}/users/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        saveCurrentUser(user);
        savedAddresses = [];
        orderHistory = [];
        favoriteRestaurants = [];
        favoriteMenuItems = [];
        savedPaymentMethods = [];
        checkoutPaymentChoice = "CASH";
        renderCart();
        renderOrders();
        renderRestaurants();
        renderAuthModal();
    } catch (error) {
        if (feedback) {
            feedback.textContent = error.message || "Signup failed.";
            feedback.className = "checkout-feedback error";
        }
    }
}

function logoutUser() {
    saveCurrentUser(null);
    savedAddresses = [];
    orderHistory = [];
    favoriteRestaurants = [];
    favoriteMenuItems = [];
    savedPaymentMethods = [];
    checkoutPaymentChoice = "CASH";
    closeAuthModal();
    renderAddressBook();
    renderOrders();
    renderRestaurants();
    renderCart();
}

async function removeFavoriteFromAccount(restaurantId) {
    try {
        await fetchJson(`${API_BASE_URL}/favorites/restaurants/${encodeURIComponent(restaurantId)}`, {
            method: "DELETE"
        });
        await fetchFavoriteRestaurants();
    } catch (error) {
        alert(error.message || "Failed to remove favorite.");
    }
}

async function removeFavoriteMenuItemFromAccount(itemId) {
    try {
        await fetchJson(`${API_BASE_URL}/favorites/menu-items/${encodeURIComponent(itemId)}`, {
            method: "DELETE"
        });
        await fetchFavoriteMenuItems();
    } catch (error) {
        alert(error.message || "Failed to remove favorite dish.");
    }
}

async function savePaymentMethod(event) {
    event.preventDefault();

    const feedback = document.getElementById("paymentFeedback");
    const payload = {
        methodType: paymentFormType,
        defaultMethod: document.getElementById("paymentDefault")?.checked || false
    };

    if (paymentFormType === "CARD") {
        const cardNumber = document.getElementById("paymentCardNumber")?.value.trim() || "";
        payload.cardHolderName = document.getElementById("paymentCardHolder")?.value.trim();
        payload.cardNumber = cardNumber;
        payload.cardBrand = detectCardBrand(cardNumber);
        payload.expiryMonth = document.getElementById("paymentExpiryMonth")?.value.trim();
        payload.expiryYear = document.getElementById("paymentExpiryYear")?.value.trim();
    } else if (paymentFormType === "UPI") {
        payload.upiId = document.getElementById("paymentUpiId")?.value.trim();
    } else {
        payload.walletProvider = document.getElementById("paymentWalletProvider")?.value.trim();
    }

    if (feedback) {
        feedback.textContent = "Saving your payment method...";
        feedback.className = "checkout-feedback";
    }

    try {
        await fetchJson(`${API_BASE_URL}/payments/methods`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });
        paymentFormType = "CARD";
        await fetchPaymentMethods();
    } catch (error) {
        if (feedback) {
            feedback.textContent = error.message || "Failed to save payment method.";
            feedback.className = "checkout-feedback error";
        }
    }
}

async function markPaymentMethodDefault(paymentMethodId) {
    try {
        await fetchJson(`${API_BASE_URL}/payments/methods/${paymentMethodId}/default`, {
            method: "PATCH"
        });
        await fetchPaymentMethods();
    } catch (error) {
        alert(error.message || "Failed to update default payment method.");
    }
}

async function deletePaymentMethod(paymentMethodId) {
    try {
        await fetchJson(`${API_BASE_URL}/payments/methods/${paymentMethodId}`, {
            method: "DELETE"
        });
        await fetchPaymentMethods();
    } catch (error) {
        alert(error.message || "Failed to remove payment method.");
    }
}

function renderOrders(isLoading = false) {
    const content = document.getElementById("ordersModalContent");
    if (!content) {
        return;
    }

    if (isLoading && !orderHistory.length) {
        content.innerHTML = `<div class="modal-loading">Loading your orders...</div>`;
        return;
    }

    if (!orderHistory.length) {
        content.innerHTML = `
            <div class="orders-shell">
                <div class="orders-empty">
                    <h2>No orders yet</h2>
                    <p>Your recent orders will appear here with tracking and reorder options.</p>
                </div>
            </div>`;
        return;
    }

    content.innerHTML = `
        <div class="orders-shell">
            <div class="orders-header">
                <div>
                    <p class="menu-eyebrow">My orders</p>
                    <h2>Track every order in one place</h2>
                </div>
                <button class="secondary-button" type="button" onclick="fetchOrders()">Refresh</button>
            </div>

            <div class="orders-list">
                ${orderHistory.map((order) => `
                    <article class="order-card">
                        <div class="order-card-top">
                            <div class="order-restaurant">
                                ${order.restaurantImage ? `<img src="${order.restaurantImage}" alt="${escapeHtml(order.restaurantName)}" class="order-restaurant-image">` : ""}
                                <div>
                                    <h3>${escapeHtml(order.restaurantName)}</h3>
                                    <p>${escapeHtml(order.orderNumber)} · ${formatDateTime(order.createdAt)}</p>
                                </div>
                            </div>
                            <span class="order-status-badge ${statusClassName(getTrackedOrderStage(order))}">${formatStatus(getTrackedOrderStage(order))}</span>
                        </div>

                        <div class="order-tracking-hero ${statusClassName(getTrackedOrderStage(order))}">
                            <div>
                                <p class="order-tracking-kicker">Live tracking</p>
                                <h4>${escapeHtml(getTrackingHeadline(order))}</h4>
                                <p>${escapeHtml(getTrackingCopy(order))}</p>
                            </div>
                            <div class="order-tracking-side">
                                <span class="order-tracking-eta">${escapeHtml(getEtaLabel(order))}</span>
                                <small>${escapeHtml(getTrackingSubcopy(order))}</small>
                            </div>
                        </div>

                        <div class="order-progress">
                            ${buildOrderProgress(getTrackedOrderStage(order))}
                        </div>

                        <div class="order-meta-grid">
                            <div><span>Items</span><strong>${order.itemCount || 0}</strong></div>
                            <div><span>Total</span><strong>${formatCurrency(order.finalAmount)}</strong></div>
                            <div><span>Payment</span><strong>${formatStatus(order.paymentMethod)}</strong></div>
                            <div><span>Delivery</span><strong>${order.estimatedDeliveryTime ? formatTime(order.estimatedDeliveryTime) : "TBD"}</strong></div>
                        </div>

                        <div class="order-milestone-row">
                            ${buildOrderMilestones(order).map((milestone) => `
                                <div class="order-milestone ${milestone.active ? "active" : ""}">
                                    <span>${escapeHtml(milestone.label)}</span>
                                    <strong>${escapeHtml(milestone.time)}</strong>
                                </div>
                            `).join("")}
                        </div>

                        <div class="order-items-preview">
                            ${(order.items || []).map((item) => `
                                <div class="order-line-item">
                                    <span>${item.quantity}x ${escapeHtml(item.itemName)}</span>
                                    <strong>${formatCurrency(item.totalPrice)}</strong>
                                </div>
                            `).join("")}
                        </div>

                        <div class="order-address-block">
                            <p class="order-block-label">Delivering to</p>
                            <p>${escapeHtml(order.deliveryAddress || "Address unavailable")}</p>
                            ${order.contactNumber ? `<p>${escapeHtml(order.contactNumber)}</p>` : ""}
                            ${order.specialInstructions ? `<p class="order-note">Note: ${escapeHtml(order.specialInstructions)}</p>` : ""}
                        </div>

                        <div class="order-card-actions">
                            ${order.canReorder ? `<button class="primary-button" type="button" onclick="reorderItems(${order.id})">Reorder</button>` : ""}
                            ${order.canCancel ? `<button class="secondary-button" type="button" onclick="cancelOrder(${order.id})">Cancel order</button>` : ""}
                        </div>
                    </article>
                `).join("")}
            </div>
        </div>`;
}

function buildOrderProgress(status) {
    const steps = ["CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"];
    if (status === "CANCELLED") {
        return `<div class="order-cancelled-line">This order was cancelled.</div>`;
    }

    const activeIndex = steps.indexOf(status === "PENDING" ? "CONFIRMED" : status);
    return steps.map((step, index) => `
        <div class="order-progress-step ${index <= activeIndex ? "active" : ""}">
            <span class="order-progress-dot"></span>
            <span>${formatStatus(step)}</span>
        </div>
    `).join("");
}

async function cancelOrder(orderId) {
    if (!window.confirm("Cancel this order?")) {
        return;
    }

    try {
        await fetchJson(`${API_BASE_URL}/orders/mine/${orderId}/cancel`, {
            method: "PATCH"
        });
        await fetchOrders();
    } catch (error) {
        alert(error.message || "Failed to cancel order.");
    }
}

async function reorderItems(orderId) {
    const order = orderHistory.find((entry) => entry.id === orderId);
    if (!order || !order.restaurantId || !Array.isArray(order.items) || !order.items.length) {
        return;
    }

    if (cart.items.length && cart.restaurantCode && cart.restaurantCode !== order.restaurantId) {
        const shouldReplace = window.confirm(`Your cart has items from ${cart.restaurantName}. Replace them with this previous order?`);
        if (!shouldReplace) {
            return;
        }
    }

    try {
        const menuResponse = await fetchJson(`${API_BASE_URL}/menu-items/restaurant-code/${encodeURIComponent(order.restaurantId)}?activeOnly=true&availableOnly=true&size=100&sortBy=popular`);
        const menuItems = menuResponse.items || [];

        cart = {
            restaurantCode: order.restaurantId,
            restaurantName: order.restaurantName,
            items: order.items.map((item) => {
                const menuItem = menuItems.find((entry) => entry.name === item.itemName);
                return {
                    itemId: menuItem?.itemId || `reorder_${item.id}`,
                    name: item.itemName,
                    price: item.price,
                    basePrice: item.price,
                    quantity: item.quantity,
                    image: menuItem?.image || order.restaurantImage || "",
                    notes: item.customizations || ""
                };
            })
        };

        saveCart();
        closeOrders();
        openCart();
    } catch (error) {
        alert(error.message || "Failed to reorder.");
    }
}

function resetAddressForm() {
    editingAddressId = null;
    renderAddressBook();
}

function startAddressEdit(addressId) {
    editingAddressId = addressId;
    renderAddressBook();
}

async function saveAddress(event) {
    event.preventDefault();

    const feedback = document.getElementById("addressFeedback");
    const payload = {
        label: document.getElementById("addressLabel")?.value.trim(),
        recipientName: document.getElementById("addressRecipientName")?.value.trim(),
        phoneNumber: document.getElementById("addressPhoneNumber")?.value.trim(),
        addressLine: document.getElementById("addressLine")?.value.trim(),
        landmark: document.getElementById("addressLandmark")?.value.trim(),
        city: document.getElementById("addressCity")?.value.trim(),
        state: document.getElementById("addressState")?.value.trim(),
        pincode: document.getElementById("addressPincode")?.value.trim(),
        defaultAddress: document.getElementById("addressDefault")?.checked || false
    };

    if (feedback) {
        feedback.textContent = editingAddressId ? "Updating address..." : "Saving address...";
        feedback.className = "checkout-feedback";
    }

    try {
        const endpoint = editingAddressId
            ? `${API_BASE_URL}/addresses/${editingAddressId}`
            : `${API_BASE_URL}/addresses`;
        const method = editingAddressId ? "PUT" : "POST";

        await fetchJson(endpoint, {
            method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        editingAddressId = null;
        await fetchAddresses();
        renderAddressBook();

        const updatedFeedback = document.getElementById("addressFeedback");
        if (updatedFeedback) {
            updatedFeedback.textContent = method === "POST" ? "Address saved successfully." : "Address updated successfully.";
            updatedFeedback.className = "checkout-feedback success";
        }
    } catch (error) {
        if (feedback) {
            feedback.textContent = error.message || "Failed to save address.";
            feedback.className = "checkout-feedback error";
        }
    }
}

async function setDefaultAddress(addressId) {
    try {
        await fetchJson(`${API_BASE_URL}/addresses/${addressId}/default`, {
            method: "PATCH"
        });
        await fetchAddresses();
        renderAddressBook();
    } catch (error) {
        alert(error.message || "Failed to update default address.");
    }
}

async function deleteAddress(addressId) {
    if (!window.confirm("Delete this saved address?")) {
        return;
    }

    try {
        await fetchJson(`${API_BASE_URL}/addresses/${addressId}`, {
            method: "DELETE"
        });
        if (editingAddressId === addressId) {
            editingAddressId = null;
        }
        await fetchAddresses();
        renderAddressBook();
    } catch (error) {
        alert(error.message || "Failed to delete address.");
    }
}

function clearCart() {
    cart = createEmptyCart();
    saveCart();
    if (activeRestaurant) {
        renderMenuModal();
    }
}

async function submitOrder(event) {
    event.preventDefault();
    if (!cart.items.length || !cart.restaurantCode) {
        return;
    }

    const feedback = document.getElementById("checkoutFeedback");
    const selectedPayment = getCheckoutPaymentSelection();
    const paymentMethod = selectedPayment.type || "CASH";
    const notes = document.getElementById("checkoutNotes")?.value.trim();
    const defaultAddress = getDefaultAddress();

    if (!defaultAddress) {
        if (feedback) {
            feedback.textContent = "Please add a default delivery address first.";
            feedback.className = "checkout-feedback error";
        }
        return;
    }

    if (feedback) {
        feedback.textContent = "Placing your order...";
        feedback.className = "checkout-feedback";
    }

    try {
        const placedItemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        const deliveryFee = getDeliveryFee();
        const response = await fetchJson(`${API_BASE_URL}/orders/checkout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                restaurantCode: cart.restaurantCode,
                addressId: defaultAddress.id,
                customerName: defaultAddress.recipientName,
                specialInstructions: notes,
                paymentMethod,
                deliveryFee,
                discount: 0,
                items: cart.items.map((item) => ({
                    itemId: item.itemId,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    notes: item.notes
                }))
            })
        });

        if (feedback) {
            feedback.textContent = `Order placed successfully to ${defaultAddress.label} using ${selectedPayment.label}. Order number: ${response.order.orderNumber}`;
            feedback.className = "checkout-feedback success";
        }

        latestOrderSuccess = {
            order: {
                ...(response.order || {}),
                restaurantName: cart.restaurantName || response.order?.restaurantName || "Your order",
                status: response.order?.status || "CONFIRMED"
            },
            addressLabel: defaultAddress.label,
            paymentLabel: selectedPayment.label,
            itemCount: placedItemCount
        };

        cart = createEmptyCart();
        saveCart();
        await fetchOrders();
        if (activeRestaurant) {
            renderMenuModal();
        }
        setTimeout(() => {
            renderCart();
        }, 1200);
    } catch (error) {
        if (feedback) {
            feedback.textContent = error.message || "Failed to place order.";
            feedback.className = "checkout-feedback error";
        }
    }
}

function getCartSubtotal() {
    return roundAmount(cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0));
}

function getDeliveryFee() {
    return cart.items.length ? 40 : 0;
}

function closeMenu() {
    const modal = document.getElementById("menuModal");
    if (!modal) {
        return;
    }
    modal.classList.remove("open");
    if (!anyModalOpen()) {
        document.body.classList.remove("modal-open");
    }
    activeRestaurant = null;
    activeMenuItems = [];
    if (window.location.hash) {
        history.replaceState(null, "", window.location.pathname + window.location.search);
    }
}

function anyModalOpen() {
    return ["menuModal", "cartModal", "addressModal", "ordersModal", "authModal", "locationModal"].some((modalId) =>
        document.getElementById(modalId)?.classList.contains("open")
    );
}

function scrollCarousel(containerId, amount) {
    const container = document.getElementById(containerId);
    if (container) {
        container.scrollBy({ left: amount, behavior: "smooth" });
    }
}

function handleRestaurantKeydown(event, restaurantCode) {
    if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openRestaurantMenu(restaurantCode);
    }
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function escapeAttribute(value) {
    return String(value).replace(/'/g, "\\'");
}

function capitalize(value) {
    return value ? value.charAt(0).toUpperCase() + value.slice(1) : "";
}

function formatNumber(value) {
    return Number(value || 0).toFixed(1);
}

function formatPaymentMethodLabel(method) {
    if (!method) {
        return "Cash on delivery";
    }
    if (method.label) {
        return method.label;
    }
    if (method.methodType === "CARD") {
        return `${method.cardBrand || "Card"} ending ${method.cardLast4 || "0000"}`;
    }
    if (method.methodType === "UPI") {
        return `UPI · ${method.upiId || ""}`;
    }
    return `Wallet · ${method.walletProvider || ""}`;
}

function formatPaymentMethodSubtitle(method) {
    if (!method) {
        return "";
    }
    if (method.methodType === "CARD") {
        const expiry = method.expiryMonth && method.expiryYear
            ? `Expires ${method.expiryMonth}/${String(method.expiryYear).slice(-2)}`
            : "Card saved securely";
        return [method.cardHolderName, expiry].filter(Boolean).join(" · ");
    }
    if (method.methodType === "UPI") {
        return "Fast UPI checkout";
    }
    return "Wallet ready for checkout";
}

function formatPaymentMethodType(type) {
    if (type === "UPI") {
        return "UPI";
    }
    if (type === "CARD") {
        return "Card";
    }
    if (type === "WALLET") {
        return "Wallet";
    }
    return "Cash";
}

function detectCardBrand(cardNumber) {
    const digits = String(cardNumber || "").replace(/\D/g, "");
    if (digits.startsWith("4")) {
        return "Visa";
    }
    if (/^5[1-5]/.test(digits)) {
        return "Mastercard";
    }
    if (/^3[47]/.test(digits)) {
        return "Amex";
    }
    if (/^(506|508|60|65|81|82|353|356)/.test(digits)) {
        return "RuPay";
    }
    return "Card";
}

function formatCurrency(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(value || 0);
}

function formatDateTime(value) {
    if (!value) {
        return "Just now";
    }
    return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit"
    }).format(new Date(value));
}

function formatTime(value) {
    if (!value) {
        return "TBD";
    }
    return new Intl.DateTimeFormat("en-IN", {
        hour: "numeric",
        minute: "2-digit"
    }).format(new Date(value));
}

function formatStatus(value) {
    return String(value || "")
        .toLowerCase()
        .split("_")
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
}

function statusClassName(status) {
    return `status-${String(status || "").toLowerCase()}`;
}

function roundAmount(value) {
    return Math.round(value * 100) / 100;
}

function showErrorMessage(message) {
    console.error(message);
}

async function initializeApp() {
    try {
        updateAuthNav();
        updateLocationChip();
        if (currentUser?.id) {
            await refreshCurrentUser();
        }
        await Promise.all([fetchCategories(), fetchRestaurants(), fetchAddresses(), fetchOrders(), fetchFavoriteRestaurants(), fetchFavoriteMenuItems(), fetchPaymentMethods()]);
        updateCartCount();
        renderCart();
        const deepLinkRestaurant = window.location.hash.replace("#", "");
        if (deepLinkRestaurant) {
            openRestaurantMenu(deepLinkRestaurant);
        }
    } catch {
        showErrorMessage("Failed to initialize app.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initializeApp();

    const searchInput = document.getElementById("searchInput");
    const searchActionButton = document.getElementById("searchActionButton");
    let searchTimeout;
    if (searchInput) {
        searchInput.addEventListener("input", (event) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchRestaurants(event.target.value);
            }, 250);
        });

        searchInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                runSearch();
            }
        });
    }

    if (searchActionButton) {
        searchActionButton.addEventListener("click", () => {
            runSearch();
        });
    }

    ["menuModal", "cartModal", "addressModal", "ordersModal", "authModal", "locationModal"].forEach((modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.addEventListener("click", (event) => {
                if (event.target === modal) {
                    if (modalId === "menuModal") {
                        closeMenu();
                    } else if (modalId === "cartModal") {
                        closeCart();
                    } else if (modalId === "addressModal") {
                        closeAddressBook();
                    } else if (modalId === "ordersModal") {
                        closeOrders();
                    } else if (modalId === "locationModal") {
                        closeLocationPicker();
                    } else {
                        closeAuthModal();
                    }
                }
            });
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeMenu();
            closeCart();
            closeAddressBook();
            closeOrders();
            closeAuthModal();
            closeLocationPicker();
            closeSearchBar();
        }
    });
});
