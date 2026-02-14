const categories = [
    { id: "CAT001", name: "Food", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&h=400&fit=crop", filter: "all", count: "240+ stores" },
    { id: "CAT004", name: "Pizza", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=400&fit=crop", filter: "italian", count: "150+ stores" },
    { id: "CAT005", name: "Burgers", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=400&fit=crop", filter: "american", count: "120+ stores" },
    { id: "CAT006", name: "Chinese", image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&h=400&fit=crop", filter: "chinese", count: "130+ stores" },
    { id: "CAT007", name: "Indian", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400&h=400&fit=crop", filter: "indian", count: "200+ stores" },
    { id: "CAT008", name: "Desserts", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop", filter: "desserts", count: "85+ stores" },
    { id: "CAT009", name: "Mexican", image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=400&fit=crop", filter: "mexican", count: "75+ stores" },
    { id: "CAT010", name: "Healthy", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop", filter: "healthy", count: "110+ stores" },
    { id: "CAT011", name: "Coffee", image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400&h=400&fit=crop", filter: "cafe", count: "140+ stores" },
    { id: "CAT012", name: "Sushi", image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=400&fit=crop", filter: "japanese", count: "65+ stores" },
    { id: "CAT013", name: "Breakfast", image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&h=400&fit=crop", filter: "breakfast", count: "90+ stores" },
    { id: "CAT014", name: "Bakery", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=400&fit=crop", filter: "bakery", count: "100+ stores" },
    { id: "CAT015", name: "Seafood", image: "https://images.unsplash.com/photo-1559737558-2f5a35f4523e?w=400&h=400&fit=crop", filter: "seafood", count: "55+ stores" },
    { id: "CAT016", name: "BBQ", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=400&fit=crop", filter: "bbq", count: "70+ stores" },
    { id: "CAT017", name: "Thai", image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=400&h=400&fit=crop", filter: "thai", count: "60+ stores" },
    { id: "CAT018", name: "Vegan", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop", filter: "vegan", count: "80+ stores" },
    { id: "CAT019", name: "Sandwiches", image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=400&fit=crop", filter: "sandwich", count: "95+ stores" },
    { id: "CAT020", name: "Beverages", image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=400&fit=crop", filter: "beverages", count: "120+ stores" }
];

const restaurants = [
    // Italian Restaurants
    { id: "REST001", name: "La Bella Italia", cuisine: "Italian, Pizza, Pasta", rating: 4.5, time: "30-35 mins", discount: "50% OFF", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&h=400&fit=crop", category: "italian", verified: true },
    { id: "REST002", name: "Pizza Paradise", cuisine: "Pizza, Italian", rating: 4.3, time: "25-30 mins", discount: "40% OFF", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=400&fit=crop", category: "italian", verified: true },
    { id: "REST003", name: "Pasta House", cuisine: "Pasta, Italian, Continental", rating: 4.6, time: "35-40 mins", discount: "30% OFF", image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&h=400&fit=crop", category: "italian", verified: false },
    { id: "REST004", name: "Roma Trattoria", cuisine: "Italian, Pizza, Wine", rating: 4.7, time: "40-45 mins", discount: "25% OFF", image: "https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=600&h=400&fit=crop", category: "italian", verified: true },
    { id: "REST005", name: "Napoli Kitchen", cuisine: "Pizza, Pasta, Italian", rating: 4.4, time: "30-35 mins", discount: "45% OFF", image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=400&fit=crop", category: "italian", verified: true },
    { id: "REST006", name: "Venice Pizzeria", cuisine: "Pizza, Italian", rating: 4.5, time: "28-32 mins", discount: "35% OFF", image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&h=400&fit=crop", category: "italian", verified: false },
    
    // Healthy Restaurants
    { id: "REST007", name: "Green Bowl", cuisine: "Healthy, Salads, Smoothies", rating: 4.7, time: "20-25 mins", discount: "25% OFF", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop", category: "healthy", verified: true },
    { id: "REST008", name: "Fit Kitchen", cuisine: "Healthy, Protein Bowls", rating: 4.4, time: "30-35 mins", discount: "35% OFF", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop", category: "healthy", verified: false },
    { id: "REST009", name: "Salad Bar", cuisine: "Salads, Juices, Healthy", rating: 4.5, time: "15-20 mins", discount: "20% OFF", image: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&h=400&fit=crop", category: "healthy", verified: true },
    { id: "REST010", name: "Fresh & Fit", cuisine: "Smoothie Bowls, Healthy", rating: 4.6, time: "25-30 mins", discount: "30% OFF", image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&h=400&fit=crop", category: "healthy", verified: true },
    { id: "REST011", name: "Clean Eats", cuisine: "Healthy, Organic, Vegan", rating: 4.8, time: "25-30 mins", discount: "40% OFF", image: "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&h=400&fit=crop", category: "healthy", verified: true },
    
    // Chinese Restaurants
    { id: "REST012", name: "Dragon Wok", cuisine: "Chinese, Asian, Noodles", rating: 4.2, time: "35-40 mins", discount: "45% OFF", image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600&h=400&fit=crop", category: "chinese", verified: false },
    { id: "REST013", name: "Mandarin Express", cuisine: "Chinese, Dim Sum", rating: 4.6, time: "40-45 mins", discount: "30% OFF", image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&h=400&fit=crop", category: "chinese", verified: true },
    { id: "REST014", name: "Noodle Nation", cuisine: "Noodles, Chinese, Thai", rating: 4.4, time: "25-30 mins", discount: "35% OFF", image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600&h=400&fit=crop", category: "chinese", verified: true },
    { id: "REST015", name: "Dim Sum Palace", cuisine: "Dim Sum, Chinese", rating: 4.5, time: "30-35 mins", discount: "40% OFF", image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=600&h=400&fit=crop", category: "chinese", verified: false },
    { id: "REST016", name: "Wok Express", cuisine: "Chinese, Asian Fusion", rating: 4.3, time: "28-33 mins", discount: "38% OFF", image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&h=400&fit=crop", category: "chinese", verified: true },
    { id: "REST017", name: "Golden Dragon", cuisine: "Chinese, Cantonese", rating: 4.7, time: "35-40 mins", discount: "32% OFF", image: "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&h=400&fit=crop", category: "chinese", verified: true },
    
    // Dessert Restaurants
    { id: "REST018", name: "Sweet Tooth", cuisine: "Desserts, Cakes, Pastries", rating: 4.8, time: "20-25 mins", discount: "40% OFF", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&h=400&fit=crop", category: "desserts", verified: true },
    { id: "REST019", name: "Cake Factory", cuisine: "Cakes, Desserts, Bakery", rating: 4.5, time: "30-35 mins", discount: "25% OFF", image: "https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=600&h=400&fit=crop", category: "desserts", verified: true },
    { id: "REST020", name: "Ice Cream Corner", cuisine: "Ice Cream, Desserts", rating: 4.7, time: "15-20 mins", discount: "30% OFF", image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&h=400&fit=crop", category: "desserts", verified: false },
    { id: "REST021", name: "Choco Heaven", cuisine: "Desserts, Chocolate, Cakes", rating: 4.6, time: "25-30 mins", discount: "35% OFF", image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&h=400&fit=crop", category: "desserts", verified: true },
    { id: "REST022", name: "Donut Delight", cuisine: "Donuts, Desserts, Coffee", rating: 4.4, time: "18-22 mins", discount: "28% OFF", image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&h=400&fit=crop", category: "desserts", verified: false },
    
    // Indian Restaurants
    { id: "REST023", name: "Spice Route", cuisine: "Indian, Biryani, Curry", rating: 4.6, time: "40-45 mins", discount: "50% OFF", image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop", category: "indian", verified: true },
    { id: "REST024", name: "Biryani House", cuisine: "Biryani, Indian, Mughlai", rating: 4.4, time: "35-40 mins", discount: "45% OFF", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&h=400&fit=crop", category: "indian", verified: true },
    { id: "REST025", name: "Tandoor Express", cuisine: "Indian, Tandoori, Curry", rating: 4.5, time: "30-35 mins", discount: "40% OFF", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop", category: "indian", verified: false },
    { id: "REST026", name: "Masala Magic", cuisine: "North Indian, Curry, Naan", rating: 4.7, time: "35-40 mins", discount: "30% OFF", image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&h=400&fit=crop", category: "indian", verified: true },
    { id: "REST027", name: "Curry Kingdom", cuisine: "Indian, Curry, Rice", rating: 4.6, time: "32-37 mins", discount: "42% OFF", image: "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=600&h=400&fit=crop", category: "indian", verified: true },
    { id: "REST028", name: "Dosa Palace", cuisine: "South Indian, Dosa, Idli", rating: 4.5, time: "28-33 mins", discount: "35% OFF", image: "https://images.unsplash.com/photo-1630383249896-424e482df921?w=600&h=400&fit=crop", category: "indian", verified: false },
    
    // Mexican Restaurants
    { id: "REST029", name: "Taco Bell", cuisine: "Mexican, Tacos, Burritos", rating: 4.4, time: "30-35 mins", discount: "40% OFF", image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop", category: "mexican", verified: true },
    { id: "REST030", name: "Burrito Brothers", cuisine: "Mexican, Burritos, Nachos", rating: 4.3, time: "25-30 mins", discount: "35% OFF", image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=600&h=400&fit=crop", category: "mexican", verified: false },
    { id: "REST031", name: "Chipotle Grill", cuisine: "Mexican, Bowls, Tacos", rating: 4.6, time: "30-35 mins", discount: "30% OFF", image: "https://images.unsplash.com/photo-1604467707321-70d5ac45adda?w=600&h=400&fit=crop", category: "mexican", verified: true },
    { id: "REST032", name: "El Mariachi", cuisine: "Mexican, Authentic, Fajitas", rating: 4.7, time: "38-43 mins", discount: "28% OFF", image: "https://images.unsplash.com/photo-1599974579688-8dbdd335e3f1?w=600&h=400&fit=crop", category: "mexican", verified: true },
    
    // American Restaurants
    { id: "REST033", name: "Burger King", cuisine: "Burgers, Fast Food, American", rating: 4.3, time: "25-30 mins", discount: "50% OFF", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop", category: "american", verified: true },
    { id: "REST034", name: "The Sandwich Co.", cuisine: "Sandwiches, Wraps, Fast Food", rating: 4.2, time: "20-25 mins", discount: "30% OFF", image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&h=400&fit=crop", category: "american", verified: false },
    { id: "REST035", name: "Grill House", cuisine: "BBQ, Grilled, American", rating: 4.5, time: "40-45 mins", discount: "35% OFF", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop", category: "american", verified: true },
    { id: "REST036", name: "Five Guys", cuisine: "Burgers, Fries, American", rating: 4.6, time: "28-33 mins", discount: "38% OFF", image: "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=600&h=400&fit=crop", category: "american", verified: true },
    { id: "REST037", name: "Shake Shack", cuisine: "Burgers, Shakes, American", rating: 4.7, time: "30-35 mins", discount: "42% OFF", image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&h=400&fit=crop", category: "american", verified: true },
    
    // Breakfast Restaurants
    { id: "REST038", name: "Breakfast Club", cuisine: "Breakfast, Pancakes, Coffee", rating: 4.6, time: "20-25 mins", discount: "25% OFF", image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600&h=400&fit=crop", category: "breakfast", verified: true },
    { id: "REST039", name: "Morning Glory", cuisine: "Breakfast, Eggs, Waffles", rating: 4.5, time: "25-30 mins", discount: "32% OFF", image: "https://images.unsplash.com/photo-1464305795204-6f5bbfc7fb81?w=600&h=400&fit=crop", category: "breakfast", verified: false },
    { id: "REST040", name: "Sunrise Cafe", cuisine: "Breakfast, Brunch, Coffee", rating: 4.4, time: "22-27 mins", discount: "28% OFF", image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&h=400&fit=crop", category: "breakfast", verified: true },
    
    // Cafe Restaurants
    { id: "REST041", name: "Starbucks", cuisine: "Coffee, Cafe, Bakery", rating: 4.5, time: "15-20 mins", discount: "20% OFF", image: "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=600&h=400&fit=crop", category: "cafe", verified: true },
    { id: "REST042", name: "Costa Coffee", cuisine: "Coffee, Snacks, Desserts", rating: 4.4, time: "18-22 mins", discount: "25% OFF", image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop", category: "cafe", verified: true },
    { id: "REST043", name: "Cafe Mocha", cuisine: "Coffee, Pastries, Sandwiches", rating: 4.6, time: "20-25 mins", discount: "30% OFF", image: "https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=600&h=400&fit=crop", category: "cafe", verified: false },
    
    // Japanese Restaurants
    { id: "REST044", name: "Sushi Station", cuisine: "Sushi, Japanese, Asian", rating: 4.7, time: "35-40 mins", discount: "35% OFF", image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&h=400&fit=crop", category: "japanese", verified: true },
    { id: "REST045", name: "Tokyo Kitchen", cuisine: "Japanese, Ramen, Sushi", rating: 4.5, time: "32-37 mins", discount: "40% OFF", image: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=600&h=400&fit=crop", category: "japanese", verified: true },
    { id: "REST046", name: "Sake House", cuisine: "Sushi, Japanese, Sake", rating: 4.6, time: "38-43 mins", discount: "28% OFF", image: "https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=600&h=400&fit=crop", category: "japanese", verified: false },
    
    // Thai Restaurants
    { id: "REST047", name: "Thai Basil", cuisine: "Thai, Asian, Curry", rating: 4.6, time: "30-35 mins", discount: "35% OFF", image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600&h=400&fit=crop", category: "thai", verified: true },
    { id: "REST048", name: "Bangkok Street", cuisine: "Thai, Street Food", rating: 4.4, time: "28-33 mins", discount: "38% OFF", image: "https://images.unsplash.com/photo-1562565652-a0d8f0c59eb4?w=600&h=400&fit=crop", category: "thai", verified: true },
    
    // Vegan Restaurants
    { id: "REST049", name: "Plant Based", cuisine: "Vegan, Healthy, Organic", rating: 4.8, time: "25-30 mins", discount: "30% OFF", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=400&fit=crop", category: "vegan", verified: true },
    { id: "REST050", name: "Green Leaf", cuisine: "Vegan, Plant Based", rating: 4.6, time: "28-33 mins", discount: "35% OFF", image: "https://images.unsplash.com/photo-1540914124281-342587941389?w=600&h=400&fit=crop", category: "vegan", verified: false },
    
    // Bakery Restaurants
    { id: "REST051", name: "The Bake Shop", cuisine: "Bakery, Cakes, Pastries", rating: 4.5, time: "20-25 mins", discount: "25% OFF", image: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=600&h=400&fit=crop", category: "bakery", verified: true },
    { id: "REST052", name: "French Patisserie", cuisine: "Bakery, French, Desserts", rating: 4.7, time: "25-30 mins", discount: "32% OFF", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop", category: "bakery", verified: true },
    
    // BBQ Restaurants
    { id: "REST053", name: "BBQ Nation", cuisine: "BBQ, Grilled, Buffet", rating: 4.6, time: "40-45 mins", discount: "40% OFF", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600&h=400&fit=crop", category: "bbq", verified: true },
    { id: "REST054", name: "Smoke House", cuisine: "BBQ, Smoked, American", rating: 4.5, time: "38-43 mins", discount: "35% OFF", image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&h=400&fit=crop", category: "bbq", verified: false },
    
    // Seafood Restaurants
    { id: "REST055", name: "Ocean's Catch", cuisine: "Seafood, Fish, Coastal", rating: 4.7, time: "35-40 mins", discount: "38% OFF", image: "https://images.unsplash.com/photo-1559737558-2f5a35f4523e?w=600&h=400&fit=crop", category: "seafood", verified: true },
    { id: "REST056", name: "Fish Market", cuisine: "Seafood, Fresh Fish", rating: 4.5, time: "32-37 mins", discount: "30% OFF", image: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=600&h=400&fit=crop", category: "seafood", verified: true }
];

function renderCategories() {
    const container = document.getElementById('categoriesContainer');
    container.innerHTML = categories.map(cat => `
        <div class="category-card" data-id="${cat.id}" data-filter="${cat.filter}" onclick="filterByCategory('${cat.filter}')">
            <span class="category-id">${cat.id}</span>
            <img src="${cat.image}" alt="${cat.name}" class="category-image" loading="lazy">
            <div class="category-overlay">
                <div class="category-name">${cat.name}</div>
            </div>
        </div>
    `).join('');
}

function renderRestaurants() {
    const grid = document.getElementById('restaurantsGrid');
    grid.innerHTML = restaurants.map(rest => `
        <div class="restaurant-card" data-id="${rest.id}" data-category="${rest.category}">
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

function scrollCarousel(containerId, scrollAmount) {
    const container = document.getElementById(containerId);
    if (container) {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
}

function filterByCategory(category) {
    const cards = document.querySelectorAll('.restaurant-card');
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
    
    // Filter restaurants and count visible ones
    let visibleCount = 0;
    cards.forEach((card, index) => {
        setTimeout(() => {
            if (category === 'all' || card.dataset.category === category) {
                card.classList.remove('hidden');
                card.style.animation = 'fadeIn 0.5s ease-in-out';
                visibleCount++;
            } else {
                card.classList.add('hidden');
            }
        }, index * 20);
    });
    
    // Show restaurants section only if there are matching restaurants
    setTimeout(() => {
        const actualVisibleCount = document.querySelectorAll('.restaurant-card:not(.hidden)').length;
        if (actualVisibleCount > 0) {
            restaurantsSection.style.display = 'block';
            // Scroll to restaurants section
            restaurantsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            restaurantsSection.style.display = 'none';
        }
    }, 100);
}

document.addEventListener('DOMContentLoaded', () => {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const searchTerm = e.target.value.toLowerCase();
            const cards = document.querySelectorAll('.restaurant-card');
            
            cards.forEach(card => {
                const name = card.querySelector('.restaurant-name').textContent.toLowerCase();
                const cuisine = card.querySelector('.restaurant-cuisine').textContent.toLowerCase();
                
                if (name.includes(searchTerm) || cuisine.includes(searchTerm)) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        }, 300);
    });
});

document.addEventListener('DOMContentLoaded', () => {
    renderCategories();
    renderRestaurants();
});
