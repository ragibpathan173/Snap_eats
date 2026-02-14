const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// This is your "Database" for now
const restaurants = {
    biryani: [
        { id: 1, name: "Royal Handi", rating: 4.7, time: "25-35 mins", offer: "Free delivery", offerText: "ITEMS AT ₹199", cuisine: "Biryani, Indian, Rice dishes", category: "biryani", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&h=300&fit=crop" },
        // ... You can copy the rest of the restaurants object from your swiggy_style.js here
    ],
    pizza_burger: [
        { id: 8, name: "Slice & Burger Co.", rating: 4.6, time: "20-30 mins", offer: "Free delivery", offerText: "ITEMS AT ₹149", cuisine: "Pizza, Burgers, Fast Food", category: "pizza-burger", image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop" },
    ],
    // Add the other categories (burgers, cakes, italian) as well
};

// API Endpoint to get all restaurants
app.get('/api/restaurants', (req, res) => {
    res.json(restaurants);
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});