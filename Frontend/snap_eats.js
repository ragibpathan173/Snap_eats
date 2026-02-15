const API_BASE_URL = 'http://localhost:8080/api';

let categories = [];
let restaurants = [];

// ---------------- FETCH CATEGORIES ----------------
async function fetchCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories/active`);
        if (!response.ok) throw new Error('Failed to fetch categories');

        categories = await response.json();
        renderCategories();
    } catch (error) {
        showErrorMessage('Failed to load categories.');
    }
}

// ---------------- FETCH RESTAURANTS ----------------
async function fetchRestaurants() {
    try {
        const response = await fetch(`${API_BASE_URL}/restaurants/active`);
        if (!response.ok) throw new Error('Failed to fetch restaurants');

        restaurants = await response.json();
        renderRestaurants();
    } catch (error) {
        showErrorMessage('Failed to load restaurants.');
    }
}

// ---------------- FETCH BY CATEGORY ----------------
async function fetchRestaurantsByCategory(category) {
    try {
        const endpoint = category === 'all'
            ? `${API_BASE_URL}/restaurants/active`
            : `${API_BASE_URL}/restaurants/category/${category}`;

        const response = await fetch(endpoint);
        if (!response.ok) throw new Error('Failed to fetch restaurants');

        restaurants = await response.json();
        renderRestaurants();
    } catch (error) {
        showErrorMessage('Failed to load restaurants.');
    }
}

// ---------------- SEARCH ----------------
async function searchRestaurants(query) {
    if (!query || query.trim() === '') {
        fetchRestaurants();
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/restaurants/search?query=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Search failed');

        restaurants = await response.json();
        renderRestaurants();
    } catch (error) {
        showErrorMessage('Search failed.');
    }
}

// ---------------- RENDER CATEGORIES ----------------
function renderCategories() {
    const container = document.getElementById('categoriesContainer');
    if (!container) return;

    container.innerHTML = categories.map(cat => `
        <div class="category-card"
             onclick="filterByCategory('${cat.filter || 'all'}')">
            <img src="${cat.image}" alt="${cat.name}" class="category-image">
            <div class="category-overlay">
                <div class="category-name">${cat.name}</div>
            </div>
        </div>
    `).join('');
}

// ---------------- RENDER RESTAURANTS ----------------
function renderRestaurants() {
    const grid = document.getElementById('restaurantsGrid');
    if (!grid) return;

    if (restaurants.length === 0) {
        grid.innerHTML = `
            <p style="grid-column: 1/-1; text-align: center; padding: 40px;">
                No restaurants found.
            </p>`;
        return;
    }

    grid.innerHTML = restaurants.map(rest => `
        <div class="restaurant-card">
            <div class="restaurant-image">
                <img src="${rest.image}" alt="${rest.name}">
                ${rest.discount ? `<div class="discount-badge">${rest.discount}</div>` : ''}
            </div>
            <div class="restaurant-info">
                <div class="restaurant-name">
                    ${rest.name}
                    ${rest.verified ? ' <span style="color:#48c479;">✓</span>' : ''}
                </div>
                <div class="restaurant-cuisine">${rest.cuisine || ''}</div>
                <div class="restaurant-meta">
                    <div class="rating">⭐ ${rest.rating || 0}</div>
                    <div class="delivery-time">${rest.time || ''}</div>
                </div>
            </div>
        </div>
    `).join('');
}

// ---------------- FILTER ----------------
async function filterByCategory(category) {
    const sectionTitle = document.getElementById('restaurantSectionTitle');

    sectionTitle.textContent = category === 'all'
        ? 'All Restaurants'
        : `${category.charAt(0).toUpperCase() + category.slice(1)} Restaurants`;

    await fetchRestaurantsByCategory(category);
}

// ---------------- ERROR ----------------
function showErrorMessage(message) {
    console.error(message);
}

// ---------------- SEARCH LISTENER ----------------
document.addEventListener('DOMContentLoaded', () => {
    fetchCategories();
    fetchRestaurants();

    const searchInput = document.getElementById('searchInput');
    let searchTimeout;

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchRestaurants(e.target.value);
            }, 300);
        });
    }
});
