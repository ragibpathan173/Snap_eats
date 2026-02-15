// API Configuration
const API_BASE_URL = 'http://localhost:8080/api';

// Global data storage
let categories = [];
let restaurants = [];

// Fetch categories from API
async function fetchCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/categories/active`);
        if (!response.ok) {
            throw new Error('Failed to fetch categories');
        }
        categories = await response.json();
        renderCategories();
    } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to empty array or show error message
        showErrorMessage('Failed to load categories. Please try again later.');
    }
}

// Fetch restaurants from API
async function fetchRestaurants() {
    try {
        const response = await fetch(`${API_BASE_URL}/restaurants/active`);
        if (!response.ok) {
            throw new Error('Failed to fetch restaurants');
        }
        restaurants = await response.json();
        renderRestaurants();
    } catch (error) {
        console.error('Error fetching restaurants:', error);
        // Fallback to empty array or show error message
        showErrorMessage('Failed to load restaurants. Please try again later.');
    }
}

// Fetch restaurants by category
async function fetchRestaurantsByCategory(category) {
    try {
        const endpoint = category === 'all' 
            ? `${API_BASE_URL}/restaurants/active`
            : `${API_BASE_URL}/restaurants/category/${category}`;
        
        const response = await fetch(endpoint);
        if (!response.ok) {
            throw new Error('Failed to fetch restaurants');
        }
        restaurants = await response.json();
        renderRestaurants();
    } catch (error) {
        console.error('Error fetching restaurants by category:', error);
        showErrorMessage('Failed to load restaurants. Please try again later.');
    }
}

// Search restaurants
async function searchRestaurants(query) {
    if (!query || query.trim() === '') {
        fetchRestaurants();
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/restaurants/search?query=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error('Failed to search restaurants');
        }
        restaurants = await response.json();
        renderRestaurants();
    } catch (error) {
        console.error('Error searching restaurants:', error);
        showErrorMessage('Failed to search restaurants. Please try again later.');
    }
}

// Show error message
function showErrorMessage(message) {
    // You can customize this to show a nice error UI
    console.error(message);
    // Optional: Display error in UI
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = 'background: #ff4444; color: white; padding: 15px; margin: 20px; border-radius: 8px; text-align: center;';
    errorDiv.textContent = message;
    
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(errorDiv, container.firstChild);
        setTimeout(() => errorDiv.remove(), 5000);
    }
}

// Render categories
function renderCategories() {
    const container = document.getElementById('categoriesContainer');
    if (!container) return;
    
    container.innerHTML = categories.map(cat => `
        <div class="category-card" data-id="${cat.categoryId || cat.id}" data-filter="${cat.filter}" onclick="filterByCategory('${cat.filter}')">
            <span class="category-id">${cat.categoryId || cat.id}</span>
            <img src="${cat.image}" alt="${cat.name}" class="category-image" loading="lazy">
            <div class="category-overlay">
                <div class="category-name">${cat.name}</div>
            </div>
        </div>
    `).join('');
}

// Render restaurants
function renderRestaurants() {
    const grid = document.getElementById('restaurantsGrid');
    if (!grid) return;
    
    if (restaurants.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: #666;">No restaurants found.</p>';
        return;
    }
    
    grid.innerHTML = restaurants.map(rest => `
        <div class="restaurant-card" data-id="${rest.restaurantId || rest.id}" data-category="${rest.category}">
            <div class="restaurant-image">
                <img src="${rest.image}" alt="${rest.name}" loading="lazy">
                <div class="discount-badge">${rest.discount}</div>
            </div>
            <div class="restaurant-info">
                <div class="restaurant-name">
                    ${rest.name}
                    ${rest.verified ? '<span style="color: #48c479; margin-left: 5px;">✓</span>' : ''}
                </div>
                <div class="restaurant-cuisine">${rest.cuisine}</div>
                <div class="restaurant-meta">
                    <div class="rating">⭐ ${rest.rating}</div>
                    <div class="delivery-time">${rest.time}</div>
                </div>
            </div>
        </div>
    `).join('');
}

// Scroll carousel
function scrollCarousel(containerId, scrollAmount) {
    const container = document.getElementById(containerId);
    if (container) {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
}

// Filter by category
async function filterByCategory(category) {
    const sectionTitle = document.getElementById('restaurantSectionTitle');
    const restaurantsSection = document.querySelector('.restaurants-section');
    
    // Update section title
    const categoryNames = {
        'all': 'All Restaurants',
        'italian': 'Italian Restaurants',
        'healthy': 'Healthy Food',
        'chinese': 'Chinese Restaurants',
        'desserts': 'Desserts & Sweets',
        'indian': 'Indian Restaurants',
        'mexican': 'Mexican Food',
        'american': 'American Food',
        'cafe': 'Coffee & Cafes',
        'japanese': 'Japanese Cuisine',
        'breakfast': 'Breakfast Places',
        'vegan': 'Vegan Restaurants',
        'thai': 'Thai Food',
        'bbq': 'BBQ & Grills',
        'seafood': 'Seafood Restaurants',
        'bakery': 'Bakery & Pastries',
        'sandwich': 'Sandwiches',
        'beverages': 'Beverages'
    };
    
    sectionTitle.textContent = categoryNames[category] || 'Top restaurant chains in your city';
    
    // Fetch restaurants by category
    await fetchRestaurantsByCategory(category);
    
    // Show restaurants section
    if (restaurantsSection) {
        restaurantsSection.style.display = 'block';
        restaurantsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    // Fetch initial data
    fetchCategories();
    fetchRestaurants();
    
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    let searchTimeout;
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const searchTerm = e.target.value.toLowerCase();
                searchRestaurants(searchTerm);
            }, 300);
        });
    }
});

// Optional: Refresh data periodically (every 5 minutes)
setInterval(() => {
    fetchCategories();
    fetchRestaurants();
}, 5 * 60 * 1000);