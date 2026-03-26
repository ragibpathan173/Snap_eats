const API_BASE_URL = "/api";
const CART_STORAGE_KEY = "snap_eats_cart";

let categories = [];
let restaurants = [];
let activeCategory = "all";
let activeRestaurant = null;
let activeMenuItems = [];
let cart = loadCart();

async function fetchJson(url, options = {}) {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
    }
    return data;
}

function loadCart() {
    try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        return raw ? JSON.parse(raw) : createEmptyCart();
    } catch {
        return createEmptyCart();
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

function updateCartCount() {
    const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const cartCount = document.getElementById("cartCount");
    if (cartCount) {
        cartCount.textContent = String(count);
    }
}

async function fetchCategories() {
    categories = await fetchJson(`${API_BASE_URL}/categories/active`);
    renderCategories();
}

async function fetchRestaurants(category = activeCategory, searchQuery = "") {
    let endpoint;
    if (searchQuery.trim()) {
        endpoint = `${API_BASE_URL}/restaurants/search?query=${encodeURIComponent(searchQuery.trim())}`;
    } else if (category === "all") {
        endpoint = `${API_BASE_URL}/restaurants/active`;
    } else {
        endpoint = `${API_BASE_URL}/restaurants/category/${encodeURIComponent(category)}`;
    }

    restaurants = await fetchJson(endpoint);
    renderRestaurants();
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
        grid.innerHTML = `<p class="empty-state">No restaurants found for this selection.</p>`;
        return;
    }

    grid.innerHTML = restaurants.map((restaurant) => `
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
            </div>
            <div class="restaurant-info">
                <div class="restaurant-name">
                    ${escapeHtml(restaurant.name)}
                    ${restaurant.verified ? ' <span class="verified-mark">Verified</span>' : ""}
                </div>
                <div class="restaurant-cuisine">${escapeHtml(restaurant.cuisine || "")}</div>
                <div class="restaurant-meta">
                    <div class="rating">★ ${formatNumber(restaurant.rating)}</div>
                    <div class="delivery-time">${escapeHtml(restaurant.time || "")}</div>
                </div>
            </div>
        </article>
    `).join("");
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
                        <button class="primary-button add-button" type="button" onclick="addToCart('${escapeAttribute(item.itemId)}')">Add to cart</button>
                    </div>
                </article>
            `).join("")}
        </section>
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

function closeCart() {
    const modal = document.getElementById("cartModal");
    if (!modal) {
        return;
    }

    modal.classList.remove("open");
    if (!document.getElementById("menuModal")?.classList.contains("open")) {
        document.body.classList.remove("modal-open");
    }
}

function renderCart() {
    const content = document.getElementById("cartModalContent");
    if (!content) {
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

                    <form class="checkout-form" onsubmit="submitOrder(event)">
                        <label>
                            Name
                            <input type="text" id="checkoutName" placeholder="Your name" required>
                        </label>
                        <label>
                            Phone number
                            <input type="tel" id="checkoutPhone" placeholder="10-digit phone" required>
                        </label>
                        <label>
                            Delivery address
                            <textarea id="checkoutAddress" rows="3" placeholder="House number, area, city" required></textarea>
                        </label>
                        <label>
                            Payment method
                            <select id="checkoutPayment">
                                <option value="CASH">Cash on delivery</option>
                                <option value="UPI">UPI</option>
                                <option value="CARD">Card</option>
                                <option value="WALLET">Wallet</option>
                            </select>
                        </label>
                        <label>
                            Notes
                            <textarea id="checkoutNotes" rows="2" placeholder="Add delivery notes (optional)"></textarea>
                        </label>
                        <button class="primary-button checkout-button" type="submit">Place order</button>
                    </form>
                    <div id="checkoutFeedback" class="checkout-feedback"></div>
                </section>
            </div>
        </div>`;
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
    const name = document.getElementById("checkoutName")?.value.trim();
    const phone = document.getElementById("checkoutPhone")?.value.trim();
    const address = document.getElementById("checkoutAddress")?.value.trim();
    const paymentMethod = document.getElementById("checkoutPayment")?.value || "CASH";
    const notes = document.getElementById("checkoutNotes")?.value.trim();

    if (feedback) {
        feedback.textContent = "Placing your order...";
        feedback.className = "checkout-feedback";
    }

    try {
        const subtotal = getCartSubtotal();
        const deliveryFee = getDeliveryFee();
        const response = await fetchJson(`${API_BASE_URL}/orders/checkout`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                restaurantCode: cart.restaurantCode,
                customerName: name,
                contactNumber: phone,
                deliveryAddress: address,
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
            feedback.textContent = `Order placed successfully. Order number: ${response.order.orderNumber}`;
            feedback.className = "checkout-feedback success";
        }

        cart = createEmptyCart();
        saveCart();
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
    if (!document.getElementById("cartModal")?.classList.contains("open")) {
        document.body.classList.remove("modal-open");
    }
    activeRestaurant = null;
    activeMenuItems = [];
    if (window.location.hash) {
        history.replaceState(null, "", window.location.pathname + window.location.search);
    }
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

function formatCurrency(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(value || 0);
}

function roundAmount(value) {
    return Math.round(value * 100) / 100;
}

function showErrorMessage(message) {
    console.error(message);
}

async function initializeApp() {
    try {
        await Promise.all([fetchCategories(), fetchRestaurants()]);
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
    let searchTimeout;
    if (searchInput) {
        searchInput.addEventListener("input", (event) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchRestaurants(event.target.value);
            }, 250);
        });
    }

    ["menuModal", "cartModal"].forEach((modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.addEventListener("click", (event) => {
                if (event.target === modal) {
                    if (modalId === "menuModal") {
                        closeMenu();
                    } else {
                        closeCart();
                    }
                }
            });
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeMenu();
            closeCart();
        }
    });
});
